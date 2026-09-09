//This isn't the final dashboard yet. 
// It's just the protected destination so we can verify authentication before adding all the management modules.

import { useEffect, useState, } from "react";
import { useNavigate, } from "react-router-dom";
  
  import {
    getCurrentAdmin,
    signOutAdmin,
    type AdminProfile,
  } from "../../services/adminService";
  
  export default function AdminDashboard() {
    const navigate = useNavigate();
  
    const [ admin, setAdmin, ] = useState<AdminProfile | null>( null );
    const [ loading, setLoading, ] = useState(true);
  
    useEffect(() => {
      let mounted = true;
  
      async function loadAdmin() {
        const currentAdmin =
          await getCurrentAdmin();
  
        if (!mounted) {
          return;
        }
  
        setAdmin(
          currentAdmin
        );
        setLoading(false);
      }
  
      loadAdmin();
  
      return () => {
        mounted = false;
      };
    }, []);
  
    async function handleSignOut() {
      try {
        await signOutAdmin();
  
        navigate(
          "/admin/login",
          {
            replace: true,
          }
        );
      } catch {
        // Keep the administrator on the dashboard
        // if the sign-out request fails.
      }
    }
  
    if (loading) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#faf8f4]">
          <p className="text-sm text-[#6b645b]">
            Loading dashboard...
          </p>
        </main>
      );
    }
  
    if (!admin) {
      return null;
    }
  
    return (
      <main className="min-h-screen bg-[#faf8f4] text-[#171512]">
        <header className="border-b border-[#e1d9cc] bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8 lg:px-12">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8a6a22]">
                Cafe Two Shades
              </p>
  
              <h1 className="mt-1 font-serif text-2xl">
                Admin dashboard
              </h1>
            </div>
  
            <button
              type="button"
              onClick={
                handleSignOut
              }
              className="rounded-lg border border-[#d7cfc2] bg-white px-4 py-2 text-sm font-medium text-[#29251f] transition hover:bg-[#f6f1e8] focus:outline-none focus:ring-2 focus:ring-[#8a6a22] focus:ring-offset-2"
            >
              Sign out
            </button>
          </div>
        </header>
  
        <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
          <div className="rounded-2xl border border-[#e1d9cc] bg-white p-7">
            <p className="text-sm text-[#6b645b]">
              Signed in as
            </p>
  
            <p className="mt-1 font-medium">
              {admin.display_name}
            </p>
  
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardPlaceholder
                title="Bookings"
              />
  
              <DashboardPlaceholder
                title="Menu"
              />
  
              <DashboardPlaceholder
                title="Reviews"
              />
  
              <DashboardPlaceholder
                title="Customer Photos"
              />
            </div>
          </div>
        </section>
      </main>
    );
  }
  
  
  function DashboardPlaceholder({
    title,
  }: {
    title: string;
  }) {
    return (
      <div className="rounded-xl border border-[#e5ded3] bg-[#faf8f4] p-5">
        <p className="font-serif text-xl">
          {title}
        </p>
  
        <p className="mt-2 text-xs text-[#7a736a]">
          Management panel coming next.
        </p>
      </div>
    );
  }