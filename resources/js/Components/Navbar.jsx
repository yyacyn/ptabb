import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ onScrollToSection }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleNavClick = (sectionId) => (e) => {
        if (onScrollToSection && sectionId) {
            e.preventDefault();
            setMobileMenuOpen(false);
            onScrollToSection(sectionId);
        }
    };

    return (
        <header>
            {/* DESKTOP NAVBAR (lg: 1024px and above) */}
            <nav className="hidden lg:flex items-center justify-start gap-[7px] mb-[7px] w-full">
                
                {/* Logo Box */}
                <Link
                    href="/"
                    className="flex-[468_1_0%] max-w-[468px] h-[42px] bg-white rounded-[8px] border border-[#E5E7EB] flex items-center px-3.5 gap-3 min-w-0 shrink"
                >
                    <img
                        src="/images/logo-abb1.png"
                        alt="PT ABB Logo"
                        className="h-[24px] w-auto object-contain shrink-0"
                    />
                    <span className="font-['Hanken_Grotesk'] font-bold text-[16px] text-[#141B2C] tracking-tight truncate whitespace-nowrap">
                        PT Pelayaran Andalas Bahtera Baruna
                    </span>
                </Link>

                {/* 6 Middle Nav Pills */}
                <a
                    href="#about"
                    onClick={handleNavClick('about')}
                    className="flex-[120_1_0%] max-w-[120px] h-[42px] bg-white hover:bg-[#141B2C] hover:text-white transition-colors duration-300 rounded-[8px] flex items-center justify-start px-3 font-['JetBrains_Mono'] font-medium text-[14px] text-[#141B2C] border border-[#E5E7EB] whitespace-nowrap shrink"
                >
                    ABOUT US
                </a>
                <a
                    href="#services"
                    onClick={handleNavClick('services')}
                    className="flex-[120_1_0%] max-w-[120px] h-[42px] bg-white hover:bg-[#141B2C] hover:text-white transition-colors duration-300 rounded-[8px] flex items-center justify-start px-3 font-['JetBrains_Mono'] font-medium text-[14px] text-[#141B2C] border border-[#E5E7EB] whitespace-nowrap shrink"
                >
                    SERVICES
                </a>
                <a
                    href="#fleet"
                    onClick={handleNavClick('fleet')}
                    className="flex-[120_1_0%] max-w-[120px] h-[42px] bg-white hover:bg-[#141B2C] hover:text-white transition-colors duration-300 rounded-[8px] flex items-center justify-start px-3 font-['JetBrains_Mono'] font-medium text-[14px] text-[#141B2C] border border-[#E5E7EB] whitespace-nowrap shrink"
                >
                    FLEET
                </a>
                <Link
                    href={route('clients.index')}
                    className="flex-[120_1_0%] max-w-[120px] h-[42px] bg-white hover:bg-[#141B2C] hover:text-white transition-colors duration-300 rounded-[8px] flex items-center justify-start px-3 font-['JetBrains_Mono'] font-medium text-[14px] text-[#141B2C] border border-[#E5E7EB] whitespace-nowrap shrink"
                >
                    CLIENTS
                </Link>
                <Link
                    href={route('news.index')}
                    className="flex-[120_1_0%] max-w-[120px] h-[42px] bg-white hover:bg-[#141B2C] hover:text-white transition-colors duration-300 rounded-[8px] flex items-center justify-start px-3 font-['JetBrains_Mono'] font-medium text-[14px] text-[#141B2C] border border-[#E5E7EB] whitespace-nowrap shrink"
                >
                    NEWS
                </Link>
                <Link
                    href={route('careers.index')}
                    className="flex-[120_1_0%] max-w-[120px] h-[42px] bg-white hover:bg-[#141B2C] hover:text-white transition-colors duration-300 rounded-[8px] flex items-center justify-start px-3 font-['JetBrains_Mono'] font-medium text-[14px] text-[#141B2C] border border-[#E5E7EB] whitespace-nowrap shrink"
                >
                    CAREERS
                </Link>

                {/* Contact Us Pill */}
                <Link
                    href={route('contacts.index')}
                    className="flex-[151_1_0%] max-w-[151px] h-[42px] bg-gradient-to-r from-[#D93A2B] to-[#FF5542] rounded-[8px] flex items-center justify-start px-3 font-['JetBrains_Mono'] font-medium text-[14px] text-white hover:opacity-95 transition-opacity whitespace-nowrap shrink shadow-xs"
                >
                    CONTACT US
                </Link>

            </nav>

            {/* MOBILE & TABLET NAVBAR (<1024px) */}
            <div className="lg:hidden mb-[7px]">
                <div className="flex items-center justify-between gap-[7px] w-full">
                    <Link
                        href="/"
                        className="flex-1 bg-white rounded-[8px] h-[42px] px-3 flex items-center gap-2.5 border border-[#E5E7EB] min-w-0"
                    >
                        <img
                            src="/images/logo-abb1.png"
                            alt="PT ABB Logo"
                            className="h-[20px] w-auto object-contain shrink-0"
                        />
                        <span className="font-['Hanken_Grotesk'] font-bold text-[14px] text-[#141B2C] tracking-tight truncate">
                            PT Pelayaran Andalas Bahtera Baruna
                        </span>
                    </Link>

                    <Link
                        href={route('contacts.index')}
                        className="h-[42px] px-3 bg-gradient-to-r from-[#D93A2B] to-[#FF5542] rounded-[8px] flex items-center justify-center font-['JetBrains_Mono'] font-medium text-[12px] text-white shrink-0 shadow-xs"
                    >
                        Contact Us
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="h-[42px] w-[42px] bg-white rounded-[8px] border border-[#E5E7EB] flex items-center justify-center text-[#141B2C] shrink-0"
                        aria-label="Toggle navigation menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="mt-[7px] bg-white rounded-[8px] border border-[#E5E7EB] p-3 shadow-md grid grid-cols-2 gap-2">
                        <a href="#about" onClick={handleNavClick('about')} className="px-3 py-2 rounded-[6px] bg-[#F5F5F5] font-['JetBrains_Mono'] text-[12px] text-[#141B2C] hover:bg-[#00629D] hover:text-white transition-colors">About Us</a>
                        <a href="#services" onClick={handleNavClick('services')} className="px-3 py-2 rounded-[6px] bg-[#F5F5F5] font-['JetBrains_Mono'] text-[12px] text-[#141B2C] hover:bg-[#00629D] hover:text-white transition-colors">Services</a>
                        <a href="#fleet" onClick={handleNavClick('fleet')} className="px-3 py-2 rounded-[6px] bg-[#F5F5F5] font-['JetBrains_Mono'] text-[12px] text-[#141B2C] hover:bg-[#00629D] hover:text-white transition-colors">Fleet</a>
                        <Link href={route('clients.index')} className="px-3 py-2 rounded-[6px] bg-[#F5F5F5] font-['JetBrains_Mono'] text-[12px] text-[#141B2C] hover:bg-[#00629D] hover:text-white transition-colors">Clients</Link>
                        <Link href={route('news.index')} className="px-3 py-2 rounded-[6px] bg-[#F5F5F5] font-['JetBrains_Mono'] text-[12px] text-[#141B2C] hover:bg-[#00629D] hover:text-white transition-colors">News</Link>
                        <Link href={route('careers.index')} className="px-3 py-2 rounded-[6px] bg-[#F5F5F5] font-['JetBrains_Mono'] text-[12px] text-[#141B2C] hover:bg-[#00629D] hover:text-white transition-colors">Careers</Link>
                    </div>
                )}
            </div>
        </header>
    );
}
