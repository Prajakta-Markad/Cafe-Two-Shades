import { type ReactNode, useEffect, useState, } from "react";
import { Navigate, useLocation, } from "react-router-dom";
import { getCurrentAdmin, } from "../../services/adminService";
  
  interface ProtectedAdminRouteProps {
    children: ReactNode;
  }
  
  export default function ProtectedAdminRoute({
    children,
  }: ProtectedAdminRouteProps) {
    const location =
      useLocation();
  
    const [
      loading,
      setLoading,
    ] = useState(true);
  
    const [
      authorised,
      setAuthorised,
    ] = useState(false);
  
    useEffect(() => {
      let mounted = true;
  
      async function checkAdmin() {
        try {
          const admin =
            await getCurrentAdmin();
  
          if (!mounted) {
            return;
          }
  
          setAuthorised(
            Boolean(admin)
          );
        } catch {
          if (mounted) {
            setAuthorised(false);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
  
      checkAdmin();
  
      return () => {
        mounted = false;
      };
    }, []);
  
    if (loading) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#faf8f4] px-6">
          <p
            className="text-sm text-[#6b645b]"
            aria-live="polite"
          >
            Checking access...
          </p>
        </main>
      );
    }
  
    if (!authorised) {
      return (
        <Navigate
          to="/admin/login"
          replace
          state={{
            from:
              location.pathname,
          }}
        />
      );
    }
  
    return <>{children}</>;
  }