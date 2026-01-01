import React, { useState, useEffect, useRef, useCallback } from 'react';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';
import { fetchAllUsers } from '../services/userApi';
import { fetchConversation, sendMessage, markMessageSeen } from '../services/messagesApi';
import { getMe } from '../services/api';
import Sidebar from '../components/Sidebar';
import RecruiterSidebar from '../components/RecruiterSidebar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket, onEvent, offEvent, emitEvent, getSocket } from '../services/socketService';
export default function Messages() {
  // For recruiter sidebar state
  const [activeSection, setActiveSection] = useState('messages');
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [userError, setUserError] = useState('');
  const [unread, setUnread] = useState({}); // { userId: count }
  const [toast, setToast] = useState('');
  const prevMessagesRef = useRef([]);
  const [typingUsers, setTypingUsers] = useState({}); // { senderId: true }

  // Enhanced error handling for user loading
  useEffect(() => {
    let cancelled = false;
    async function loadUsers() {
      try {
        const meRes = await getMe();
        if (!cancelled) {
          setCurrentUser(meRes.data);
          console.log('Current user:', meRes.data);
        }
        // Route protection
        if (meRes.data?.role === 'recruiter' && location.pathname !== '/recruiter/message') {
          navigate('/recruiter/message', { replace: true });
        } else if (meRes.data?.role !== 'recruiter' && location.pathname !== '/messages') {
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
      } catch (err) {
        if (!cancelled) {
          setUsers([]);
          // Try to re-authenticate if not logged in
          if (!currentUser) {
            setUserError('Could not load users. Please log in again.');
          } else {
            setUserError('Could not load users. Please check your connection or try again.');
          }
        }
      }
    }
    loadUsers();
    return () => { cancelled = true; };
  }, [location.pathname, navigate]);

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setLoading(true);
    // Add error handling for handleUserSelect
    try {
      const res = await fetchConversation(user._id);
      setMessages(res.data);
      // Mark all unread messages from this user as seen
      const unseen = res.data.filter(m => m.senderId === user._id && !m.seen);
      if (unseen.length > 0) {
        await Promise.all(unseen.map(m => markMessageSeen(m._id)));
      }
      setUnread(prev => ({ ...prev, [user._id]: 0 }));
    } catch (error) {
      console.error('Error fetching conversation:', error);
      alert('Failed to load messages. Please try again.');
      setMessages([]);
    }
    setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    // Prevent sending if input is empty, only whitespace, already sending, or no user selected
    if (!input || !input.trim() || !selectedUser || !currentUser || sending) return;
    setSending(true);
    try {
      const socketInstance = getSocket();

      // Optimistic UI Update: Show message immediately
      const tempMessage = {
        _id: Date.now().toString(), // Temporary ID
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        content: input.trim(),
        seen: false,
        createdAt: new Date().toISOString(),
        sender: currentUser, // Needed for ChatWindow to render right side
        receiver: selectedUser
      };

      setMessages(prev => [...prev, tempMessage]);
      setInput('');

      if (socketInstance && socketInstance.connected) {
        // Send via Socket.IO
        emitEvent('send_message', { receiverId: selectedUser._id, content: input.trim() }, (response) => {
          if (response?.error) {
            console.error('Socket send_message error:', response.error);
            // Rollback optimistic update on error (optional, or show error state)
            setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
            alert('Failed to send message. Please try again.');
          }
        });
      } else {
        // Fallback to REST API
        console.warn('[Messages] Socket not connected, using REST fallback');
        const res = await sendMessage(selectedUser._id, input);
        setMessages([...messages, res.data]);
        setInput('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
    setSending(false);
  };

  // Typing indicator handler
  const handleTyping = useCallback((isTyping) => {
    if (selectedUser) {
      emitEvent('typing', { receiverId: selectedUser._id, isTyping });
    }
  }, [selectedUser]);

  // Connect Socket.IO once currentUser is loaded
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    console.log('[Messages] Socket connection effect - currentUser:', !!currentUser);
    if (!currentUser) return;

    const token = localStorage.getItem('token');
    console.log('[Messages] Token from localStorage:', token ? 'Present' : 'Missing');

    if (token) {
      console.log('[Messages] Calling connectSocket...');
      const socket = connectSocket(token);
      console.log('[Messages] connectSocket returned:', socket ? 'Socket instance' : 'null/undefined');

      // Listen for successful connection
      const handleConnect = () => {
        console.log('[Messages] Socket connected, setting ready state');
        setSocketReady(true);
      };

      if (socket) {
        socket.on('connect', handleConnect);
        // If already connected
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
  }, [currentUser]);

  // Real-time message listener - only subscribe when socket is ready
  useEffect(() => {
    if (!socketReady) return;

    const handleReceiveMessage = (message) => {
      // Only add if conversation is with this sender/receiver
      if (selectedUser && (message.sender?._id === selectedUser._id || message.receiver?._id === selectedUser._id)) {
        setMessages((prev) => {
          // Check if we already have this message (by ID)
          const exists = prev.find(m => m._id === message._id);
          if (exists) return prev;

          // If this is the real version of a temp message I sent, replace the temp one
          // (Simple heuristic: if I sent it recently and content matches)
          if (message.senderId === currentUser._id) {
            const tempMatch = prev.find(m =>
              m._id.length > 20 && // Temp IDs are timestamps (short) or large numbers? Date.now() is 13 digits. MongoDB ObjectIds are 24 hex chars.
              !isNaN(Number(m._id)) && // Check if it's our numeric temp ID
              m.content === message.content &&
              m.receiverId === message.receiverId
            );
            if (tempMatch) {
              return prev.map(m => m._id === tempMatch._id ? message : m);
            }
          }

          return [...prev, message];
        });
      }
    };

    const handleTypingEvent = ({ senderId, isTyping }) => {
      setTypingUsers((prev) => ({ ...prev, [senderId]: isTyping }));
    };

    onEvent('receive_message', handleReceiveMessage);
    onEvent('user_typing', handleTypingEvent);

    return () => {
      offEvent('receive_message', handleReceiveMessage);
      offEvent('user_typing', handleTypingEvent);
    };
  }, [socketReady, selectedUser]);

  // Fallback Poll for new messages every 30 seconds (reduced frequency due to sockets)
  useEffect(() => {
    if (!selectedUser) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetchConversation(selectedUser._id);
        setMessages(res.data);
        prevMessagesRef.current = res.data;
      } catch { }
    }, 30000); // Reduced from 5s to 30s
    return () => clearInterval(interval);
  }, [selectedUser, currentUser]);

  // Track unread messages for each user
  useEffect(() => {
    if (!currentUser) return;
    const fetchUnread = async () => {
      const unreadMap = {};
      for (const user of users) {
        if (!user._id || user._id === currentUser._id) continue;
        try {
          const res = await fetchConversation(user._id);
          const count = res.data.filter(m => m.senderId === user._id && !m.seen).length;
          unreadMap[user._id] = count;
        } catch { }
      }
      setUnread(unreadMap);
    };
    fetchUnread();
  }, [users, currentUser]);


  // Filter users for UserList (show company name for recruiters, name for others)
  let filteredUsers = users.filter(user => {
    if (!currentUser) return true;
    // Do NOT filter out the current user, so you can message yourself
    if (user.role === 'recruiter') {
      return (user.companyName || '').toLowerCase().includes(search.toLowerCase());
    }
    return (user.name || '').toLowerCase().includes(search.toLowerCase());
  });

  // Retry user loading
  const handleRetryLoadUsers = () => {
    setUserError('');
    setUsers([]);
    setCurrentUser(null);
    // Force reload by navigating to same route
    navigate(location.pathname, { replace: true });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <Topbar user={currentUser} />
      <div className="flex flex-1 overflow-hidden">
        {currentUser?.role === 'recruiter' ? (
          <RecruiterSidebar
            activeSection={activeSection}
            onSectionChange={section => {
              setActiveSection(section);
              if (section === 'dashboard') {
                navigate('/recruiter');
              } else if (section === 'messages') {
                navigate('/recruiter/message');
              } else if (section === 'settings') {
                // Stay on messages page, just update section
              } else if (section === 'logout') {
                // Logout handled in sidebar
              } else {
                navigate(`/recruiter/${section}`);
              }
            }}
            unreadCount={Object.values(unread).reduce((a, b) => a + b, 0)}
          />
        ) : (
          <Sidebar unreadCount={Object.values(unread).reduce((a, b) => a + b, 0)} />
        )}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* User list with search */}
            <UserList
              users={filteredUsers}
              currentUser={currentUser}
              selectedUser={selectedUser}
              unread={unread}
              search={search}
              setSearch={setSearch}
              onUserSelect={handleUserSelect}
              userError={userError}
              onRetryLoadUsers={handleRetryLoadUsers}
            />
            {/* Chat window */}
            <div className="flex-1 flex flex-col relative">
              {/* Debug/Status Indicator */}
              <div className="absolute top-2 right-4 z-50 flex items-center gap-2 bg-white/80 px-2 py-1 rounded-full text-xs shadow-sm backdrop-blur-sm">
                <div className={`w-2 h-2 rounded-full ${socketReady ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-gray-600 font-medium">
                  {socketReady ? 'Real-time Connected' : 'Connecting...'}
                </span>
              </div>

              <ChatWindow
                selectedUser={selectedUser}
                messages={messages}
                loading={loading}
                currentUser={currentUser}
                input={input}
                setInput={setInput}
                sending={sending}
                handleSend={handleSend}
                onTyping={handleTyping}
                typingUsers={typingUsers}
              />
            </div>
          </div>
        </main>
      </div>
      {/* No toast for new message */}
      <Footer />
    </div>
  );
}
