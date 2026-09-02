import { NavLink } from "react-router-dom";

const links = [
  {
    label: "Home",
    to: "/",
  },
  {
    label: "Menu",
    to: "/menu",
  },
  {
    label: "Bookings & Orders",
    to: "/bookings",
  },
];

export default function NavLinks({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `
            transition-colors
            duration-200
            ${
              mobile
                ? "block py-3 text-lg"
                : "text-sm font-medium"
            }
            ${
              isActive
                ? "text-brand-ochre"
                : "text-black hover:text-brand-ochre"
            }
          `
          }
        >
          {link.label}
        </NavLink>
      ))}
    </>
  );
}