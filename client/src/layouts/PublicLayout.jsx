import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "../components/common/Navbar";
import PageTransition from "../components/common/PageTransition";

export default function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      {/* Navbar tetap seperti sebelumnya */}
      {!isHome && <Navbar />}

      {/* 🔥 TRANSITION AMAN */}
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
    </>
  );
}