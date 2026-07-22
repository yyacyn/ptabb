import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="mt-[7px] bg-[#141B2C] text-white rounded-[8px] p-6 text-xs font-['JetBrains_Mono'] flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>© {new Date().getFullYear()} PT Pelayaran Andalas Bahtera Baruna. All rights reserved.</div>
            <div className="flex gap-4 text-[#8AAFC8]">
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
        </footer>
    );
}
