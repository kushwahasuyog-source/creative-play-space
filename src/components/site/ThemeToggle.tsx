import { Moon01, Sun } from "@untitledui/icons";
import { useEffect, useState } from "react";

/** Switches between the dark (default) and light colour themes; the choice is remembered. */
export function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => setLight(document.documentElement.classList.contains("light")), []);
  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("bf_theme", next ? "light" : "dark");
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
    >
      {light ? <Moon01 className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}
