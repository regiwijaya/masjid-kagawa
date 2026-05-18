import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export default function RouteProgress() {
  const location = useLocation();

  useEffect(() => {
    // mulai progress
    NProgress.start();

    // selesai setelah frame berikutnya (biar terasa smooth)
    const t = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => clearTimeout(t);
  }, [location.pathname]);

  return null;
}