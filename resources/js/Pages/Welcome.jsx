import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { MapPin, ArrowRight } from 'lucide-react';

export default function Welcome({ auth }) {
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

    return (
        <GuestLayout onScrollToSection={scrollToSection}>
            <Head title="PT Pelayaran Andalas Bahtera Baruna — Indonesian Leaders in Bulk Cement Transportation" />

            {/* 1. Hero Section */}
            <div id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-[7px] items-stretch min-h-[606px]">
                
                {/* Left Card Container */}
                <div className="lg:col-span-5 bg-white rounded-[8px] p-6 sm:p-8 lg:px-[34px] lg:py-[60px] flex flex-col justify-center border border-[#E5E7EB] relative min-h-[420px] lg:min-h-[606px]">
                    <div className="max-w-[441px] flex flex-col gap-[15px]">
                        <h1 className="font-['Hanken_Grotesk'] font-medium text-[32px] sm:text-[44px] lg:text-[50px] leading-[1.12] text-[#141B2C] tracking-tight">
                            Indonesian Leaders in Bulk Cement Transportation
                        </h1>

                        <p className="font-['Hanken_Grotesk'] font-medium text-[15px] sm:text-[17px] text-[#404750] leading-relaxed">
                            Commanding a specialized fleet with industrial precision. We bridge the gap between production and delivery with state-of-the-art maritime operations tailored for heavy industrial logistics.
                        </p>

                        <div className="flex flex-wrap items-center gap-[10px] pt-2">
                            <Link
                                href={route('contacts.index')}
                                className="group bg-gradient-to-r from-[#00629D] to-[#3F96DD] rounded-[4px] px-[25px] py-[8px] font-['Hanken_Grotesk'] font-medium text-[14px] text-white hover:opacity-95 transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] active:scale-[0.97] inline-flex items-center justify-center gap-2"
                            >
                                Book Shipment
                                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 group-active:translate-x-0" />
                            </Link>

                            <a
                                href="#fleet"
                                onClick={(e) => { e.preventDefault(); scrollToSection('fleet'); }}
                                className="group rounded-[4px] border border-[#404750] px-[25px] py-[8px] font-['Hanken_Grotesk'] font-medium text-[14px] text-[#404750] transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.2)] active:scale-[0.97] inline-flex items-center justify-center gap-2"
                            >
                                Explore Fleet
                                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1 group-active:translate-x-0" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Card Container */}
                <div className="lg:col-span-7 bg-white rounded-[8px] overflow-hidden relative min-h-[380px] lg:min-h-[606px] border border-[#E5E7EB] group">
                    
                    {/* Ocean Cargo Ship Image */}
                    <img
                        src="/images/asuwa1.jpg"
                        alt="Active Vessel - ASUWA 1"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Figma Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/75 rounded-[8px]" />

                    {/* Active Vessel Telemetry Panel */}
                    <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-[51px] flex flex-col gap-[5px] text-white z-10">
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
                    </div>

                </div>

            </div>

            {/* 2. Supporting Trust Bar */}
            <div className="bg-white rounded-[8px] border border-[#E5E7EB] py-6 px-4 sm:px-8 mt-[7px] text-center">
                <p className="text-[11px] sm:text-[12px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider text-[#404750] mb-4">
                    TRUSTED BY LEADING INDUSTRIAL & ENERGY CORPORATIONS ACROSS ASIA
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12 opacity-85">
                    <span className="text-[14px] sm:text-[16px] font-['Hanken_Grotesk'] font-extrabold text-[#141B2C] tracking-tight">BKI CLASSIFICATION</span>
                    <span className="text-[14px] sm:text-[16px] font-['Hanken_Grotesk'] font-extrabold text-[#141B2C] tracking-tight">ISM CODE COMPLIANT</span>
                    <span className="text-[14px] sm:text-[16px] font-['Hanken_Grotesk'] font-bold text-[#141B2C]">PELINDO MARITIME</span>
                    <span className="text-[14px] sm:text-[16px] font-['Hanken_Grotesk'] font-bold text-[#141B2C]">PERTAMINA TRANS</span>
                    <span className="text-[14px] sm:text-[16px] font-['Hanken_Grotesk'] font-extrabold text-[#141B2C]">ADARO LOGISTICS</span>
                </div>
            </div>

            {/* 3. Services Grid */}
            <div id="services" className="mt-[7px]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[7px]">
                    <div className="group bg-white rounded-[8px] border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-[0_4px_20px_rgba(0,98,157,0.25)] transition-all duration-300 p-6 flex flex-col justify-between">
                        <div>
                            <div className="w-8 h-8 rounded bg-[#F5F5F5] group-hover:bg-[#00629D]/10 text-[#141B2C] group-hover:text-[#00629D] flex items-center justify-center font-bold text-sm mb-4 transition-colors">
                                01
                            </div>
                            <h3 className="text-[20px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] mb-2">
                                Tugboat & Barge Chartering
                            </h3>
                            <p className="text-[14px] font-['Hanken_Grotesk'] text-[#404750] leading-relaxed mb-4">
                                Spot and long-term time charters featuring 3,200 HP twin-screw tugs and 330ft heavy deck cargo barges for coal, nickel, and bulk commodities.
                            </p>
                        </div>
                        <a href="#fleet" onClick={(e) => { e.preventDefault(); scrollToSection('fleet'); }} className="text-[#00629D] font-['Hanken_Grotesk'] font-semibold text-[14px] flex items-center gap-1">
                            <span>Learn More</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                        </a>
                    </div>

                    <div className="group bg-white rounded-[8px] border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-[0_4px_20px_rgba(0,98,157,0.25)] transition-all duration-300 p-6 flex flex-col justify-between">
                        <div>
                            <div className="w-8 h-8 rounded bg-[#F5F5F5] group-hover:bg-[#00629D]/10 text-[#141B2C] group-hover:text-[#00629D] flex items-center justify-center font-bold text-sm mb-4 transition-colors">
                                02
                            </div>
                            <h3 className="text-[20px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] mb-2">
                                Offshore Transshipment
                            </h3>
                            <p className="text-[14px] font-['Hanken_Grotesk'] text-[#404750] leading-relaxed mb-4">
                                Ship-to-ship bulk transshipment via floating crane barges at open anchorage stations, maximizing turnaround speed for ocean carriers.
                            </p>
                        </div>
                        <a href="#fleet" onClick={(e) => { e.preventDefault(); scrollToSection('fleet'); }} className="text-[#00629D] font-['Hanken_Grotesk'] font-semibold text-[14px] flex items-center gap-1">
                            <span>Learn More</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                        </a>
                    </div>

                    <div className="group bg-white rounded-[8px] border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-[0_4px_20px_rgba(0,98,157,0.25)] transition-all duration-300 p-6 flex flex-col justify-between">
                        <div>
                            <div className="w-8 h-8 rounded bg-[#F5F5F5] group-hover:bg-[#00629D]/10 text-[#141B2C] group-hover:text-[#00629D] flex items-center justify-center font-bold text-sm mb-4 transition-colors">
                                03
                            </div>
                            <h3 className="text-[20px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] mb-2">
                                Coastal Towage & Agency
                            </h3>
                            <p className="text-[14px] font-['Hanken_Grotesk'] text-[#404750] leading-relaxed mb-4">
                                End-to-end voyage routing, port agency clearances, and bunkering coordination across primary archipelagic shipping lanes.
                            </p>
                        </div>
                        <a href="#fleet" onClick={(e) => { e.preventDefault(); scrollToSection('fleet'); }} className="text-[#00629D] font-['Hanken_Grotesk'] font-semibold text-[14px] flex items-center gap-1">
                            <span>Learn More</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                        </a>
                    </div>
                </div>
            </div>

            {/* 4. Fleet Register */}
            <div id="fleet" className="mt-[7px]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[7px]">
                    <div className="bg-white rounded-[8px] border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-[0_4px_20px_rgba(0,98,157,0.25)] transition-all duration-300 overflow-hidden group">
                        <div className="h-48 bg-[#141B2C] overflow-hidden relative">
                            <img
                                src="/images/asuwa1.jpg"
                                alt="ASUWA 1"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 bg-[#141B2C]/80 text-white text-[11px] font-['JetBrains_Mono'] px-2.5 py-0.5 rounded">
                                Active Vessel
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-[18px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] mb-1">
                                ASUWA 1
                            </h3>
                            <p className="text-[13px] font-['Hanken_Grotesk'] text-[#404750] mb-2">
                                Bulk Cement Carrier · 12,000 DWT
                            </p>
                            <div className="text-[12px] font-['JetBrains_Mono'] text-[#404750] border-t border-[#E5E7EB] pt-2">
                                Route: Tokyo &rarr; Jakarta
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[8px] border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-[0_4px_20px_rgba(0,98,157,0.25)] transition-all duration-300 overflow-hidden group">
                        <div className="h-48 bg-[#141B2C] overflow-hidden relative">
                            <img
                                src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80"
                                alt="TB. Samudra Power 01"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 bg-[#141B2C]/80 text-white text-[11px] font-['JetBrains_Mono'] px-2.5 py-0.5 rounded">
                                Active Vessel
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-[18px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] mb-1">
                                TB. Samudra Power 01
                            </h3>
                            <p className="text-[13px] font-['Hanken_Grotesk'] text-[#404750] mb-2">
                                Ocean Tugboat · 3,200 HP
                            </p>
                            <div className="text-[12px] font-['JetBrains_Mono'] text-[#404750] border-t border-[#E5E7EB] pt-2">
                                Route: Samarinda &rarr; Java Sea
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[8px] border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-[0_4px_20px_rgba(0,98,157,0.25)] transition-all duration-300 overflow-hidden group">
                        <div className="h-48 bg-[#141B2C] overflow-hidden relative">
                            <img
                                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
                                alt="FC. Buana Titan"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 bg-[#141B2C]/80 text-white text-[11px] font-['JetBrains_Mono'] px-2.5 py-0.5 rounded">
                                Active Vessel
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-[18px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] mb-1">
                                FC. Buana Titan
                            </h3>
                            <p className="text-[13px] font-['Hanken_Grotesk'] text-[#404750] mb-2">
                                Floating Crane · 25 MT Grab
                            </p>
                            <div className="text-[12px] font-['JetBrains_Mono'] text-[#404750] border-t border-[#E5E7EB] pt-2">
                                Location: Samarinda Anchorage
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
