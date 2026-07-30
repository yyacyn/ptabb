import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Info } from 'lucide-react';

export default function NotificationPopup({ notifications = [], targetType = 'home' }) {
    const [activeNotification, setActiveNotification] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!notifications || !Array.isArray(notifications) || notifications.length === 0) return;

        // Find active notification matching targetType (home or career)
        const found = notifications.find(
            n => n.type === targetType && (n.status === 'active' || !n.status)
        );

        if (found) {
            // Check if already dismissed in this browser session
            const dismissedKey = `dismissed_popup_${found.id}`;
            const isDismissed = sessionStorage.getItem(dismissedKey);

            if (!isDismissed) {
                setActiveNotification(found);
                setIsOpen(true);
            }
        }
    }, [notifications, targetType]);

    const handleClose = () => {
        if (activeNotification) {
            sessionStorage.setItem(`dismissed_popup_${activeNotification.id}`, 'true');
        }
        setIsOpen(false);
    };

    if (!isOpen || !activeNotification) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
                {/* Backdrop Click */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0"
                />

                {/* Modal Window */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative bg-white rounded-[12px] border border-[#E5E7EB] shadow-2xl max-w-lg w-full overflow-hidden p-6 sm:p-8 z-10 font-['Hanken_Grotesk'] text-[#141B2C]"
                >
                    {/* Top Right Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#141B2C] hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                        title="Close Announcement"
                    >
                        <X className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* Header Badge */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-[#00629D]/10 text-[#00629D] rounded-[6px]">
                            <Bell className="w-4 h-4" />
                        </div>
                        <span className="font-['JetBrains_Mono'] font-bold text-[11px] uppercase tracking-wider text-[#00629D]">
                            ANNOUNCEMENT
                        </span>
                    </div>

                    {/* Notification Title */}
                    <h3 className="font-['Hanken_Grotesk'] font-bold text-[22px] sm:text-[24px] text-[#141B2C] tracking-tight leading-snug mb-3">
                        {activeNotification.title}
                    </h3>

                    {/* Image (if attached) */}
                    {activeNotification.image && (
                        <div className="my-4 rounded-[8px] overflow-hidden border border-[#E5E7EB] max-h-64 bg-[#141B2C]">
                            <img
                                src={activeNotification.image}
                                alt={activeNotification.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Content Text */}
                    <div className="text-[15px] text-[#404750] leading-relaxed max-h-60 overflow-y-auto pr-1 mb-6 whitespace-pre-line">
                        {activeNotification.content}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleClose}
                        className="w-full bg-gradient-to-r from-[#00629D] to-[#3F96DD] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] active:scale-[0.97] text-white font-semibold text-[14px] py-3 rounded-[8px] transition-all cursor-pointer text-center"
                    >
                        Dismiss Announcement
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
