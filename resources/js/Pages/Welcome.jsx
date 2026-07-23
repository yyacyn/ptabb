import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import {
    MapPin,
    ArrowRight,
    Ship,
    Globe,
    Award,
    CheckCircle2,
    ShieldCheck,
    Compass,
    Anchor,
    ChevronRight,
    TrendingUp,
    Zap
} from 'lucide-react';

export default function Welcome({ auth, clients: initialClients = [] }) {
    const [activeFleetTab, setActiveFleetTab] = useState(0);
    const [clientsList, setClientsList] = useState(initialClients);

    // Fetch all clients from /clients endpoint if not provided via Inertia props
    useEffect(() => {
        if (!initialClients || initialClients.length === 0) {
            fetch('/clients', {
                headers: { 'Accept': 'application/json' }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        setClientsList(data);
                    }
                })
                .catch(err => console.error("Error loading clients:", err));
        }
    }, [initialClients]);

    // Ensure page always loads at top and clears any auto-scroll anchor hash
    useEffect(() => {
        if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
        }
        window.scrollTo(0, 0);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const fallbackClientLogos = [
        { name: "Weltrans Marine Services Inc.", src: "/images/clients/1777648070_Weltrans_Marine.png" },
        { name: "United Ocean Shipping (UOS) Co., Ltd", src: "/images/clients/1777648264_United_Ocean_Sh.png" },
        { name: "PT. Semen Indonesia (Persero), Tbk", src: "/images/clients/1777649240_PT__Semen_Indon.png" },
        { name: "PT. Semen Bosowa Indonesia", src: "/images/clients/1777649674_PT__Semen_Bosow.png" },
        { name: "PT. Semen Padang", src: "/images/clients/1777649829_PT__Semen_Padan.png" },
        { name: "PT. Indocement Tunggal Perkasa, Tbk", src: "/images/clients/1777649352_PT__Indocement_.png" },
        { name: "Jumewah Shipping Sdn Bhd (YTL Group)", src: "/images/clients/1777647999_Jumewah_Shippin.png" },
        { name: "PT. Cemindo Gemilang", src: "/images/clients/1777649646_PT__Cemindo_Gem.png" },
        { name: "PT. Semen Tonasa", src: "/images/clients/1777649742_PT__Semen_Tonas.png" },
        { name: "PT. Semen Gresik", src: "/images/clients/1777649295_PT__Semen_Gresi.png" },
        { name: "Raysut Cement Company", src: "/images/clients/1777642947_Raysut_Cement_C.png" },
        { name: "KGJS Cement", src: "/images/clients/1777648348_KGJS_Cement.png" },
        { name: "PT. Solusi Bangun Indonesia, Tbk", src: "/images/clients/1777649875_PT__Solusi_Bang.png" },
        { name: "Cementis Group", src: "/images/clients/1778835519_Cementis_Group.png" }
    ];

    const displayClients = clientsList && clientsList.length > 0
        ? clientsList.map(c => ({
            name: c.name,
            src: c.logo ? `/images/clients/${c.logo}` : '/images/clients/placeholder.png'
        }))
        : fallbackClientLogos;

    const fleetVessels = [
        {
            name: "ASUWA 1",
            type: "Pneumatic Bulk Cement",
            dwt: "11,040 DWT",
            capacity: "8,860 MT",
            year: "2015",
            flagClass: "Indonesia (RINA Class)",
            status: "Active - In Service",
            image: "/images/asuwa1.jpg",
            route: "Tokyo &rarr; Jakarta"
        },
        {
            name: "TB. Samudra Power 01",
            type: "Twin-Screw Ocean Tugboat",
            dwt: "3,200 HP",
            capacity: "330ft Deck Cargo",
            year: "2018",
            flagClass: "Indonesia (BKI Class)",
            status: "Active - In Service",
            image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
            route: "Samarinda &rarr; Java Sea"
        },
        {
            name: "FC. Buana Titan",
            type: "Floating Crane Barge",
            dwt: "25 MT Grab",
            capacity: "15,000 MT/Day",
            year: "2020",
            flagClass: "Indonesia (BKI Class)",
            status: "Active - In Service",
            image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
            route: "Samarinda Anchorage"
        }
    ];

    return (
        <GuestLayout onScrollToSection={scrollToSection}>
            <Head title="PT Pelayaran Andalas Bahtera Baruna — Indonesian Leaders in Bulk Cement Transportation" />

            {/* 1. Hero Section */}
            <div id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-[7px] items-stretch min-h-[606px]">

                {/* Left Card Container */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="lg:col-span-5 bg-white rounded-[8px] p-6 sm:p-8 lg:px-[34px] lg:py-[60px] flex flex-col justify-center border border-[#E5E7EB] relative min-h-[420px] lg:min-h-[606px]"
                >
                    <div className="max-w-[441px] flex flex-col gap-[15px]">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider"
                        >
                            INTRODUCTION
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="font-['Hanken_Grotesk'] font-medium text-[32px] sm:text-[44px] lg:text-[50px] leading-[1.12] text-[#141B2C] tracking-tight"
                        >
                            Indonesian Leaders in Bulk Cement Transportation
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="font-['Hanken_Grotesk'] font-medium text-[17px] sm:text-[18px] text-[#404750] leading-relaxed"
                        >
                            Commanding a specialized fleet with industrial precision. We bridge the gap between production and delivery with state-of-the-art maritime operations tailored for heavy industrial logistics.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-wrap items-center gap-[10px] pt-2"
                        >
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Link
                                    href={route('contacts.index')}
                                    className="group bg-gradient-to-r from-[#00629D] to-[#3F96DD] rounded-[4px] px-[28px] py-[10px] font-['Hanken_Grotesk'] font-medium text-[15px] text-white hover:opacity-95 transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] inline-flex items-center justify-center gap-2"
                                >
                                    Book Shipment
                                    <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 group-active:translate-x-0" />
                                </Link>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <a
                                    href="#fleet"
                                    onClick={(e) => { e.preventDefault(); scrollToSection('fleet'); }}
                                    className="group rounded-[4px] border border-[#404750] px-[28px] py-[10px] font-['Hanken_Grotesk'] font-medium text-[15px] text-[#404750] transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.2)] inline-flex items-center justify-center gap-2"
                                >
                                    Explore Fleet
                                    <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 group-active:translate-x-0" />
                                </a>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right Card Container */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="lg:col-span-7 bg-white rounded-[8px] overflow-hidden relative min-h-[380px] lg:min-h-[606px] border border-[#E5E7EB] group"
                >
                    <motion.img
                        src="/images/asuwa1.jpg"
                        alt="Active Vessel - ASUWA 1"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/75 rounded-[8px]" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="absolute bottom-6 sm:bottom-10 left-6 sm:left-[51px] flex flex-col gap-[5px] text-white z-10"
                    >
                        <div className="font-['JetBrains_Mono'] font-bold text-[11px] sm:text-[12px] text-white uppercase tracking-wide">
                            Active Vessel
                        </div>

                        <div className="font-['Hanken_Grotesk'] font-bold text-[28px] sm:text-[36px] text-white leading-none">
                            ASUWA 1
                        </div>

                        <div className="flex flex-wrap items-center gap-2 font-['Hanken_Grotesk'] font-bold text-[12px] text-white">
                            <span className="font-['JetBrains_Mono'] font-medium text-white/80">From</span>
                            <span>Tokyo, Japan</span>
                            <span className="font-['JetBrains_Mono'] font-medium text-white/80 ml-2">To</span>
                            <span>Jakarta, Indonesia</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] font-medium text-[12px] text-white/70">
                            <MapPin className="w-3.5 h-3.5 text-white/70 shrink-0" />
                            <span>48.8584° N, 2.2945° E</span>
                        </div>
                    </motion.div>
                </motion.div>

            </div>

            {/* 2. Client & Partners Infinite Carousel (Framer Motion) */}
            <motion.div
                id="clients"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[8px] border border-[#E5E7EB] py-6 px-4 sm:px-8 mt-[7px] overflow-hidden relative"
            >
                <p className="text-[11px] sm:text-[12px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider text-[#404750] mb-6 text-start">
                    TRUSTED BY INDUSTRY LEADERS NATIONALLY &amp; INTERNATIONALLY
                </p>

                {/* Gradient Fade Edges */}
                <div className="absolute left-0 top-12 bottom-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-12 bottom-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

                {/* Infinite Framer Motion Track */}
                <div className="overflow-hidden py-2 flex">
                    <motion.div
                        className="flex items-center gap-10 sm:gap-14 lg:gap-12 shrink-0"
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: 'loop',
                                duration: 35,
                                ease: 'linear',
                            },
                        }}
                    >
                        {[...displayClients, ...displayClients].map((client, idx) => (
                            <motion.div
                                key={idx}
                                className="flex-shrink-0 flex items-center justify-center h-14 w-36 sm:w-44 px-2 group cursor-pointer"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <img
                                    src={client.src}
                                    alt={client.name}
                                    title={client.name}
                                    className="max-h-12 max-w-full object-contain grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        if (e.currentTarget.nextSibling) {
                                            e.currentTarget.nextSibling.style.display = 'block';
                                        }
                                    }}
                                />
                                <span className="hidden font-['Hanken_Grotesk'] font-bold text-[14px] text-[#141B2C]">
                                    {client.name}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* 3. Our Core Excellence Section */}
            {/* Layer 1: Core Wrapper (White) */}
            <motion.div
                id="excellence"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mt-[7px] bg-white rounded-[8px] border border-[#E5E7EB] p-8 sm:p-12 lg:p-14 text-center"
            >
                {/* Section Header Info */}
                <div className="max-w-[1091px] mx-auto flex flex-col items-center gap-3 mb-8">
                    <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider">
                        OUR CORE EXCELLENCE
                    </div>
                    <h2 className="font-['Hanken_Grotesk'] font-medium text-[32px] sm:text-[44px] lg:text-[50px] leading-[1.12] text-[#141B2C] max-w-[920px]">
                        Connecting Industrial Supply Chains Across Regional and International Waters
                    </h2>
                    <p className="font-['Hanken_Grotesk'] font-medium text-[15px] sm:text-[16px] text-[#404750] max-w-[850px] leading-relaxed mt-1">
                        High-capacity vessel solutions custom-engineered for uninterrupted transport of bulk cement, industrial raw materials, and heavy logistics across both domestic waterways and international maritime corridors.
                    </p>
                </div>

                {/* Layer 2: Card Wrapper (Gray) */}
                <div className="max-w-[960px] mx-auto bg-[#F5F5F5] rounded-[8px] border border-[#E5E7EB] p-1 mb-8 text-left">
                    {/* Layer 3: 3 Cards (White) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                        {[
                            {
                                icon: Ship,
                                title: "High-Capacity Bulk Cargo Vessels",
                                desc: "Purpose-built cement carrier vessels equipped with advanced pneumatic handling systems for zero-loss, dust-free transport of bulk cement, clinker, and industrial minerals."
                            },
                            {
                                icon: Globe,
                                title: "Strategic Multi-Port Routing",
                                desc: "Optimized coastal and deep-sea routes connecting key production facilities with major domestic hubs and international port destinations across regional trade corridors."
                            },
                            {
                                icon: Anchor,
                                title: "Robust Vessel Fleet Management",
                                desc: "A versatile fleet of modern industrial vessels berthed at major ports, operated by certified marine crews for seamless cargo transshipment."
                            }
                        ].map((item, idx) => {
                            const IconComponent = item.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    className="group bg-white rounded-[6px] p-8 lg:px-8 lg:py-10 border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-[0_6px_20px_rgba(0,98,157,0.15)] transition-all duration-200 cursor-pointer min-h-[380px] flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Icon Box */}
                                        <div className="w-10 h-10 rounded-[6px] bg-[#F5F5F5] border border-[#E5E7EB] flex items-center justify-center mb-8 text-[#141B2C]">
                                            <IconComponent className="w-5 h-5 text-[#141B2C]" />
                                        </div>

                                        {/* Title with Fixed Min-Height for Baseline Alignment */}
                                        <div className="min-h-[58px] flex items-start mb-4">
                                            <h3 className="text-[20px] lg:text-[22px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] leading-snug">
                                                {item.title}
                                            </h3>
                                        </div>

                                        {/* Body Paragraph Aligned Across Cards */}
                                        <p className="text-[15px] lg:text-[16px] font-['Hanken_Grotesk'] font-normal text-[#404750] leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Center Action Button */}
                <div className="flex justify-center pt-2">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link
                            href={route('contacts.index')}
                            className="bg-gradient-to-r from-[#00629D] to-[#3F96DD] rounded-[4px] px-[28px] py-[10px] font-['Hanken_Grotesk'] font-medium text-[15px] text-white hover:opacity-95 transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] inline-block"
                        >
                            Book Shipment
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* 4. Track Record & Scale Section (Dark Theme) */}
            <motion.div
                id="stats"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.2 }}
                className="bg-[#141B2C] text-white rounded-[8px] p-6 sm:p-10 lg:p-12 lg:px-20 relative overflow-hidden"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left Info Column */}
                    <div className="lg:col-span-7 flex flex-col gap-3">
                        <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#8AAFC8] tracking-wider">
                            TRACK RECORD &amp; SCALE
                        </div>
                        <h2 className="font-['Hanken_Grotesk'] font-bold text-[28px] sm:text-[36px] lg:text-[44px] leading-[1.1] text-white tracking-tight">
                            Built on Ocean-Scale Operations
                        </h2>
                        <p className="font-['Hanken_Grotesk'] font-normal text-[16px] sm:text-[17px] text-[#8AAFC8] leading-relaxed max-w-[580px]">
                            Decades of maritime experience reflected in continuous fleet expansion, high-tonnage cargo delivery, and industry-leading voyage reliability.
                        </p>
                    </div>

                    {/* Right Certification Badges Column */}
                    <div className="lg:col-span-5 flex items-center justify-start lg:justify-end gap-6">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#141B2C] border-[3px] border-[#0D1322] flex flex-col items-center justify-center text-center p-2 ">
                            <span className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8] font-bold uppercase">ISO</span>
                            <span className="font-['Hanken_Grotesk'] font-bold text-sm sm:text-base text-white leading-tight">9001:2015</span>
                            <span className="font-['JetBrains_Mono'] text-[10px] text-[#8AAFC8]">Quality</span>
                        </div>

                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#141B2C] border-[3px] border-[#0D1322] flex flex-col items-center justify-center text-center p-2 ">
                            <span className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8] font-bold uppercase">ISO</span>
                            <span className="font-['Hanken_Grotesk'] font-bold text-sm sm:text-base text-white leading-tight">14001</span>
                            <span className="font-['JetBrains_Mono'] text-[10px] text-[#8AAFC8]">Safety</span>
                        </div>
                    </div>
                </div>

                {/* 4 Stat Cards Row (Same 3-Layer Wrapper Style as Core Excellence) */}
                {/* Layer 2: Card Wrapper (Dark Slate) */}
                <div className="max-w-full mx-auto bg-[#0D1322] rounded-[8px] border border-white/10 p-1 mt-10 text-left">
                    {/* Layer 3: 4 Stat Cards (Navy) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
                        {[
                            { stat: "25+", label: "Years of Maritime Excellence" },
                            { stat: "15+", label: "Specialized Fleet Vessels" },
                            { stat: "30+", label: "Domestic & Global Clients" },
                            { stat: "100%", label: "MARPOL / ISM Compliance" }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.1 }}
                                whileHover={{ y: -4 }}
                                className="bg-[#141B2C] rounded-[6px] p-6 border border-white/5 flex flex-col justify-between min-h-[140px] cursor-pointer hover:border-[#3F96DD]/40 transition-all duration-200"
                            >
                                <div className="flex items-center gap-1.5 text-[#3F96DD] mb-3">
                                    <TrendingUp className="w-4 h-4 text-[#3F96DD]" />
                                </div>
                                <div>
                                    <div className="font-['JetBrains_Mono'] font-bold text-[36px] sm:text-[40px] text-white leading-none tracking-tight mb-2">
                                        {item.stat}
                                    </div>
                                    <div className="font-['Hanken_Grotesk'] text-[15px] sm:text-[16px] font-normal text-[#8AAFC8] leading-snug">
                                        {item.label}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* 5. Operational Coverage / Regions Section */}
            <motion.div
                id="coverage"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 lg:p-12"
            >
                <div className="max-w-[800px] flex flex-col gap-4 mb-10">
                    <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider">
                        OPERATIONAL COVERAGE
                    </div>
                    <h2 className="font-['Hanken_Grotesk'] font-medium text-[28px] sm:text-[40px] lg:text-[50px] leading-[1.1] text-[#141B2C]">
                        Strategic Maritime Reach Across Key Global Trade Corridors
                    </h2>
                    <p className="font-['Hanken_Grotesk'] font-medium text-[15px] sm:text-[17px] text-[#404750] leading-relaxed">
                        Operating a versatile vessel fleet connecting major manufacturing ports, regional distribution hubs, and international maritime channels.
                    </p>
                </div>

                {/* Regional Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-[7px]">

                    {/* Main Featured Indonesia Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-7 bg-[#F5F5F5] rounded-[8px] p-8 border border-[#E5E7EB] flex flex-col justify-between min-h-[380px] relative overflow-hidden group"
                    >
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#00629D] text-white font-['JetBrains_Mono'] text-xs font-bold mb-4">
                                Archipelagic Network
                            </div>
                            <h3 className="text-[26px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] mb-2">
                                Indonesia Domestic Waterways
                            </h3>
                            <p className="text-[15px] font-['Hanken_Grotesk'] text-[#404750] max-w-[480px]">
                                Our foundation. Supporting national distribution networks across the archipelago with dedicated coastal cement carriers and tug &amp; barge fleets.
                            </p>
                        </div>

                        <div className="mt-8 relative z-10">
                            <div className="h-44 rounded-lg overflow-hidden border border-[#E5E7EB] shadow-sm relative">
                                <img
                                    src="/images/asuwa1.jpg"
                                    alt="Indonesian Waters"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded text-xs font-['JetBrains_Mono']">
                                    Primary Trade Corridor: Java Sea &amp; Kalimantan
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Secondary Regions Column */}
                    <div className="lg:col-span-5 flex flex-col gap-[7px]">
                        {[
                            { num: "02", name: "Southeast Asia", detail: "Singapore, Malaysia, Vietnam & Thailand Bulk Routes" },
                            { num: "03", name: "Asia & Far East", detail: "Japan, China & South Korea Deep-Sea Corridors" },
                            { num: "04", name: "Global Network", detail: "International Charter & Cross-Border Transshipment" }
                        ].map((corridor, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.12 }}
                                whileHover={{ x: 6 }}
                                className="bg-[#F5F5F5] rounded-[8px] p-6 border border-[#E5E7EB] hover:border-[#00629D] hover:bg-white transition-all duration-300 flex items-center justify-between cursor-pointer"
                            >
                                <div>
                                    <div className="text-[12px] font-['JetBrains_Mono'] font-bold text-[#00629D] uppercase tracking-wider mb-1">
                                        Corridor {corridor.num}
                                    </div>
                                    <h4 className="text-[20px] font-['Hanken_Grotesk'] font-bold text-[#141B2C]">
                                        {corridor.name}
                                    </h4>
                                    <p className="text-[14px] font-['Hanken_Grotesk'] text-[#404750]">
                                        {corridor.detail}
                                    </p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-[#00629D] shrink-0" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* 6. Featured Fleet Register Section */}
            <motion.div
                id="fleet"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 lg:p-12"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="max-w-[700px]">
                        <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider mb-2">
                            FEATURED FLEET
                        </div>
                        <h2 className="font-['Hanken_Grotesk'] font-medium text-[28px] sm:text-[40px] lg:text-[48px] leading-[1.1] text-[#141B2C]">
                            Engineered for High-Tonnage Cargo Precision
                        </h2>
                        <p className="font-['Hanken_Grotesk'] font-medium text-[15px] sm:text-[17px] text-[#404750] mt-2">
                            Explore operational specifications, DWT capacities, and pneumatic cargo handling systems across our active fleet.
                        </p>
                    </div>

                    {/* Fleet Tab Selector */}
                    <div className="flex items-center gap-2 bg-[#F5F5F5] p-1.5 rounded-[6px] self-start md:self-auto">
                        {fleetVessels.map((vessel, idx) => (
                            <motion.button
                                key={idx}
                                onClick={() => setActiveFleetTab(idx)}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                className={`px-4 py-2 rounded-[4px] font-['JetBrains_Mono'] text-[13px] font-bold transition-all ${activeFleetTab === idx
                                        ? 'bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white shadow-sm'
                                        : 'text-[#141B2C] hover:bg-white'
                                    }`}
                            >
                                {idx + 1}. {vessel.name.split(' ')[0]}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Active Vessel Animated Display Box */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFleetTab}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-[7px] bg-[#F5F5F5] rounded-[8px] p-2 border border-[#E5E7EB]"
                    >
                        {/* Vessel Specs Sheet */}
                        <div className="lg:col-span-5 bg-white rounded-[8px] p-6 sm:p-8 flex flex-col justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#00629D]/10 text-[#00629D] font-['JetBrains_Mono'] text-xs font-bold mb-4">
                                    {fleetVessels[activeFleetTab].status}
                                </div>
                                <h3 className="text-[28px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] mb-1">
                                    {fleetVessels[activeFleetTab].name}
                                </h3>
                                <p className="text-[15px] font-['Hanken_Grotesk'] text-[#404750] mb-6">
                                    {fleetVessels[activeFleetTab].type}
                                </p>

                                {/* 6-Grid Spec Table */}
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E5E7EB]">
                                    <div className="bg-[#F5F5F5] rounded-[6px] p-3">
                                        <div className="text-[11px] font-['Hanken_Grotesk'] font-bold text-[#404750]">Vessel Type</div>
                                        <div className="text-[13px] font-['JetBrains_Mono'] font-bold text-[#141B2C] mt-1">{fleetVessels[activeFleetTab].type.split(' ')[0]}</div>
                                    </div>
                                    <div className="bg-[#F5F5F5] rounded-[6px] p-3">
                                        <div className="text-[11px] font-['Hanken_Grotesk'] font-bold text-[#404750]">Deadweight (DWT)</div>
                                        <div className="text-[13px] font-['JetBrains_Mono'] font-bold text-[#141B2C] mt-1">{fleetVessels[activeFleetTab].dwt}</div>
                                    </div>
                                    <div className="bg-[#F5F5F5] rounded-[6px] p-3">
                                        <div className="text-[11px] font-['Hanken_Grotesk'] font-bold text-[#404750]">Cargo Capacity</div>
                                        <div className="text-[13px] font-['JetBrains_Mono'] font-bold text-[#141B2C] mt-1">{fleetVessels[activeFleetTab].capacity}</div>
                                    </div>
                                    <div className="bg-[#F5F5F5] rounded-[6px] p-3">
                                        <div className="text-[11px] font-['Hanken_Grotesk'] font-bold text-[#404750]">Year Built</div>
                                        <div className="text-[13px] font-['JetBrains_Mono'] font-bold text-[#141B2C] mt-1">{fleetVessels[activeFleetTab].year}</div>
                                    </div>
                                    <div className="bg-[#F5F5F5] rounded-[6px] p-3 col-span-2">
                                        <div className="text-[11px] font-['Hanken_Grotesk'] font-bold text-[#404750]">Flag &amp; Classification</div>
                                        <div className="text-[13px] font-['JetBrains_Mono'] font-bold text-[#141B2C] mt-1">{fleetVessels[activeFleetTab].flagClass}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-[#E5E7EB]">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                                    <Link
                                        href={route('contacts.index')}
                                        className="w-full bg-gradient-to-r from-[#00629D] to-[#3F96DD] rounded-[4px] py-[11px] px-[20px] font-['Hanken_Grotesk'] font-medium text-[15px] text-white hover:opacity-95 transition-all inline-flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        Book Shipment
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </motion.div>
                            </div>
                        </div>

                        {/* Vessel Photo Display */}
                        <div className="lg:col-span-7 rounded-[8px] overflow-hidden min-h-[360px] lg:min-h-[440px] relative border border-[#E5E7EB] group">
                            <motion.img
                                key={fleetVessels[activeFleetTab].image}
                                initial={{ scale: 1.08, opacity: 0.8 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                src={fleetVessels[activeFleetTab].image}
                                alt={fleetVessels[activeFleetTab].name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                            <div className="absolute bottom-6 left-6 text-white z-10">
                                <div className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8] uppercase">Current Voyage</div>
                                <div className="font-['Hanken_Grotesk'] font-bold text-xl text-white">
                                    {fleetVessels[activeFleetTab].route}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* 7. Call To Action Conversion Banner */}
            <motion.div
                id="cta"
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white rounded-[8px] p-8 sm:p-12 text-center relative overflow-hidden"
            >
                <div className="max-w-[708px] mx-auto flex flex-col items-center gap-6 relative z-10">
                    <h2 className="font-['Hanken_Grotesk'] font-medium text-[32px] sm:text-[44px] lg:text-[50px] leading-[1.05] text-white">
                        Ready to Streamline Your Bulk Cargo Logistics?
                    </h2>

                    <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[18px] text-white/90 leading-relaxed">
                        Partner with PT. ABB for reliable vessel chartering, pneumatic bulk cement shipping, and dedicated maritime operations across regional &amp; global routes.
                    </p>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                        <Link
                            href={route('contacts.index')}
                            className="group bg-white text-[#00629D] rounded-[8px] px-[36px] py-[14px] font-['Hanken_Grotesk'] font-semibold text-[16px] hover:shadow-lg active:scale-[0.97] inline-flex items-center gap-2.5 mt-2 transition-all"
                        >
                            Request Charter Proposal
                            <ArrowRight className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1" />
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </GuestLayout>
    );
}
