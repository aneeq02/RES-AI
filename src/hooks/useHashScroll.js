import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls to the element matching the URL hash once the page has mounted. */
export default function useHashScroll() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    // Wait for the page-enter transition so layout is settled.
    const t = setTimeout(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus({ preventScroll: true });
    }, 120);
    return () => clearTimeout(t);
  }, [hash]);
}
