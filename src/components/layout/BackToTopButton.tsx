import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!visible) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="
        fixed
        bottom-6
        right-6
        z-40
        rounded-full
        bg-brand-ochre
        p-3
        text-white
        shadow-lg
        transition-all
        hover:bg-brand-ochre-dark
        focus:outline-none
        focus:ring-2
        focus:ring-brand-ochre
        focus:ring-offset-2
      "
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}