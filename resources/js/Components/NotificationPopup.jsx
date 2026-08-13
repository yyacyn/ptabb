import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Sparkles } from 'lucide-react';

const EMPTY_NOTIFICATIONS = [];

export default function NotificationPopup({ notifications = EMPTY_NOTIFICATIONS, targetType = 'home' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Find active notification matching targetType OR active celebration graphic popup
    const activeNotification = useMemo(() => {
        if (!notifications || !Array.isArray(notifications) || notifications.length === 0) return null;

        const today = new Date().toISOString().split('T')[0];

        // 1. Check for active/scheduled Celebration Graphic Popups first (shown on all public pages)
        const celebrationFound = notifications.find(n => {
            if (n.type !== 'celebration') return false;
            try {
                if (sessionStorage.getItem(`dismissed_popup_${n.id}`) === 'true') return false;
            } catch (e) {}

            if (n.status === 'active') return true;
            if (n.status === 'scheduled' && n.start_date && n.end_date) {
                return today >= n.start_date && today <= n.end_date;
            }
            return false;
        });

        if (celebrationFound) return celebrationFound;

        // 2. Otherwise check for active standard popup matching targetType (home / career)
        const standardFound = notifications.find(n => {
            if (n.type !== targetType) return false;
            try {
                if (sessionStorage.getItem(`dismissed_popup_${n.id}`) === 'true') return false;
            } catch (e) {}

            if (n.status === 'active') return true;
            if (n.status === 'scheduled' && n.start_date && n.end_date) {
                return today >= n.start_date && today <= n.end_date;
            }
            return false;
        });

        return standardFound || null;
    }, [notifications, targetType]);

    useEffect(() => {
        if (activeNotification && !isDismissed) {
            setIsOpen(true);
            setImageError(false);
        } else {
            setIsOpen(false);
        }
    }, [activeNotification, isDismissed]);

    const handleClose = () => {
        // Dismiss all active popups in this session on single click to prevent multi-dismiss requirements
        if (notifications && Array.isArray(notifications)) {
            notifications.forEach(n => {
                try {
                    sessionStorage.setItem(`dismissed_popup_${n.id}`, 'true');
                } catch (e) {}
            });
        }
        setIsDismissed(true);
        setIsOpen(false);
    };

    if (isDismissed || !isOpen || !activeNotification) return null;

    const isCelebration = activeNotification.type === 'celebration';
    const hasValidImage = Boolean(activeNotification.image) && !imageError;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                {/* Backdrop Click */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0"
                />

                {/* GRAPHIC CELEBRATION POPUP (Pure Poster Modal + Circular Bottom X Close) */}
                {isCelebration ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative flex flex-col items-center max-w-sm sm:max-w-md w-full z-10 font-['Hanken_Grotesk']"
                    >
                        {/* Poster Card Container */}
                        {hasValidImage ? (
                            <div className="relative w-full rounded-md overflow-hidden  cursor-pointer" onClick={handleClose}>
                                <img
                                    src={activeNotification.image}
                                    alt={activeNotification.title}
                                    className="w-full h-auto max-h-[75vh] object-contain rounded-md"
                                    onError={() => setImageError(true)}
                                />
                            </div>
                        ) : (
                            /* Clean Typographic Poster Card if image is missing */
                            <div
                                onClick={handleClose}
                                className="relative w-full rounded-[24px] p-8 sm:p-10 bg-gradient-to-br from-[#003865] via-[#00629D] to-[#141B2C] text-center space-y-4 text-white border border-blue-400/20 cursor-pointer"
                            >
                                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-200" /> HARI BESAR INDONESIA
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                                    {activeNotification.title}
                                </h2>
                                <div className="w-16 h-1 bg-[#3F96DD] mx-auto rounded-full" />
                            </div>
                        )}

                        {/* Circular Bottom (X) Close Button matching MyIM3 reference example */}
                        <button
                            onClick={handleClose}
                            className="mt-5 p-3 bg-black/80 hover:bg-black text-white hover:text-red-400 rounded-full transition-all shadow-xl cursor-pointer border-2 border-white/90 backdrop-blur-md flex items-center justify-center hover:scale-110 active:scale-95"
                            title="Close"
                        >
                            <X className="w-6 h-6 stroke-[2.5]" />
                        </button>
                    </motion.div>
                ) : (
                    /* STANDARD ANNOUNCEMENT POPUP (Text + Details Modal) */
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
                        {hasValidImage && (
                            <div className="my-4 rounded-[8px] overflow-hidden border border-[#E5E7EB] max-h-64 bg-[#141B2C]">
                                <img
                                    src={activeNotification.image}
                                    alt={activeNotification.title}
                                    className="w-full h-full object-cover"
                                    onError={() => setImageError(true)}
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
                            className="w-full bg-gradient-to-r from-[#00629D] to-[#3F96DD] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] active:scale-[0.97] text-white font-semibold text-[14px] py-3 rounded-[8px] transition-[colors,shadow,opacity,transform] cursor-pointer text-center"
                        >
                            Dismiss Announcement
                        </button>
                    </motion.div>
                )}
            </div>
        </AnimatePresence>
    );
}
