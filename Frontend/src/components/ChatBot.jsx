import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Sparkles,
  ChevronDown,
  ShoppingBag,
  Eye,
  Package,
  CheckCircle2,
  Truck,
  Tag,
  ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const SESSION_KEY = 'footflex_chat_history';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  type: 'general_text',
  content: `👋 Welcome to **FootFlex AI**!

I am your AI Shopping Assistant powered by **RAG + MCP**. I can help you:
• 👟 Search & recommend products tailored to your budget
• 📦 Track real-time order status & delivery progress
• 🛒 Add items directly to your shopping cart
• 📋 Answer questions about returns, refunds, warranty & policies

How can I assist your shopping experience today?`,
  timestamp: new Date().toISOString(),
};

const QUICK_REPLIES = [
  'Show me running shoes under ₹3000',
  'Find white sneakers under ₹2500',
  'Where is my latest order?',
  'What is your return policy?',
  'Do you provide refunds?',
  'Recommend shoes for me',
  'Is Nike Revolution 7 available?',
  'How long does shipping take?',
];

// ─── Utility: parse simple markdown ──────────────────────────────────────────
function parseMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const result = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      result.push(<br key={key++} />);
      continue;
    }

    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-semibold text-blue-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (line.startsWith('• ') || line.startsWith('- ')) {
      result.push(
        <div key={key++} className="flex gap-1.5 my-0.5">
          <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
          <span>{line.slice(2).split(/(\*\*[^*]+\*\*)/g).map((p, idx) =>
            p.startsWith('**') && p.endsWith('**')
              ? <strong key={idx} className="font-semibold text-blue-300">{p.slice(2, -2)}</strong>
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

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Component: Interactive Product Card ──────────────────────────────────────
function AIProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    const defaultSize = product.inventory && product.inventory[0] ? product.inventory[0].size : '8';
    const defaultColor = product.inventory && product.inventory[0] ? product.inventory[0].color : 'Black';

    addToCart(product, defaultSize, defaultColor);
    setAdded(true);
    if (showToast) showToast(`Added ${product.name} to cart! 🛒`, 'cart');

    setTimeout(() => setAdded(false), 2000);
  };

  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#18181b] border border-white/10 rounded-xl overflow-hidden shadow-lg flex flex-col group hover:border-blue-500/40 transition-all"
    >
      <div className="relative h-24 bg-[#27272a] flex items-center justify-center p-2 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <Tag size={10} /> {product.discount}% OFF
          </span>
        )}
      </div>

      <div className="p-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] uppercase tracking-wider text-blue-400 font-medium">
              {product.category} · {product.gender}
            </span>
          </div>
          <h4 className="text-xs font-bold text-zinc-100 line-clamp-1 mt-0.5">{product.name}</h4>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-extrabold text-white">₹{discountedPrice}</span>
            {product.discount > 0 && (
              <span className="text-[10px] text-zinc-500 line-through">₹{product.price}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 mt-2">
          <button
            onClick={() => navigate(`/product/${product.id || product._id}`)}
            className="flex items-center justify-center gap-1 text-[10px] py-1 px-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            <Eye size={11} /> View
          </button>
          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`flex items-center justify-center gap-1 text-[10px] py-1 px-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              added
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30'
            }`}
          >
            {added ? <CheckCircle2 size={11} /> : <ShoppingBag size={11} />}
            {added ? 'Added' : 'Add Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Component: Interactive Order Card ────────────────────────────────────────
function AIOrderCard({ order }) {
  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'delivered') return { bg: 'bg-green-950/80 text-green-400 border-green-800/60', icon: <CheckCircle2 size={11} /> };
    if (s === 'shipped' || s === 'out-for-delivery') return { bg: 'bg-blue-950/80 text-blue-400 border-blue-800/60', icon: <Truck size={11} /> };
    if (s === 'return-requested' || s === 'returned') return { bg: 'bg-purple-950/80 text-purple-400 border-purple-800/60', icon: <Package size={11} /> };
    return { bg: 'bg-amber-950/80 text-amber-400 border-amber-800/60', icon: <Package size={11} /> };
  };

  const badge = getStatusBadge(order.status);
  const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#18181b] border border-white/10 rounded-xl p-2.5 mb-2 text-xs"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
        <div>
          <span className="text-zinc-400 text-[10px]">Order #{String(order.orderId || order._id).slice(-6)}</span>
          <p className="text-[10px] text-zinc-500">{formattedDate}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border flex items-center gap-1 uppercase tracking-wider ${badge.bg}`}>
          {badge.icon} {order.status}
        </span>
      </div>

      <div className="py-1.5 space-y-1">
        {order.items && order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-zinc-200 text-[11px]">
            <span className="truncate max-w-[180px] font-medium">{item.quantity}x {item.name}</span>
            <span className="text-zinc-400">₹{item.price}</span>
          </div>
        ))}
      </div>

      <div className="pt-1.5 border-t border-white/5 flex items-center justify-between font-bold text-zinc-100 text-[11px]">
        <span>Total</span>
        <span className="text-blue-400">₹{order.amount}</span>
      </div>
    </motion.div>
  );
}

// ─── Component: Typing Indicator ─────────────────────────────────────────────
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

// ─── Component: Message Bubble ───────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex items-end gap-2 mb-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
          : 'bg-gradient-to-br from-blue-500 to-blue-700'
      }`}>
        {isUser ? <User size={13} className="text-white" /> : <Bot size={13} className="text-white" />}
      </div>

      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {msg.content && (
          <div className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm shadow-lg shadow-blue-900/30'
              : 'bg-[#1c1c1f] border border-white/10 text-zinc-100 rounded-bl-sm'
          }`}>
            {isUser ? msg.content : parseMarkdown(msg.content)}
          </div>
        )}

        {msg.products && msg.products.length > 0 && (
          <div className="mt-2 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
            {msg.products.map(p => (
              <AIProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        )}

        {msg.orders && msg.orders.length > 0 && (
          <div className="mt-2 w-full space-y-2">
            {msg.orders.map((o, idx) => (
              <AIOrderCard key={o.orderId || idx} order={o} />
            ))}
          </div>
        )}

        {msg.cartAction && msg.cartAction.cartItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 bg-green-950/70 border border-green-800/60 rounded-xl p-2 flex items-center gap-2 text-xs text-green-300"
          >
            <CheckCircle2 size={15} className="text-green-400 flex-shrink-0" />
            <span className="flex-1 font-medium">{msg.cartAction.message}</span>
          </motion.div>
        )}

        <span className="text-[10px] text-zinc-600 mt-1 px-1">{formatTime(msg.timestamp)}</span>
      </div>
    </motion.div>
  );
}

// ─── Main ChatBot Component ───────────────────────────────────────────────────
export default function ChatBot() {
  const { user } = useAuth();
  const { addToCart } = useCart();
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

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
    } catch { /* quota exceeded */ }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleClose = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMaximize = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setIsMinimized(false);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleMinimize = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setIsMinimized(true);
  };

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
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history,
          userId: user?.uid || null
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${response.status}).`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      if (data.type === 'cart_action' && data.cartAction && data.cartAction.cartItem) {
        const item = data.cartAction.cartItem;
        addToCart(item, item.size, item.color);
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        type: data.type || 'general_text',
        content: data.reply,
        products: data.products || [],
        orders: data.orders || [],
        cartAction: data.cartAction || null,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsTyping(false);
    }
  }, [messages, isTyping, user, addToCart]);

  const handleSend = () => sendMessage(inputValue);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date().toISOString() }]);
    setShowQuickReplies(true);
    setError(null);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="chatbot-trigger-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleOpen}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl shadow-blue-900/50 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Open FootFlex AI Shopping Assistant"
          >
            <motion.span
              className="absolute w-full h-full rounded-full bg-blue-500/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <MessageCircle size={24} className="text-white relative z-10" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center z-20">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-panel"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`fixed z-[9999] flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-[#111113] transition-all duration-300 ease-in-out ${
              isMinimized
                ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-72 sm:w-80 h-14 cursor-pointer hover:border-blue-500/50'
                : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[360px] sm:w-[400px] max-w-[calc(100vw-2rem)] h-[520px] sm:h-[580px] max-h-[calc(100vh-3rem)]'
            }`}
            onClick={isMinimized ? handleMaximize : undefined}
          >
            {/* Header */}
            <div className="flex-shrink-0 h-14 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-4 py-3 flex items-center gap-3 select-none">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bot size={17} className="text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-blue-700" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-white font-semibold text-sm leading-tight truncate">FootFlex AI</p>
                  <Sparkles size={12} className="text-blue-200 flex-shrink-0" />
                </div>
                <p className="text-blue-200 text-[11px] leading-tight truncate">
                  {isMinimized ? 'Click to open assistant' : 'RAG + MCP Shopping Assistant'}
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  id="chatbot-toggle-minimize-btn"
                  onClick={isMinimized ? handleMaximize : handleMinimize}
                  className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/90 transition-colors cursor-pointer"
                  aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
                  title={isMinimized ? "Expand chat" : "Minimize chat"}
                >
                  {isMinimized ? <ChevronUp size={18} className="text-white" /> : <Minimize2 size={14} />}
                </button>
                <button
                  id="chatbot-close-btn"
                  onClick={handleClose}
                  className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/90 transition-colors cursor-pointer"
                  aria-label="Close chat panel"
                  title="Close chat"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            {!isMinimized && (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div id="chatbot-messages" className="flex-1 min-h-0 overflow-y-auto px-3.5 py-3 space-y-0 scroll-smooth">
                  {messages.map(msg => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))}
                  {isTyping && <TypingIndicator />}

                  {error && (
                    <div className="flex items-center gap-2 bg-red-950/60 border border-red-800/50 rounded-xl px-3 py-2 mb-2 text-red-400 text-xs">
                      <span>⚠️ {error}</span>
                      <button onClick={() => setError(null)} className="ml-auto text-red-300 cursor-pointer">
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {showQuickReplies && messages.length <= 2 && (
                  <div className="px-3 pb-2 flex-shrink-0">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-medium mb-1 px-1">
                      Quick Prompts
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {QUICK_REPLIES.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(reply)}
                          disabled={isTyping}
                          className="text-[11px] px-2.5 py-1 rounded-full border border-blue-800/60 bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 transition-all disabled:opacity-40 cursor-pointer"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-px bg-white/5 flex-shrink-0" />

                {/* Input Bar */}
                <div className="flex-shrink-0 px-3 py-2.5 bg-[#111113]">
                  <div className="flex items-end gap-2 bg-[#1c1c1f] border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-blue-500/50">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about shoes, orders, cart or policies..."
                      rows={1}
                      disabled={isTyping}
                      className="flex-1 bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 resize-none outline-none min-h-[22px] max-h-24 overflow-y-auto"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isTyping}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
                    >
                      <Send size={14} className="text-white" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <p className="text-zinc-600 text-[10px]">FootFlex RAG + MCP Assistant</p>
                    <button onClick={clearChat} className="text-zinc-600 hover:text-zinc-400 text-[10px] cursor-pointer">
                      Clear chat
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
