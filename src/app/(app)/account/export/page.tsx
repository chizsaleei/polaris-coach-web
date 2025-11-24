// polaris-coach-web/src/app/(app)/account/export/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Database, Download, ShieldCheck } from "lucide-react";

import { coreGet } from "@/lib/fetch-core";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Export your data · Polaris Coach",
  description:
    "Download a JSON archive with your drills, attempts, tickets, and other Polaris Coach data any time.",
};

export const revalidate = 0;

type TableManifest = {
  count: number;
  error?: string;
};

type ExportManifest = {
  ok: boolean;
  userId: string;
  generatedAt: string;
  tables: Record<string, TableManifest>;
};

export default async function AccountExportPage() {
  const user = await requireUser("/login");
  const manifest = await fetchManifest(user.id);
  const totalRows = manifest ? sumTableCounts(manifest.tables) : 0;

  return (
    <main className="space-y-8 pb-16">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Data portability
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Export your Polaris data</h1>
            <p className="mt-3 text-base text-slate-700">
              Download a machine-readable archive of your practice history, saved expressions, tickets,
              notifications, and other personal records.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
            Generated on {formatDate(manifest?.generatedAt) ?? "request"}
          </div>
        </div>
        <ul className="mt-6 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <li className="flex items-start gap-3 rounded-2xl border border-slate-200/70 p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            <span>Only you can request exports. Each file includes a manifest detailing table counts.</span>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-slate-200/70 p-4">
            <Database className="h-5 w-5 text-slate-500" aria-hidden="true" />
            <span>Archives are JSON (optionally gzipped) so you can import them into any analysis tool.</span>
          </li>
        </ul>
      </header>

      {manifest ? (
        <ManifestCard manifest={manifest} totalRows={totalRows} />
      ) : (
        <div
          role="alert"
          className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          We couldn’t reach the export service right now. Retry in a moment or email{" "}
          <a className="font-semibold underline" href="mailto:polaris@chizsaleei.com">
            polaris@chizsaleei.com
          </a>
          .
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="text-2xl font-semibold text-slate-900">Download archive</h2>
        <p className="mt-2 text-sm text-slate-600">
          The download includes all tables listed above. We’ll stream the JSON file directly to your browser;
          large accounts may take a minute to prepare.
        </p>

        <form action={downloadExport} className="mt-6 space-y-4">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 md:w-auto"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download my data
          </button>
          <p className="text-xs text-slate-500">
            You’ll receive a `.json` file (or `.json.gz` if your browser advertises gzip support). Keep it secure—
            it contains your complete Polaris history.
          </p>
        </form>
      </section>

      <div className="text-sm text-slate-500">
        Changed your mind?{" "}
        <Link className="font-semibold text-slate-900 underline" href="/account">
          Return to account settings
        </Link>
      </div>
    </main>
  );
}

function ManifestCard({ manifest, totalRows }: { manifest: ExportManifest; totalRows: number }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Included tables</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            {Object.keys(manifest.tables).length} tables · {totalRows.toLocaleString()} rows
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Manifest generated {formatDate(manifest.generatedAt, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(manifest.tables).map(([table, info]) => (
          <div key={table} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{table}</dt>
            <dd className="mt-2 font-mono text-slate-900">{info.count.toLocaleString()}</dd>
            {info.error && <p className="mt-1 text-xs text-amber-600">Skipped ({info.error})</p>}
          </div>
        ))}
      </dl>
    </article>
  );
}

async function fetchManifest(userId: string): Promise<ExportManifest | null> {
  try {
    return await coreGet<ExportManifest>("/v1/account/export/manifest", {
      headers: { "x-user-id": userId },
      cache: "no-store",
    });
  } catch (error) {
    console.error("[account/export] manifest failed", error);
    return null;
  }
}

async function downloadExport() {
  "use server";

  const user = await requireUser("/login");
  // Proxy through your Next API route once implemented so we can add auth headers server-side.
  redirect(`/api/account/export?userId=${encodeURIComponent(user.id)}`);
}

function sumTableCounts(tables: Record<string, TableManifest>): number {
  return Object.values(tables).reduce((acc, entry) => acc + entry.count, 0);
}

function formatDate(value?: string, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("en", options).format(new Date(value));
  } catch {
    return value;
  }
}