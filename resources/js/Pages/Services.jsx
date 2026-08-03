import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import {
    Ship,
    Globe,
    Anchor,
    ArrowRight,
    CheckCircle2,
    Zap,
    ShieldCheck,
    Award,
    Layers,
    Gauge,
    Wind,
    Settings,
    FileText,
    TrendingUp,
    MapPin,
    Building2,
    Compass,
    Cpu,
    ArrowUpRight,
    Check,
    Clock
} from 'lucide-react';

const EMPTY_FLEETS = [];
const EMPTY_CLIENTS = [];

export default function Services({ fleets = EMPTY_FLEETS, clients = EMPTY_CLIENTS }) {
    const [selectedCharter, setSelectedCharter] = useState('time');
    const [activeTechPoint, setActiveTechPoint] = useState(0);
    const [activeRegion, setActiveRegion] = useState('indonesia');

    // Fleet vessel images array extracted from backend `fleets` prop (just like in AboutUs.jsx)
    const backendImages = (fleets && fleets.length > 0)
        ? fleets
            .map((f, idx) => f.image || f.featured_image_url || (f.featured_image ? (f.featured_image.startsWith('/') || f.featured_image.startsWith('http') ? f.featured_image : `/images/fleet/${f.featured_image}`) : null) || (idx % 2 === 0 ? '/images/card_bulk_vessel.png' : '/images/asuwa1.jpg'))
            .filter(Boolean)
        : ['/images/asuwa1.jpg', '/images/card_bulk_vessel.png'];

    const vesselImages = backendImages;

    const [currentHeroImageIdx, setCurrentHeroImageIdx] = useState(0);
    const [activeHoverGroup, setActiveHoverGroup] = useState(0);

    // Randomize Hero vessel image every 7 seconds
    useEffect(() => {
        if (!vesselImages || vesselImages.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentHeroImageIdx((prevIdx) => {
                let nextIdx = Math.floor(Math.random() * vesselImages.length);
                if (nextIdx === prevIdx) {
                    nextIdx = (prevIdx + 1) % vesselImages.length;
                }
                return nextIdx;
            });
        }, 7000);

        return () => clearInterval(timer);
    }, [vesselImages.length]);

    // Google Charts GeoChart for Operational Coverage
    useEffect(() => {
        const renderGoogleChart = () => {
            if (!window.google || !window.google.visualization) return;

            const container = document.getElementById('regions_div');
            if (!container) return;

            const mapChart = new window.google.visualization.GeoChart(container);
            const mapOptions = {
                backgroundColor: 'transparent',
                datalessRegionColor: '#374151',
                legend: 'none',
                tooltip: { trigger: 'none' },
                colorAxis: {
                    values: [0, 1, 2, 3, 4, 5],
                    colors: ['#374151', '#d9534f', '#5bc0de', '#3b5998', '#5cb85c', '#f0ad4e']
                }
            };

            const data = new window.google.visualization.DataTable();
            data.addColumn('string', 'Negara');
            data.addColumn('number', 'Warna');

            const val = function (groupNum) {
                if (activeHoverGroup === 0) {
                    return groupNum; // Default: show all region colors
                }
                return activeHoverGroup === groupNum ? groupNum : 0;
            };

            data.addRows([
                // 1: Indonesia (Merah)
                [{ v: 'ID' }, val(1)],

                // 2: Southeast Asia (Biru Muda)
                [{ v: 'MY' }, val(2)], [{ v: 'SG' }, val(2)], [{ v: 'TH' }, val(2)], [{ v: 'VN' }, val(2)], [{ v: 'PH' }, val(2)],
                [{ v: 'MM' }, val(2)], [{ v: 'KH' }, val(2)], [{ v: 'LA' }, val(2)], [{ v: 'BN' }, val(2)], [{ v: 'TL' }, val(2)],

                // 3: Asia & Far East (Biru Tua)
                [{ v: 'CN' }, val(3)], [{ v: 'JP' }, val(3)], [{ v: 'KR' }, val(3)], [{ v: 'TW' }, val(3)],
                [{ v: 'IN' }, val(3)], [{ v: 'BD' }, val(3)], [{ v: 'LK' }, val(3)], [{ v: 'PK' }, val(3)],
                [{ v: 'MN' }, val(3)], [{ v: 'KP' }, val(3)], [{ v: 'NP' }, val(3)], [{ v: 'BT' }, val(3)],
                [{ v: 'KZ' }, val(3)], [{ v: 'UZ' }, val(3)], [{ v: 'TM' }, val(3)], [{ v: 'KG' }, val(3)], [{ v: 'TJ' }, val(3)],
                [{ v: 'AF' }, val(3)], [{ v: 'MV' }, val(3)],

                // 4: Middle East (Hijau)
                [{ v: 'SA' }, val(4)], [{ v: 'AE' }, val(4)], [{ v: 'QA' }, val(4)], [{ v: 'OM' }, val(4)],
                [{ v: 'KW' }, val(4)], [{ v: 'BH' }, val(4)], [{ v: 'IQ' }, val(4)], [{ v: 'IR' }, val(4)],
                [{ v: 'YE' }, val(4)], [{ v: 'JO' }, val(4)], [{ v: 'LB' }, val(4)], [{ v: 'SY' }, val(4)],
                [{ v: 'IL' }, val(4)], [{ v: 'PS' }, val(4)], [{ v: 'TR' }, val(4)], [{ v: 'CY' }, val(4)],
                [{ v: 'EG' }, val(4)],

                // 5: Europe (Kuning)
                [{ v: 'GB' }, val(5)], [{ v: 'FR' }, val(5)], [{ v: 'DE' }, val(5)], [{ v: 'IT' }, val(5)], [{ v: 'ES' }, val(5)],
                [{ v: 'PT' }, val(5)], [{ v: 'NL' }, val(5)], [{ v: 'BE' }, val(5)], [{ v: 'LU' }, val(5)], [{ v: 'CH' }, val(5)],
                [{ v: 'AT' }, val(5)], [{ v: 'IE' }, val(5)], [{ v: 'DK' }, val(5)], [{ v: 'SE' }, val(5)], [{ v: 'NO' }, val(5)],
                [{ v: 'FI' }, val(5)], [{ v: 'IS' }, val(5)], [{ v: 'PL' }, val(5)], [{ v: 'CZ' }, val(5)], [{ v: 'SK' }, val(5)],
                [{ v: 'HU' }, val(5)], [{ v: 'RO' }, val(5)], [{ v: 'BG' }, val(5)], [{ v: 'HR' }, val(5)], [{ v: 'SI' }, val(5)],
                [{ v: 'RS' }, val(5)], [{ v: 'BA' }, val(5)], [{ v: 'ME' }, val(5)], [{ v: 'MK' }, val(5)], [{ v: 'AL' }, val(5)],
                [{ v: 'GR' }, val(5)], [{ v: 'EE' }, val(5)], [{ v: 'LV' }, val(5)], [{ v: 'LT' }, val(5)], [{ v: 'MT' }, val(5)],
                [{ v: 'UA' }, val(5)], [{ v: 'MD' }, val(5)], [{ v: 'BY' }, val(5)]
            ]);

            mapChart.draw(data, mapOptions);
        };

        if (window.google && window.google.charts) {
            window.google.charts.load('current', { packages: ['geochart'] });
            window.google.charts.setOnLoadCallback(renderGoogleChart);
        } else {
            const script = document.createElement('script');
            script.src = 'https://www.gstatic.com/charts/loader.js';
            script.onload = () => {
                window.google.charts.load('current', { packages: ['geochart'] });
                window.google.charts.setOnLoadCallback(renderGoogleChart);
            };
            document.head.appendChild(script);
        }
    }, [activeHoverGroup]);

    return (
        <GuestLayout>
            <Head title="Services - PT PABB" />

            {/* SECTION 01: HERO BANNER */}
            <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-white rounded-[8px] border border-[#E5E7EB] p-1 lg:p-2"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Left Column (Content & CTAs) */}
                    <div className="lg:col-span-5 flex flex-col justify-center ml-4 pl-4">
                        {/* Eyebrow */}
                        <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider mb-3">
                            WHAT WE OFFER
                        </div>

                        {/* H1 Headline */}
                        <h1 className="font-['Hanken_Grotesk'] font-bold text-[36px] sm:text-[48px] lg:text-[50px] text-[#141B2C] leading-[1.12] tracking-tight mb-5">
                            End-to-End Marine Freight &amp; Specialized Bulk Cement Logistics
                        </h1>

                        {/* Subtitle Paragraph */}
                        <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] lg:text-[18px] text-[#404750] leading-relaxed mb-8">
                            From specialized bulk cement transportation to flexible time charters and heavy-tonnage voyage charters, PT. ABB operates a modern, ISO-certified fleet engineered to move your industrial cargo seamlessly across domestic and international trade routes.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap items-center gap-3">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Link
                                    href={route('contacts.index')}
                                    className="group inline-flex items-center justify-center bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white font-['Hanken_Grotesk'] font-medium text-[15px] rounded-[4px] px-[28px] py-[10px] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] active:scale-[0.97] transition-[opacity,shadow] duration-200"
                                >
                                    Book Shipment
                                </Link>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <a
                                    href="#charter-types"
                                    className="inline-flex items-center justify-center bg-white border border-[#404750] text-[#404750] hover:text-[#00629D] hover:border-[#00629D] font-['Hanken_Grotesk'] font-medium text-[15px] rounded-[4px] px-[28px] py-[10px] transition-[colors,shadow] duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.15)]"
                                >
                                    Explore Charter Solutions
                                </a>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column (Image + 3 Stat Cards Below) */}
                    <div className="lg:col-span-7 flex flex-col gap-1 ">
                        {/* Vessel Image Panel with 7s Randomized Slideshow */}
                        <div className="rounded-[8px] overflow-hidden border border-[#E5E7EB] shadow-sm h-[300px] sm:h-[360px] lg:h-[400px] w-full relative group bg-[#141B2C]">
                            <AnimatePresence initial={false}>
                                <motion.img
                                    key={currentHeroImageIdx}
                                    src={vesselImages[currentHeroImageIdx % vesselImages.length]}
                                    alt="PT. ABB Maritime Vessel"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.currentTarget.src = '/images/card_bulk_vessel.png';
                                    }}
                                />
                            </AnimatePresence>
                        </div>

                        {/* 3 Stat Cards Strip */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 ">
                            <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-4 sm:p-5 flex flex-col justify-between hover:border-[#00629D] transition-[colors,shadow] duration-200 shadow-xs">
                                <div className="flex items-center gap-3 mb-1">
                                    <Ship className="w-5 h-5 text-[#141B2C] shrink-0" />
                                    <span className="font-['Hanken_Grotesk'] font-bold text-[28px] sm:text-[34px] text-[#141B2C] leading-none tracking-tight">
                                        15+
                                    </span>
                                </div>
                                <span className="font-['Hanken_Grotesk'] font-medium text-[12px] sm:text-[13px] text-[#404750] leading-snug">
                                    Active Vessels
                                </span>
                            </div>

                            <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-4 sm:p-5 flex flex-col justify-between hover:border-[#00629D] transition-[colors,shadow] duration-200 shadow-xs">
                                <div className="flex items-center gap-3 mb-1">
                                    <Award className="w-5 h-5 text-[#141B2C] shrink-0" />
                                    <span className="font-['Hanken_Grotesk'] font-bold text-[28px] sm:text-[34px] text-[#141B2C] leading-none tracking-tight">
                                        25+
                                    </span>
                                </div>
                                <span className="font-['Hanken_Grotesk'] font-medium text-[12px] sm:text-[13px] text-[#404750] leading-snug">
                                    Years of Experience
                                </span>
                            </div>

                            <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-4 sm:p-5 flex flex-col justify-between hover:border-[#00629D] transition-[colors,shadow] duration-200 shadow-xs">
                                <div className="flex items-center gap-3 mb-1">
                                    <ShieldCheck className="w-5 h-5 text-[#141B2C] shrink-0" />
                                    <span className="font-['Hanken_Grotesk'] font-bold text-[28px] sm:text-[34px] text-[#141B2C] leading-none tracking-tight">
                                        ISO
                                    </span>
                                </div>
                                <span className="font-['Hanken_Grotesk'] font-medium text-[12px] sm:text-[13px] text-[#404750] leading-snug">
                                    Certificate Compliant
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>            {/* SECTION 02: CHARTERING SOLUTIONS */}
            <motion.section
                id="charter-types"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 lg:p-14"
            >
                {/* Header */}
                <div className="max-w-[1091px] mx-auto text-center flex flex-col items-center gap-3 mb-10 sm:mb-12">
                    <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider">
                        CHARTERING SOLUTIONS
                    </div>
                    <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] lg:text-[44px] leading-[1.12] text-[#141B2C] tracking-tight">
                        Structured Deployment, Strategic Flexibility
                    </h2>
                    <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] lg:text-[18px] text-[#404750] max-w-[920px] leading-relaxed">
                        From specialized bulk cement transportation to flexible time charters and heavy-tonnage voyage charters, PT. ABB operates a modern, ISO-certified fleet engineered to move your industrial cargo seamlessly across domestic and international trade routes.
                    </p>
                </div>

                {/* 2 Chartering Cards Grid (Gray Outer Wrapper with 2 Pure White Cards) */}
                <div className="max-w-[1200px] mx-auto bg-[#F5F5F5] rounded-[12px] border border-[#E5E7EB] p-1 sm:p-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-1 items-stretch">
                        {/* Time Charter Card */}
                        <motion.div
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-8 lg:p-10 flex flex-col justify-between h-full hover:border-[#00629D] hover:shadow-[0_6px_20px_rgba(0,98,157,0.12)] transition-[colors,shadow] duration-200"
                        >
                            <div>
                                {/* Card Title & Icon */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-[6px] bg-[#F5F5F5] border border-[#E5E7EB] flex items-center justify-center text-[#141B2C] shrink-0">
                                        <Anchor className="w-5 h-5 text-[#141B2C]" />
                                    </div>
                                    <h3 className="font-['Hanken_Grotesk'] font-bold text-[24px] sm:text-[28px] text-[#141B2C] leading-snug">
                                        Time Charter
                                    </h3>
                                </div>

                                {/* Blue Subtitle */}
                                <div className="font-['JetBrains_Mono'] font-semibold text-[14px] text-[#00629D] mb-4">
                                    Strategic Long-Term Partnership
                                </div>

                                {/* Description */}
                                <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[17px] text-[#404750] leading-relaxed mb-6">
                                    Designed for sustained industrial operations, Time Charter agreements provide clients with dedicated vessel allocation and predictable logistics planning. Under this structure, clients gain scheduling influence while we ensure vessel performance, crew excellence, and regulatory compliance across domestic and overseas routes.
                                </p>

                                {/* Core Advantages */}
                                <div className="mb-8">
                                    <div className="font-['Hanken_Grotesk'] font-bold text-[17px] text-[#141B2C] mb-3">
                                        Core Advantages:
                                    </div>
                                    <ul className="space-y-2.5 font-['Hanken_Grotesk'] text-[17px] text-[#404750]">
                                        {[
                                            'Long-Term Commitment',
                                            'Cost Predictability',
                                            'Dedicated Vessel Allocation',
                                            'Flexible Route Deployment',
                                            'Continuous Supply Chain Support'
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-2.5">
                                                <Check className="w-4 h-4 text-[#00629D] shrink-0 stroke-[3]" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Footer Note */}
                            <div className="mt-auto pt-5 border-[#E5E7EB]">
                                <p className="font-['Hanken_Grotesk'] italic font-medium text-[13px] sm:text-[14px] lg:text-[17px] text-[#404750] leading-normal">
                                    <span className="font-semibold not-italic text-[#141B2C]">Best suited for:</span> Industrial producers, infrastructure projects, and recurring distribution cycles.
                                </p>
                            </div>
                        </motion.div>

                        {/* Freight Charter Card */}
                        <motion.div
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-8 lg:p-10 flex flex-col justify-between h-full hover:border-[#00629D] hover:shadow-[0_6px_20px_rgba(0,98,157,0.12)] transition-[colors,shadow] duration-200"
                        >
                            <div>
                                {/* Card Title & Icon */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-[6px] bg-[#F5F5F5] border border-[#E5E7EB] flex items-center justify-center text-[#141B2C] shrink-0">
                                        <Compass className="w-5 h-5 text-[#141B2C]" />
                                    </div>
                                    <h3 className="font-['Hanken_Grotesk'] font-bold text-[24px] sm:text-[28px] text-[#141B2C] leading-snug">
                                        Freight Charter
                                    </h3>
                                </div>

                                {/* Blue Subtitle */}
                                <div className="font-['JetBrains_Mono'] font-semibold text-[14px] text-[#00629D] mb-4">
                                    Precision Voyage Execution
                                </div>

                                {/* Description */}
                                <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[17px] text-[#404750] leading-relaxed mb-6">
                                    Freight Charter solutions are optimized for specific shipments and spot-market opportunities. From voyage planning and bunkering coordination to port clearance and cargo supervision, our team manages every operational detail — ensuring punctual delivery and uncompromised cargo integrity without long-term contractual obligation.
                                </p>

                                {/* Core Advantages */}
                                <div className="mb-8">
                                    <div className="font-['Hanken_Grotesk'] font-bold text-[17px] text-[#141B2C] mb-3">
                                        Core Advantages:
                                    </div>
                                    <ul className="space-y-2.5 font-['Hanken_Grotesk'] text-[17px] text-[#404750]">
                                        {[
                                            'Spot Market Flexibility',
                                            'Zero Capital Exposure',
                                            'Full Voyage Management',
                                            'Optimized Port Turnaround'
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-2.5">
                                                <Check className="w-4 h-4 text-[#00629D] shrink-0 stroke-[3]" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Footer Note */}
                            <div className="mt-auto pt-5 border-[#E5E7EB]">
                                <p className="font-['Hanken_Grotesk'] italic font-medium text-[13px] sm:text-[14px] lg:text-[17px] text-[#404750] leading-normal">
                                    <span className="font-semibold not-italic text-[#141B2C]">Best suited for:</span> Short-term cargo movement, seasonal demand fluctuations, and project-based logistics.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* SECTION 03: HOW IT WORKS (CLOSED-LOOP PNEUMATIC EXCELLENCE) */}
            <motion.section
                id="pneumatic-system"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 lg:p-14"
            >
                {/* Header */}
                <div className="max-w-[1091px] mx-auto text-center flex flex-col items-center gap-3 mb-8 sm:mb-10">
                    <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider">
                        HOW IT WORKS
                    </div>
                    <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] lg:text-[44px] leading-[1.12] text-[#141B2C] tracking-tight">
                        Closed-Loop Pneumatic Excellence
                    </h2>
                    <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] lg:text-[18px] text-[#404750] max-w-[920px] leading-relaxed">
                        Our vessels are equipped with specialized closed-loop pneumatic loading and discharge systems engineered specifically for bulk cement transportation. Through this precision-engineered framework, cargo integrity remains uncompromised from origin terminal to final discharge point.
                    </p>
                </div>

                {/* Main System Diagram Card Panel */}
                <div className="max-w-[1100px] mx-auto bg-gradient-to-b from-[#EBF3F9] to-[#DCEAF5] rounded-[16px] border border-[#D5E3EE] p-3 sm:p-6 lg:p-8 mb-8 shadow-xs overflow-hidden">
                    <div className="rounded-[12px] overflow-hidden bg-white/40 backdrop-blur-xs border border-white/60 p-2 sm:p-4">
                        <img
                            src="/images/service-system.jpg"
                            alt="Closed-Loop Pneumatic Cement Carrier Operations Diagram"
                            className="w-full h-auto object-contain rounded-[8px]"
                        />
                    </div>
                </div>

                {/* Bottom 4 Pill Highlights Row */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-[1100px] mx-auto">
                    <div className="bg-[#F0F5FA] rounded-full px-5 py-2.5 flex items-center gap-2.5 text-[#00629D] font-['Hanken_Grotesk'] font-medium text-[14px] shadow-xs hover:border-[#00629D] transition-[colors,shadow] duration-200">
                        <ShieldCheck className="w-4 h-4 text-[#00629D] shrink-0" />
                        <span>Dust-Free Transfer</span>
                    </div>

                    <div className="bg-[#F0F5FA] rounded-full px-5 py-2.5 flex items-center gap-2.5 text-[#00629D] font-['Hanken_Grotesk'] font-medium text-[14px] shadow-xs hover:border-[#00629D] transition-[colors,shadow] duration-200">
                        <CheckCircle2 className="w-4 h-4 text-[#00629D] shrink-0" />
                        <span>Zero Contamination</span>
                    </div>

                    <div className="bg-[#F0F5FA] rounded-full px-5 py-2.5 flex items-center gap-2.5 text-[#00629D] font-['Hanken_Grotesk'] font-medium text-[14px] shadow-xs hover:border-[#00629D] transition-[colors,shadow] duration-200">
                        <Gauge className="w-4 h-4 text-[#00629D] shrink-0" />
                        <span>High Efficiency</span>
                    </div>

                    <div className="bg-[#F0F5FA] rounded-full px-5 py-2.5 flex items-center gap-2.5 text-[#00629D] font-['Hanken_Grotesk'] font-medium text-[14px] shadow-xs hover:border-[#00629D] transition-[colors,shadow] duration-200">
                        <Clock className="w-4 h-4 text-[#00629D] shrink-0" />
                        <span>Reduced Port Stay</span>
                    </div>
                </div>
            </motion.section>

            {/* SECTION 04: OPERATIONAL COVERAGE & REGIONS */}
            <motion.section
                id="coverage"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-[#141B2C] text-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 lg:p-14"
            >
                <div className="max-w-[1200px] mx-auto">
                    {/* Header */}
                    <div className="mb-10 sm:mb-12">
                        <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#8AAFC8] tracking-wider mb-2">
                            OPERATIONAL COVERAGE
                        </div>
                        <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] lg:text-[50px] leading-[1.12] text-white tracking-tight mb-4 max-w-full">
                            Strategic Maritime Reach Across Key Global Trade Corridors
                        </h2>
                        <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] lg:text-[18px] text-[#8AAFC8] max-w-full leading-relaxed">
                            Connecting industrial hubs nationwide and internationally. From high-frequency inter-island routes across Indonesia to trans-oceanic bulk freight corridors, PT. ABB ensures your cargo moves without boundaries.
                        </p>
                    </div>

                    {/* Main Content Grid: World Map (Left) + Region Legend (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        {/* Left Column: Interactive GeoChart Map */}
                        <div className="lg:col-span-7 flex items-center justify-center relative">
                            <style>{`
                                #regions_div svg rect {
                                    fill: transparent !important;
                                    stroke: none !important;
                                }
                                #regions_div svg path {
                                    stroke: rgba(255, 255, 255, 0.08) !important;
                                    stroke-width: 0.5px !important;
                                }
                            `}</style>
                            <div id="regions_div" className="w-full h-[400px] sm:h-[440px] overflow-hidden" />
                        </div>

                        {/* Right Column: 5 Region Legend Items with Mouse Sensors */}
                        <div className="lg:col-span-5 flex flex-col lg:gap-1 gap-6">
                            {/* Region 1: INDONESIAN WATERS */}
                            <div
                                onMouseEnter={() => setActiveHoverGroup(1)}
                                onMouseLeave={() => setActiveHoverGroup(0)}
                                className={`flex items-start gap-4 p-2 sm:p-3 rounded-[8px] transition-[colors,shadow] duration-200 cursor-pointer ${
                                    activeHoverGroup === 1 ? 'bg-white/10' : 'hover:bg-white/5'
                                }`}
                            >
                                <span className="w-4 h-4 rounded-full bg-[#d9534f] shrink-0 mt-1 shadow-sm" />
                                <div>
                                    <h4 className="font-['Hanken_Grotesk'] font-bold text-[16px] sm:text-[17px] text-white uppercase tracking-wide mb-1">
                                        Indonesian Waters
                                    </h4>
                                    <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[15px] text-[#8AAFC8] leading-relaxed">
                                        Our operational foundation — supporting national distribution networks.
                                    </p>
                                </div>
                            </div>

                            {/* Region 2: SOUTHEAST ASIA */}
                            <div
                                onMouseEnter={() => setActiveHoverGroup(2)}
                                onMouseLeave={() => setActiveHoverGroup(0)}
                                className={`flex items-start gap-4 p-2 sm:p-3 rounded-[8px] transition-[colors,shadow] duration-200 cursor-pointer ${
                                    activeHoverGroup === 2 ? 'bg-white/10' : 'hover:bg-white/5'
                                }`}
                            >
                                <span className="w-4 h-4 rounded-full bg-[#5bc0de] shrink-0 mt-1 shadow-sm" />
                                <div>
                                    <h4 className="font-['Hanken_Grotesk'] font-bold text-[16px] sm:text-[17px] text-white uppercase tracking-wide mb-1">
                                        Southeast Asia
                                    </h4>
                                    <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[15px] text-[#8AAFC8] leading-relaxed">
                                        Short-sea trade routes connecting regional manufacturing hubs.
                                    </p>
                                </div>
                            </div>

                            {/* Region 3: ASIA & THE FAR EAST */}
                            <div
                                onMouseEnter={() => setActiveHoverGroup(3)}
                                onMouseLeave={() => setActiveHoverGroup(0)}
                                className={`flex items-start gap-4 p-2 sm:p-3 rounded-[8px] transition-[colors,shadow] duration-200 cursor-pointer ${
                                    activeHoverGroup === 3 ? 'bg-white/10' : 'hover:bg-white/5'
                                }`}
                            >
                                <span className="w-4 h-4 rounded-full bg-[#3b5998] shrink-0 mt-1 shadow-sm" />
                                <div>
                                    <h4 className="font-['Hanken_Grotesk'] font-bold text-[16px] sm:text-[17px] text-white uppercase tracking-wide mb-1">
                                        Asia &amp; The Far East
                                    </h4>
                                    <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[15px] text-[#8AAFC8] leading-relaxed">
                                        Strategic deployment across expanding infrastructure markets.
                                    </p>
                                </div>
                            </div>

                            {/* Region 4: MIDDLE EAST */}
                            <div
                                onMouseEnter={() => setActiveHoverGroup(4)}
                                onMouseLeave={() => setActiveHoverGroup(0)}
                                className={`flex items-start gap-4 p-2 sm:p-3 rounded-[8px] transition-[colors,shadow] duration-200 cursor-pointer ${
                                    activeHoverGroup === 4 ? 'bg-white/10' : 'hover:bg-white/5'
                                }`}
                            >
                                <span className="w-4 h-4 rounded-full bg-[#5cb85c] shrink-0 mt-1 shadow-sm" />
                                <div>
                                    <h4 className="font-['Hanken_Grotesk'] font-bold text-[16px] sm:text-[17px] text-white uppercase tracking-wide mb-1">
                                        Middle East
                                    </h4>
                                    <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[15px] text-[#8AAFC8] leading-relaxed">
                                        Support for cement trade aligned with major development initiatives.
                                    </p>
                                </div>
                            </div>

                            {/* Region 5: EUROPE */}
                            <div
                                onMouseEnter={() => setActiveHoverGroup(5)}
                                onMouseLeave={() => setActiveHoverGroup(0)}
                                className={`flex items-start gap-4 p-2 sm:p-3 rounded-[8px] transition-[colors,shadow] duration-200 cursor-pointer ${
                                    activeHoverGroup === 5 ? 'bg-white/10' : 'hover:bg-white/5'
                                }`}
                            >
                                <span className="w-4 h-4 rounded-full bg-[#f0ad4e] shrink-0 mt-1 shadow-sm" />
                                <div>
                                    <h4 className="font-['Hanken_Grotesk'] font-bold text-[16px] sm:text-[17px] text-white uppercase tracking-wide mb-1">
                                        Europe
                                    </h4>
                                    <p className="font-['Hanken_Grotesk'] text-[14px] sm:text-[15px] text-[#8AAFC8] leading-relaxed">
                                        Long-haul capability structured for disciplined charter execution.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>


            {/* 5. CTA Banner Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-gradient-to-r from-[#00629D] to-[#3F96DD] rounded-[8px] p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden "
            >
                <div className="max-w-3xl mx-auto flex flex-col items-center">
                    <h2 className="font-['Hanken_Grotesk'] font-bold text-[28px] sm:text-[36px] lg:text-[40px] tracking-tight mb-4 text-white">
                        Need Custom Marine Logistics or Vessel Chartering?
                    </h2>

                    <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] lg:text-[18px] text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Whether you require a dedicated time charter, or an urgent voyage freight proposal, our operations team is ready to tailor a solution for your cargo needs.
                    </p>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                        <Link
                            href={route('contacts.index')}
                            className="group bg-gradient-to-r from-[#D93A2B] to-[#FF5542] text-white rounded-[8px] px-[36px] py-[14px] font-['Hanken_Grotesk'] font-semibold text-[16px] hover:shadow-[0_4px_14px_rgba(217,58,43,0.35)] active:scale-[0.97] inline-flex items-center gap-2.5 mt-2 transition-[shadow,transform]"
                        >
                            Request Charter Proposal
                            <ArrowRight className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1" />
                        </Link>
                    </motion.div>
                </div>
            </motion.section>
        </GuestLayout>
    );
}
