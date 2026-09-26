import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const CONTACT_EMAIL = "hello@botforge.app";
const WHATSAPP = "https://wa.me/10000000000";

function captureUtm() {
  const p = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const v = p.get(k);
    if (v) utm[k] = v;
  }
  if (Object.keys(utm).length && !localStorage.getItem("bf_utm")) {
    localStorage.setItem("bf_utm", JSON.stringify(utm));
  }
}

export function getUtm(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem("bf_utm") ?? "{}");
  } catch {
    return {};
  }
}

export function SiteExtras() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [cookie, setCookie] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    captureUtm();
    setCookie(!localStorage.getItem("bf_cookie"));
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
      setShowTop(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="print:hidden">
      <div
        aria-hidden
        className="fixed left-0 top-0 z-[60] h-0.5 bg-primary transition-[width]"
        style={{ width: `${progress}%` }}
      />

      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {open && (
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 text-sm shadow-lg">
            <a className="hover:text-accent" href={`mailto:${CONTACT_EMAIL}`}>Email us</a>
            <a className="hover:text-accent" href={WHATSAPP} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        )}
        {showTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="size-11 rounded-full border border-border bg-surface text-lg transition-colors hover:border-accent hover:text-accent"
          >
            ↑
          </button>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Contact us"
          className="h-12 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          {open ? "Close" : "Contact"}
        </button>
      </div>

      {cookie && (
        <div className="fixed inset-x-3 bottom-20 z-50 mx-auto flex max-w-lg flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4 text-sm shadow-lg sm:bottom-5 sm:left-5 sm:right-auto">
          <p className="min-w-0 flex-1 text-muted-foreground">
            We use essential cookies to keep you signed in. See our{" "}
            <Link to="/privacy" className="text-accent underline">privacy policy</Link>.
          </p>
          <button
            onClick={() => {
              localStorage.setItem("bf_cookie", "1");
              setCookie(false);
            }}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
