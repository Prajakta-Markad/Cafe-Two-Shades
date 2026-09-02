import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import NavLinks from "./NavLinks";

interface Props {
  open: boolean;
  closeMenu: () => void;
}

export default function MobileMenu({
  open,
  closeMenu,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="
            absolute
            left-0
            top-20
            w-full
            border-b
            border-stone-200
            bg-brand-ivory
            px-6
            py-6
            md:hidden
          "
        >
          <div className="flex flex-col gap-2">

            <NavLinks
              mobile
              onNavigate={closeMenu}
            />

<Link
  to="/bookings"
  onClick={closeMenu}
  className="
    mt-4
    rounded-xl
    bg-brand-ochre
    px-5
    py-3
    text-center
    font-semibold
    text-white
  "
>
  Book a Table
</Link>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}