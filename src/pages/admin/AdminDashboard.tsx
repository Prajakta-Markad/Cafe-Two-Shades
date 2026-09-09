import { Link } from "react-router-dom";

const adminSections = [
  {
    title: "Bookings",
    description:
      "Review pending bookings and manage approved reservations.",
    path: "/admin/bookings",
  },
  {
    title: "Menu",
    description:
      "Manage menu categories, items, prices and availability.",
    path: "/admin/menu",
  },
  {
    title: "Seasonal Special",
    description:
      "Manage the single seasonal special shown on the homepage.",
    path: "/admin/seasonal-special",
  },
  {
    title: "Homepage Content",
    description:
      "Manage Google reviews and customer-submitted photos.",
    path: "/admin/homepage-content",
  },
];

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-[#f8f5ef] px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#8a6a22]">
            Cafe Two Shades
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#171512]">
            Admin Dashboard
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6b645b]">
            Manage the information displayed across
            the cafe website.
          </p>
        </header>

        <section
          aria-label="Admin sections"
          className="mt-10 grid gap-5 sm:grid-cols-2"
        >
          {adminSections.map(
            (section) => (
              <Link
                key={section.path}
                to={section.path}
                className="group rounded-xl border border-[#e1d9cc] bg-white p-6 transition hover:border-[#b9a36b] hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl text-[#171512]">
                      {section.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#6b645b]">
                      {section.description}
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className="text-xl text-[#8a6a22] transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </div>
              </Link>
            )
          )}
        </section>
      </div>
    </main>
  );
}

/* Version 1:

import { signOutAdmin,} from "../../services/authService";
import AdminBookings from "./AdminBookings";
import { Link, useNavigate } from "react-router-dom";
  
interface AdminDashboardProps { onSignOut: () => void; }
  
  export default function AdminDashboard({
    onSignOut,
  }: AdminDashboardProps) {
    async function handleSignOut() {
      await signOutAdmin();
      onSignOut();
    }
  
    return (
      <div className="min-h-screen bg-brand-beige">
        <header className="border-b border-brand-border bg-brand-ivory">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ochre"> Cafe Two Shades </p>
              <h1 className="mt-1 font-serif text-2xl font-semibold"> Admin Dashboard </h1>
            </div>
  
            <button
              type="button" onClick={handleSignOut}
              className="rounded-lg border border-brand-border px-4 py-2 text-sm font-medium transition hover:border-brand-ochre"
            > Sign out
            </button>
          </div>
        </header>
  
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="mt-8"> <AdminBookings /> </div>

            <Link to="/admin/menu" className="rounded-xl border border-[#e5ded3] bg-[#faf8f4] p-5 transition hover:border-[#c9b990]">
              <p className="font-serif text-xl"> Menu </p>
              <p className="mt-2 text-xs text-[#7a736a]"> Manage categories, items and prices. </p>
            </Link>

            <DashboardCard title="Seasonal Special" description="Manage the current seasonal special." />
            <Link to="/admin/homepage-content"
              className="rounded-xl border border-[#e5ded3] bg-[#faf8f4] p-5 transition hover:border-[#c9b990]"
            >
            <p className="font-serif text-xl"> Homepage Content </p>
            <p className="mt-2 text-xs text-[#7a736a]"> Manage reviews and customer photos. </p>
          </Link>
          </div>
        </main>
      </div>
    );
  }
  
  
  function DashboardCard({ title, description, }: {
    title: string; description: string;
  }) {
    return (
      <div className="rounded-2xl border border-brand-border bg-brand-ivory p-7">
        <h2 className="font-serif text-2xl font-semibold"> {title} </h2>
        <p className="mt-3 text-sm leading-6 text-stone-500"> {description} </p>
      </div>
    );
  }

  */