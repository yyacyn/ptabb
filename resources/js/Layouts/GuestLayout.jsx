import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { useState } from 'react';
import { Anchor, MessageSquare } from 'lucide-react';

export default function GuestLayout({ children, onScrollToSection }) {
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { sender: 'bot', text: 'Welcome to PT Pelayaran Andalas Bahtera Baruna. How can we assist your bulk cement shipment or fleet inquiry today?' }
    ]);
    const [chatInput, setChatInput] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
        setChatInput('');

        setTimeout(() => {
            setChatMessages((prev) => [
                ...prev,
                {
                    sender: 'bot',
                    text: 'Thank you for reaching out. Our maritime dispatch officer will contact you shortly.'
                }
            ]);
        }, 600);
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] text-[#141B2C] font-['Hanken_Grotesk'] antialiased selection:bg-[#00629D] selection:text-white">
            
            {/* Outer Page Canvas Container (Figma 1440px Width) */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-3 pb-3">

                {/* Shared Navigation Bar */}
                <Navbar onScrollToSection={onScrollToSection} />

                {/* Page Main Content */}
                <main className="flex flex-col gap-[7px] mt-[7px]">{children}</main>

                {/* Shared Footer */}
                <Footer />

            </div>

            {/* Floating Chat Widget */}
            <div className="fixed bottom-6 right-6 z-50">
                {!chatOpen ? (
                    <button
                        type="button"
                        onClick={() => setChatOpen(true)}
                        className="w-14 h-14 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white rounded-full flex items-center justify-center shadow-lg hover:opacity-95 transition-opacity"
                        title="Chat with Us"
                    >
                        <MessageSquare className="w-6 h-6" />
                    </button>
                ) : (
                    <div className="w-[340px] bg-white rounded-xl border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col h-[400px]">
                        <div className="bg-[#141B2C] text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00629D] to-[#3F96DD] flex items-center justify-center font-bold text-white text-xs">
                                    <Anchor className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="font-['Hanken_Grotesk'] font-bold text-[14px]">Dispatch Assistant</div>
                                    <div className="text-[11px] font-['JetBrains_Mono'] text-[#8AAFC8]">PT. PABB Live Support</div>
                                </div>
                            </div>
                            <button type="button" onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white text-xl leading-none">&times;</button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F5F5F5] text-[13px]">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`p-3 rounded-[8px] max-w-[85%] ${msg.sender === 'user' ? 'bg-[#00629D] text-white ml-auto' : 'bg-white text-[#141B2C] border border-[#E5E7EB] mr-auto'}`}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E5E7EB] bg-white flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 text-[13px] font-['Hanken_Grotesk'] px-3 py-2 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#00629D]"
                            />
                            <button type="submit" className="bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white px-4 py-2 rounded-[8px] font-['Hanken_Grotesk'] font-semibold text-xs hover:opacity-95">
                                Send
                            </button>
                        </form>
                    </div>
                )}
            </div>

        </div>
    );
}
