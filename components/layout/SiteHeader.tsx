"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
        </svg>
      </span>
      <span className="text-lg font-bold text-neutral-900">MtaaVoice</span>
    </Link>
  );
}

const NAV_LINK_CLASS =
  "text-sm font-medium text-neutral-600 transition-colors hover:text-brand";

const PRIMARY_LINK_CLASS =
  "inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-strong";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          <Link href="/#how-it-works" className={NAV_LINK_CLASS}>
            How it works
          </Link>
          <Link href="/#categories" className={NAV_LINK_CLASS}>
            What you can report
          </Link>
          <Link href="/login" className={NAV_LINK_CLASS}>
            Log in
          </Link>
          <Link href="/register" className={PRIMARY_LINK_CLASS}>
            Sign up
          </Link>
        </nav>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line-strong text-neutral-700 md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            {open ? (
              <path
                strokeLinecap="round"
                d="M6 6l12 12M18 6L6 18"
              />
            ) : (
              <path
                strokeLinecap="round"
                d="M4 7h16M4 12h16M4 17h16"
              />
            )}
          </svg>
        </button>
      </div>
      <div
        id="mobile-nav"
        className={cn(
          "border-t border-line bg-white md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav
          aria-label="Mobile"
          className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3 sm:px-6"
        >
          <Link
            href="/#how-it-works"
            className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-surface"
            onClick={() => setOpen(false)}
          >
            How it works
          </Link>
          <Link
            href="/#categories"
            className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-surface"
            onClick={() => setOpen(false)}
          >
            What you can report
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-surface"
            onClick={() => setOpen(false)}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="mt-1 rounded-lg bg-brand px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-strong"
            onClick={() => setOpen(false)}
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
