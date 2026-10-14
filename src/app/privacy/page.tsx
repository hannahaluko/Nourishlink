"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, CircleButton, IconTile, Pill } from "@/components/ui";
import { IconBack, IconCheck, IconLock, IconShield, IconTrash, IconNote, IconUsers } from "@/components/icons";

const SECTIONS = [
  {
    title: "1. What we collect",
    body: [
      "Account details: name, email, phone number and location.",
      "Health profile: height, weight, goals, conditions and allergies you enter during onboarding.",
      "Logs: meals, blood glucose readings, weight, water and activity you record.",
      "Consult records: bookings, payments, chat messages and the session notes your dietitian writes.",
      "Orders: what you bought, where it was delivered and the payment reference.",
    ],
  },
  {
    title: "2. Why we collect it",
    body: [
      "To match you with dietitians who fit your conditions, location and budget.",
      "To let the dietitian you booked prepare for, and follow up on, your care.",
      "To power reminders and show your own trends over time.",
      "To fulfil and support orders from the healthy food shop.",
    ],
  },
  {
    title: "3. Who can see your health data",
    body: [
      "You, always. Everything is visible in your own dashboard.",
      "A dietitian, only after you book them and while your sharing consent stays on. Revoking consent closes their access immediately.",
      "An administrator, only to resolve a support issue, and every access is logged.",
      "Vendors never see your health data — they only see the product, quantity and delivery address for an order.",
    ],
  },
  {
    title: "4. How long we keep it",
    body: [
      "Health logs and consultation notes: while your account is active, and 24 months after it closes, then deleted.",
      "Payment records: as required by financial regulation, without any clinical detail.",
      "You can delete your account and all records at any time from Profile — deletion is immediate and irreversible.",
    ],
  },
  {
    title: "5. Your rights",
    body: [
      "Access and export: download a machine-readable copy of your record.",
      "Rectification: edit any profile detail or log entry yourself.",
      "Erasure: delete your account and everything in it.",
      "Withdraw consent: turn off dietitian sharing or reminders at any time without losing access to the app.",
    ],
  },
  {
    title: "6. Security",
    body: [
      "Data is encrypted in transit and at rest, with row-level security rules so one account can never read another's rows.",
      "Consents are recorded with a timestamp and shown to the dietitian before they open a record.",
      "Video consults are encrypted; nothing is recorded without both parties agreeing.",
    ],
  },
  {
    title: "7. Contact",
    body: [
      "Data protection officer: privacy@nourishlink.example.",
      "We respond to privacy requests within 30 days, and to deletion requests immediately.",
    ],
  },
];

export default function PrivacyPage() {
  const router = useRouter();
  const { consent } = useStore();

  return (
    <div className="mx-auto min-h-screen w-full max-w-[680px] px-[18px] pb-16">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Legal</p>
          <h1 className="truncate text-[17px] font-semibold">Privacy & consent</h1>
        </div>
      </header>

      <div className="space-y-3">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <IconTile tone="lime" size={44}>
              <IconShield size={20} />
            </IconTile>
            <div>
              <h2 className="text-[16px] font-semibold">Health data is sensitive data</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                NourishLink stores diet, glucose, weight and consultation records. We process them under
                Nigeria&apos;s NDPR and, for users in Europe, the GDPR. This page explains exactly what
                happens to that data and how to take it back.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Pill tone="lime">
                  <IconLock size={12} />
                  Row-level security
                </Pill>
                <Pill tone="gray">Updated 14 October 2026</Pill>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-[16px] font-semibold">Your current consents</h2>
          <ul className="mt-2 divide-y divide-hairline">
            {[
              {
                label: "Process my health data",
                on: consent.dataProcessing,
                detail: consent.agreedAt ? `Agreed ${consent.agreedAt.slice(0, 10)}` : "Not recorded",
              },
              {
                label: "Share my record with a booked dietitian",
                on: consent.shareWithDietitian,
                detail: "Only the dietitian you book, for the duration of your care",
              },
              {
                label: "Logging and consult reminders",
                on: consent.reminders,
                detail: "Evening nudges plus consult reminders",
              },
            ].map((c) => (
              <li key={c.label} className="flex items-start gap-3 py-3">
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                    c.on ? "bg-lime text-white" : "bg-canvas text-faint"
                  }`}
                >
                  <IconCheck size={12} />
                </span>
                <span className="flex-1">
                  <span className="block text-[13px] font-semibold">{c.label}</span>
                  <span className="block text-[12px] text-muted">
                    {c.on ? "On — " : "Off — "}
                    {c.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/profile"
            className="press mt-3 inline-flex items-center gap-2 rounded-full bg-canvas px-4 py-2.5 text-[13px] font-semibold"
          >
            <IconUsers size={15} />
            Manage consents in Profile
          </Link>
        </Card>

        {SECTIONS.map((s) => (
          <Card key={s.title} className="p-4">
            <h2 className="text-[15px] font-semibold">{s.title}</h2>
            <ul className="mt-2 space-y-2">
              {s.body.map((b) => (
                <li key={b} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                  {b}
                </li>
              ))}
            </ul>
          </Card>
        ))}

        <Card className="flex items-start gap-3 p-4">
          <IconTile tone="red" size={44}>
            <IconTrash size={20} />
          </IconTile>
          <div className="flex-1">
            <h2 className="text-[15px] font-semibold">Export or delete everything</h2>
            <p className="mt-1 text-[12px] text-muted">
              Profile → Data & privacy gives you a CSV export and a delete-account button. Deletion removes
              logs, notes, bookings and orders tied to your account.
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-3 p-4">
          <IconTile tone="gray" size={44}>
            <IconNote size={20} />
          </IconTile>
          <div className="flex-1">
            <h2 className="text-[15px] font-semibold">Not medical advice</h2>
            <p className="mt-1 text-[12px] text-muted">
              NourishLink provides dietitian-led nutrition guidance. It does not diagnose, prescribe or replace
              emergency care. In an emergency, contact your local emergency service.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
