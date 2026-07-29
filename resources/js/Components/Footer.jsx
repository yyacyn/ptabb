import { Link } from '@inertiajs/react';
import { MapPin, Phone, Mail, ChevronRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer id="footer" className="mt-[7px] bg-white rounded-[8px] border border-[#E5E7EB] p-8 lg:p-10 font-['Hanken_Grotesk'] text-[#141B2C]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 pb-8 border-b border-[#E5E7EB]">
                {/* Brand Column */}
                <div className="md:col-span-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/logo-abb1.png"
                            alt="PT. ABB Logo"
                            className="h-10 w-auto object-contain shrink-0"
                        />
                        <span className="text-[18px] lg:text-[20px] font-bold text-[#141B2C] leading-snug">
                            PT Pelayaran Andalas Bahtera Baruna
                        </span>
                    </div>

                    <p className="text-[15px] text-[#404750] leading-relaxed max-w-[480px]">
                        Providing high-capacity bulk vessel transport, specialized pneumatic cement shipping, and dedicated maritime logistics across domestic and international waters.
                    </p>

                    <div className="pt-2">
                        <div className="text-[13px] font-['Hanken_Grotesk'] font-bold text-[#141B2C] mb-2">
                            Proud Member of:
                        </div>
                        <img
                            src="/images/insa.png"
                            alt="INSA Logo"
                            className="h-16 w-auto object-contain"
                        />
                    </div>
                </div>

                {/* Quick Links Column */}
                <div className="md:col-span-3 flex flex-col gap-3">
                    <h4 className="text-[16px] font-bold text-[#141B2C] mb-1">Company</h4>
                    <ul className="space-y-2 text-[15px] font-medium text-[#141B2C]">
                        <li>
                            <Link href="/about-us" className="hover:text-[#00629D] transition-colors flex items-center gap-1.5 font-semibold">
                                <ChevronRight className="w-4 h-4 text-[#D93A2B]" />
                                About Us
                            </Link>
                        </li>
                        <li>
                            <a href="#fleet" className="hover:text-[#00629D] transition-colors flex items-center gap-1.5 font-semibold">
                                <ChevronRight className="w-4 h-4 text-[#D93A2B]" />
                                Our Fleet
                            </a>
                        </li>
                        <li>
                            <a href="#clients" className="hover:text-[#00629D] transition-colors flex items-center gap-1.5 font-semibold">
                                <ChevronRight className="w-4 h-4 text-[#D93A2B]" />
                                Clients &amp; Partners
                            </a>
                        </li>
                        <li>
                            <Link href={route('careers.index')} className="hover:text-[#00629D] transition-colors flex items-center gap-1.5 font-semibold">
                                <ChevronRight className="w-4 h-4 text-[#D93A2B]" />
                                Careers
                            </Link>
                        </li>
                        <li>
                            <Link href={route('contacts.index')} className="hover:text-[#00629D] transition-colors flex items-center gap-1.5 font-semibold">
                                <ChevronRight className="w-4 h-4 text-[#D93A2B]" />
                                Contact Us
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Head Office Column */}
                <div className="md:col-span-4 flex flex-col gap-3">
                    <h4 className="text-[16px] font-bold text-[#141B2C] mb-1">Head Office</h4>
                    <div className="space-y-3 text-[15px] text-[#404750]">
                        <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-[#00629D] shrink-0 mt-1" />
                            <span>Jl. Roa Malaka Utara No. 17-18, Jakarta Barat 11230, Indonesia</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Phone className="w-4 h-4 text-[#00629D] shrink-0" />
                            <span>+62 21 691 8822</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Mail className="w-4 h-4 text-[#00629D] shrink-0" />
                            <span>info@ptabb.com</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px] font-['JetBrains_Mono'] text-[#404750]">
                <div>© {new Date().getFullYear()} PT Pelayaran Andalas Bahtera Baruna. All rights reserved.</div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-[#00629D] transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-[#00629D] transition-colors">Terms of Charter</a>
                </div>
            </div>
        </footer>
    );
}
