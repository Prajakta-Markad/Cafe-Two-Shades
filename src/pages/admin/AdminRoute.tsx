import {useState,} from "react";
  
  import AdminGuard from "../../components/admin/AdminGuard";
  import AdminDashboard from "./AdminDashboard";
  import AdminLogin from "./AdminLogin";
  
  export default function AdminRoute() {
    const [
      authenticated,
      setAuthenticated,
    ] = useState(false);
  
    if (!authenticated) {
      return (
        <AdminLogin
          onSuccess={() =>
            setAuthenticated(true)
          }
        />
      );
    }
  
    return (
      <AdminGuard
        onUnauthorised={() =>
          setAuthenticated(false)
        }
      >
        <AdminDashboard
          onSignOut={() =>
            setAuthenticated(false)
          }
        />
      </AdminGuard>
    );
  }