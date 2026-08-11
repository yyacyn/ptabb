import { Head, Link } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import CtaBanner from '@/Components/CtaBanner';
import JobApplyModal from '@/Components/JobApplyModal';
import NotificationPopup from '@/Components/NotificationPopup';
import {
    ArrowRight, Shield, TrendingUp, Anchor, Award,
    FileText, Search, Wrench, BriefcaseMedical,
    Filter, ChevronLeft, ChevronRight,
    Briefcase, MapPin, Clock, CheckCircle2, X
} from 'lucide-react';

const EMPTY_NOTIFICATIONS = [];

export default function Careers({ careers = [], notifications: initialNotifications = EMPTY_NOTIFICATIONS }) {
    const [notificationsList, setNotificationsList] = useState(initialNotifications);

    useEffect(() => {
        if (initialNotifications && initialNotifications.length > 0) {
            setNotificationsList(initialNotifications);
        } else {
            fetch('/notifications', { headers: { 'Accept': 'application/json' } })
                .then(res => res.json())
                .then(data => {
                    const list = Array.isArray(data) ? data : (data?.notifications || []);
                    if (list.length > 0) setNotificationsList(list);
                })
                .catch(err => console.error("Error loading notifications:", err));
        }
    }, [initialNotifications]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [sortOrder, setSortOrder] = useState('latest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const PER_PAGE = 6;

    // Apply Modal State
    const [applyingCareer, setApplyingCareer] = useState(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    const openApplyModal = (career) => {
        setApplyingCareer(career);
    };

    const closeApplyModal = () => {
        setApplyingCareer(null);
    };

    useEffect(() => {
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) setIsFilterOpen(false);
        };
        if (isFilterOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isFilterOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeApplyModal();
        };
        if (applyingCareer) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [applyingCareer]);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory, selectedType, sortOrder]);

    const categories = [...new Set(careers.map(c => c.category).filter(Boolean))];
    const types = [...new Set(careers.map(c => c.employment_type).filter(Boolean))];
    const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedType ? 1 : 0) + (sortOrder !== 'latest' ? 1 : 0);

    const filtered = careers
        .filter(c => {
            const q = searchQuery.toLowerCase().trim();
            const matchQ = !q ||
                (c.position || '').toLowerCase().includes(q) ||
                (c.department || '').toLowerCase().includes(q) ||
                (c.location || '').toLowerCase().includes(q) ||
                (c.description || '').toLowerCase().includes(q);
            return matchQ && (!selectedCategory || c.category === selectedCategory) && (!selectedType || c.employment_type === selectedType);
        })
        .sort((a, b) => sortOrder === 'oldest'
            ? new Date(a.created_at) - new Date(b.created_at)
            : new Date(b.created_at) - new Date(a.created_at));

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    const resetFilters = () => { setSearchQuery(''); setSelectedCategory(''); setSelectedType(''); setSortOrder('latest'); };

    const categoryColor = (cat) => {
        const l = (cat || '').toLowerCase();
        if (l === 'corporate' || l === 'office') return 'bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white';
        if (l === 'seafaring' || l === 'crew') return 'bg-gradient-to-r from-[#D93A2B] to-[#FF5542] text-white';
        return 'bg-[#404750] text-white';
    };

    const applyBtnClass = (cat) => {
        const l = (cat || '').toLowerCase();
        return (l === 'seafaring' || l === 'crew')
            ? 'bg-gradient-to-r from-[#D93A2B] to-[#FF5542] hover:shadow-[0_4px_14px_rgba(217,58,43,0.35)]'
            : 'bg-gradient-to-r from-[#00629D] to-[#3F96DD] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)]';
    };

    const formatType = (t) => (t || 'Full Time').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const formatDeadline = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null;

    return (
        <GuestLayout>
            <Head title="Maritime Careers & Job Vacancies | PT. ABB" />

            {/* 1. Hero */}
            <div id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-[4px] items-stretch min-h-[606px]">
                <motion.div
                    initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="lg:col-span-5 bg-white rounded-[8px] p-6 sm:p-8 lg:px-[34px] lg:py-[60px] flex flex-col justify-center border border-[#E5E7EB] relative min-h-[420px] lg:min-h-[606px]"
                >
                    <div className="max-w-[441px] flex flex-col gap-[15px]">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
                            className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider"
                        >
                            JOIN OUR TEAM
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
                            className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[44px] leading-[1.12] text-[#141B2C] tracking-tight"
                        >
                            Chart Your Next Career Voyage with Us
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
                            className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[18px] text-[#404750] leading-relaxed"
                        >
                            Whether on land or at sea, PT. ABB offers competitive growth, safety-first culture, and professional career advancement across our expanding fleet and offices.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-wrap items-center gap-[10px] pt-2"
                        >
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                                <a
                                    href="#positions"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const el = document.getElementById('positions');
                                        if (el) {
                                            el.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    className="group bg-gradient-to-r from-[#00629D] to-[#3F96DD] rounded-[4px] px-[28px] py-[10px] font-['Hanken_Grotesk'] font-medium text-[15px] text-white hover:opacity-95 transition-[colors,shadow,opacity,transform] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] inline-flex items-center gap-2 cursor-pointer"
                                >
                                    Explore Careers <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                                </a>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                                <Link
                                    href={route('public.contacts')}
                                    className="rounded-[4px] border border-[#404750] hover:border-[#00629D] hover:text-[#00629D] px-[28px] py-[10px] font-['Hanken_Grotesk'] font-medium text-[15px] text-[#404750] transition-all inline-flex items-center gap-2 cursor-pointer"
                                >
                                    Contact Us
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="lg:col-span-7 bg-[#141B2C] rounded-[8px] overflow-hidden relative min-h-[380px] lg:min-h-[606px] border border-[#E5E7EB]"
                >
                    <img src="/images/careers/hero.png" alt="Join Our Team" className="w-full max-h-[606px] object-cover" />
                </motion.div>
            </div>

            {/* 2. Why Work With Us */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[3px] items-stretch">
                <motion.div
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                    className="lg:col-span-5 rounded-[8px] overflow-hidden border border-[#E5E7EB] relative min-h-[380px] lg:min-h-[460px] group bg-[#141B2C]"
                >
                    <img src="/images/asuwa1.jpg" alt="PT. ABB Fleet Management" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                    className="lg:col-span-7 bg-white rounded-[8px] border border-[#E5E7EB] p-8 sm:p-12 flex flex-col justify-between"
                >
                    <div>
                        <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider mb-3">WHY WORK WITH US</div>
                        <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] text-[#141B2C] leading-[1.12] tracking-tight mb-5">
                            Empowering Our People at Sea and on Land
                        </h2>
                        <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[18px] text-[#404750] leading-relaxed mb-6">
                            At PT. ABB, we believe our greatest asset is our workforce. We are committed to providing a safe, supportive, and rewarding environment where every team member can thrive.
                        </p>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-[8px] border border-[#E5E7EB] p-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-left">
                            {[
                                { icon: Shield, title: 'Safety Culture', description: 'Uncompromising commitment to operational safety and crew wellbeing.' },
                                { icon: TrendingUp, title: 'Structured Growth', description: 'Clear pathways supported by continuous technical training.' },
                                { icon: Anchor, title: 'Long-Term Career', description: 'Stable opportunities supported by a reliable, modern fleet.' },
                                { icon: Award, title: 'Top Benefits', description: 'Comprehensive compensation aligned with global industry standards.' },
                            ].map((item, idx) => {
                                const IconComponent = item.icon;
                                return (
                                    <motion.div key={idx} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}
                                        className="bg-white rounded-[6px] p-4 sm:p-5 border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-[0_4px_14px_rgba(0,98,157,0.15)] transition-[colors,shadow,opacity,transform] flex items-start gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-[6px] bg-[#F5F5F5] border border-[#E5E7EB] flex items-center justify-center shrink-0 mt-0.5">
                                            <IconComponent className="w-4 h-4 text-[#141B2C]" />
                                        </div>
                                        <div>
                                            <h4 className="font-['Hanken_Grotesk'] font-bold text-[15px] text-[#141B2C] leading-snug">{item.title}</h4>
                                            <p className="font-['Hanken_Grotesk'] text-[12px] text-[#404750] leading-snug mt-1">{item.description}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 3. Recruitment Pipeline */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-white rounded-[8px] border border-[#E5E7EB] p-8 sm:p-12"
            >
                <div className="mb-5 text-left">
                    <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider mb-3">RECRUITMENT PIPELINE</div>
                    <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] text-[#141B2C] leading-[1.12] tracking-tight mb-3">Your Journey to Joining PT. ABB</h2>
                    <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] text-[#404750] leading-relaxed">
                        A transparent, step-by-step hiring process designed to evaluate technical expertise, safety awareness, and cultural fit for land and sea positions.
                    </p>
                </div>
                {/* Desktop view (horizontal step flow) */}
                <div className="hidden md:flex w-full flex-row items-start justify-between pt-6">
                    {[
                        { icon: FileText, title: 'Application & Document Submission' },
                        { icon: Search, title: 'Screening & Verification' },
                        { icon: Wrench, title: 'Technical & Competency Interview' },
                        { icon: BriefcaseMedical, title: 'Medical Check-Up' },
                    ].map((step, idx, arr) => {
                        const Icon = step.icon;
                        return (
                            <React.Fragment key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: idx * 0.15 + 0.3, ease: 'easeOut' }}
                                    className="flex-1 flex flex-col items-center text-center gap-3"
                                >
                                    <div className="w-16 h-16 rounded-[12px] bg-gradient-to-br from-[#00629D] to-[#3F96DD] flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform">
                                        <Icon className="w-7 h-7 stroke-[1.8]" />
                                    </div>
                                    <h4 className="font-['Hanken_Grotesk'] font-bold text-[14px] sm:text-[15px] text-[#141B2C] max-w-[130px] leading-snug">{step.title}</h4>
                                </motion.div>
                                {idx < arr.length - 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                                        transition={{ duration: 0.3, delay: idx * 0.15 + 0.3, ease: 'easeOut' }}
                                        className="flex items-center self-start mt-7 shrink-0 px-2"
                                    >
                                        <img src="/images/Arrow right.svg" alt="arrow" className="h-3 w-auto opacity-60" />
                                    </motion.div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Mobile view (grid / step list layout) */}
                <div className="grid grid-cols-2 gap-4 md:hidden pt-4">
                    {[
                        { icon: FileText, title: 'Application & Document Submission', stepNum: '01' },
                        { icon: Search, title: 'Screening & Verification', stepNum: '02' },
                        { icon: Wrench, title: 'Technical & Competency Interview', stepNum: '03' },
                        { icon: BriefcaseMedical, title: 'Medical Check-Up', stepNum: '04' },
                    ].map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                className="border border-[#E5E7EB] rounded-[8px] p-4 flex flex-col items-center text-center gap-2.5 relative"
                            >
                                <span className="absolute top-2 right-2 text-[10px] font-['JetBrains_Mono'] font-bold text-[#00629D]/50 bg-[#00629D]/10 px-1.5 py-0.5 rounded">
                                    {step.stepNum}
                                </span>
                                <div className="w-12 h-12 rounded-[10px] bg-gradient-to-br from-[#00629D] to-[#3F96DD] flex items-center justify-center text-white shadow-sm mt-1">
                                    <Icon className="w-5 h-5 stroke-[1.8]" />
                                </div>
                                <h4 className="font-['Hanken_Grotesk'] font-bold text-[13px] text-[#141B2C] leading-tight">
                                    {step.title}
                                </h4>
                                {idx < 3 && (
                                    <div className="text-[10px] text-[#00629D] font-['JetBrains_Mono'] font-semibold flex items-center gap-1 mt-auto pt-1">
                                        <span>Next Step</span>
                                        <span>&rarr;</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* 4. Career Vacancy Section */}
            <motion.section
                id="positions"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 lg:p-14"
            >
                {/* Header + Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider mb-2">CAREERS</div>
                        <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[44px] leading-[1.12] text-[#141B2C] tracking-tight">
                            Looking for Something Specific?
                        </h2>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search here..."
                                className="w-52 sm:w-64 px-4 py-2 text-[13px] font-['JetBrains_Mono'] text-[#141B2C] placeholder-[#9CA3AF] bg-white border border-[#E5E7EB] rounded-[4px] focus:outline-none focus:border-[#00629D] focus:ring-1 focus:ring-[#00629D] transition-colors"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        {/* Red Search Button */}
                        <button type="button" title="Search"
                            className="bg-gradient-to-r from-[#D93A2B] to-[#FF5542] hover:shadow-[0_4px_14px_rgba(217,58,43,0.35)] active:scale-[0.97] text-white p-3 rounded-[4px] transition-[colors,shadow,opacity,transform] flex items-center justify-center shadow-sm cursor-pointer"
                        >
                            <Search className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        {/* Blue Filter Button & Popover */}
                        <div className="relative" ref={filterRef}>
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                title="Filter Positions"
                                className={`relative bg-gradient-to-r from-[#00629D] to-[#3F96DD] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] active:scale-[0.97] text-white p-3 rounded-[4px] transition-[colors,shadow,opacity,transform] flex items-center justify-center shadow-sm cursor-pointer ${activeFiltersCount > 0 ? 'ring-2 ring-offset-1 ring-[#00629D]' : ''}`}
                            >
                                <Filter className="w-4 h-4 fill-white stroke-none" />
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D93A2B] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>
                            {isFilterOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E5E7EB] rounded-[8px] shadow-xl z-30 p-4 space-y-4">
                                    <div className="flex items-center justify-between border-[#E5E7EB] pb-2.5">
                                        <span className="text-[12px] font-['JetBrains_Mono'] font-bold text-[#141B2C] uppercase tracking-wider">Filter Positions</span>
                                        {activeFiltersCount > 0 && (
                                            <button type="button" onClick={resetFilters} className="text-[11px] font-['JetBrains_Mono'] text-[#D93A2B] hover:underline font-semibold cursor-pointer">
                                                Reset All ({activeFiltersCount})
                                            </button>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-['JetBrains_Mono'] font-bold text-[#8AAFC8] uppercase mb-1.5">Category</label>
                                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full border border-[#E5E7EB] rounded-[4px] px-3 py-2 text-[13px] text-[#141B2C] focus:outline-none focus:border-[#00629D] cursor-pointer bg-white">
                                            <option value="">All Categories</option>
                                            {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-['JetBrains_Mono'] font-bold text-[#8AAFC8] uppercase mb-1.5">Employment Type</label>
                                        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
                                            className="w-full border border-[#E5E7EB] rounded-[4px] px-3 py-2 text-[13px] text-[#141B2C] focus:outline-none focus:border-[#00629D] cursor-pointer bg-white">
                                            <option value="">All Types</option>
                                            {types.map(t => <option key={t} value={t}>{formatType(t)}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-['JetBrains_Mono'] font-bold text-[#8AAFC8] uppercase mb-1.5">Sort Order</label>
                                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
                                            className="w-full border border-[#E5E7EB] rounded-[4px] px-3 py-2 text-[13px] text-[#141B2C] focus:outline-none focus:border-[#00629D] cursor-pointer bg-white">
                                            <option value="latest">Latest First</option>
                                            <option value="oldest">Oldest First</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vacancy Grid */}
                {filtered.length === 0 ? (
                    <div className="py-14 text-center bg-[#F9FAFB] rounded-[8px] border border-dashed border-[#E5E7EB]">
                        <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3 stroke-[1.5]" />
                        <h3 className="font-['Hanken_Grotesk'] font-bold text-lg text-[#141B2C] mb-1">
                            {searchQuery || activeFiltersCount > 0 ? "No Matching Positions Found" : "No Open Positions Currently Available"}
                        </h3>
                        <p className="text-[14px] text-[#404750] max-w-md mx-auto mb-5 font-['Hanken_Grotesk'] leading-relaxed">
                            {searchQuery || activeFiltersCount > 0
                                ? "No open positions match your current search or filters."
                                : "There are currently no active job vacancies posted. Please check back soon or send your CV via our contact form."}
                        </p>
                        {(searchQuery || activeFiltersCount > 0) && (
                            <button type="button" onClick={resetFilters}
                                className="px-4 py-2 bg-[#00629D] text-white text-xs font-semibold rounded-[4px] hover:bg-[#004e7e] transition-colors cursor-pointer">
                                Reset Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {paginated.map((career, idx) => (
                            <motion.div
                                key={career.id || idx}
                                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ duration: 0.35, delay: (idx % PER_PAGE) * 0.05 }}
                                className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col gap-4 hover:border-[#00629D] hover:shadow-[0_4px_14px_rgba(0,98,157,0.1)] transition-[colors,shadow,opacity,transform] duration-200"
                            >
                                {/* Badges */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[12px] font-['JetBrains_Mono'] font-bold uppercase px-2 py-0.5 rounded-[3px] ${categoryColor(career.category)}`}>
                                        {(career.category || 'General').toUpperCase()}
                                    </span>
                                    <span className="text-[12px] font-['JetBrains_Mono'] font-bold uppercase px-2 py-0.5 rounded-[3px] text-[#404750] border border-[#E5E7EB]">
                                        {formatType(career.employment_type)}
                                    </span>
                                </div>

                                {/* Position + Meta */}
                                <div>
                                    <h3 className="font-['Hanken_Grotesk'] font-bold lg:text-[24px] text-[20px] text-[#141B2C] leading-snug tracking-tight">
                                        {career.position}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                        {career.department && (
                                            <span className="flex items-center gap-1.5 lg:text-[15px] text-[13px] text-[#404750] font-['Hanken_Grotesk']">
                                                <Briefcase className="w-3.5 h-3.5 shrink-0 stroke-[2]" />
                                                {career.department}
                                            </span>
                                        )}
                                        {career.location && (
                                            <span className="flex items-center gap-1.5 lg:text-[15px] text-[13px] text-[#404750] font-['Hanken_Grotesk']">
                                                <MapPin className="w-3.5 h-3.5 shrink-0 stroke-[2]" />
                                                {career.location}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                {career.description && (
                                    <p className="font-['Hanken_Grotesk'] lg:text-[15px] text-[13px] text-[#404750] leading-relaxed line-clamp-2 flex-1">
                                        {career.description}
                                    </p>
                                )}

                                {/* Deadline */}
                                {career.application_deadline && (
                                    <div className="flex items-center gap-1.5 text-[12px] text-[#9CA3AF] font-['JetBrains_Mono']">
                                        <Clock className="w-3 h-3 shrink-0" />
                                        Deadline: {formatDeadline(career.application_deadline)}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 mt-auto pt-1">
                                    <Link href={route('public.careers.show', career.id)}
                                        className="w-full text-center py-2 px-4 border border-[#E5E7EB] rounded-[4px] font-['Hanken_Grotesk'] font-medium lg:text-[15px] text-[13px] text-[#141B2C] hover:border-[#00629D] hover:text-[#00629D] transition-colors cursor-pointer"
                                    >
                                        Review Position
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => openApplyModal(career)}
                                        className={`w-full text-center py-2 px-4 rounded-[4px] font-['Hanken_Grotesk'] font-semibold lg:text-[15px] text-[13px] text-white transition-[colors,shadow,opacity,transform] cursor-pointer ${applyBtnClass(career.category)}`}
                                    >
                                        Apply Securely
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 font-['Hanken_Grotesk']">
                        <div className="text-[13px] text-[#404750] font-['JetBrains_Mono']">
                            Showing <span className="font-bold text-[#141B2C]">{(currentPage - 1) * PER_PAGE + 1}</span> to{' '}
                            <span className="font-bold text-[#141B2C]">{Math.min(currentPage * PER_PAGE, filtered.length)}</span> of{' '}
                            <span className="font-bold text-[#141B2C]">{filtered.length}</span> positions
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="w-9 h-9 rounded-[6px] flex items-center justify-center bg-white hover:bg-slate-50 text-[#141B2C] border border-[#E5E7EB] disabled:opacity-40 disabled:cursor-not-allowed transition-[colors,shadow,opacity,transform] cursor-pointer">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} type="button" onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 rounded-[6px] text-[14px] font-bold flex items-center justify-center transition-[colors,shadow,opacity,transform] cursor-pointer ${currentPage === page
                                        ? 'bg-gradient-to-r from-[#D93A2B] to-[#FF5542] text-white border border-transparent'
                                        : 'bg-white hover:bg-slate-50 text-[#141B2C] border border-[#E5E7EB]'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button type="button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                className="w-9 h-9 rounded-[6px] flex items-center justify-center bg-white hover:bg-slate-50 text-[#141B2C] border border-[#E5E7EB] disabled:opacity-40 disabled:cursor-not-allowed transition-[colors,shadow,opacity,transform] cursor-pointer">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </motion.section>

            {/* 5. CTA */}
            <CtaBanner
                title="Didn't Find a Role That Matches Your Qualifications?"
                description="We are always looking for skilled seafarers, marine officers, and corporate logistics talent. Submit your CV to our talent database, and our HR team will reach out as soon as a suitable opportunity opens up."
                buttonLabel="Send Us Your CV"
                onClick={() => setApplyingCareer({
                    id: null,
                    position: 'Spontaneous Application / Candidate Pool',
                    department: 'General Candidate Database',
                    location: 'Indonesia / Global',
                    isGeneric: true
                })}
            />

            {/* 6. JOB APPLICATION MODAL */}
            <JobApplyModal
                career={applyingCareer}
                onClose={() => setApplyingCareer(null)}
                onSuccess={() => {
                    setShowSuccessToast(true);
                    setTimeout(() => setShowSuccessToast(false), 5000);
                }}
            />

            {/* Success Toast Notification */}
            <AnimatePresence>
                {showSuccessToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="fixed bottom-6 right-6 z-50 bg-[#141B2C] text-white p-4 rounded-[8px] shadow-2xl border border-emerald-500/30 flex items-center gap-3 max-w-md font-['Hanken_Grotesk']"
                    >
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[15px] text-white leading-tight">Application Submitted!</h4>
                            <p className="text-[13px] text-slate-300 mt-0.5 leading-snug">
                                Thank you for applying. Our team will review your qualifications and reach out soon.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowSuccessToast(false)}
                            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors shrink-0 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Pop-up Banner Alert Modal for Career Page */}
            <NotificationPopup notifications={notificationsList} targetType="career" />
        </GuestLayout>
    );
}
