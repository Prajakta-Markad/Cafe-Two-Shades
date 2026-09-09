//import { useState } from 'react'

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
//import BookingsOrders from "./pages/BookingsOrders";
import Orders from "./pages/Orders";
import Bookings from "./pages/Bookings";
import AdminRoute from "./pages/admin/AdminRoute";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import HomepageContentManagement from "./pages/admin/HomepageContentManagement";
import MenuManagement from "./pages/admin/MenuManagement";
import SeasonalSpecialManagement from "./pages/admin/SeasonalSpecialManagement";
import SeasonalSpecialAdmin from "./pages/admin/SeasonalSpecialAdmin";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={ <ProtectedAdminRoute> <AdminDashboard onSignOut={() => {
          // signOutAdmin is already handled inside AdminDashboard
        }} /> </ProtectedAdminRoute> } />
          <Route path="/admin/homepage-content" element={ <ProtectedAdminRoute> <HomepageContentManagement /> </ProtectedAdminRoute> } />
          <Route path="/admin/menu" element={ <ProtectedAdminRoute> <MenuManagement /> </ProtectedAdminRoute> } />
          <Route path="/admin/seasonal-special" element={ <ProtectedAdminRoute> <SeasonalSpecialManagement /></ProtectedAdminRoute> } />
          <Route path="/admin/seasonal-special" element={ <ProtectedAdminRoute> <SeasonalSpecialAdmin /> </ProtectedAdminRoute> } />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App