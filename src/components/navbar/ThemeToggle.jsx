import React from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "res-theme";

function apply(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f4f0e6" : "#07080c");
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* storage can be blocked; the switch still works for this visit */
  }
}

// Both icons are always rendered and swapped with CSS, so the server and client markup match
// (the theme is only known in the browser, before first paint, via the inline script in index.html).
export default function ThemeToggle({ className = "" }) {
  const toggle = () => apply(document.documentElement.dataset.theme === "light" ? "dark" : "light");
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      className={`grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-ink/5 text-ink transition hover:bg-ink/10 ${className}`}
    >
      <Sun size={18} aria-hidden="true" className="light:hidden" />
      <Moon size={18} aria-hidden="true" className="hidden light:block" />
    </button>
  );
}
