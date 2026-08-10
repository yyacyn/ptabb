import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import CtaBanner from '@/Components/CtaBanner';
import {
    Ship,
    Globe,
    Award,
    Eye,
    Target,
    ShieldCheck,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';

export default function AboutUs({ milestones: initialMilestones = [] }) {
    // Format and sort all milestones chronologically (oldest -> newest)
    const milestones = useMemo(() => {
        if (!initialMilestones || initialMilestones.length === 0) return [];
        return [...initialMilestones]
            .sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0))
            .map((m, idx) => ({
                id: `m-${m.year}-${idx}`,
                year: String(m.year),
                title: m.milestone || m.title || 'Company Milestone',
                description: m.description || '',
                image: m.image || (idx % 2 === 0 ? '/images/card_bulk_vessel.png' : '/images/asuwa1.jpg')
            }));
    }, [initialMilestones]);

    const [activeYear, setActiveYear] = useState(() => milestones[0]?.year || '1999');
    const [spineVisible, setSpineVisible] = useState(true);

    // Calculate 5-year sliding window for sticky central year spine
    const activeIndex = useMemo(() => {
        const idx = milestones.findIndex(m => m.year === activeYear);
        return idx >= 0 ? idx : 0;
    }, [milestones, activeYear]);

    const spineWindow = useMemo(() => {
        const total = milestones.length;
        if (total === 0) return { items: [], hasEarlier: false, hasLater: false };
        if (total <= 5) return { items: milestones.map((m, idx) => ({ ...m, origIndex: idx })), hasEarlier: false, hasLater: false };

        let start = activeIndex - 2;
        let end = activeIndex + 2;

        if (start < 0) {
            start = 0;
            end = 4;
        } else if (end >= total) {
            end = total - 1;
            start = total - 5;
        }

        const items = milestones.slice(start, end + 1).map((m, relativeIdx) => {
            const origIndex = start + relativeIdx;
            return {
                ...m,
                origIndex,
            };
        });

        return {
            items,
            hasEarlier: start > 0,
            hasLater: end < total - 1
        };
    }, [milestones, activeIndex]);

    // Track scroll position to highlight active year
    const milestoneRefs = useRef({});
    const desktopStreamRef = useRef(null);
    const [spineHeight, setSpineHeight] = useState(null);

    // Match spine container height to last milestone card so sticky spine scrolls away with cards
    useEffect(() => {
        const el = desktopStreamRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            const cards = el.querySelectorAll('[data-year]');
            if (cards.length === 0) return;
            let maxBottom = 0;
            cards.forEach(card => {
                const bottom = card.offsetTop + card.offsetHeight;
                if (bottom > maxBottom) maxBottom = bottom;
            });
            setSpineHeight(maxBottom);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const targetCenter = window.innerHeight * 0.5; // Matches exact middle of viewport (50vh)
            let closestYear = null;
            let minDistance = Infinity;

            Object.entries(milestoneRefs.current).forEach(([year, el]) => {
                if (!el) return;
                const rect = el.getBoundingClientRect();
                // Check distance from center of milestone card to viewport center height
                const cardCenter = rect.top + (rect.height / 2);
                const distance = Math.abs(cardCenter - targetCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestYear = year;
                }
            });

            if (closestYear) {
                setActiveYear(closestYear);
            }

            // Boundary visibility: hide spine when above first card or below last card
            const firstYear = milestones[0]?.year;
            const lastYear = milestones[milestones.length - 1]?.year;
            const firstEl = firstYear ? milestoneRefs.current[firstYear] : null;
            const lastEl = lastYear ? milestoneRefs.current[lastYear] : null;

            let visible = true;
            if (firstEl) {
                const firstRect = firstEl.getBoundingClientRect();
                if (firstRect.top > window.innerHeight * 0.7) visible = false;
            }
            if (lastEl) {
                const lastRect = lastEl.getBoundingClientRect();
                if (lastRect.bottom < window.innerHeight * 0.3) visible = false;
            }
            setSpineVisible(visible);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [milestones]);

    const scrollToMilestone = (year) => {
        const targetEl = document.getElementById(`milestone-${year}`);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <GuestLayout>
            <Head title="About Us - PT PABB" />

            {/* 1. Hero Banner Section */}
            <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative rounded-[8px] overflow-hidden border border-[#E5E7EB] min-h-[380px] sm:min-h-[440px] flex items-center justify-center"
            >
                {/* Background Ship Image with Dark Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/asuwa1.jpg"
                        alt="PT. ABB Maritime Vessel"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#141B2C]/90 via-[#141B2C]/80 to-[#141B2C]/85" />
                </div>

                {/* Hero Text Content */}
                <div className="relative z-10 text-center px-6 py-16 sm:py-20 lg:py-24 max-w-5xl mx-auto flex flex-col items-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[44px] lg:text-[50px] text-white tracking-tight leading-[1.15] text-center"
                    >
                        Pioneering Maritime Excellence Across Archipelagic &amp; Global Corridors
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] lg:text-[18px] text-white/90 text-center max-w-3xl mt-4 leading-relaxed"
                    >
                        Empowering global commerce with high-tonnage cargo transport, modern fleet reliability, and over 25 years of maritime operational excellence.
                    </motion.p>
                </div>
            </motion.section>

            {/* 2. Who We Are / Overview Section (Split Layout matching Welcome.jsx hero: 5-col image card + 7-col text card) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[3px] items-stretch">

                {/* Left Column: Corporate Image Card (5-Cols) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-5 rounded-[8px] overflow-hidden border border-[#E5E7EB] shadow-xs relative min-h-[380px] lg:min-h-[460px] group bg-[#141B2C]"
                >
                    <img
                        src="/images/asuwa1.jpg"
                        alt="PT. ABB Fleet Management"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141B2C]/90 via-[#141B2C]/30 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#8AAFC8] tracking-wider mb-1">
                            OVER 25 YEARS OF MARITIME OPERATIONAL EXCELLENCE
                        </div>
                        <h3 className="font-['Hanken_Grotesk'] font-bold text-[22px] sm:text-[26px] leading-tight">
                            Commanding High-Tonnage Bulk Cement &amp; Cargo Transport
                        </h3>
                    </div>
                </motion.div>

                {/* Right Column: Narrative Card (7-Cols) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-7 bg-white rounded-[8px] border border-[#E5E7EB] p-8 sm:p-12 flex flex-col justify-between shadow-xs"
                >
                    <div>
                        <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider mb-3">
                            COMPANY PROFILE
                        </div>
                        <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] text-[#141B2C] leading-[1.12] tracking-tight mb-5">
                            Navigating the Future of Industrial Logistics
                        </h2>
                        <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] lg:text-[18px] text-[#404750] leading-relaxed mb-6">
                            PT. ABB is an Indonesian shipping company specializing in bulk cement and heavy freight transportation. With over 25 years of maritime experience, we provide dependable voyage and time charter services connecting major ports across Indonesia and regional trade corridors.
                        </p>
                    </div>

                    {/* 3 Feature Cards Inside Gray Container (Core Excellence Pattern) */}
                    <div className="bg-[#F5F5F5] rounded-[8px] border border-[#E5E7EB] p-1">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-left">
                            {[
                                {
                                    icon: Ship,
                                    title: "Bulk cement & shipping commodities"
                                },
                                {
                                    icon: Award,
                                    title: "ISO 9001:2015 & 14001 compliant"
                                },
                                {
                                    icon: Globe,
                                    title: "Domestic & international maritime routes"
                                }
                            ].map((item, idx) => {
                                const IconComponent = item.icon;
                                return (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ y: -2 }}
                                        transition={{ duration: 0.2 }}
                                        className="group bg-white rounded-[6px] p-4 sm:p-5 border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-[0_4px_14px_rgba(0,98,157,0.15)] transition-[colors,shadow,opacity,transform] duration-200 flex flex-col justify-between h-full min-h-[110px]"
                                    >
                                        <div className="w-8 h-8 rounded-[6px] bg-[#F5F5F5] border border-[#E5E7EB] flex items-center justify-center mb-3 text-[#141B2C] shrink-0">
                                            <IconComponent className="w-4 h-4 text-[#141B2C]" />
                                        </div>
                                        <span className="font-['Hanken_Grotesk'] font-semibold text-[15px] sm:text-[17px] text-[#141B2C] leading-snug">
                                            {item.title}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* 3. Our Vision & Mission Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 lg:p-12"
            >
                <div className="mb-6">
                    <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider mb-2">
                        OUR VISION &amp; MISSION
                    </div>
                    <h2 className="font-['Hanken_Grotesk'] font-bold text-[28px] sm:text-[36px] lg:text-[40px] text-[#141B2C] tracking-tight leading-[1.15]">
                        Driven by Purpose, Guided by Maritime Excellence
                    </h2>
                </div>

                {/* Cards Inside Gray Container (Core Excellence Pattern) */}
                <div className="bg-[#F5F5F5] rounded-[8px] border border-[#E5E7EB] p-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">

                        {/* Our Vision Card */}
                        <motion.div
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.2 }}
                            className="group bg-white rounded-[6px] p-6 sm:p-8 border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-[0_6px_20px_rgba(0,98,157,0.15)] transition-[colors,shadow,opacity,transform] duration-200 min-h-[260px] flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-[6px] bg-[#F5F5F5] border border-[#E5E7EB] flex items-center justify-center mb-5 text-[#141B2C]">
                                    <Eye className="w-5 h-5 text-[#00629D]" />
                                </div>

                                <h3 className="text-[20px] lg:text-[22px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] leading-snug mb-3">
                                    Our Vision
                                </h3>

                                <p className="text-[15px] lg:text-[17px] font-['Hanken_Grotesk'] italic text-[#404750] leading-relaxed">
                                    “To become a trusted and preferred maritime operator in domestic and international bulk cement transportation, driven by integrity, team synergy, and uncompromising operational safety.”
                                </p>
                            </div>
                        </motion.div>

                        {/* Our Mission Card */}
                        <motion.div
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.2 }}
                            className="group bg-white rounded-[6px] p-6 sm:p-8 border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-[0_6px_20px_rgba(0,98,157,0.15)] transition-[colors,shadow,opacity,transform] duration-200 min-h-[260px] flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-[6px] bg-[#F5F5F5] border border-[#E5E7EB] flex items-center justify-center mb-5 text-[#141B2C]">
                                    <Target className="w-5 h-5 text-[#00629D]" />
                                </div>

                                <h3 className="text-[20px] lg:text-[22px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] leading-snug mb-4">
                                    Our Mission
                                </h3>

                                <ul className="space-y-3 font-['Hanken_Grotesk'] lg:text-[17px] sm:text-[15px] text-[#404750] leading-relaxed">
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-[#00629D] shrink-0 mt-1" />
                                        <span>Deliver innovative, competitive, and reliable maritime logistics solutions.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-[#00629D] shrink-0 mt-1" />
                                        <span>Operate with disciplined commitment to Speed, Safety, Security, and Economy.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-[#00629D] shrink-0 mt-1" />
                                        <span>Deploy competent seafarers and skilled shore professionals in full regulatory compliance.</span>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </motion.section>

            {/* 4. Milestones Section — Zig-Zag Timeline */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 lg:p-14"
            >
                {/* Section Header */}
                <div className="text-center max-w-4xl mx-auto mb-14 sm:mb-20">
                    <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider mb-2">
                        MILESTONES
                    </div>
                    <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[36px] lg:text-[40px] text-[#141B2C] tracking-tight leading-[1.12]">
                        Building a Legacy of Fleet Excellence &amp; Ocean Trust
                    </h2>
                </div>

                {/* Timeline Relative Container */}
                <div className="relative max-w-[1360px] mx-auto min-h-[700px]">

                    {/* Sticky Center Year Spine — 5-Item Sliding Window (Pure Year Numbers with Top/Bottom Ellipsis) */}
                    <div
                        className={`hidden lg:flex flex-col items-center absolute left-1/2 -translate-x-1/2 top-24 z-20 pointer-events-none w-32 transition-opacity duration-300 ${spineVisible ? 'opacity-100' : 'opacity-0'}`}
                        style={spineHeight ? { height: Math.max(0, spineHeight - 96) } : { bottom: 0 }}
                    >
                        <div className="sticky top-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center gap-2 py-2 transition-all duration-300">
                            {/* Top Ellipsis for earlier years */}
                            {spineWindow.hasEarlier && (
                                <span className="font-['JetBrains_Mono'] text-[#8AAFC8] font-bold text-[13px] opacity-40 select-none -mb-1 tracking-widest">
                                    . . .
                                </span>
                            )}

                            {spineWindow.items.map((item, idx) => {
                                const distance = Math.abs(item.origIndex - activeIndex);
                                const isCurrent = item.year === activeYear;

                                const nextMilestone = milestones[item.origIndex + 1];
                                const hasYearGap = nextMilestone && (parseInt(nextMilestone.year) - parseInt(item.year) > 1);

                                // Opacity & scale index styling:
                                // 1st = slightly transparent (35% opacity)
                                // 2nd = a little more apparent (70% opacity)
                                // 3rd (current) = apparent (100% opacity, 32px bold blue)
                                // 4th = a little more apparent (70% opacity)
                                // 5th = slightly transparent (35% opacity)
                                let styleClasses = "text-[16px] font-bold text-[#8AAFC8] opacity-35 scale-90 hover:opacity-70";
                                if (isCurrent || distance === 0) {
                                    styleClasses = "text-[32px] font-extrabold text-[#00629D] opacity-100 scale-110 tracking-tight";
                                } else if (distance === 1) {
                                    styleClasses = "text-[22px] font-bold text-[#404750] opacity-70 scale-95 hover:opacity-100 hover:text-[#00629D]";
                                } else if (distance >= 2) {
                                    styleClasses = "text-[16px] font-bold text-[#8AAFC8] opacity-35 scale-90 hover:opacity-70 hover:text-[#00629D]";
                                }

                                return (
                                    <div key={`spine-${item.id}`} className="flex flex-col items-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveYear(item.year);
                                                scrollToMilestone(item.year);
                                            }}
                                            className={`font-['JetBrains_Mono'] transition-all duration-300 cursor-pointer ${styleClasses}`}
                                        >
                                            {item.year}
                                        </button>

                                        {/* Display . . . gap dots representing missing years between non-consecutive milestones */}
                                        {hasYearGap && (
                                            <span className="font-['JetBrains_Mono'] text-[#8AAFC8] font-bold text-[13px] opacity-45 select-none my-1 tracking-widest">
                                                . . .
                                            </span>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Bottom Ellipsis for later years */}
                            {spineWindow.hasLater && (
                                <span className="font-['JetBrains_Mono'] text-[#8AAFC8] font-bold text-[13px] opacity-40 select-none -mt-1 tracking-widest">
                                    . . .
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Mobile & Tablet Stream (< lg): Pure single column stream with uniform gap */}
                    <div className="flex lg:hidden flex-col gap-8 sm:gap-10">
                        {milestones.map((item) => {
                            const isActive = activeYear === item.year;
                            return (
                                <div
                                    key={item.id}
                                    id={`milestone-${item.year}-mobile`}
                                    data-year={item.year}
                                    ref={(el) => (milestoneRefs.current[item.year] = el)}
                                    className="scroll-mt-36"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                        className={`bg-white rounded-[12px] p-6 sm:p-8 border-2 transition-[colors,shadow,opacity,transform] duration-300 ${isActive
                                            ? 'border-[#3F96DD] shadow-[0_8px_30px_rgba(0,98,157,0.15)]'
                                            : 'border-[#E5E7EB]'
                                            }`}
                                    >
                                        <div className="font-['JetBrains_Mono'] font-medium text-[13px] text-[#8AAFC8] mb-2">
                                            {item.year}
                                        </div>
                                        <h3 className="font-['Hanken_Grotesk'] font-bold text-[20px] text-[#141B2C] leading-snug mb-3 break-words">
                                            {item.title}
                                        </h3>
                                        <p className="font-['Hanken_Grotesk'] text-[14px] text-[#404750] leading-relaxed mb-5 break-words">
                                            {item.description}
                                        </p>
                                        {item.image && (
                                            <div className="rounded-[10px] overflow-hidden border border-[#E5E7EB] h-[200px] sm:h-[240px] w-full relative group">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/images/card_bulk_vessel.png';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Stream (>= lg): Spacious 2-column staggered masonry stream with generous offset */}
                    <div ref={desktopStreamRef} className="hidden lg:grid grid-cols-12 gap-10 xl:gap-14 items-start">
                        {/* Left Column (Even Index Milestones: 1999, 2025) — Gap matched to staggered 320px step */}
                        <div className="col-span-5 flex flex-col gap-16 lg:gap-[280px] xl:gap-[300px]">
                            {milestones
                                .filter((_, idx) => idx % 2 === 0)
                                .map((item) => {
                                    const isActive = activeYear === item.year;
                                    return (
                                        <div
                                            key={item.id}
                                            id={`milestone-${item.year}`}
                                            data-year={item.year}
                                            ref={(el) => (milestoneRefs.current[item.year] = el)}
                                            className="scroll-mt-36"
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, y: 40, x: -20 }}
                                                whileInView={{ opacity: 1, y: 0, x: 0 }}
                                                viewport={{ once: true, amount: 0.3 }}
                                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                                className={`bg-white rounded-[12px] p-6 sm:p-8 border-2 transition-[colors,shadow,opacity,transform] duration-300 ${isActive
                                                    ? 'border-[#3F96DD] shadow-[0_8px_30px_rgba(0,98,157,0.15)]'
                                                    : 'border-[#E5E7EB] hover:border-[#00629D]'
                                                    }`}
                                            >
                                                <div className="font-['JetBrains_Mono'] font-medium text-[13px] text-[#8AAFC8] mb-2">
                                                    {item.year}
                                                </div>
                                                <h3 className="font-['Hanken_Grotesk'] font-bold text-[20px] sm:text-[22px] text-[#141B2C] leading-snug mb-3 break-words">
                                                    {item.title}
                                                </h3>
                                                <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[15px] text-[#404750] leading-relaxed mb-5 break-words">
                                                    {item.description}
                                                </p>
                                                {item.image && (
                                                    <div className="rounded-[10px] overflow-hidden border border-[#E5E7EB] h-[200px] sm:h-[240px] w-full relative group">
                                                        <img
                                                            src={item.image}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/images/card_bulk_vessel.png';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Center Spacer Column */}
                        <div className="col-span-2" />

                        {/* Right Column — Offset by at least 320px with matched vertical gap */}
                        <div className="col-span-5 flex flex-col gap-16 lg:gap-[300px] xl:gap-[320px] pt-28 lg:pt-[300px] xl:pt-[320px]">
                            {milestones
                                .filter((_, idx) => idx % 2 === 1)
                                .map((item) => {
                                    const isActive = activeYear === item.year;
                                    return (
                                        <div
                                            key={item.id}
                                            id={`milestone-${item.year}`}
                                            data-year={item.year}
                                            ref={(el) => (milestoneRefs.current[item.year] = el)}
                                            className="scroll-mt-36"
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, y: 40, x: 20 }}
                                                whileInView={{ opacity: 1, y: 0, x: 0 }}
                                                viewport={{ once: true, amount: 0.3 }}
                                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                                className={`bg-white rounded-[12px] p-6 sm:p-8 border-2 transition-[colors,shadow,opacity,transform] duration-300 ${isActive
                                                    ? 'border-[#3F96DD] shadow-[0_8px_30px_rgba(0,98,157,0.15)]'
                                                    : 'border-[#E5E7EB] hover:border-[#00629D]'
                                                    }`}
                                            >
                                                <div className="font-['JetBrains_Mono'] font-medium text-[13px] text-[#8AAFC8] mb-2">
                                                    {item.year}
                                                </div>
                                                <h3 className="font-['Hanken_Grotesk'] font-bold text-[20px] sm:text-[22px] text-[#141B2C] leading-snug mb-3 break-words">
                                                    {item.title}
                                                </h3>
                                                <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[15px] text-[#404750] leading-relaxed mb-5 break-words">
                                                    {item.description}
                                                </p>
                                                {item.image && (
                                                    <div className="rounded-[10px] overflow-hidden border border-[#E5E7EB] h-[200px] sm:h-[230px] w-full relative group">
                                                        <img
                                                            src={item.image}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/images/card_bulk_vessel.png';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* 5. CTA Banner Section */}
            <CtaBanner
                title="Ready to Chart Your Next High-Tonnage Voyage?"
                description="Whether you need bulk cement transportation, specialized vessel charters, or long-term marine logistics, our ISO-certified fleet is ready to deliver."
                buttonLabel="Request Charter Proposal"
                buttonRoute="public.contacts"
            />
        </GuestLayout>
    );
}
