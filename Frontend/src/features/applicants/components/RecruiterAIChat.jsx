import { useState, useRef, useEffect, useCallback } from 'react';
import { sendRAGMessage } from '../../../services/ragApi';
import './RecruiterAIChat.css';

const QUICK_PROMPTS = [
    'Who are my top candidates?',
    'Compare applicants for…',
    'Who has the most experience?',
    'Summarize the applicant pipeline',
];

function MarkdownText({ text }) {
    const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/^[\s]*[-*]\s+(.+)$/gm, '<li>$1</li>')
        .replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li>$1</li>')
        .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
        .replace(/\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

const initSessions = () => {
    try {
        const savedSessions = localStorage.getItem('skillSync_rai_sessions');
        if (savedSessions) return JSON.parse(savedSessions);

        const legacyChat = localStorage.getItem('skillSync_rai_chat');
        if (legacyChat) {
            const legacyMessages = JSON.parse(legacyChat);
            if (legacyMessages.length > 0) {
                return [{
                    id: Date.now().toString(),
                    title: legacyMessages.find(m => m.role === 'user')?.content.slice(0, 30) || 'Previous Chat',
                    messages: legacyMessages,
                    createdAt: Date.now()
                }];
            }
        }
    } catch (e) {
        console.error('Failed to parse sessions', e);
    }
    return [{ id: Date.now().toString(), title: 'New Chat', messages: [], createdAt: Date.now() }];
};

export default function RecruiterAIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [sessions, setSessions] = useState(initSessions);
    const [currentSessionId, setCurrentSessionId] = useState(() => {
        return localStorage.getItem('skillSync_rai_current_session') || sessions[0]?.id;
    });

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
    const messages = currentSession?.messages || [];

    useEffect(() => {
        localStorage.setItem('skillSync_rai_sessions', JSON.stringify(sessions));
        if (currentSessionId) {
            localStorage.setItem('skillSync_rai_current_session', currentSessionId);
        }
    }, [sessions, currentSessionId]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, scrollToBottom]);

    useEffect(() => {
        if (isOpen && !isSidebarOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, isSidebarOpen, currentSessionId]);

    const createNewSession = () => {
        const newSession = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            createdAt: Date.now()
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setError('');
        if (window.innerWidth <= 480) setIsSidebarOpen(false);
    };

    const deleteSession = (id) => {
        setSessions(prev => {
            const updated = prev.filter(s => s.id !== id);
            if (updated.length === 0) {
                const newOne = { id: Date.now().toString(), title: 'New Chat', messages: [], createdAt: Date.now() };
                setCurrentSessionId(newOne.id);
                return [newOne];
            }
            if (currentSessionId === id) {
                setCurrentSessionId(updated[0].id);
            }
            return updated;
        });
    };

    const switchSession = (id) => {
        setCurrentSessionId(id);
        setError('');
        if (window.innerWidth <= 480) setIsSidebarOpen(false);
    };

    const updateCurrentSessionMessages = (newMessages) => {
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                let title = s.title;
                if (title === 'New Chat' && newMessages.length === 1 && newMessages[0].role === 'user') {
                    const firstMsg = newMessages[0].content;
                    title = firstMsg.slice(0, 25) + (firstMsg.length > 25 ? '...' : '');
                }
                return { ...s, title, messages: newMessages };
            }
            return s;
        }));
    };

    const sendMessage = async (text) => {
        const userMessage = text || input.trim();
        if (!userMessage || loading) return;

        setInput('');
        setError('');

        const newMessages = [...messages, { role: 'user', content: userMessage }];
        updateCurrentSessionMessages(newMessages);
        setLoading(true);

        try {
            const history = newMessages.slice(-10);
            const data = await sendRAGMessage(userMessage, history);
            updateCurrentSessionMessages([...newMessages, { role: 'assistant', content: data.reply }]);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Something went wrong. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const showPrompts = messages.length === 0 && !loading;

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                id="rai-toggle-btn"
                className="rai-toggle"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
                title="AI Recruiting Assistant"
            >
                {isOpen ? (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                        </svg>
                        <span className="rai-dot" />
                    </>
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="rai-panel" role="dialog" aria-label="AI Recruiting Assistant">

                    {/* Sidebar Overlay (Chat History) */}
                    <div className={`rai-chat-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />
                    <div className={`rai-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                        <div className="rai-sidebar-header">
                            <button className="rai-new-chat-btn" onClick={createNewSession}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Chat
                            </button>
                            <button className="rai-close-sidebar-btn" onClick={() => setIsSidebarOpen(false)} aria-label="Close history">
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="rai-sidebar-list">
                            {sessions.map(s => (
                                <div
                                    key={s.id}
                                    className={`rai-session-item ${s.id === currentSessionId ? 'active' : ''}`}
                                    onClick={() => switchSession(s.id)}
                                >
                                    <div className="rai-session-title-wrap">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                        <span className="rai-session-title">{s.title}</span>
                                    </div>
                                    <button
                                        className="rai-delete-session"
                                        onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                                        title="Delete chat"
                                        aria-label="Delete chat session"
                                    >
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Header */}
                    <div className="rai-header">
                        <button className="rai-hamburger-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Menu" title="Chat History">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="rai-header-info">
                            <h3 className="rai-header-title">AI Recruiting Assistant</h3>
                            <p className="rai-header-sub">Ask about your applicants</p>
                        </div>
                        <div className="rai-header-actions">
                            <button
                                className="rai-action-btn"
                                onClick={createNewSession}
                                aria-label="New chat"
                                title="New Chat"
                            >
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                            <button
                                className="rai-action-btn"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close chat"
                                title="Close"
                            >
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="rai-messages">
                        {showPrompts && (
                            <div className="rai-welcome">
                                <div className="rai-welcome-icon">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                    </svg>
                                </div>
                                <h3>Hi there! 👋</h3>
                                <p>
                                    I can help you analyze your applicant pool. Ask me about candidates, compare skills,
                                    or get insights about your pipeline.
                                </p>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`rai-msg ${msg.role}`}>
                                {msg.role === 'assistant' ? (
                                    <MarkdownText text={msg.content} />
                                ) : (
                                    msg.content
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="rai-typing">
                                <div className="rai-typing-dots">
                                    <span /><span /><span />
                                </div>
                                <span className="rai-typing-text">Analyzing applicants…</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompts */}
                    {showPrompts && (
                        <div className="rai-prompts">
                            {QUICK_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    className="rai-prompt-btn"
                                    onClick={() => sendMessage(prompt)}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Error Bar */}
                    {error && (
                        <div className="rai-error">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                            <button onClick={() => setError('')}>Dismiss</button>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="rai-input-area">
                        <textarea
                            ref={inputRef}
                            className="rai-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your applicants…"
                            rows={1}
                            disabled={loading}
                            id="rai-chat-input"
                        />
                        <button
                            className="rai-send-btn"
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            aria-label="Send message"
                            id="rai-send-btn"
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

