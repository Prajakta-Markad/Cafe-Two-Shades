//import { useState } from 'react'

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
//import BookingsOrders from "./pages/BookingsOrders";
import Orders from "./pages/Orders";
import Bookings from "./pages/Bookings";
import AdminRoute from "./pages/admin/AdminRoute";
import PrivacyPolicy from "./pages/PrivacyPolicy";

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
          <Route path="/admin" element={<AdminRoute />}
          />
        </Route>
      </Routes>


    </BrowserRouter>
  );
}

export default App