import { Moon01, Sun } from "@untitledui/icons";
import { useEffect, useState } from "react";

/** Switches between the light (default) and dark colour themes; the choice is remembered. */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("bf_theme", next ? "dark" : "light");
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
    >
      {dark ? <Sun className="size-4" /> : <Moon01 className="size-4" />}
    </button>
  );
}
