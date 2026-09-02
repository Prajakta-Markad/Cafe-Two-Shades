//import { useState } from 'react'

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import BookingsOrders from "./pages/BookingsOrders";

import AppLayout from "./components/layout/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/bookings" element={<BookingsOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App