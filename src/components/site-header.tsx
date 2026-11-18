"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#approach", label: "Арга барил" },
  { href: "#services", label: "Үйлчилгээ" },
  { href: "#contact", label: "Холбоо барих" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <a className="wordmark" href="#top">
          AGENCY
        </a>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Хаах" : "Цэс"}
        </button>
        <nav id="site-nav" className="site-nav" data-open={open} aria-label="Үндсэн цэс">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a className="btn btn-primary btn-small" href="#builder" onClick={() => setOpen(false)}>
            Багцаа бүрдүүлэх
          </a>
        </nav>
      </div>
    </header>
  );
}
