import { useEffect, useState, useRef } from 'react';
import { useInView, animate } from 'framer-motion';

export default function TallyNumber({ value, duration = 1.6, delay = 0, className = "" }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });
    const [count, setCount] = useState(0);

    const stringVal = String(value ?? "");
    const match = stringVal.match(/(\d+)/);
    const target = match ? parseInt(match[0], 10) : 0;
    const prefix = match ? stringVal.slice(0, match.index) : "";
    const suffix = match ? stringVal.slice(match.index + match[0].length) : stringVal;

    useEffect(() => {
        if (!isInView || target === 0) return;

        let controls;
        const timer = setTimeout(() => {
            controls = animate(0, target, {
                duration,
                ease: [0.16, 1, 0.3, 1], // Exponential ease-out for realistic tally counter deceleration
                onUpdate(latest) {
                    setCount(Math.floor(latest));
                }
            });
        }, delay * 1000);

        return () => {
            clearTimeout(timer);
            if (controls) controls.stop();
        };
    }, [isInView, target, duration, delay]);

    return (
        <span ref={ref} className={`tabular-nums ${className}`}>
            {prefix}{isInView ? count : 0}{suffix}
        </span>
    );
}
