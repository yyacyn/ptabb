import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import CtaBanner from '@/Components/CtaBanner';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Building2, Globe, ShieldCheck, Search, ArrowRight, Award, ExternalLink } from 'lucide-react';

export default function Clients({ clients = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');


    // Helper function imitating getLogoPath from Dashboard/Clients.jsx
    const getLogoPath = (item) => {
        if (!item) return '/images/clients/placeholder.png';
        const logoFile = item.logo_url || item.logo || item.logo_path || item.pathfile || item.image || item.featured_image;
        if (!logoFile) return '/images/clients/placeholder.png';

        if (logoFile.startsWith('http://') || logoFile.startsWith('https://')) return logoFile;
        if (logoFile.startsWith('/images/') || logoFile.startsWith('/storage/')) return logoFile;
        if (logoFile.startsWith('assets/images/clients/')) return `/${logoFile.replace('assets/images/clients/', 'images/clients/')}`;
        if (logoFile.startsWith('../assets/images/clients/')) return `/${logoFile.replace('../assets/images/clients/', 'images/clients/')}`;
        if (logoFile.startsWith('images/') || logoFile.startsWith('storage/')) return `/${logoFile}`;

        const filename = logoFile.split('/').pop();
        return `/images/clients/${filename}`;
    };


    const activeClients = clients || [];

    // Filter Domestic Clients for Carousel — explicit category/country only
    const dbDomestic = activeClients.filter(
        c => (c.category || '').toLowerCase() === 'domestic' || (c.country || '').toLowerCase() === 'indonesia'
    );

    const mappedDomesticLogos = dbDomestic.length >= 2
        ? dbDomestic.map(c => ({ name: c.name, src: getLogoPath(c) }))
        : [];

    const rawRow1 = mappedDomesticLogos.filter((_, idx) => idx % 2 === 0);
    const rawRow2 = mappedDomesticLogos.filter((_, idx) => idx % 2 !== 0);

    // Duplicate EXACTLY TWICE so that 50% translation is mathematically 1 full set of logos
    const row1Track = rawRow1.length > 0 ? [...rawRow1, ...rawRow1] : [];
    const row2Track = rawRow2.length > 0 ? [...rawRow2, ...rawRow2] : [];

    // Filter International Clients for Carousel — explicit category only
    const dbIntl = activeClients.filter(
        c => (c.category || '').toLowerCase() === 'international'
    );

    const mappedIntlLogos = dbIntl.length >= 2
        ? dbIntl.map(c => ({ name: c.name, src: getLogoPath(c) }))
        : [];

    const intlRawRow1 = mappedIntlLogos.filter((_, idx) => idx % 2 === 0);
    const intlRawRow2 = mappedIntlLogos.filter((_, idx) => idx % 2 !== 0);

    const intlRow1Track = intlRawRow1.length > 0 ? [...intlRawRow1, ...intlRawRow1] : [];
    const intlRow2Track = intlRawRow2.length > 0 ? [...intlRawRow2, ...intlRawRow2] : [];

    return (
        <GuestLayout>
            <Head title="Our Trusted Clients & Partners - PT. ABB" />

            {/* GPU-Accelerated Hardware Marquee Animation Styles */}
            <style>{`
                @keyframes marqueeRight {
                    0% { transform: translate3d(-50%, 0, 0); }
                    100% { transform: translate3d(0%, 0, 0); }
                }
                @keyframes marqueeLeft {
                    0% { transform: translate3d(0%, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                .marquee-right {
                    animation: marqueeRight 30s linear infinite;
                    will-change: transform;
                }
                .marquee-left {
                    animation: marqueeLeft 30s linear infinite;
                    will-change: transform;
                }
                .marquee-right:hover,
                .marquee-left:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <div className="bg-[#F5F5F5] min-h-screen">
                <div className="max-w-[1440px] mx-auto space-y-[7px]">

                    {/* HERO SECTION */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-[8px] border border-[#E5E7EB] p-1 lg:p-2"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                            {/* Left Column Text & CTAs */}
                            <div className="lg:col-span-5 flex flex-col justify-center ml-4 pl-4">
                                {/* Eyebrow */}
                                <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider mb-3">
                                    PARTNERS
                                </div>

                                {/* Main Headline */}
                                <h1 className="font-['Hanken_Grotesk'] font-bold text-[36px] sm:text-[44px] lg:text-[48px] text-[#141B2C] leading-[1.12] tracking-tight mb-5">
                                    Trusted by Industry Leaders Nationally &amp; Internationally
                                </h1>

                                {/* Subtitle Paragraph */}
                                <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] lg:text-[18px] text-[#404750] leading-relaxed mb-8">
                                    Partnering with premier industrial enterprises, cement manufacturers, and global maritime logistics leaders to deliver reliable, ocean-scale cargo transportation.
                                </p>

                                {/* CTAs */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Link
                                            href={route('contacts.index')}
                                            className="group inline-flex items-center justify-center bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white font-['Hanken_Grotesk'] font-medium text-[15px] rounded-[4px] px-[28px] py-[10px] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] active:scale-[0.97] transition-[colors,shadow,opacity,transform] duration-200"
                                        >
                                            Become a Partner
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Right Column: Hero Image + 2 Stat Cards Below */}
                            <div className="lg:col-span-7 flex flex-col gap-1">
                                {/* Corporate Office Team Hero Image Card */}
                                <div className="rounded-[8px] overflow-hidden border border-[#E5E7EB] shadow-xs h-[300px] sm:h-[360px] lg:h-[380px] w-full relative group bg-[#141B2C]">
                                    <img
                                        src="/images/hero_client_partners.png"
                                        alt="PT. ABB Client Partners Meeting"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.currentTarget.src = '/images/card_fleet_management.png';
                                        }}
                                    />
                                </div>

                                {/* 2 Stat Cards Strip (Side by Side) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                    <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-5 sm:p-6 flex flex-col justify-between hover:border-[#00629D] transition-[colors,shadow,opacity,transform] duration-200 shadow-xs">
                                        <span className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] text-[#141B2C] leading-none tracking-tight mb-2">
                                            15+
                                        </span>
                                        <span className="font-['Hanken_Grotesk'] font-medium text-[14px] sm:text-[15px] text-[#404750] leading-snug">
                                            Domestic Partners
                                        </span>
                                    </div>

                                    <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-5 sm:p-6 flex flex-col justify-between hover:border-[#00629D] transition-[colors,shadow,opacity,transform] duration-200 shadow-xs">
                                        <span className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] text-[#141B2C] leading-none tracking-tight mb-2">
                                            15+
                                        </span>
                                        <span className="font-['Hanken_Grotesk'] font-medium text-[14px] sm:text-[15px] text-[#404750] leading-snug">
                                            International Partners
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>

                    {/* 2. DOMESTIC PARTNERS SECTION */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 lg:p-12 overflow-hidden shadow-xs"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                            {/* Left Text Block */}
                            <div className="lg:col-span-5 space-y-4">
                                <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider">
                                    DOMESTIC PARTNERS
                                </div>
                                <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] text-[#141B2C] tracking-tight leading-[1.15]">
                                    Driven by Purpose, Guided by Maritime Excellence
                                </h2>
                                <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] lg:text-[18px] text-[#404750] leading-relaxed">
                                    Partnering with premier industrial enterprises, cement manufacturers, and global maritime logistics leaders to deliver reliable, ocean-scale cargo transportation.
                                </p>
                            </div>

                            {/* Right Dual-Row Infinite Logo Carousel */}
                            <div className="lg:col-span-7 flex flex-col gap-6 overflow-hidden relative py-4">
                                {/* Left & Right Fade Overlays */}
                                <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />

                                {/* Row 1: Carousel to the RIGHT */}
                                <div className="overflow-hidden w-full">
                                    <div className="flex items-center gap-8 sm:gap-12 whitespace-nowrap w-max marquee-right">
                                        {row1Track.map((logo, idx) => (
                                            <div
                                                key={idx}
                                                className="shrink-0 flex items-center justify-center h-16 sm:h-20 px-2"
                                            >
                                                <img
                                                    src={logo.src}
                                                    alt={logo.name}
                                                    title={logo.name}
                                                    className="h-14 sm:h-18 lg:h-20 max-w-[150px] sm:max-w-[190px] object-contain hover:scale-105 transition-transform duration-200"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Row 2: Carousel to the LEFT */}
                                <div className="overflow-hidden w-full">
                                    <div className="flex items-center gap-8 sm:gap-12 whitespace-nowrap w-max marquee-left">
                                        {row2Track.map((logo, idx) => (
                                            <div
                                                key={idx}
                                                className="shrink-0 flex items-center justify-center h-16 sm:h-20 px-2"
                                            >
                                                <img
                                                    src={logo.src}
                                                    alt={logo.name}
                                                    title={logo.name}
                                                    className="h-14 sm:h-18 lg:h-20 max-w-[150px] sm:max-w-[190px] object-contain hover:scale-105 transition-transform duration-200"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. INTERNATIONAL PARTNERS SECTION */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 lg:p-12 overflow-hidden shadow-xs"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                            {/* Left Text Block */}
                            <div className="lg:col-span-5 space-y-4">
                                <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider">
                                    INTERNATIONAL PARTNERS
                                </div>
                                <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] text-[#141B2C] tracking-tight leading-[1.15]">
                                    Trusted by Global Shipping Leaders &amp; Charterers
                                </h2>
                                <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] lg:text-[18px] text-[#404750] leading-relaxed">
                                    Providing deep-sea bulk shipping, time charter capacity, and custom marine logistics for international trade partners across major Asian and global shipping routes.
                                </p>
                            </div>

                            {/* Right Dual-Row Infinite Logo Carousel */}
                            <div className="lg:col-span-7 flex flex-col gap-6 overflow-hidden relative py-4">
                                {/* Left & Right Fade Overlays */}
                                <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />

                                {/* Row 1: Carousel to the LEFT */}
                                <div className="overflow-hidden w-full">
                                    <div className="flex items-center gap-8 sm:gap-12 whitespace-nowrap w-max marquee-left">
                                        {intlRow1Track.map((logo, idx) => (
                                            <div
                                                key={idx}
                                                className="shrink-0 flex items-center justify-center h-16 sm:h-20 px-2"
                                            >
                                                <img
                                                    src={logo.src}
                                                    alt={logo.name}
                                                    title={logo.name}
                                                    className="h-14 sm:h-18 lg:h-20 max-w-[150px] sm:max-w-[190px] object-contain hover:scale-105 transition-transform duration-200"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Row 2: Carousel to the RIGHT */}
                                <div className="overflow-hidden w-full">
                                    <div className="flex items-center gap-8 sm:gap-12 whitespace-nowrap w-max marquee-right">
                                        {intlRow2Track.map((logo, idx) => (
                                            <div
                                                key={idx}
                                                className="shrink-0 flex items-center justify-center h-16 sm:h-20 px-2"
                                            >
                                                <img
                                                    src={logo.src}
                                                    alt={logo.name}
                                                    title={logo.name}
                                                    className="h-14 sm:h-18 lg:h-20 max-w-[150px] sm:max-w-[190px] object-contain hover:scale-105 transition-transform duration-200"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* CLIENT DIRECTORY & CATEGORY FILTER */}
                    {/* <div id="partners-grid" className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E7EB] pb-6">
                            <div>
                                <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider mb-1">
                                    OUR PARTNER NETWORK
                                </div>
                                <h2 className="font-['Hanken_Grotesk'] font-bold text-[28px] sm:text-[34px] text-[#141B2C] tracking-tight">
                                    Strategic Client Collaborations
                                </h2>
                            </div> */}

                    {/* Search Box */}
                    {/* <div className="relative w-full md:w-72">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#404750]" />
                                <input
                                    type="text"
                                    placeholder="Search partners..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-[14px] font-['Hanken_Grotesk'] border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#00629D] transition-colors"
                                />
                            </div>
                        </div> */}

                    {/* Category Filter Pills */}
                    {/* <div className="flex flex-wrap items-center gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-1.5 rounded-[8px] font-['JetBrains_Mono'] text-[12px] font-medium transition-[colors,shadow,opacity,transform] duration-200 cursor-pointer ${selectedCategory === cat
                                            ? 'bg-[#141B2C] text-white'
                                            : 'bg-[#F5F5F5] text-[#404750] hover:bg-[#E5E7EB]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div> */}

                    {/* Clients Grid */}
                    {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
                            {filteredClients.map((client, idx) => (
                                <motion.div
                                    key={client.id || idx}
                                    whileHover={{ y: -3 }}
                                    className="bg-white rounded-[8px] border border-[#E5E7EB] p-5 flex flex-col justify-between hover:border-[#00629D] hover:shadow-[0_4px_20px_rgba(0,98,157,0.25)] transition-[colors,shadow,opacity,transform] duration-300 group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="inline-block px-2.5 py-0.5 bg-[#F5F5F5] text-[#00629D] rounded-[4px] font-['JetBrains_Mono'] font-bold text-[11px] uppercase tracking-wider">
                                                {client.category || 'Partner'}
                                            </span>
                                            <Globe className="w-4 h-4 text-[#8AAFC8] group-hover:text-[#00629D] transition-colors" />
                                        </div> */}

                    {/* Logo Image */}
                    {/* <div className="h-16 w-full bg-[#F5F5F5]/50 rounded-[6px] p-2.5 flex items-center justify-center mb-3 border border-[#E5E7EB]/60">
                                            <img
                                                src={getLogoPath(client)}
                                                alt={client.name}
                                                className="max-h-12 max-w-[140px] object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/clients/placeholder.png';
                                                }}
                                            />
                                        </div>

                                        <h3 className="font-['Hanken_Grotesk'] font-bold text-[17px] text-[#141B2C] mb-1.5 leading-snug group-hover:text-[#00629D] transition-colors">
                                            {client.name}
                                        </h3>

                                        <p className="font-['Hanken_Grotesk'] text-[13px] text-[#404750] leading-relaxed">
                                            {client.type || 'Industrial Logistics & Freight'}
                                        </p>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-[#E5E7EB] flex items-center justify-between text-[12px] font-['JetBrains_Mono'] text-[#404750]">
                                        <span>Region: {client.country || 'Global'}</span>
                                        <ShieldCheck className="w-4 h-4 text-[#00629D]" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div> */}

                    {/* CTA BANNER */}
                    <CtaBanner
                        title="Join Our Network of Industry-Leading Maritime Partners"
                        description="Experience dependable ocean freight, flexible charter agreements, and ISO-certified shipping excellence tailored to your industrial supply chain requirements."
                        buttonLabel="Become a Partner"
                        buttonRoute="public.contacts"
                    />
                </div>
            </div>
        </GuestLayout>
    );
}
