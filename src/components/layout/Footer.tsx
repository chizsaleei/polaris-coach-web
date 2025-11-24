"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  const [openContact, setOpenContact] = useState<string | null>(null);

  const contacts = [
    {
      label: "Email",
      href: "mailto:polaris@chizsaleei.com",
      detail: "polaris@chizsaleei.com",
      icon: "/icons/email.png",
      aria: "Email Polaris Coach",
    },
    {
      label: "Teams",
      href: "mailto:chizsaleei2018@outlook.com",
      detail: "chizsaleei2018@outlook.com",
      icon: "/icons/teams.png",
      aria: "Contact on Microsoft Teams",
    },
    {
      label: "WeChat",
      href: "weixin://dl/chat?Chizyle",
      detail: "WeChat: Chizyle",
      icon: "/icons/wechat.png",
      aria: "Contact on WeChat",
    },
    {
      label: "WhatsApp",
      href: "https://wa.me/639619801968",
      detail: "+63 961 980 1968",
      icon: "/icons/whatsapp.png",
      aria: "Contact on WhatsApp",
    },
  ];

  return (
    <footer className="mt-10 border-t border-border bg-background dark:border-white/10 dark:bg-base">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <section>
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="hover:underline">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/help-center" className="hover:underline">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline">
                  About
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <h4 className="mb-3 text-sm font-semibold">App</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:underline">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/chat" className="hover:underline">
                  Practice Now
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/privacy" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:underline">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </section>
        </div>

        <div className="divider my-6" />

        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="text-xs text-black/60 dark:text-white/60">
            © {year} Polaris Coach. All rights reserved.
          </p>

          <div className="grid w-full grid-cols-4 gap-3 sm:w-auto sm:grid-cols-4 sm:gap-4">
            {contacts.map((contact) => (
              <button
                key={contact.label}
                type="button"
                onClick={() =>
                  setOpenContact((prev) => (prev === contact.label ? null : contact.label))
                }
                className="flex items-center justify-center rounded-full bg-white/70 p-3 shadow transition hover:scale-105 hover:bg-white dark:bg-slate-800/70 dark:hover:bg-slate-700"
                aria-label={contact.aria}
              >
                <img
                  src={contact.icon}
                  alt={`${contact.label} icon`}
                  className="h-12 w-12 sm:h-8 sm:w-8 object-contain"
                  loading="lazy"
                  width={48}
                  height={48}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {openContact && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-4 py-6 sm:items-center"
          onClick={() => setOpenContact(null)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpenContact(null)}
              className="absolute right-3 top-3 rounded-full bg-slate-100 p-1 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              aria-label="Close contact dialog"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <img
                src={contacts.find((c) => c.label === openContact)?.icon}
                alt=""
                className="h-12 w-12 sm:h-8 sm:w-8 object-contain"
              />
              <div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Need help?
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-200">
                  Start a conversation with our team.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="text-xs text-slate-600 dark:text-slate-200">
                We typically reply within a few minutes.
              </p>
            </div>

            <a
              href={contacts.find((c) => c.label === openContact)?.href}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Chat with us
            </a>
          </div>
        </div>
      )}
    </footer>
  );
}
