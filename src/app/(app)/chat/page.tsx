// polaris-coach-web/src/app/(app)/chat/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Lightbulb,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import ChatPanel from "@/components/app/ChatPanel";
import PracticeNowButton from "@/components/app/PracticeNowButton";
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import type { CoachKey } from "@/types";

export const metadata: Metadata = {
  title: "Practice Now • Polaris Coach",
  description:
    "Jump into a guided conversation with your Polaris AI coach. Request drills, role-play scenarios, and get transcript feedback.",
};

const STARTER_PROMPTS = [
  "Run a 3-minute listening drill about team retrospectives.",
  "Role-play a negotiation where I need to push back on a deadline.",
  "Give me feedback on this paragraph for clarity and tone.",
  "Pretend to be a hiring manager asking about my technical portfolio.",
];

type CoachAvatarMeta = {
  src: string;
  alt: string;
  label: string;
};

const COACH_AVATAR: Partial<Record<CoachKey, CoachAvatarMeta>> = {
  chase_krashen: {
    src: "/coach-assets/chase-krashen/avatar-256.webp",
    alt: "Chase Krashen",
    label: "Chase Krashen · Academic English",
  },
  dr_claire_swales: {
    src: "/coach-assets/claire-swales/avatar-256.webp",
    alt: "Dr. Claire Swales",
    label: "Dr. Claire Swales · Admissions",
  },
  carter_goleman: {
    src: "/coach-assets/carter-goleman/avatar-256.webp",
    alt: "Carter Goleman",
    label: "Carter Goleman · Interviews",
  },
  chelsea_lightbown: {
    src: "/coach-assets/chelsea-lightbown/avatar-256.webp",
    alt: "Chelsea Lightbown",
    label: "Chelsea Lightbown · IELTS and TOEFL",
  },
  dr_clark_atul: {
    src: "/coach-assets/clark-atul/avatar-256.webp",
    alt: "Dr. Clark Atul",
    label: "Dr. Clark Atul · Physicians",
  },
  dr_crystal_benner: {
    src: "/coach-assets/crystal-benner/avatar-256.webp",
    alt: "Dr. Crystal Benner",
    label: "Dr. Crystal Benner · Nursing",
  },
  christopher_buffett: {
    src: "/coach-assets/christopher-buffett/avatar-256.webp",
    alt: "Christopher Buffett",
    label: "Christopher Buffett · Finance",
  },
  colton_covey: {
    src: "/coach-assets/colton-covey/avatar-256.webp",
    alt: "Colton Covey",
    label: "Colton Covey · Leadership",
  },
  cody_turing: {
    src: "/coach-assets/cody-turing/avatar-256.webp",
    alt: "Cody Turing",
    label: "Cody Turing · Technical",
  },
  chloe_sinek: {
    src: "/coach-assets/chloe-sinek/avatar-256.webp",
    alt: "Chloe Sinek",
    label: "Chloe Sinek · Personal vision",
  },
};

function getCoachMeta(key?: CoachKey | null): CoachAvatarMeta | null {
  if (!key) return null;
  return COACH_AVATAR[key] ?? null;
}

export default async function ChatPage() {
  const user = await requireUser("/login");
  const supabase = getSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, active_coach_key")
    .eq("id", user.id)
    .maybeSingle();

  const fullName: string | undefined =
    (profile?.full_name as string | undefined) ||
    ((user.user_metadata as any)?.full_name as string | undefined);

  const firstName = fullName?.split(" ")[0] || "there";
  const activeCoachKey = (profile?.active_coach_key ?? null) as CoachKey | null;
  const coachMeta = getCoachMeta(activeCoachKey);

  return (
    <main className="space-y-8 pb-16">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 dark:bg-[#03121A]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Practice now
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              Ready when you are, {firstName}.
            </h1>
            <p className="mt-3 text-base text-slate-700 dark:text-slate-200">
              Use this space for quick drills, clarification questions, or full
              role-plays. Sessions run in real time with your current coach
              profile so recommendations stay aligned with your goals.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
            <p className="font-semibold">Need a fresh drill</p>
            <PracticeNowButton className="mt-2 w-full rounded-xl bg-[#042838] text-white hover:bg-[#054468]" />
          </div>
        </div>
        <ul className="mt-6 grid gap-3 text-sm text-slate-700 dark:text-slate-200 md:grid-cols-3">
          <Checklist
            icon={<Sparkles className="h-4 w-4" />}
            label="Instant drills"
            copy="Ask for targeted warmups by skill, time, or format."
          />
          <Checklist
            icon={<MessageSquareText className="h-4 w-4" />}
            label="Transcript feedback"
            copy="Paste conversation notes to get tone and clarity suggestions."
          />
          <Checklist
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Safety guardrails"
            copy="All chats are private, logged, and follow your safety settings."
          />
        </ul>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          {coachMeta && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
              <Image
                src={coachMeta.src}
                alt={coachMeta.alt}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Current coach
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {coachMeta.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drills and feedback in this chat use this coach profile and
                  rubric.
                </p>
              </div>
            </div>
          )}

          <ChatPanel
            userId={user.id}
            userName={fullName}
            starterPrompts={STARTER_PROMPTS}
          />
        </div>

        <aside className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-[#04121B]">
            <header className="flex items-center gap-3">
              <Lightbulb
                className="h-6 w-6 text-amber-500"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ideas
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Make the most of this chat
                </h2>
              </div>
            </header>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
              <li>
                Ask for multi-turn role-plays, for example, “act as my
                stakeholder who disagrees”.
              </li>
              <li>
                Upload transcripts via the{" "}
                <Link
                  className="font-semibold underline"
                  href="/account/export"
                >
                  data export
                </Link>{" "}
                page for deeper reviews.
              </li>
              <li>
                Use “Why” follow-ups to unpack the rubric your coach is using.
              </li>
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-[#04121B]">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Session tips
            </h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <InfoRow
                title="Duration"
                value="Chats can run as long as you need and reset when you leave the page."
              />
              <InfoRow
                title="Voice and live"
                value="Need live speaking drills Use the Live tab for real-time sessions."
              />
              <InfoRow
                title="Escalations"
                value="Email polaris@chizsaleei.com if you need to flag a conversation."
              />
            </dl>
          </article>
        </aside>
      </section>
    </main>
  );
}

function Checklist({
  icon,
  label,
  copy,
}: {
  icon: React.ReactNode;
  label: string;
  copy: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-slate-200/70 p-4">
      <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {label}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300">{copy}</p>
      </div>
    </li>
  );
}

function InfoRow({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </dt>
      <dd className="text-sm text-slate-700 dark:text-slate-200">{value}</dd>
    </div>
  );
}
