import { signOutAdmin,} from "../../services/authService";
import AdminBookings from "./AdminBookings";
  
  interface AdminDashboardProps {
    onSignOut: () => void;
  }
  
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ochre">
                Cafe Two Shades
              </p>
  
              <h1 className="mt-1 font-serif text-2xl font-semibold">
                Admin Dashboard
              </h1>
            </div>
  
            <button
              type="button"
              onClick={handleSignOut}
              className="
                rounded-lg
                border
                border-brand-border
                px-4
                py-2
                text-sm
                font-medium
                transition
                hover:border-brand-ochre
              "
            >
              Sign out
            </button>
          </div>
        </header>
  
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="mt-8">
                 <AdminBookings />
            </div>
  
            <DashboardCard
              title="Menu"
              description="Manage categories, items, prices and availability."
            />
  
            <DashboardCard
              title="Seasonal Special"
              description="Manage the current seasonal special."
            />
          </div>
        </main>
      </div>
    );
  }
  
  
  function DashboardCard({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) {
    return (
      <div className="rounded-2xl border border-brand-border bg-brand-ivory p-7">
        <h2 className="font-serif text-2xl font-semibold">
          {title}
        </h2>
  
        <p className="mt-3 text-sm leading-6 text-stone-500">
          {description}
        </p>
      </div>
    );
  }