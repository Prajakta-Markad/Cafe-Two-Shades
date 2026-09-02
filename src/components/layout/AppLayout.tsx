import { Outlet } from "react-router-dom";

import Navbar from "./Navbar/index";
import Footer from "./Footer";
import BackToTopButton from "./BackToTopButton";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-ivory text-brand-black">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      <BackToTopButton />
    </div>
  );
}