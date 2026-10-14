"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { bmi, bmiLabel, naira, oneDecimal, prettyDate, prettyTime } from "@/lib/format";
import type { Condition, Goal } from "@/lib/types";
import { useToast } from "@/components/app-providers";
import {
  Avatar,
  Card,
  CircleButton,
  IconTile,
  Pill,
  SectionHeader,
  Sheet,
  Tag,
  Toggle,
} from "@/components/ui";
import {
  IconBag,
  IconCheck,
  IconChevronRight,
  IconClipboard,
  IconGrid,
  IconLeaf,
  IconLogout,
  IconNote,
  IconShield,
  IconTrash,
  IconTrend,
  IconUser,
  IconVerified,
  IconVideo,
} from "@/components/icons";

const GOALS: Goal[] = [
  "Lose weight",
  "Manage blood sugar",
  "Lower blood pressure",
  "Eat healthier",
  "Build muscle",
  "Gain weight",
];
const CONDITIONS: Condition[] = [
  "Type 2 diabetes",
  "Hypertension",
  "Obesity",
  "High cholesterol",
  "PCOS",
  "None",
];
const ALLERGIES = ["Peanuts", "Shellfish", "Lactose", "Gluten", "Eggs", "Soy", "Tree nuts"];

export default function ProfilePage() {
  const router = useRouter();
  const store = useStore();
  const { push } = useToast();
  const { profile, consent, reminders, appointments, orders, dietitianById, activeRole } = store;

  const [editOpen, setEditOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>(profile.goals);
  const [conditions, setConditions] = useState<Condition[]>(profile.conditions);
  const [allergies, setAllergies] = useState<string[]>(profile.allergies);
  const [heightCm, setHeightCm] = useState(profile.heightCm ?? 168);
  const [weightKg, setWeightKg] = useState(profile.weightKg ?? 82);

  const myAppointments = appointments.filter((a) => a.clientId === profile.id);
  const myOrders = orders.filter((o) => o.clientId === profile.id);
  const value = bmi(profile.weightKg, profile.heightCm);
  const myReminders = reminders.filter((r) => r.clientId === profile.id);

  const toggle = <T,>(list: T[], v: T) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const exportCsv = () => {
    const lines = [
      "type,date,time,detail,value",
      ...store
        .mealsFor(profile.id)
        .map((m) => `meal,${m.date},${m.loggedAt.slice(11, 16)},"${m.title}",${m.kcal} kcal`),
      ...store
        .glucoseFor(profile.id)
        .map((g) => `glucose,${g.date},${g.time},${g.context},${g.value} mmol/L`),
      ...store.weightsFor(profile.id).map((w) => `weight,${w.date},,weigh-in,${w.kg} kg`),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nourishlink-health-record.csv";
    a.click();
    URL.revokeObjectURL(url);
    push("Health record exported as CSV");
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] md:max-w-[720px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <Avatar name={profile.name} size={46} tone="lime" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-muted">{profile.email}</p>
          <h1 className="truncate text-[17px] font-semibold">{profile.name}</h1>
        </div>
        <Pill tone="lime" className="capitalize">
          {activeRole}
        </Pill>
      </header>

      <div className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Consults", value: `${myAppointments.length}`, icon: <IconVideo size={17} />, tone: "blue" as const },
            { label: "Logs", value: `${store.mealsFor(profile.id).length + store.glucoseFor(profile.id).length}`, icon: <IconTrend size={17} />, tone: "teal" as const },
            { label: "Orders", value: `${myOrders.length}`, icon: <IconBag size={17} />, tone: "orange" as const },
          ].map((s) => (
            <Card key={s.label} className="p-3">
              <div className="flex items-start justify-between">
                <span className="text-[11px] text-muted">{s.label}</span>
                <IconTile tone={s.tone} size={30}>
                  {s.icon}
                </IconTile>
              </div>
              <p className="tnum mt-2 text-[20px] font-semibold">{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Health profile */}
        <Card className="p-4">
          <SectionHeader
            title="Health profile"
            className="mb-2"
          />
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Goals</dt>
              <dd className="text-right font-medium">{profile.goals.join(", ") || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Conditions</dt>
              <dd className="text-right font-medium">{profile.conditions.join(", ") || "None"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Allergies</dt>
              <dd className="text-right font-medium text-red">{profile.allergies.join(", ") || "None"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Height / weight</dt>
              <dd className="text-right font-medium">
                {profile.heightCm} cm · {profile.weightKg} kg
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">BMI</dt>
              <dd className="text-right font-medium">
                {value ? `${oneDecimal(value)} · ${bmiLabel(value)}` : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Location</dt>
              <dd className="text-right font-medium">{profile.city}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="press mt-3 w-full rounded-full bg-canvas py-3 text-[13px] font-semibold"
          >
            Edit health profile
          </button>
        </Card>

        {/* Consent */}
        <Card className="p-4">
          <SectionHeader title="Consent & privacy" className="mb-2" />
          <ul className="divide-y divide-hairline">
            <li className="flex items-center gap-3 py-3">
              <IconTile tone="lime" size={38}>
                <IconVerified size={18} />
              </IconTile>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">Share with my dietitian</span>
                <span className="block text-[11px] text-muted">
                  {consent.shareWithDietitian ? "On · booked dietitians can see logs" : "Off · logs stay private"}
                </span>
              </span>
              <Toggle
                checked={consent.shareWithDietitian}
                onChange={(v) => {
                  store.setConsent({ shareWithDietitian: v });
                  push(v ? "Sharing enabled" : "Sharing revoked");
                }}
                label="Share with dietitian"
              />
            </li>
            <li className="flex items-center gap-3 py-3">
              <IconTile tone="blue" size={38}>
                <IconNote size={18} />
              </IconTile>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">Reminders</span>
                <span className="block text-[11px] text-muted">Logging nudges and consult reminders</span>
              </span>
              <Toggle
                checked={consent.reminders}
                onChange={(v) => store.setConsent({ reminders: v })}
                label="Reminders"
              />
            </li>
            <li className="flex items-center gap-3 py-3">
              <IconTile tone="gray" size={38}>
                <IconShield size={18} />
              </IconTile>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">Process health data</span>
                <span className="block text-[11px] text-muted">
                  Required for tracking · agreed {consent.agreedAt?.slice(0, 10) ?? "—"}
                </span>
              </span>
              <Pill tone="teal">
                <IconCheck size={12} />
                On
              </Pill>
            </li>
          </ul>
          <Link
            href="/privacy"
            className="press mt-2 flex items-center justify-between rounded-[16px] bg-canvas p-3 text-[13px] font-semibold"
          >
            Read the privacy policy
            <IconChevronRight size={17} className="text-faint" />
          </Link>
        </Card>

        {/* Reminders */}
        <Card className="p-4">
          <SectionHeader title="Upcoming reminders" className="mb-1" />
          <ul className="divide-y divide-hairline">
            {myReminders.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <span
                  role="checkbox"
                  aria-checked={r.done}
                  tabIndex={0}
                  onClick={() => store.toggleReminder(r.id)}
                  onKeyDown={(e) => e.key === "Enter" && store.toggleReminder(r.id)}
                  className={`press grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                    r.done ? "bg-lime text-white" : "bg-canvas text-faint"
                  }`}
                >
                  <IconCheck size={13} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-[13px] font-medium ${r.done ? "text-faint line-through" : ""}`}
                  >
                    {r.title}
                  </span>
                  <span className="block text-[11px] text-muted">
                    {prettyDate(r.when.slice(0, 10))} · {prettyTime(r.when.slice(11, 16))}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* My dietitians */}
        <Card className="p-4">
          <SectionHeader title="My dietitians" href="/consults/book" action="Find another" className="mb-1" />
          <ul className="divide-y divide-hairline">
            {Array.from(new Set(myAppointments.map((a) => a.dietitianId))).map((id) => {
              const d = dietitianById(id);
              if (!d) return null;
              const appt = myAppointments.find((a) => a.dietitianId === id);
              return (
                <li key={id} className="flex items-center gap-3 py-3">
                  <Avatar name={d.name} size={40} tone="teal" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{d.name}</span>
                    <span className="block truncate text-[11px] text-muted">
                      {appt ? `${prettyDate(appt.date)} · ${prettyTime(appt.time)}` : d.city}
                    </span>
                  </span>
                  <CircleButton label={`Open ${d.name}`} href={`/consults/book/${d.id}`} size={32} className="bg-canvas">
                    <IconChevronRight size={16} />
                  </CircleButton>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Payments */}
        <Card className="p-4">
          <SectionHeader title="Payments & receipts" className="mb-1" />
          <ul className="divide-y divide-hairline">
            {[
              ...myAppointments
                .filter((a) => a.payment !== "unpaid")
                .map((a) => ({
                  id: a.id,
                  label: `Consult · ${dietitianById(a.dietitianId)?.name ?? ""}`,
                  amount: a.fee,
                  status: a.payment,
                  date: a.date,
                })),
              ...myOrders.map((o) => ({
                id: o.id,
                label: `Order ${o.reference}`,
                amount: o.total,
                status: o.payment,
                date: o.placedAt.slice(0, 10),
              })),
            ]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <IconTile tone={p.status === "refunded" ? "red" : "teal"} size={38}>
                    <IconLeaf size={18} />
                  </IconTile>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{p.label}</span>
                    <span className="block text-[11px] text-muted">{prettyDate(p.date)}</span>
                  </span>
                  <span className="text-right">
                    <span className="tnum block text-[13px] font-semibold">{naira(p.amount)}</span>
                    <span
                      className={`block text-[11px] capitalize ${
                        p.status === "refunded" ? "text-red" : "text-muted"
                      }`}
                    >
                      {p.status}
                    </span>
                  </span>
                </li>
              ))}
          </ul>
        </Card>

        {/* Role switcher */}
        <Card className="p-4">
          <SectionHeader title="Switch workspace" className="mb-2" />
          <p className="text-[12px] text-muted">
            This prototype ships with all three roles so you can review the full flow.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { role: "client" as const, label: "Client", icon: <IconUser size={18} /> },
              { role: "dietitian" as const, label: "Dietitian", icon: <IconVerified size={18} /> },
              { role: "admin" as const, label: "Admin", icon: <IconGrid size={18} /> },
            ].map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => {
                  store.setRole(r.role);
                  router.push(r.role === "client" ? "/app" : r.role === "dietitian" ? "/dietitian" : "/admin");
                }}
                aria-pressed={activeRole === r.role}
                className={`press flex flex-col items-center gap-2 rounded-[16px] py-3 text-[12px] font-semibold ${
                  activeRole === r.role ? "bg-lime-tint" : "bg-canvas text-muted"
                }`}
              >
                <IconTile tone={activeRole === r.role ? "lime" : "gray"} size={34} shape="circle">
                  {r.icon}
                </IconTile>
                {r.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Data & privacy actions */}
        <Card className="p-4">
          <SectionHeader title="Data & privacy" className="mb-2" />
          <div className="space-y-2">
            <button
              type="button"
              onClick={exportCsv}
              className="press flex w-full items-center gap-3 rounded-[16px] bg-canvas p-3 text-left"
            >
              <IconTile tone="blue" size={38}>
                <IconClipboard size={18} />
              </IconTile>
              <span className="flex-1">
                <span className="block text-[13px] font-semibold">Export my health record</span>
                <span className="block text-[11px] text-muted">CSV of meals, glucose and weight</span>
              </span>
              <IconChevronRight size={17} className="text-faint" />
            </button>
            <button
              type="button"
              onClick={() => {
                store.resetDemo();
                push("Demo data restored");
              }}
              className="press flex w-full items-center gap-3 rounded-[16px] bg-canvas p-3 text-left"
            >
              <IconTile tone="amber" size={38}>
                <IconTrend size={18} />
              </IconTile>
              <span className="flex-1">
                <span className="block text-[13px] font-semibold">Reset demo data</span>
                <span className="block text-[11px] text-muted">Restores the seeded logs and bookings</span>
              </span>
              <IconChevronRight size={17} className="text-faint" />
            </button>
            <button
              type="button"
              onClick={() => {
                store.updateProfile({ onboardedAt: null });
                push("Account marked for deletion — everything cleared");
                router.push("/signup");
              }}
              className="press flex w-full items-center gap-3 rounded-[16px] bg-red-tint p-3 text-left text-red"
            >
              <IconTile tone="red" size={38}>
                <IconTrash size={18} />
              </IconTile>
              <span className="flex-1">
                <span className="block text-[13px] font-semibold">Delete account and health data</span>
                <span className="block text-[11px] opacity-80">Immediate and irreversible</span>
              </span>
            </button>
          </div>
        </Card>

        <button
          type="button"
          onClick={() => {
            store.setRole("client");
            push("Signed out");
            router.push("/");
          }}
          className="press flex w-full items-center justify-center gap-2 rounded-full bg-surface py-3.5 text-[14px] font-semibold text-muted"
        >
          <IconLogout size={18} />
          Sign out
        </button>

        <p className="px-1 text-[11px] text-muted">
          NourishLink prototype · version 0.1.0 · data stored locally in this browser.
        </p>
      </div>

      {/* Edit sheet */}
      <Sheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit health profile"
        footer={
          <button
            type="button"
            onClick={() => {
              store.updateProfile({ goals, conditions, allergies, heightCm, weightKg });
              store.addWeight({ date: store.today, kg: weightKg });
              setEditOpen(false);
              push("Health profile updated");
            }}
            className="press w-full rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white"
          >
            Save changes
          </button>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[12px] font-medium text-muted">Goals</p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <Tag key={g} active={goals.includes(g)} onClick={() => setGoals((prev) => toggle(prev, g))}>
                  {g}
                </Tag>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[12px] font-medium text-muted">Conditions</p>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <Tag
                  key={c}
                  active={conditions.includes(c)}
                  onClick={() => setConditions((prev) => toggle(prev, c))}
                >
                  {c}
                </Tag>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[12px] font-medium text-muted">Allergies</p>
            <div className="flex flex-wrap gap-2">
              {ALLERGIES.map((a) => (
                <Tag key={a} active={allergies.includes(a)} onClick={() => setAllergies((prev) => toggle(prev, a))}>
                  {a}
                </Tag>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-muted">Height (cm)</span>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full rounded-[16px] bg-canvas px-3.5 py-3 text-[14px] outline-none focus:ring-2 focus:ring-lime/60"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-muted">Weight (kg)</span>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full rounded-[16px] bg-canvas px-3.5 py-3 text-[14px] outline-none focus:ring-2 focus:ring-lime/60"
              />
            </label>
          </div>
          <p className="text-[11px] text-muted">
            Changing your weight also records a weigh-in for today so your trend stays honest.
          </p>
        </div>
      </Sheet>
    </div>
  );
}
