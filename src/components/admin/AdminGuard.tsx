import { ReactNode, useEffect,useState, } from "react";
import { getCurrentAdmin,} from "../../services/authService";
  
  interface AdminGuardProps {
    children: ReactNode;
    onUnauthorised: () => void;
  }
  
  export default function AdminGuard({
    children,
    onUnauthorised,
  }: AdminGuardProps) {
    const [
      checking,
      setChecking,
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
  
          if (!admin) {
            onUnauthorised();
            return;
          }
  
          setAuthorised(true);
        } catch {
          if (mounted) {
            onUnauthorised();
          }
        } finally {
          if (mounted) {
            setChecking(false);
          }
        }
      }
  
      checkAdmin();
  
      return () => {
        mounted = false;
      };
    }, [onUnauthorised]);
  
    if (checking) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-brand-beige">
          <p className="text-sm text-stone-500">
            Checking access...
          </p>
        </main>
      );
    }
  
    if (!authorised) {
      return null;
    }
  
    return <>{children}</>;
  }