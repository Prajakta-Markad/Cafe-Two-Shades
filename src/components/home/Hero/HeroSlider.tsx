import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const heroImages = [
  {
    src: "/images/hero/cafe-exterior.jpg",
    alt: "Cafe Two Shades exterior",
  },
  {
    src: "/images/hero/cafe-interior.jpg",
    alt: "Cafe Two Shades interior",
  },
  {
    src: "/images/hero/cafe-ambience.jpg",
    alt: "Cafe Two Shades ambience",
  },
];

const SLIDE_DURATION = 6000;

export default function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex(
        (current) => (current + 1) % heroImages.length
      );
    }, SLIDE_DURATION);

    return () => {
      window.clearInterval(interval);
    };
  }, [isPaused, shouldReduceMotion]);

  const activeImage = heroImages[activeIndex];

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-hidden="true"
    >
      <AnimatePresence mode="sync">
        <motion.img
          fetchPriority="high"
          key={activeImage.src}
          src={activeImage.src}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 1.2,
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/45" />
    </div>
  );
}