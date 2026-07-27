export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            src="/images/logo-abb1.png"
            alt="PT. Pelayaran Andalas Bahtera Baruna"
            className={`h-9 w-auto object-contain ${className}`}
            {...props}
        />
    );
}
