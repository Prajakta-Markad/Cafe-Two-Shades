import NavLinks from "./NavLinks";
import { Link } from "react-router-dom";

export default function DesktopNav() {
  return (
    <div className="hidden items-center gap-8 md:flex">
      <NavLinks />

      <Link
  to="/bookings"
  className="
    rounded-xl
    bg-brand-ochre
    px-5
    py-2.5
    text-sm
    font-semibold
    text-white
    transition-all
    hover:bg-brand-ochre-dark
  "
>
  Book a Table
</Link>
    </div>
  );
}