
import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaBuilding } from 'react-icons/fa';
import { FaPaperPlane } from 'react-icons/fa';
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
    try {
      const res = await fetchConversation(user._id);
      setMessages(res.data);
      // Mark all unread messages from this user as seen
      const unseen = res.data.filter(m => m.senderId === user._id && !m.seen);
      if (unseen.length > 0) {
        await Promise.all(unseen.map(m => markMessageSeen(m._id)));
      }
      setUnread(prev => ({ ...prev, [user._id]: 0 }));
    } catch {
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
      const res = await sendMessage(selectedUser._id, input);
      setMessages([...messages, res.data]);
      setInput('');
    } catch {
      // Optionally show error
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

  // Filter users by search (show company name for recruiters, name for others)
  let filteredUsers = users.filter(user => {
    if (!currentUser) return true; // Show all users if currentUser is not set
    if (user._id === currentUser._id) return false;
    if (user.role === 'recruiter') {
      return (user.companyName || '').toLowerCase().includes(search.toLowerCase());
    }
    return (user.name || '').toLowerCase().includes(search.toLowerCase());
  });

  // Show current user at top if present (optional, can remove if not needed)
  // if (currentUser) {
  //   filteredUsers = [currentUser, ...filteredUsers.filter(u => u._id !== currentUser._id)];
  // }

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
            <div className="w-full md:w-1/3 lg:w-1/4 border-r bg-gray-50 p-4 h-full">
              <h2 className="text-lg font-semibold mb-4">Chats</h2>
              <div className="mb-3 flex gap-2">
                <input
                  className="border rounded px-2 py-1 flex-1"
                  type="text"
                  placeholder="Search user..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  type="button"
                  aria-label="Search"
                  onClick={() => {}}
                >
                  🔍
                </button>
              </div>
              {userError ? (
                <div className="text-red-500 text-sm mb-2">
                  {userError}
                  <button
                    className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    onClick={handleRetryLoadUsers}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="overflow-y-auto h-full" style={{ maxHeight: '100%' }}>
                  {filteredUsers.length === 0 && (
                    <div className="text-gray-400 text-center">No users found.</div>
                  )}
                  <ul className="space-y-1">
                    {filteredUsers.map((user, idx) => {
                      let avatar = null;
                      if (user.role === 'recruiter') {
                        if (user.companyLogo) {
                          avatar = <img src={`http://localhost:5000${user.companyLogo}`} alt="logo" className="w-8 h-8 rounded-full object-cover border" />;
                        } else {
                          avatar = <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full border text-xl text-gray-500"><FaBuilding /></span>;
                        }
                      } else {
                        if (user.profilePicture) {
                          avatar = <img src={`http://localhost:5000${user.profilePicture}`} alt="avatar" className="w-8 h-8 rounded-full object-cover border" />;
                        } else {
                          avatar = <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full border text-xl text-gray-500"><FaUser /></span>;
                        }
                      }
                      return (
                        <li key={user._id || user.email || idx} className="relative">
                          <button
                            className={`flex items-center gap-3 w-full text-left px-2 py-2 rounded hover:bg-blue-50 ${selectedUser && selectedUser._id === user._id ? 'bg-blue-100 font-semibold' : ''}`}
                            onClick={() => handleUserSelect(user)}
                          >
                            {avatar}
                            <span>
                              {user.role === 'recruiter' ? (user.companyName || 'Unnamed Company') : (user.name || user.email)}
                            </span>
                            {unread[user._id] > 0 && (
                              <span className="absolute right-2 top-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unread[user._id]}</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
            {/* Chat window */}
            <div className="flex-1 flex flex-col p-4">
              {selectedUser ? (
                <>
                  <div className="flex-1 overflow-y-auto mb-2 border rounded p-2 bg-gray-50">
                    {loading ? (
                      <div className="text-gray-400 text-center">Loading...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-gray-400 text-center">No messages yet.</div>
                    ) : (
                      messages.filter(Boolean).map(msg => {
                        if (!msg || typeof msg !== 'object' || !('senderId' in msg)) return null;
                        const isMine = currentUser && (msg.senderId === currentUser._id || msg.senderId === currentUser.id || (msg.senderId && msg.senderId.toString && msg.senderId.toString() === currentUser._id));
                        return (
                          <div
                            key={msg._id}
                            className={`mb-2 flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`px-3 py-2 rounded-lg max-w-xs shadow-sm ${
                                isMine
                                  ? 'bg-green-500 text-white rounded-br-none'
                                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
                              }`}
                            >
                              {msg.content}
                              <div className={`text-xs mt-1 text-right ${isMine ? 'text-green-100' : 'text-gray-500'}`}>
                                {(() => {
                                  if (!msg.createdAt) return '';
                                  const dateObj = new Date(msg.createdAt);
                                  const now = new Date();
                                  const msgDate = dateObj.toLocaleDateString();
                                  const today = now.toLocaleDateString();
                                  const yesterday = new Date(now.getTime() - 86400000).toLocaleDateString();
                                  let label = msgDate;
                                  if (msgDate === today) label = 'Today';
                                  else if (msgDate === yesterday) label = 'Yesterday';
                                  return `${label}, ${dateObj.toLocaleTimeString()}`;
                                })()}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input
                      className="flex-1 border rounded px-3 py-2"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder={`Message ${selectedUser.role === 'recruiter' ? (selectedUser.companyName || 'Company') : (selectedUser.name || selectedUser.email)}`}
                      disabled={sending || (selectedUser && currentUser && selectedUser._id === currentUser._id)}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center"
                      disabled={sending || (selectedUser && currentUser && selectedUser._id === currentUser._id) || !input || !input.trim()}
                      aria-label="Send"
                    >
                      {sending ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <FaPaperPlane size={22} />
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">Select a user to start chatting.</div>
              )}
            </div>
          </div>
        </main>
      </div>
  {/* No toast for new message */}
      <Footer />
    </div>
  );
}
