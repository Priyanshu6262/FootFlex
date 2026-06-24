import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import API_URL from '../config/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const SESSION_KEY = 'footflex_chat_history';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 Welcome to **FootFlex**!

I'm your AI shopping assistant. I can help you with:
• 👟 Product recommendations
• 📦 Order tracking & status
• 🔄 Returns & refunds
• 💳 Payments & delivery
• 🗺️ Website navigation

How can I help you today?`,
  timestamp: new Date().toISOString(),
};

const QUICK_REPLIES = [
  'What products do you sell?',
  'How can I place an order?',
  'What payment methods are available?',
  'How long does delivery take?',
  'How can I track my order?',
  'What is your return policy?',
  'Do you offer refunds?',
  'Which shoes are best for running?',
  'Show me products under ₹2000',
  'How can I contact support?',
];

// ─── Utility: parse simple markdown ──────────────────────────────────────────
function parseMarkdown(text) {
  const lines = text.split('\n');
  const result = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      result.push(<br key={key++} />);
      continue;
    }

    // Bold **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (line.startsWith('• ') || line.startsWith('- ')) {
      result.push(
        <div key={key++} className="flex gap-1.5 my-0.5">
          <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
          <span>{line.slice(2).split(/(\*\*[^*]+\*\*)/g).map((p, idx) =>
            p.startsWith('**') && p.endsWith('**')
              ? <strong key={idx}>{p.slice(2, -2)}</strong>
              : p
          )}</span>
        </div>
      );
    } else {
      result.push(<p key={key++} className="my-0.5">{parts}</p>);
    }
  }
  return result;
}

// ─── Timestamp formatter ──────────────────────────────────────────────────────
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
        <Bot size={14} className="text-white" />
      </div>
      <div className="bg-[#1c1c1f] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-400"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex items-end gap-2 mb-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
          : 'bg-gradient-to-br from-blue-500 to-blue-700'
      }`}>
        {isUser ? <User size={13} className="text-white" /> : <Bot size={13} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm shadow-lg shadow-blue-900/30'
            : 'bg-[#1c1c1f] border border-white/10 text-zinc-100 rounded-bl-sm'
        }`}>
          {isUser ? msg.content : parseMarkdown(msg.content)}
        </div>
        <span className="text-[10px] text-zinc-600 mt-1 px-1">{formatTime(msg.timestamp)}</span>
      </div>
    </motion.div>
  );
}

// ─── Main ChatBot Component ───────────────────────────────────────────────────
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : [WELCOME_MESSAGE];
    } catch {
      return [WELCOME_MESSAGE];
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatPanelRef = useRef(null);

  // Persist chat to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
    } catch { /* quota exceeded — ignore */ }
  }, [messages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Track unread messages when closed — use a ref to avoid stale closure
  const prevMsgCountRef = useRef(messages.length);
  useEffect(() => {
    const prev = prevMsgCountRef.current;
    prevMsgCountRef.current = messages.length;
    if (!isOpen && messages.length > prev) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && lastMsg.id !== 'welcome') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUnreadCount(c => c + 1);
      }
    }
  }, [messages, isOpen]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setError(null);
    setShowQuickReplies(false);

    try {
      // Build history (exclude welcome message and current message)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          response.status === 404
            ? 'Chat endpoint not found. Please restart the backend server.'
            : `Server error (${response.status}). Please restart the backend server.`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsTyping(false);
    }
  }, [messages, isTyping]);

  const handleSend = () => sendMessage(inputValue);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => setIsMinimized(true);
  const handleMaximize = () => {
    setIsMinimized(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
  };

  const clearChat = () => {
    setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date().toISOString() }]);
    setShowQuickReplies(true);
    setError(null);
  };

  return (
    <>
      {/* ── Floating Trigger Button ─────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="chatbot-trigger-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/40 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#09090b]"
            aria-label="Open AI chat assistant"
          >
            {/* Pulsing ring */}
            <motion.span
              className="absolute w-full h-full rounded-full bg-blue-500/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <MessageCircle size={24} className="text-white relative z-10" />

            {/* Unread badge */}
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center z-20"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-panel"
            ref={chatPanelRef}
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={isMinimized
              ? { opacity: 1, y: 0, scale: 1, height: 'auto' }
              : { opacity: 1, y: 0, scale: 1 }
            }
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={`fixed z-50 flex flex-col overflow-hidden
              rounded-2xl border border-white/10 shadow-2xl shadow-black/60
              bg-[#111113]
              ${isMinimized
                ? 'bottom-6 right-6 w-72'
                : 'bottom-6 right-6 w-[370px] h-[580px] sm:w-[390px] sm:h-[600px] max-sm:inset-4 max-sm:w-auto max-sm:h-auto max-sm:bottom-4 max-sm:right-4 max-sm:left-4 max-sm:top-4'
              }`}
          >
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-4 py-3 flex items-center gap-3">
              {/* Bot avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-blue-700" />
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-white font-semibold text-sm leading-tight truncate">FootFlex AI</p>
                  <Sparkles size={12} className="text-blue-200 flex-shrink-0" />
                </div>
                <p className="text-blue-200 text-[11px] leading-tight">Online · Always ready to help</p>
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!isMinimized ? (
                  <button
                    id="chatbot-minimize-btn"
                    onClick={handleMinimize}
                    className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white"
                    aria-label="Minimize chat"
                  >
                    <Minimize2 size={14} />
                  </button>
                ) : (
                  <button
                    id="chatbot-maximize-btn"
                    onClick={handleMaximize}
                    className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white"
                    aria-label="Maximize chat"
                  >
                    <ChevronDown size={14} className="rotate-180" />
                  </button>
                )}
                <button
                  id="chatbot-close-btn"
                  onClick={handleClose}
                  className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white"
                  aria-label="Close chat"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* ── Body (hidden when minimized) ─────────────────────────────── */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  {/* Messages area */}
                  <div
                    id="chatbot-messages"
                    className="flex-1 overflow-y-auto px-4 py-4 space-y-0 scroll-smooth"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}
                  >
                    {messages.map(msg => (
                      <MessageBubble key={msg.id} msg={msg} />
                    ))}
                    {isTyping && <TypingIndicator />}

                    {/* Error message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 bg-red-950/60 border border-red-800/50 rounded-xl px-3 py-2.5 mb-2"
                      >
                        <span className="text-red-400 text-xs flex-1">⚠️ {error}</span>
                        <button
                          onClick={() => setError(null)}
                          className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* ── Quick Replies ───────────────────────────────────────── */}
                  <AnimatePresence>
                    {showQuickReplies && messages.length <= 2 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-3 pb-2 flex-shrink-0"
                      >
                        <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-medium mb-2 px-1">
                          Suggested questions
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto"
                          style={{ scrollbarWidth: 'none' }}>
                          {QUICK_REPLIES.map((reply, idx) => (
                            <button
                              key={idx}
                              id={`quick-reply-${idx}`}
                              onClick={() => sendMessage(reply)}
                              disabled={isTyping}
                              className="text-[11px] px-2.5 py-1.5 rounded-full border border-blue-800/60 bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 hover:border-blue-600 hover:text-blue-200 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Divider ─────────────────────────────────────────────── */}
                  <div className="h-px bg-white/5 flex-shrink-0" />

                  {/* ── Input Bar ───────────────────────────────────────────── */}
                  <div className="flex-shrink-0 px-3 py-3 bg-[#111113]">
                    <div className="flex items-end gap-2 bg-[#1c1c1f] border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500/50 transition-colors">
                      <textarea
                        id="chatbot-input"
                        ref={inputRef}
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        rows={1}
                        disabled={isTyping}
                        className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 resize-none outline-none min-h-[22px] max-h-28 overflow-y-auto leading-relaxed disabled:opacity-50"
                        style={{ scrollbarWidth: 'none' }}
                        onInput={e => {
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 112) + 'px';
                        }}
                        aria-label="Chat message input"
                      />
                      <button
                        id="chatbot-send-btn"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all duration-150 flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-md shadow-blue-900/40"
                        aria-label="Send message"
                      >
                        <Send size={14} className="text-white translate-x-[1px]" />
                      </button>
                    </div>

                    {/* Footer meta */}
                    <div className="flex items-center justify-between mt-2 px-1">
                      <p className="text-zinc-700 text-[10px]">Powered by Google Gemini</p>
                      <button
                        id="chatbot-clear-btn"
                        onClick={clearChat}
                        className="text-zinc-700 hover:text-zinc-500 text-[10px] transition-colors"
                        aria-label="Clear chat history"
                      >
                        Clear chat
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Minimized summary bar */}
            {isMinimized && (
              <button
                onClick={handleMaximize}
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/5 transition-colors w-full text-left"
              >
                <Sparkles size={12} className="text-blue-400 flex-shrink-0" />
                <span className="text-xs text-zinc-400">Click to open chat</span>
                <ChevronDown size={12} className="text-zinc-600 ml-auto rotate-180" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
