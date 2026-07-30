import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import TallyNumber from '@/Components/TallyNumber';
import NotificationPopup from '@/Components/NotificationPopup';
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

export default function Welcome({ auth, clients: initialClients = [], fleets: initialFleets = [], notifications: initialNotifications = [] }) {
    const [activeFleetTab, setActiveFleetTab] = useState(0);
    const [heroVesselIndex, setHeroVesselIndex] = useState(0);
    const [activeRegion, setActiveRegion] = useState('indonesia');
    const [clientsList, setClientsList] = useState(initialClients);
    const [fleetsList, setFleetsList] = useState(initialFleets);
    const [notificationsList, setNotificationsList] = useState(initialNotifications);

    // Auto-rotate Hero active vessel every 3 seconds (3000ms)
    useEffect(() => {
        const vesselsCount = (fleetsList && fleetsList.length > 0) ? fleetsList.length : fleetVessels.length;
        if (vesselsCount <= 1) return;

        const interval = setInterval(() => {
            setHeroVesselIndex(prev => (prev + 1) % vesselsCount);
        }, 5000);

        return () => clearInterval(interval);
    }, [fleetsList]);

    // Fetch all clients, fleets, and notifications from API endpoints if not provided via Inertia props
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

        if (!initialFleets || initialFleets.length === 0) {
            fetch('/fleets', {
                headers: { 'Accept': 'application/json' }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        setFleetsList(data);
                    }
                })
                .catch(err => console.error("Error loading fleets:", err));
        }

        if (!initialNotifications || initialNotifications.length === 0) {
            fetch('/notifications', {
                headers: { 'Accept': 'application/json' }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        setNotificationsList(data);
                    }
                })
                .catch(err => console.error("Error loading notifications:", err));
        }
    }, [initialClients, initialFleets, initialNotifications]);

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

    const safeRoute = (routeName, fallback = '#') => {
        try {
            return route(routeName);
        } catch (e) {
            return fallback;
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
            image: "/images/card_bulk_vessel.png",
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
            <Head title="Welcome - PT PABB" />
            <NotificationPopup notifications={notificationsList} targetType="home" />

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
                            className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[44px] lg:text-[44px] leading-[1.12] text-[#141B2C] tracking-tight"
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
                    className="lg:col-span-7 bg-[#141B2C] rounded-[8px] overflow-hidden relative min-h-[380px] lg:min-h-[606px] border border-[#E5E7EB] group"
                >
                    {(() => {
                        const vessels = (fleetsList && fleetsList.length > 0) ? fleetsList : fleetVessels;
                        const safeIdx = Math.min(heroVesselIndex, vessels.length - 1);
                        const heroVessel = vessels[safeIdx];

                        const heroImage = heroVessel?.featured_image_url
                            || (heroVessel?.featured_image
                                ? (heroVessel.featured_image.startsWith('/') || heroVessel.featured_image.startsWith('http')
                                    ? heroVessel.featured_image
                                    : `/images/fleet/${heroVessel.featured_image}`)
                                : (heroVessel?.image || "/images/asuwa1.jpg"));
                        const heroName = heroVessel?.ship_name || heroVessel?.name || "ASUWA 1";
                        const heroArea = heroVessel?.operational_area || "Indonesia Archipelago";
                        const heroStatus = heroVessel?.status
                            ? (heroVessel.status.includes('service') || heroVessel.status === 'Active' ? 'Active - In Service' : heroVessel.status.replace('_', ' '))
                            : "Active Vessel";
                        const heroImo = heroVessel?.imo_number ? `IMO: ${heroVessel.imo_number}` : "IMO: 9812345";
                        const heroType = heroVessel?.vessel_type || heroVessel?.type || "Pneumatic Bulk Cement";

                        return (
                            <AnimatePresence initial={false}>
                                <motion.div
                                    key={safeIdx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <img
                                        src={heroImage}
                                        alt={heroName}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            e.currentTarget.src = '/images/card_bulk_vessel.png';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/75 rounded-[8px]" />

                                    <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-[51px] flex flex-col gap-[5px] text-white z-10">
                                        <div className="font-['JetBrains_Mono'] font-bold text-[11px] sm:text-[12px] text-white uppercase tracking-wide flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            {heroStatus}
                                        </div>

                                        <div className="font-['Hanken_Grotesk'] font-bold text-[28px] sm:text-[36px] text-white leading-none">
                                            {heroName}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 font-['Hanken_Grotesk'] font-bold text-[12px] text-white">
                                            <span className="font-['JetBrains_Mono'] font-medium text-white/80">Type</span>
                                            <span>{heroType}</span>
                                            <span className="font-['JetBrains_Mono'] font-medium text-white/80 ml-2">Area</span>
                                            <span>{heroArea}</span>
                                        </div>

                                        <div className="flex items-center gap-2 font-['JetBrains_Mono'] font-medium text-[12px] text-white/70">
                                            <MapPin className="w-3.5 h-3.5 text-white/70" />
                                            <span>{heroImo}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        );
                    })()}
                </motion.div>

            </div>

            {/* 2. Client & Partners Infinite Carousel (Framer Motion) */}
            <motion.div
                id="clients"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[8px] border border-[#E5E7EB] py-6 px-4 sm:px-8  overflow-hidden relative"
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
                className=" bg-white rounded-[8px] border border-[#E5E7EB] p-8 sm:p-12 lg:p-14 text-center"
            >
                {/* Section Header Info */}
                <div className="max-w-[1091px] mx-auto flex flex-col items-center gap-3 mb-8">
                    <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider">
                        OUR CORE EXCELLENCE
                    </div>
                    <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[36px] lg:text-[44px] leading-[1.12] text-[#141B2C] max-w-[920px]">
                        Connecting Industrial Supply Chains Across Regional and International Waters
                    </h2>
                    <p className="font-['Hanken_Grotesk'] font-medium text-[17px] sm:text-[18px] text-[#404750] max-w-[850px] leading-relaxed mt-1">
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
                                    className="group bg-white rounded-[6px] p-8 lg:px-8 lg:py-10 border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-[0_6px_20px_rgba(0,98,157,0.15)] transition-all duration-200 min-h-[380px] flex flex-col justify-between"
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
                            className="bg-gradient-to-r from-[#00629D] to-[#3F96DD] rounded-[4px] px-[28px] py-[10px] font-['Hanken_Grotesk'] font-medium text-[15px] text-white hover:opacity-95 transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] inline-flex items-center gap-2"
                        >
                            Book Shipment
                            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 group-active:translate-x-0" />
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
                        <p className="font-['Hanken_Grotesk'] font-medium text-[17px] sm:text-[18px] text-[#8AAFC8] leading-relaxed max-w-[580px]">
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
                                        <TallyNumber value={item.stat} delay={idx * 0.12} />
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
                {/* Header Row with Inline Top-Right CTA */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-10">
                    <div className="max-w-[780px]">
                        <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider mb-2">
                            OPERATIONAL COVERAGE
                        </div>
                        <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] lg:text-[44px] leading-[1.12] text-[#141B2C] tracking-tight">
                            Strategic Maritime Reach Across Key Global Trade Corridors
                        </h2>
                        <p className="font-['Hanken_Grotesk'] font-medium text-[17px] sm:text-[18px] text-[#404750] leading-relaxed mt-3">
                            Operating a versatile vessel fleet connecting major manufacturing ports, regional distribution hubs, and international maritime channels.
                        </p>
                    </div>

                    {/* Top-Right Inline Book Shipment Button */}
                    <div className="shrink-0 pt-1">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                href={route('contacts.index')}
                                className="group bg-gradient-to-r from-[#00629D] to-[#3F96DD] rounded-[4px] px-[28px] py-[10px] font-['Hanken_Grotesk'] font-medium text-[15px] text-white hover:opacity-95 transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] inline-flex items-center gap-2"
                            >
                                Book Shipment
                                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 group-active:translate-x-0" />
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Dynamic Expandable Regions Accordion (Grey Outer Wrapper + Pure White Active Card) */}
                <div
                    onMouseLeave={() => setActiveRegion('indonesia')}
                    className="bg-[#F5F5F5] rounded-[12px] border border-[#E5E7EB] p-1 sm:p-1 flex flex-col lg:flex-row gap-1 h-auto lg:h-[620px] w-full items-stretch"
                >
                    {[
                        {
                            id: 'indonesia',
                            title: 'Indonesia',
                            shortDesc: 'Our foundation. Supporting national distribution networks across the archipelago.',
                            image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80'
                        },
                        {
                            id: 'southeast-asia',
                            title: 'Southeast Asia',
                            shortDesc: 'Key regional routes connecting Singapore, Malaysia, Vietnam, and Thailand bulk terminals.',
                            image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80'
                        },
                        {
                            id: 'asia-far-east',
                            title: 'Asia & Far East',
                            shortDesc: 'Deep-sea trade corridors servicing Japan, China, and South Korea industrial ports.',
                            image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80'
                        },
                        {
                            id: 'global',
                            title: 'Global',
                            shortDesc: 'Worldwide chartering, transshipment, and cross-border maritime bulk logistics.',
                            image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
                        }
                    ].map((region) => {
                        const isActive = activeRegion === region.id;
                        return (
                            <div
                                key={region.id}
                                onMouseEnter={() => setActiveRegion(region.id)}
                                className={`rounded-[8px] overflow-hidden transition-all duration-300 ease-out cursor-pointer relative flex flex-col h-[460px] lg:h-full ${isActive
                                    ? 'lg:flex-[3.5_1_0%] bg-white border border-[#E5E7EB] p-6 sm:p-8 justify-between '
                                    : 'lg:flex-[1_1_0%] border border-[#E5E7EB] items-center justify-center'
                                    }`}
                            >
                                {isActive ? (
                                    /* Active Expanded Region Panel (Pure White Surface) */
                                    <div className="h-full flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-[28px] sm:text-[36px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] mb-2 tracking-tight">
                                                {region.title}
                                            </h3>
                                            <p className="text-[15px] sm:text-[16px] font-['Hanken_Grotesk'] font-normal text-[#404750] leading-relaxed max-w-[520px]">
                                                {region.shortDesc}
                                            </p>
                                        </div>

                                        <div className="rounded-[8px] overflow-hidden border border-[#E5E7EB] shadow-sm h-[260px] sm:h-[395px] w-full relative shrink-0">
                                            <img
                                                src={region.image}
                                                alt={region.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* Collapsed Vertical Image Strip Panel */
                                    <>
                                        <img
                                            src={region.image}
                                            alt={region.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-b from-[#00629D]/75 via-[#00629D]/40 to-[#141B2C]/85 hover:from-[#00629D]/85 transition-colors duration-300" />

                                        <div className="relative z-10 flex items-center justify-center p-2 h-full w-full">
                                            <span className="font-['Hanken_Grotesk'] font-bold text-[20px] sm:text-[24px] text-white tracking-wide whitespace-nowrap lg:[writing-mode:vertical-lr] lg:rotate-180 drop-shadow-md">
                                                {region.title}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* 6. Featured Fleet Register Section */}
            <motion.div
                id="fleet"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="bg-white rounded-[8px] border border-[#E5E7EB] p-8 sm:p-12 lg:p-14"
            >
                {/* Section Header (Left-Aligned) */}
                <div className="flex flex-col gap-3 mb-10">
                    <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider">
                        FEATURED FLEET
                    </div>
                    <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[36px] lg:text-[44px] leading-[1.12] text-[#141B2C] max-w-[920px]">
                        Engineered for High-Tonnage Cargo Precision
                    </h2>
                    <p className="font-['Hanken_Grotesk'] font-medium text-[17px] sm:text-[18px] text-[#404750] max-w-[850px] leading-relaxed">
                        Explore operational specifications, DWT capacities, and pneumatic cargo handling systems across our active fleet.
                    </p>
                </div>

                {/* Layer 2: Gray Band Wrapper with overflow-hidden for smooth horizontal slide */}
                <div className="bg-[#F5F5F5] rounded-[8px] border border-[#E5E7EB] p-1 mb-8 overflow-hidden">
                    <AnimatePresence mode="wait" custom={activeFleetTab}>
                        {(() => {
                            const currentVessel = (fleetsList && fleetsList.length > 0)
                                ? fleetsList[Math.min(activeFleetTab, fleetsList.length - 1)]
                                : fleetVessels[Math.min(activeFleetTab, fleetVessels.length - 1)];

                            const vesselName = currentVessel.ship_name || currentVessel.name || 'MV. IRIANA';
                            const vesselType = currentVessel.vessel_type || currentVessel.type || 'Pneumatic Bulk Cement';
                            const dwtVal = currentVessel.dwt ? `${Number(currentVessel.dwt).toLocaleString()} DWT` : (currentVessel.dwt || '11,040 DWT');
                            const capacityVal = currentVessel.capacity ? `${Number(currentVessel.capacity).toLocaleString()} MT` : (currentVessel.capacity || '8,860 MT');
                            const yearVal = currentVessel.build_year || currentVessel.year || '2015';
                            const flagClassVal = currentVessel.flag
                                ? `${currentVessel.flag} ${currentVessel.classification_society ? '(' + currentVessel.classification_society + ' Class)' : ''}`
                                : (currentVessel.flagClass || 'Indonesia (RINA Class)');
                            const statusVal = currentVessel.status
                                ? (currentVessel.status.includes('service') || currentVessel.status === 'Active' ? 'Active - In Service' : currentVessel.status.replace('_', ' '))
                                : 'Active - In Service';
                            const imageVal = currentVessel.featured_image_url
                                || (currentVessel.featured_image
                                    ? (currentVessel.featured_image.startsWith('/') || currentVessel.featured_image.startsWith('http')
                                        ? currentVessel.featured_image
                                        : `/images/fleet/${currentVessel.featured_image}`)
                                    : (currentVessel.image || '/images/asuwa1.jpg'));

                            const rawDesc = currentVessel.description || 'Pneumatic bulk cement carrier engineered for high-tonnage cargo precision, efficient pneumatic discharge operations, and reliable regional maritime transport.';
                            const descVal = rawDesc.length > 200 ? `${rawDesc.substring(0, 200)}...` : rawDesc;

                            return (
                                <motion.div
                                    key={activeFleetTab}
                                    initial={{ x: 60 }}
                                    animate={{ x: 0 }}
                                    exit={{ x: -60 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="grid grid-cols-1 lg:grid-cols-12 gap-1 items-stretch"
                                >
                                    {/* Left Specs Panel */}
                                    <div className="lg:col-span-5 bg-white rounded-[6px] border border-[#E5E7EB] p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-[24px] sm:text-[28px] lg:text-[32px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] leading-tight tracking-tight mb-2">
                                                {vesselName}
                                            </h3>

                                            <p className="font-['Hanken_Grotesk'] font-normal text-[13px] sm:text-[14px] text-[#404750] leading-relaxed mb-5">
                                                {descVal}
                                            </p>

                                            {/* 6 Specs Grid */}
                                            <div className="grid grid-cols-2 gap-2">
                                                {/* Card 1 */}
                                                <div className="bg-white rounded-[6px] border border-[#E5E7EB] p-3.5 flex flex-col justify-between">
                                                    <span className="text-[11px] font-['JetBrains_Mono'] font-bold uppercase text-[#00629D] tracking-wider">Vessel Type</span>
                                                    <span className="text-[14px] sm:text-[15px] font-['Hanken_Grotesk'] font-medium text-[#141B2C] leading-snug mt-1.5">{vesselType}</span>
                                                </div>

                                                {/* Card 2 */}
                                                <div className="bg-white rounded-[6px] border border-[#E5E7EB] p-3.5 flex flex-col justify-between">
                                                    <span className="text-[11px] font-['JetBrains_Mono'] font-bold uppercase text-[#00629D] tracking-wider">Deadweight (DWT)</span>
                                                    <span className="text-[14px] sm:text-[15px] font-['Hanken_Grotesk'] font-medium text-[#141B2C] mt-1.5">{dwtVal}</span>
                                                </div>

                                                {/* Card 3 */}
                                                <div className="bg-white rounded-[6px] border border-[#E5E7EB] p-3.5 flex flex-col justify-between">
                                                    <span className="text-[11px] font-['JetBrains_Mono'] font-bold uppercase text-[#00629D] tracking-wider">Cargo Capacity</span>
                                                    <span className="text-[14px] sm:text-[15px] font-['Hanken_Grotesk'] font-medium text-[#141B2C] mt-1.5">{capacityVal}</span>
                                                </div>

                                                {/* Card 4 */}
                                                <div className="bg-white rounded-[6px] border border-[#E5E7EB] p-3.5 flex flex-col justify-between">
                                                    <span className="text-[11px] font-['JetBrains_Mono'] font-bold uppercase text-[#00629D] tracking-wider">Year Built</span>
                                                    <span className="text-[14px] sm:text-[15px] font-['Hanken_Grotesk'] font-medium text-[#141B2C] mt-1.5">{yearVal}</span>
                                                </div>

                                                {/* Card 5 */}
                                                <div className="bg-white rounded-[6px] border border-[#E5E7EB] p-3.5 flex flex-col justify-between">
                                                    <span className="text-[11px] font-['JetBrains_Mono'] font-bold uppercase text-[#00629D] tracking-wider">Flag &amp; Class</span>
                                                    <span className="text-[14px] sm:text-[15px] font-['Hanken_Grotesk'] font-medium text-[#141B2C] leading-snug mt-1.5">{flagClassVal}</span>
                                                </div>

                                                {/* Card 6 */}
                                                <div className="bg-white rounded-[6px] border border-[#E5E7EB] p-3.5 flex flex-col justify-between">
                                                    <span className="text-[11px] font-['JetBrains_Mono'] font-bold uppercase text-[#00629D] tracking-wider">Operational Status</span>
                                                    <span className="text-[14px] sm:text-[15px] font-['Hanken_Grotesk'] font-medium text-[#141B2C] leading-snug mt-1.5">{statusVal}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons Row */}
                                        <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-[#E5E7EB]">
                                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                                <Link
                                                    href={route('contacts.index')}
                                                    className="group bg-gradient-to-r from-[#00629D] to-[#3F96DD] rounded-[4px] px-[28px] py-[10px] font-['Hanken_Grotesk'] font-medium text-[15px] text-white hover:opacity-95 transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] inline-flex items-center gap-2"
                                                >
                                                    Book Shipment
                                                    <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 group-active:translate-x-0" />
                                                </Link>
                                            </motion.div>

                                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                                <Link
                                                    href={safeRoute('fleets.index', '/fleets')}
                                                    className="group rounded-[4px] border border-[#404750] px-[24px] py-[10px] font-['Hanken_Grotesk'] font-medium text-[15px] text-[#404750] hover:text-[#00629D] hover:border-[#00629D] transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.2)] inline-flex items-center gap-2"
                                                >
                                                    View Full Specs
                                                    <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 group-active:translate-x-0" />
                                                </Link>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Right Column: Vessel Image Frame */}
                                    <div className="lg:col-span-7 bg-[#141B2C] rounded-[6px] overflow-hidden border border-[#E5E7EB] relative group h-[380px] sm:h-[440px] lg:h-[525px] w-full">
                                        <img
                                            src={imageVal}
                                            alt={vesselName}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            onError={(e) => {
                                                e.currentTarget.src = '/images/card_bulk_vessel.png';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                                    </div>
                                </motion.div>
                            );
                        })()}
                    </AnimatePresence>
                </div>

                {/* Bottom Pagination Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Numbered Tab Controls */}
                    <div className="flex items-center gap-2">
                        {((fleetsList && fleetsList.length > 0 ? fleetsList : fleetVessels).slice(0, 5)).map((vessel, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveFleetTab(idx)}
                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] text-[14px] font-['Hanken_Grotesk'] font-bold flex items-center justify-center transition-all cursor-pointer ${activeFleetTab === idx
                                    ? 'bg-gradient-to-r from-[#D93A2B] to-[#FF5542] text-white shadow-xs border border-transparent'
                                    : 'bg-white hover:bg-slate-50 text-[#141B2C] border border-[#E5E7EB]'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    {/* Right See More Fleet Button */}
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link
                            href={'/fleets'}
                            className="group bg-gradient-to-r from-[#00629D] to-[#3F96DD] rounded-[4px] px-[28px] py-[10px] font-['Hanken_Grotesk'] font-medium text-[15px] text-white hover:opacity-95 transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] inline-flex items-center gap-2"
                        >
                            See More Fleet
                            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 group-active:translate-x-0" />
                        </Link>
                    </motion.div>
                </div>
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
                    <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[36px] lg:text-[44px] leading-[1.05] text-white">
                        Ready to Streamline Your Bulk Cargo Logistics?
                    </h2>

                    <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[18px] text-white/90 leading-relaxed">
                        Partner with PT. ABB for reliable vessel chartering, pneumatic bulk cement shipping, and dedicated maritime operations across regional &amp; global routes.
                    </p>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                        <Link
                            href={route('contacts.index')}
                            className="group bg-gradient-to-r from-[#D93A2B] to-[#FF5542] text-white rounded-[8px] px-[36px] py-[14px] font-['Hanken_Grotesk'] font-semibold text-[16px] hover:shadow-[0_4px_14px_rgba(217,58,43,0.35)] active:scale-[0.97] inline-flex items-center gap-2.5 mt-2 transition-all"
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
