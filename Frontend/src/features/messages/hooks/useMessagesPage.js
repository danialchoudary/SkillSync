import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchAllUsers } from '../../../services/userApi';
import { fetchConversation, sendMessage, markMessageSeen, deleteConversation } from '../../../services/messagesApi';
import { getMe } from '../../../services/api';
import { connectSocket, onEvent, offEvent, emitEvent, getSocket } from '../../../services/socketService';

function getId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
  }
  return String(value);
}

function getLatestMessageAt(conversation) {
  if (!Array.isArray(conversation) || conversation.length === 0) return null;
  const latestMessage = conversation[conversation.length - 1];
  return latestMessage?.createdAt || null;
}

function getCurrentUserId(user) {
  return getId(user?._id || user?.id);
}

export default function useMessagesPage({ locationPathname, navigate }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [userError, setUserError] = useState('');
  const [unread, setUnread] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [lastMessageAtByUser, setLastMessageAtByUser] = useState({});
  const prevMessagesRef = useRef([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [socketReady, setSocketReady] = useState(false);

  const currentUserId = getCurrentUserId(currentUser);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        const meRes = await getMe();
        if (!cancelled) {
          const normalizedCurrentUser = meRes?.data
            ? { ...meRes.data, _id: meRes.data._id || meRes.data.id }
            : null;
          setCurrentUser(normalizedCurrentUser);
          console.log('Current user:', normalizedCurrentUser);
        }

        if (meRes.data?.role === 'recruiter' && locationPathname !== '/recruiter/message') {
          navigate('/recruiter/message', { replace: true });
        } else if (meRes.data?.role !== 'recruiter' && locationPathname !== '/messages') {
          navigate('/messages', { replace: true });
        }
      } catch {
        if (!cancelled) setCurrentUser(null);
      }

      try {
        const userRes = await fetchAllUsers();
        if (!cancelled) {
          setUsers(Array.isArray(userRes) ? userRes : []);
          console.log('Fetched users:', userRes);
          setUserError('');
        }
      } catch {
        if (!cancelled) {
          setUsers([]);
          if (!currentUser) {
            setUserError('Could not load users. Please log in again.');
          } else {
            setUserError('Could not load users. Please check your connection or try again.');
          }
        }
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [locationPathname, navigate]);

  const handleUserSelect = async (user) => {
    const selectedId = getId(user?._id || user?.id);
    if (!selectedId) return;

    if (currentUserId && selectedId === currentUserId) {
      setSelectedUser(null);
      setMessages([]);
      return;
    }

    setSelectedUser(user);
    setLoading(true);
    try {
      const res = await fetchConversation(selectedId);
      const conversation = Array.isArray(res.data) ? res.data : [];
      setMessages(conversation);
      const latestMessageAt = getLatestMessageAt(conversation);
      if (latestMessageAt) {
        setLastMessageAtByUser((prev) => ({ ...prev, [selectedId]: latestMessageAt }));
      }
      const unseen = conversation.filter((m) => getId(m.senderId) === selectedId && !m.seen);
      if (unseen.length > 0) {
        await Promise.all(unseen.map((m) => markMessageSeen(m._id)));
      }
      setUnread((prev) => ({ ...prev, [selectedId]: 0 }));
    } catch (error) {
      console.error('Error fetching conversation:', error);
      alert('Failed to load messages. Please try again.');
      setMessages([]);
    }
    setLoading(false);
  };

  const handleDeleteConversation = async (userToDelete) => {
    const userId = getId(userToDelete?._id || userToDelete?.id);
    if (!userId) return;

    try {
      await deleteConversation(userId);
      setUsers(prev => prev.filter(u => getId(u._id || u.id) !== userId));

      const currentSelectedId = getId(selectedUser?._id || selectedUser?.id);
      if (currentSelectedId === userId) {
        setSelectedUser(null);
        setMessages([]);
      }

      // Cleanup locally cached stuff
      setUnread(prev => { const p = { ...prev }; delete p[userId]; return p; });
      setLastMessageAtByUser(prev => { const p = { ...prev }; delete p[userId]; return p; });

    } catch (err) {
      console.error('Error deleting conversation:', err);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const handleSend = async (e, options = {}) => {
    e.preventDefault();
    if ((!input || !input.trim()) && options.messageType !== 'file') return;
    if (!selectedUser || !currentUserId || sending) return;

    const receiverId = getId(selectedUser?._id || selectedUser?.id);
    if (!receiverId || receiverId === currentUserId) return;

    setSending(true);
    try {
      const socketInstance = getSocket();
      const content = input.trim();

      const tempMessage = {
        _id: Date.now().toString(),
        senderId: currentUserId,
        receiverId,
        content,
        seen: false,
        createdAt: new Date().toISOString(),
        sender: currentUser,
        receiver: selectedUser,
        ...options,
      };

      setMessages((prev) => [...prev, tempMessage]);
      setLastMessageAtByUser((prev) => ({ ...prev, [receiverId]: tempMessage.createdAt }));
      setInput('');

      if (socketInstance && socketInstance.connected) {
        emitEvent(
          'send_message',
          {
            receiverId,
            content,
            ...options,
          },
          (response) => {
            if (response?.error) {
              console.error('Socket send_message error:', response.error);
              setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
              alert('Failed to send message. Please try again.');
            }
          },
        );
      } else {
        console.warn('[Messages] Socket not connected, using REST fallback');
        const res = await sendMessage(receiverId, content, options);
        setMessages((prev) => prev.map((m) => (m._id === tempMessage._id ? res : m)));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
    setSending(false);
  };

  const handleTyping = useCallback(
    (isTyping) => {
      const receiverId = getId(selectedUser?._id || selectedUser?.id);
      if (receiverId && receiverId !== currentUserId) {
        emitEvent('typing', { receiverId, isTyping });
      }
    },
    [selectedUser, currentUserId],
  );

  const isUserOnline = useCallback((userId) => Boolean(userId && onlineUsers[userId]), [onlineUsers]);

  useEffect(() => {
    const selectedUserId = getId(selectedUser?._id || selectedUser?.id);
    if (selectedUserId && selectedUserId === currentUserId) {
      setSelectedUser(null);
      setMessages([]);
    }
  }, [selectedUser, currentUserId]);

  useEffect(() => {
    console.log('[Messages] Socket connection effect - currentUser:', !!currentUser);
    if (!currentUserId) return;

    const token = localStorage.getItem('token');
    console.log('[Messages] Token from localStorage:', token ? 'Present' : 'Missing');

    if (token) {
      console.log('[Messages] Calling connectSocket...');
      const socket = connectSocket(token);
      console.log('[Messages] connectSocket returned:', socket ? 'Socket instance' : 'null/undefined');

      const handleConnect = () => {
        console.log('[Messages] Socket connected, setting ready state');
        setSocketReady(true);
      };

      if (socket) {
        socket.on('connect', handleConnect);
        if (socket.connected) {
          console.log('[Messages] Socket was already connected');
          setSocketReady(true);
        }
      }

      return () => {
        if (socket) {
          socket.off('connect', handleConnect);
        }
      };
    }
  }, [currentUser, currentUserId]);

  useEffect(() => {
    if (!socketReady) return;

    const handleOnlineUsers = ({ userIds } = {}) => {
      if (!Array.isArray(userIds)) return;
      const onlineMap = {};
      for (const userId of userIds) {
        if (userId) onlineMap[String(userId)] = true;
      }
      setOnlineUsers(onlineMap);
    };

    const handleUserOnline = ({ userId } = {}) => {
      if (!userId) return;
      setOnlineUsers((prev) => ({ ...prev, [String(userId)]: true }));
    };

    const handleUserOffline = ({ userId } = {}) => {
      if (!userId) return;
      setOnlineUsers((prev) => {
        if (!prev[String(userId)]) return prev;
        const next = { ...prev };
        delete next[String(userId)];
        return next;
      });
    };

    onEvent('online_users', handleOnlineUsers);
    onEvent('user_online', handleUserOnline);
    onEvent('user_offline', handleUserOffline);
    emitEvent('request_online_users', {});

    return () => {
      offEvent('online_users', handleOnlineUsers);
      offEvent('user_online', handleUserOnline);
      offEvent('user_offline', handleUserOffline);
    };
  }, [socketReady]);

  useEffect(() => {
    if (!socketReady || !currentUserId) return;

    const handleReceiveMessage = (message) => {
      const senderId = getId(message?.senderId || message?.sender);
      const receiverId = getId(message?.receiverId || message?.receiver);
      const selectedUserId = getId(selectedUser?._id || selectedUser?.id);
      const myUserId = currentUserId;

      if (!senderId || !receiverId || (senderId !== myUserId && receiverId !== myUserId)) {
        return;
      }

      const isFromMe = senderId === myUserId;
      const partnerId = isFromMe ? receiverId : senderId;

      if (partnerId && partnerId !== myUserId && message?.createdAt) {
        setLastMessageAtByUser((prev) => ({ ...prev, [partnerId]: message.createdAt }));
      }

      if (!isFromMe && partnerId && selectedUserId !== partnerId) {
        setUnread((prev) => ({ ...prev, [partnerId]: (prev[partnerId] || 0) + 1 }));
      }

      if (!selectedUserId || (senderId !== selectedUserId && receiverId !== selectedUserId)) {
        return;
      }

      setMessages((prev) => {
        const exists = prev.find((m) => m._id === message._id);
        if (exists) return prev;

        if (isFromMe) {
          const tempMatch = prev.find(
            (m) =>
              /^\d+$/.test(String(m._id)) &&
              getId(m.receiverId) === receiverId &&
              m.content === message.content,
          );
          if (tempMatch) {
            return prev.map((m) => (m._id === tempMatch._id ? message : m));
          }
        }

        return [...prev, message];
      });

      if (!isFromMe && message?._id && !message?.seen) {
        markMessageSeen(message._id).catch(() => { });
        setUnread((prev) => ({ ...prev, [selectedUserId]: 0 }));
      }
    };

    const handleTypingEvent = ({ senderId, isTyping } = {}) => {
      setTypingUsers((prev) => ({ ...prev, [senderId]: isTyping }));
    };

    onEvent('receive_message', handleReceiveMessage);
    onEvent('user_typing', handleTypingEvent);

    return () => {
      offEvent('receive_message', handleReceiveMessage);
      offEvent('user_typing', handleTypingEvent);
    };
  }, [socketReady, currentUserId, selectedUser]);

  useEffect(() => {
    const selectedUserId = getId(selectedUser?._id || selectedUser?.id);
    if (!selectedUserId || selectedUserId === currentUserId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetchConversation(selectedUserId);
        const conversation = Array.isArray(res.data) ? res.data : [];
        setMessages(conversation);
        prevMessagesRef.current = conversation;
        const latestMessageAt = getLatestMessageAt(conversation);
        if (latestMessageAt) {
          setLastMessageAtByUser((prev) => ({ ...prev, [selectedUserId]: latestMessageAt }));
        }
      } catch (error) {
        console.error('[Messages] Poll fetch failed:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedUser, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;

    const fetchConversationSummaries = async () => {
      const unreadMap = {};
      const latestMap = {};
      const usersToProcess = users.filter((user) => user?._id && user._id !== currentUserId);

      await Promise.all(
        usersToProcess.map(async (user) => {
          try {
            const res = await fetchConversation(user._id);
            const conversation = Array.isArray(res.data) ? res.data : [];
            const count = conversation.filter((m) => getId(m.senderId) === user._id && !m.seen).length;
            unreadMap[user._id] = count;

            const latestMessageAt = getLatestMessageAt(conversation);
            if (latestMessageAt) {
              latestMap[user._id] = latestMessageAt;
            }
          } catch {
            unreadMap[user._id] = unreadMap[user._id] || 0;
          }
        }),
      );

      if (cancelled) return;

      setUnread(unreadMap);
      setLastMessageAtByUser((prev) => ({ ...prev, ...latestMap }));
    };

    fetchConversationSummaries();
    return () => {
      cancelled = true;
    };
  }, [users, currentUserId]);

  const filteredUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      if (currentUserId && user._id === currentUserId) return false;
      if (user.role === 'recruiter') {
        return (user.companyName || '').toLowerCase().includes(search.toLowerCase());
      }
      return (user.name || '').toLowerCase().includes(search.toLowerCase());
    });

    return filtered.sort((a, b) => {
      const aTimestamp = lastMessageAtByUser[a._id] ? new Date(lastMessageAtByUser[a._id]).getTime() : 0;
      const bTimestamp = lastMessageAtByUser[b._id] ? new Date(lastMessageAtByUser[b._id]).getTime() : 0;

      if (aTimestamp !== bTimestamp) {
        return bTimestamp - aTimestamp;
      }

      const aLabel = (a.role === 'recruiter' ? a.companyName : a.name) || a.email || '';
      const bLabel = (b.role === 'recruiter' ? b.companyName : b.name) || b.email || '';
      return aLabel.localeCompare(bLabel);
    });
  }, [users, currentUserId, search, lastMessageAtByUser]);

  const handleRetryLoadUsers = () => {
    setUserError('');
    setUsers([]);
    setCurrentUser(null);
    navigate(locationPathname, { replace: true });
  };

  return {
    users,
    selectedUser,
    setSelectedUser,
    messages,
    input,
    setInput,
    currentUser,
    loading,
    sending,
    search,
    setSearch,
    userError,
    unread,
    typingUsers,
    filteredUsers,
    handleUserSelect,
    handleSend,
    handleTyping,
    handleDeleteConversation,
    isUserOnline,
    handleRetryLoadUsers,
    getId,
  };
}
