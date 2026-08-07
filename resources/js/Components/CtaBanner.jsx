import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * Reusable CTA Banner component with custom title, description, button label, and route link.
 */
export default function CtaBanner({
    id = "cta",
    title = "Ready to Streamline Your Bulk Cargo Logistics?",
    description = "Partner with PT. ABB for reliable vessel chartering, pneumatic bulk cement shipping, and dedicated maritime operations across regional & global routes.",
    buttonLabel = "Request Charter Proposal",
    buttonRoute = "public.contacts",
    buttonHref = null,
    className = ""
}) {
    let targetHref = buttonHref;
    if (!targetHref && buttonRoute) {
        try {
            targetHref = route(buttonRoute);
        } catch (e) {
            targetHref = '/contacts';
        }
    }
    if (!targetHref) {
        targetHref = '/contacts';
    }

    return (
        <motion.div
            id={id}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className={`bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white rounded-[8px] p-8 sm:p-12 text-center relative overflow-hidden ${className}`}
        >
            <div className="max-w-[708px] mx-auto flex flex-col items-center gap-6 relative z-10">
                <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[36px] lg:text-[44px] leading-[1.05] text-white">
                    {title}
                </h2>

                {description && (
                    <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] lg:text-[18px] text-white/90 leading-relaxed">
                        {description}
                    </p>
                )}

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                    <Link
                        href={targetHref}
                        className="group bg-gradient-to-r from-[#D93A2B] to-[#FF5542] text-white rounded-[8px] px-[36px] py-[14px] font-['Hanken_Grotesk'] font-semibold text-[16px] hover:shadow-[0_4px_14px_rgba(217,58,43,0.35)] active:scale-[0.97] inline-flex items-center gap-2.5 mt-2 transition-[shadow,transform]"
                    >
                        {buttonLabel}
                        <ArrowRight className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
}
