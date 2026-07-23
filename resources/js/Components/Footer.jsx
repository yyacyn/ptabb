import { Link } from '@inertiajs/react';
import { MapPin, Phone, Mail, ChevronRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer id="footer" className="mt-[7px] bg-white rounded-[8px] border border-[#E5E7EB] p-8 lg:p-10 font-['Hanken_Grotesk'] text-[#141B2C]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 pb-8 border-b border-[#E5E7EB]">
                {/* Brand Column */}
                <div className="md:col-span-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#00629D] text-white flex items-center justify-center font-bold text-lg">
                            ABB
                        </div>
                        <span className="text-[20px] lg:text-[22px] font-bold text-[#141B2C]">
                            PT Pelayaran Andalas Bahtera Baruna
                        </span>
                    </div>

                    <p className="text-[15px] text-[#404750] leading-relaxed max-w-[480px]">
                        Providing high-capacity bulk vessel transport, specialized pneumatic cement shipping, and dedicated maritime logistics across domestic and international waters.
                    </p>

                    <div className="pt-2">
                        <div className="text-[12px] font-['JetBrains_Mono'] font-bold text-[#404750] uppercase tracking-wider mb-2">
                            Proud Member of
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#F5F5F5] border border-[#E5E7EB] text-[13px] font-semibold text-[#141B2C]">
                            INSA (Indonesian National Shipowners' Association)
                        </div>
                    </div>
                </div>

                {/* Quick Links Column */}
                <div className="md:col-span-3 flex flex-col gap-3">
                    <h4 className="text-[16px] font-bold text-[#141B2C] mb-1">Company</h4>
                    <ul className="space-y-2 text-[15px] font-medium text-[#404750]">
                        <li>
                            <a href="#about" className="hover:text-[#00629D] transition-colors flex items-center gap-1.5">
                                <ChevronRight className="w-3.5 h-3.5 text-[#00629D]" />
                                About Us
                            </a>
                        </li>
                        <li>
                            <a href="#fleet" className="hover:text-[#00629D] transition-colors flex items-center gap-1.5">
                                <ChevronRight className="w-3.5 h-3.5 text-[#00629D]" />
                                Our Fleet
                            </a>
                        </li>
                        <li>
                            <a href="#clients" className="hover:text-[#00629D] transition-colors flex items-center gap-1.5">
                                <ChevronRight className="w-3.5 h-3.5 text-[#00629D]" />
                                Clients & Partners
                            </a>
                        </li>
                        <li>
                            <Link href={route('careers.index')} className="hover:text-[#00629D] transition-colors flex items-center gap-1.5">
                                <ChevronRight className="w-3.5 h-3.5 text-[#00629D]" />
                                Careers
                            </Link>
                        </li>
                        <li>
                            <Link href={route('contacts.index')} className="hover:text-[#00629D] transition-colors flex items-center gap-1.5">
                                <ChevronRight className="w-3.5 h-3.5 text-[#00629D]" />
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
