import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';
import Sidebar from '../components/Sidebar';
import RecruiterSidebar from '../components/RecruiterSidebar';
import Topbar from '../components/Topbar';
import useMessagesPage from '../features/messages/hooks/useMessagesPage';

export default function Messages() {
  const [activeSection, setActiveSection] = useState('messages');
  const location = useLocation();
  const navigate = useNavigate();

  const {
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
    isUserOnline,
    handleRetryLoadUsers,
    getId,
  } = useMessagesPage({ locationPathname: location.pathname, navigate });

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Topbar user={currentUser} />

      <div className="relative flex-1 flex">
        <div className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 z-20 bg-[var(--color-surface)] border-r border-[var(--color-border)]">
          {currentUser?.role === 'recruiter' ? (
            <RecruiterSidebar
              activeSection={activeSection}
              onSectionChange={(section) => {
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
              unreadCount={totalUnread}
            />
          ) : (
            <Sidebar unreadCount={totalUnread} />
          )}
        </div>

        <main className="flex-1 lg:ml-64 pt-14 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            <div className={`${selectedUser ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'} w-full lg:w-auto`}>
              <UserList
                users={filteredUsers}
                selectedUser={selectedUser}
                unread={unread}
                isUserOnline={isUserOnline}
                search={search}
                setSearch={setSearch}
                onUserSelect={handleUserSelect}
                userError={userError}
                onRetryLoadUsers={handleRetryLoadUsers}
              />
            </div>

            <div className={`${selectedUser ? 'flex' : 'hidden lg:flex'} flex-1 flex-col relative`}>
              {selectedUser && (
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="lg:hidden absolute left-3 top-3 z-50 px-3 py-1.5 rounded-lg bg-white/90 border border-gray-200 text-xs font-semibold text-gray-700 shadow-sm"
                >
                  Back
                </button>
              )}

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
                isUserOnline={isUserOnline(getId(selectedUser?._id || selectedUser?.id))}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
