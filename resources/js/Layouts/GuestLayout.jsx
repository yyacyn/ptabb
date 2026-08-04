import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { useState, useEffect, useRef } from 'react';
import { Anchor, MessageSquare, X, Package, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GuestLayout({ children, onScrollToSection }) {
    const [chatOpen, setChatOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [hasGreeted, setHasGreeted] = useState(() => {
        return sessionStorage.getItem('pabb_chat_greeted') === 'true';
    });
    const [chatMessages, setChatMessages] = useState(() => {
        const saved = sessionStorage.getItem('pabb_chat_messages');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { /* fallback */ }
        }
        return [];
    });
    const [chatInput, setChatInput] = useState('');
    const chatScrollRef = useRef(null);

    // Save chat messages to sessionStorage whenever chatMessages update
    useEffect(() => {
        if (chatMessages.length > 0) {
            sessionStorage.setItem('pabb_chat_messages', JSON.stringify(chatMessages));
        }
    }, [chatMessages]);

    // Trigger AI Model greeting ONCE per browser session when user opens chat for the first time
    useEffect(() => {
        if (chatOpen && !hasGreeted && chatMessages.length === 0) {
            setHasGreeted(true);
            sessionStorage.setItem('pabb_chat_greeted', 'true');
            setIsTyping(true);

            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    message: "Hi, please introduce yourself as Sarah Wijaya from PT. ABB and welcome the visitor.",
                    history: []
                })
            })
            .then(res => res.json())
            .then(data => {
                const greetingText = data?.reply || "Hello, I am Sarah Wijaya, Senior Logistics & Chartering Specialist at PT. ABB. Welcome to our live portal. How can I assist you with vessel positioning, cargo quotes, or fleet inquiries today?";
                setChatMessages([{
                    sender: 'bot',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    text: greetingText
                }]);
            })
            .catch(() => {
                setChatMessages([{
                    sender: 'bot',
                    time: 'Just now',
                    text: "Hello, I am Sarah Wijaya, PT. ABB Expert. Welcome to our live portal. How can I assist you today?"
                }]);
            })
            .finally(() => {
                setIsTyping(false);
            });
        }
    }, [chatOpen, hasGreeted, chatMessages.length]);

    useEffect(() => {
        if (chatOpen && chatScrollRef.current) {
            chatScrollRef.current.scrollTo({
                top: chatScrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [chatMessages, isTyping, chatOpen]);

    const handleSendMessage = async (e, textOverride = null) => {
        if (e) e.preventDefault();
        const userMsg = textOverride || chatInput;
        if (!userMsg.trim() || isTyping) return;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newHistory = [...chatMessages, { sender: 'user', time: timeStr, text: userMsg }];
        
        setChatMessages(newHistory);
        if (!textOverride) setChatInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    message: userMsg,
                    history: chatMessages.map(m => ({ sender: m.sender, text: m.text }))
                })
            });

            const data = await response.json();
            
            // Console log retrieved RAG data & debug info
            if (data?.retrieved_context) {
                console.group('%c[RAG System Debug]', 'color: #00629D; font-weight: bold;');
                console.log('Model Used:', data.model);
                console.log('Detected Intents:', data.intents);
                console.log('Retrieved Database Context:\n', data.retrieved_context);
                console.groupEnd();
            }

            const botReply = data?.reply || 'Thank you for reaching out. Our dispatch desk will assist you shortly.';

            setChatMessages(prev => [
                ...prev,
                {
                    sender: 'bot',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    text: botReply
                }
            ]);
        } catch (error) {
            setChatMessages(prev => [
                ...prev,
                {
                    sender: 'bot',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    text: 'Our primary network connection is experiencing high load. Please leave your inquiry on our Contact page at /contacts.'
                }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] text-[#141B2C] font-['Hanken_Grotesk'] antialiased selection:bg-[#00629D] selection:text-white">
            
            {/* Outer Page Canvas Container (Figma 1440px Width) */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-3 pb-3">

                {/* Shared Navigation Bar */}
                <Navbar onScrollToSection={onScrollToSection} />

                {/* Page Main Content */}
                <main className="flex flex-col gap-[7px] lg:mt-[47px]">{children}</main>

                {/* Shared Footer */}
                <Footer />

            </div>

            {/* Floating Chat Widget */}
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                <AnimatePresence mode="wait">
                    {!chatOpen ? (
                        <motion.button
                            key="chat-trigger-btn"
                            type="button"
                            onClick={() => setChatOpen(true)}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="w-14 h-14 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white rounded-full flex items-center justify-center shadow-xl hover:opacity-95 transition-opacity"
                            title="Chat with Us"
                        >
                            <MessageSquare className="w-6 h-6" />
                        </motion.button>
                    ) : (
                        <motion.div
                            key="chat-window-box"
                            initial={{ opacity: 0, scale: 0.95, y: 10, transformOrigin: 'bottom right' }}
                            animate={{ opacity: 1, scale: 1, y: 0, transformOrigin: 'bottom right' }}
                            exit={{ opacity: 0, scale: 0.95, y: 10, transformOrigin: 'bottom right' }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[82vh] bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Customer Service Header */}
                            <div className="bg-gradient-to-r from-[#00558A] to-[#00629D] text-white p-3.5 px-4 flex items-center justify-between shadow-sm shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=140&h=140&q=80"
                                            alt="Sarah Wijaya"
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white/80 shadow-sm"
                                        />
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div>
                                        <div className="font-['Hanken_Grotesk'] font-bold text-[15px] leading-tight flex items-center gap-1.5 text-white">
                                            Sarah Wijaya
                                        </div>
                                        <div className="text-[11px] font-['JetBrains_Mono'] text-white/80">
                                            PT. ABB Expert
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setChatOpen(false)}
                                    className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Chat History Container */}
                            <div ref={chatScrollRef} className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-[#F8FAFC] text-[13px]">
                                {chatMessages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.12 }}
                                        className={`flex gap-2 items-end ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.sender === 'bot' && (
                                            <img
                                                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=80&h=80&q=80"
                                                alt="CS Avatar"
                                                className="w-6 h-6 rounded-full object-cover shrink-0 mb-1 border border-slate-200"
                                            />
                                        )}
                                        <div className={`max-w-[82%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                            <div
                                                className={`p-3 rounded-[12px] leading-relaxed shadow-sm font-['Hanken_Grotesk'] ${
                                                    msg.sender === 'user'
                                                        ? 'bg-[#00629D] text-white rounded-br-none'
                                                        : 'bg-white text-[#141B2C] border border-[#E5E7EB] rounded-bl-none'
                                                }`}
                                            >
                                                {msg.text}
                                            </div>
                                            {msg.time && (
                                                <span className="text-[10px] font-['JetBrains_Mono'] text-slate-400 mt-1 px-1">
                                                    {msg.time}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {isTyping && (
                                    <div className="flex gap-2 items-end justify-start">
                                        <img
                                            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=80&h=80&q=80"
                                            alt="CS Avatar"
                                            className="w-6 h-6 rounded-full object-cover shrink-0 mb-1 border border-slate-200"
                                        />
                                        <div className="bg-white border border-[#E5E7EB] p-3 rounded-[12px] rounded-bl-none shadow-sm flex items-center gap-1.5">
                                            <span className="w-2 h-2 bg-[#00629D] rounded-full animate-bounce"></span>
                                            <span className="w-2 h-2 bg-[#00629D] rounded-full animate-bounce [animation-delay:0.15s]"></span>
                                            <span className="w-2 h-2 bg-[#00629D] rounded-full animate-bounce [animation-delay:0.3s]"></span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quick Action Suggestion Chips */}
                            <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                                <button
                                    type="button"
                                    onClick={() => handleSendMessage(null, 'How do I book a bulk shipment?')}
                                    className="text-[11px] font-['Hanken_Grotesk'] font-medium bg-[#F1F5F9] text-[#00629D] hover:bg-[#00629D] hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border border-slate-200 shrink-0 flex items-center gap-1.5"
                                >
                                    <Package className="w-3.5 h-3.5 stroke-[2]" />
                                    Book Shipment
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSendMessage(null, 'What vessels are available in your fleet?')}
                                    className="text-[11px] font-['Hanken_Grotesk'] font-medium bg-[#F1F5F9] text-[#00629D] hover:bg-[#00629D] hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border border-slate-200 shrink-0 flex items-center gap-1.5"
                                >
                                    <Anchor className="w-3.5 h-3.5 stroke-[2]" />
                                    Fleet Capacity
                                </button>
                            </div>

                            {/* Input Form */}
                            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E5E7EB] bg-white flex items-center gap-2 shrink-0">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask Sarah a question..."
                                    className="flex-1 text-[13px] font-['Hanken_Grotesk'] px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-full focus:outline-none focus:border-[#00629D] focus:bg-white transition-all placeholder-[#9CA3AF]"
                                />
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white w-9 h-9 rounded-full flex items-center justify-center hover:shadow-md active:scale-95 transition-all shrink-0"
                                    title="Send Message"
                                >
                                    <Send className="w-4 h-4 text-white translate-x-[-0.5px]" />
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
