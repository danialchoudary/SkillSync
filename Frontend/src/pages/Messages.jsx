import React, { useState, useEffect, useRef } from 'react';
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
    // Add error handling for handleSend
    try {
      const res = await sendMessage(selectedUser._id, input);
      setMessages([...messages, res.data]);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
    setSending(false);
  };

  // Poll for new messages every 5 seconds (no toast)
  useEffect(() => {
    if (!selectedUser) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetchConversation(selectedUser._id);
        setMessages(res.data);
        prevMessagesRef.current = res.data;
      } catch {}
    }, 5000);
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
        } catch {}
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
            <ChatWindow
              selectedUser={selectedUser}
              messages={messages}
              loading={loading}
              currentUser={currentUser}
              input={input}
              setInput={setInput}
              sending={sending}
              handleSend={handleSend}
            />
          </div>
        </main>
      </div>
      {/* No toast for new message */}
      <Footer />
    </div>
  );
}
