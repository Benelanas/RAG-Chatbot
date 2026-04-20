import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import styles from "./inputChat.module.css";

export default function InputChat() {
    const { user, logout, getAuthHeaders, isAuthenticated } = useAuth();
    const router = useRouter();
    const chatMessagesRef = useRef(null);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [isInitializing, setIsInitializing] = useState(false);
    const hasInitializedRef = useRef(false);

    // Load sessions and create initial session if authenticated
    useEffect(() => {
        if (isAuthenticated && !isInitializing && !hasInitializedRef.current) {
            setIsInitializing(true);
            hasInitializedRef.current = true;
            loadSessions();
        } else if (!isAuthenticated) {
            // Reset state when user logs out
            setSessions([]);
            setCurrentSessionId(null);
            setMessages([]);
            setIsInitializing(false);
            hasInitializedRef.current = false;
        }
    }, [isAuthenticated]);

    // Load messages when session changes
    useEffect(() => {
        if (isAuthenticated && currentSessionId) {
            loadChatHistory();
        }
    }, [currentSessionId, isAuthenticated]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    async function loadSessions(){
        if (!isAuthenticated) return;
        
        try {
            const response = await fetch('/api/chat/get-sessions', {
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setSessions(data.sessions || []);
                
                // If no sessions exist, create one
                if (data.sessions.length === 0) {
                    await createNewSession();
                } else {
                    // Set the most recent session as current
                    setCurrentSessionId(data.sessions[0].id);
                }
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
        } finally {
            setIsInitializing(false);
        }
    };

    async function createNewSession(){
        if (!isAuthenticated) return;
        
        // Only prevent creation if this is the initial session creation for a new user
        // Allow existing users to create new chats
        if (isInitializing && sessions.length === 0) {
            return;
        }
        
        try {
            const response = await fetch('/api/chat/create-session', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ title: 'New Chat' }),
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentSessionId(data.sessionId);
                setMessages([]);
                
                // Add the new session to the existing sessions list
                const newSession = {
                    id: data.sessionId,
                    title: 'New Chat',
                    message_count: 0,
                    updated_at: new Date().toISOString()
                };
                setSessions(prev => [newSession, ...prev]);
            }
        } catch (error) {
            console.error('Error creating new session:', error);
        }
    };

    async function loadChatHistory(){
        if (!isAuthenticated || !currentSessionId) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/api/chat/get-messages?sessionId=${currentSessionId}`, {
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        } finally {
            setLoading(false);
        }
    };

    async function saveMessage(role, content){
        if (!isAuthenticated || !currentSessionId) {
            console.log('Not saving message - user not authenticated or no session');
            return;
        }
        
        try {
            const response = await fetch('/api/chat/save-message', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ role, content, sessionId: currentSessionId }),
            });

            if (!response.ok) {
                console.error('Failed to save message - server returned:', response.status);
                return;
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving message:', error);
        }
    };

    async function switchSession(sessionId){
        setCurrentSessionId(sessionId);
        setMessages([]);
        setInput("");
    };

    async function deleteSession(sessionId){
        if (!isAuthenticated) return;
        
        try {
            const response = await fetch(`/api/chat/delete-session?sessionId=${sessionId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                // If we deleted the current session, switch to the most recent one or create new
                if (sessionId === currentSessionId) {
                    const remainingSessions = sessions.filter(s => s.id !== sessionId);
                    if (remainingSessions.length > 0) {
                        setCurrentSessionId(remainingSessions[0].id);
                    } else {
                        await createNewSession();
                    }
                }
                
                // Refresh sessions list
                await loadSessions();
            } else {
                console.error('Failed to delete session');
            }
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    async function handleGptResponse(messageObject) {
        const response = await fetch("/api/chat/chat-with-retrieval", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(messageObject),
        });
    
        const data = await response.json();
        return data;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!input.trim()) return;
        setIsUploading(true);

        const userMessage = {role: "user", content: input};  
        setInput("");
        setMessages(prev => [...prev, userMessage]);
        
        if (isAuthenticated) {
            await saveMessage("user", input);
        }
        
        const data = await handleGptResponse(userMessage);
        
        const assistantMessage = { 
            role: "assistant", 
            content: data.reply,
            context: data.context // Store context for display
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (isAuthenticated) {
            await saveMessage("assistant", data.reply);
        }

        setIsUploading(false);
    }



    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    };

   async function startNewChat(){
        if (isAuthenticated) {
            await createNewSession();
        } else {
            // For guest mode, just clear the current chat
            setMessages([]);
            setInput("");
        }
    };

    function handleLogout(){
        logout();
        router.push('/login');
    };

    // Function to parse bold text (**text**)
    function parseBoldText(text) {
        if (!text.includes('**')) return text;
        
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    }

    // Function to format AI message content with simple formatting
    function formatMessageContent(content) {
        if (!content) return '';
        
        // Simple approach: just preserve line breaks and basic formatting
        return content.split('\n').map((line, index) => {
            const trimmedLine = line.trim();
            
            // Skip empty lines
            if (!trimmedLine) return null;
            
            // Check for headers
            if (trimmedLine.startsWith('#')) {
                const text = trimmedLine.replace(/^#+\s*/, '');
                return (
                    <div key={index} className={styles.messageHeader}>
                        {text}
                    </div>
                );
            }
            
            // Check for code blocks
            if (trimmedLine.startsWith('```') && trimmedLine.endsWith('```')) {
                const code = trimmedLine.slice(3, -3);
                return (
                    <div key={index} className={styles.codeBlock}>
                        <code>{code}</code>
                    </div>
                );
            }
            
            // Check for inline code
            if (trimmedLine.includes('`') && !trimmedLine.startsWith('```')) {
                const parts = trimmedLine.split(/(`[^`]+`)/g);
                return (
                    <div key={index} className={styles.messageLine}>
                        {parts.map((part, partIndex) => {
                            if (part.startsWith('`') && part.endsWith('`')) {
                                return <code key={partIndex} className={styles.inlineCode}>{part.slice(1, -1)}</code>;
                            }
                            return part;
                        })}
                    </div>
                );
            }
            
            // Regular text line with basic formatting
            return (
                <div key={index} className={styles.messageLine}>
                    {parseBoldText(trimmedLine)}
                </div>
            );
        }).filter(Boolean); // Remove null entries
    }

    if (loading && isAuthenticated) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingContent}>
                    <div className={styles.loadingSpinner}></div>
                    <p className={styles.loadingText}>Loading chat history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chatbotContainer}>
            <Sidebar 
                messages={messages}
                sessions={sessions}
                currentSessionId={currentSessionId}
                onNewChat={startNewChat}
                onSwitchSession={switchSession}
                onDeleteSession={deleteSession}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                user={user}
                onLogout={handleLogout}
                isAuthenticated={isAuthenticated}
                currentPage="chat"
            />

            <div className={`${styles.mainContent} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                {!isAuthenticated && (
                    <div className={styles.guestModeBanner}>
                        <div className={styles.bannerContent}>
                            <span className={styles.bannerText}>
                                You're in guest mode. Messages won't be saved.
                            </span>
                            <button 
                                onClick={() => router.push('/login')}
                                className={styles.loginButton}
                            >
                                Login to save chats
                            </button>
                        </div>
                    </div>
                )}

                <div className={styles.chatMessages} ref={chatMessagesRef}>
                    {messages.map((message, index) => (
                        <div key={index} className={`${styles.message} ${styles[message.role]}`}>
                            <div className={styles.messageWrapper}>
                                {/* Avatar */}
                                <div className={`${styles.messageAvatar} ${styles[message.role]}`}>
                                    {message.role === 'user' ? user?.username?.charAt(0)?.toUpperCase() || 'U' : 'AI'}
                                </div>
                                
                                {/* Message Bubble */}
                                <div className={`${styles.messageBubble} ${styles[message.role]}`}>
                                    {message.role === 'assistant' ? (
                                        <div className={styles.messageText}>
                                            {formatMessageContent(message.content)}
                                        </div>
                                    ) : (
                                        <p className={styles.messageText}>{message.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Thinking indicator while AI is generating response */}
                    {isUploading && (
                        <div className={`${styles.message} ${styles.assistant}`}>
                            <div className={styles.messageWrapper}>
                                {/* Avatar */}
                                <div className={`${styles.messageAvatar} ${styles.assistant}`}>
                                    AI
                                </div>
                                
                                {/* Thinking Bubble */}
                                <div className={`${styles.messageBubble} ${styles.assistant}`}>
                                    <div className={styles.thinkingIndicator}>
                                        <div className={styles.thinkingSpinner}></div>
                                        <span className={styles.thinkingText}>Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Chat Input */}
                <div className={styles.chatInput}>
                    <form onSubmit={handleSubmit} className={styles.inputForm}>
                        <div className={styles.inputWrapper}>
                            <input
                                className={styles.textInput}
                                placeholder="Type your message here..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isUploading}
                            />

                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isUploading}
                            className={styles.sendButton}
                        >
                            {isUploading ? (
                                <div className={styles.loadingState}>
                                    <div className={styles.spinner}></div>
                                    Sending...
                                </div>
                            ) : (
                                <div className={styles.sendContent}>
                                    <span>Send</span>
                                    <svg className={styles.sendIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}