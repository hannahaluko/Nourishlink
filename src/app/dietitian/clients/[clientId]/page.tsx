"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { DEMO_DIETITIAN_ID } from "@/lib/seed";
import { bmi, bmiLabel, glucoseStatus, oneDecimal, prettyDate, prettyTime } from "@/lib/format";
import type { MealPlanItem, MealType } from "@/lib/types";
import { useToast } from "@/components/app-providers";
import {
  Avatar,
  Card,
  CircleButton,
  IconTile,
  Pill,
  ProgressBar,
  SectionHeader,
  Sheet,
  Tag,
  Value,
} from "@/components/ui";
import { GlucoseChart, WeightChart } from "@/components/charts";
import { ChatSheet } from "@/components/log-sheets";
import {
  IconBack,
  IconChat,
  IconCheck,
  IconClipboard,
  IconDroplet,
  IconFlame,
  IconLock,
  IconNote,
  IconPlus,
  IconScale,
  IconShield,
} from "@/components/icons";

type Tab = "overview" | "logs" | "notes" | "plan";

export default function ClientRecordPage() {
  const params = useParams<{ clientId: string }>();
  const router = useRouter();
  const store = useStore();
  const { push } = useToast();
  const client = store.clientById(params.clientId);
  const [tab, setTab] = useState<Tab>("overview");
  const [noteOpen, setNoteOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  if (!client) {
    return (
      <div className="mx-auto max-w-[520px] md:max-w-[760px] px-[18px] py-16 text-center">
        <p className="text-[15px] font-semibold">Client not found</p>
        <Link href="/dietitian" className="mt-3 inline-block text-[13px] font-semibold text-lime-dark">
          Back to caseload
        </Link>
      </div>
    );
  }

  const glucose = store.glucoseFor(client.id);
  const weights = store.weightsFor(client.id);
  const meals = store.mealsFor(client.id);
  const clientNotes = store.notes.filter((n) => n.clientId === client.id);
  const plan = store.mealPlans.find((p) => p.clientId === client.id);
  const appt = store.appointments.find(
    (a) => a.clientId === client.id && a.dietitianId === DEMO_DIETITIAN_ID,
  );
  const consentOn = store.consent.shareWithDietitian;
  const value = bmi(client.weightKg, client.heightCm);

  const [subjective, setSubjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [planText, setPlanText] = useState("");
  const [goalKcal, setGoalKcal] = useState(1800);

  const createPlan = () => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const template: MealPlanItem[] = [
      { meal: "Breakfast", title: "Oats, banana & almond milk", kcal: Math.round(goalKcal * 0.21), items: ["Rolled oats 60 g", "Banana", "Almond milk"] },
      { meal: "Lunch", title: "Ofada rice, grilled fish & ugu", kcal: Math.round(goalKcal * 0.35), items: ["Ofada rice 1 cup", "Tilapia", "Ugu stew"] },
      { meal: "Snack", title: "Greek yoghurt", kcal: Math.round(goalKcal * 0.1), items: ["Plain yoghurt 150 g"] },
      { meal: "Dinner", title: "Beans & boiled plantain", kcal: Math.round(goalKcal * 0.31), items: ["Honey beans 1 cup", "Unripe plantain"] },
    ];
    store.assignMealPlan({
      clientId: client.id,
      dietitianId: DEMO_DIETITIAN_ID,
      title: `${goalKcal} kcal · blood-sugar friendly rotation`,
      instructions:
        "Seven-day rotation built around the client's allergies and usual foods. Nothing deep-fried; keep the post-dinner walk.",
      days: dayNames.slice(0, 3).map((day) => ({ day, items: template })),
    });
    setPlanOpen(false);
    push("Meal plan assigned — client can see it now");
    setTab("plan");
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Client record</p>
          <h1 className="truncate text-[17px] font-semibold">{client.name}</h1>
        </div>
        <CircleButton label="Message client" size={44} onClick={() => setChatOpen(true)}>
          <IconChat size={20} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        {/* Identity + consent */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Avatar name={client.name} size={54} tone="blue" />
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-semibold">{client.name}</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {client.city} · {client.goals.join(" · ")}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Pill tone={consentOn ? "teal" : "red"}>
                  {consentOn ? <IconCheck size={12} /> : <IconLock size={12} />}
                  {consentOn ? "Sharing consented" : "Sharing revoked"}
                </Pill>
                {value ? <Pill tone="gray">BMI {oneDecimal(value)} · {bmiLabel(value)}</Pill> : null}
              </div>
            </div>
          </div>
          {client.allergies.length ? (
            <p className="mt-3 rounded-[14px] bg-red-tint p-2.5 text-[11px] font-semibold text-red">
              Allergies: {client.allergies.join(", ")}
            </p>
          ) : null}
          {!consentOn ? (
            <p className="mt-3 rounded-[14px] bg-canvas p-3 text-[11px] text-muted">
              This client has revoked sharing. Logs and history are hidden until they turn it back on — you keep
              access to notes you previously wrote.
            </p>
          ) : null}
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(
            [
              ["overview", "Overview"],
              ["logs", "Logs"],
              ["notes", "Notes"],
              ["plan", "Plan"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <Tag key={key} active={tab === key} onClick={() => setTab(key)}>
              {label}
            </Tag>
          ))}
        </div>

        {tab === "overview" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <span className="text-[12px] text-muted">Latest fasting</span>
                  <IconTile tone="red" size={32}>
                    <IconDroplet size={16} />
                  </IconTile>
                </div>
                <p className="mt-2">
                  <Value unit="mmol/L">
                    {glucose.find((g) => g.context === "Fasting")
                      ? oneDecimal(glucose.find((g) => g.context === "Fasting")!.value)
                      : "—"}
                  </Value>
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  {glucose[0] ? `Last reading ${prettyDate(glucose[0].date)}` : "No readings"}
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <span className="text-[12px] text-muted">Weight trend</span>
                  <IconTile tone="orange" size={32}>
                    <IconScale size={16} />
                  </IconTile>
                </div>
                <p className="mt-2">
                  <Value unit="kg">{weights.at(-1) ? oneDecimal(weights.at(-1)!.kg) : "—"}</Value>
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  {weights.length > 1
                    ? `${weights[0].kg - weights.at(-1)!.kg >= 0 ? "−" : "+"}${oneDecimal(
                        Math.abs(weights[0].kg - weights.at(-1)!.kg),
                      )} kg since start`
                    : "Not enough weigh-ins"}
                </p>
              </Card>
            </div>

            <Card className="p-4">
              <SectionHeader title="Clinical summary" className="mb-2" />
              <dl className="space-y-2 text-[13px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Conditions</dt>
                  <dd className="text-right font-medium">{client.conditions.join(", ") || "None"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Goals</dt>
                  <dd className="text-right font-medium">{client.goals.join(", ")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Meals logged</dt>
                  <dd className="text-right font-medium">{meals.length} entries</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Last consult</dt>
                  <dd className="text-right font-medium">
                    {appt ? `${prettyDate(appt.date)} · ${appt.status}` : "None"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Onboarded</dt>
                  <dd className="text-right font-medium">
                    {client.onboardedAt ? prettyDate(client.onboardedAt.slice(0, 10)) : "—"}
                  </dd>
                </div>
              </dl>
              {appt?.reason ? (
                <p className="mt-3 rounded-[14px] bg-canvas p-3 text-[12px] text-muted">
                  <span className="font-semibold text-ink">Reason for next session: </span>
                  {appt.reason}
                </p>
              ) : null}
            </Card>

            <Card className="p-4">
              <SectionHeader title="Adherence" className="mb-2" />
              <div className="space-y-3">
                {[
                  { label: "Meals logged", value: Math.min(100, meals.length * 6), tone: "orange" as const },
                  {
                    label: "Glucose in range",
                    value: Math.round(
                      (glucose.filter((g) => glucoseStatus(g.value).tone === "good").length /
                        Math.max(1, glucose.length)) *
                        100,
                    ),
                    tone: "teal" as const,
                  },
                  { label: "Weigh-ins", value: Math.min(100, weights.length * 14), tone: "blue" as const },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-muted">{m.label}</span>
                      <span className="font-semibold">{m.value}%</span>
                    </div>
                    <ProgressBar className="mt-1.5" value={m.value} tone={m.tone} />
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : null}

        {tab === "logs" ? (
          consentOn ? (
            <>
              <Card className="p-4">
                <SectionHeader title="Glucose readings" className="mb-2" />
                <GlucoseChart readings={glucose.slice(0, 14)} />
                <ul className="mt-2 divide-y divide-hairline">
                  {glucose.slice(0, 6).map((g) => {
                    const status = glucoseStatus(g.value);
                    return (
                      <li key={g.id} className="flex items-center gap-3 py-2.5">
                        <IconTile tone="red" size={34}>
                          <IconDroplet size={16} />
                        </IconTile>
                        <span className="flex-1 text-[13px]">
                          <span className="font-semibold">{oneDecimal(g.value)} mmol/L</span>
                          <span className="ml-2 text-[11px] text-muted">
                            {g.context} · {prettyDate(g.date)} {prettyTime(g.time)}
                          </span>
                        </span>
                        <Pill
                          tone={status.tone === "good" ? "teal" : status.tone === "warn" ? "amber" : "red"}
                        >
                          {status.label}
                        </Pill>
                      </li>
                    );
                  })}
                </ul>
              </Card>

              <Card className="p-4">
                <SectionHeader title="Weight" className="mb-2" />
                <WeightChart series={weights} />
                <p className="mt-2 text-[12px] text-muted">
                  {weights.length} weigh-ins · latest {weights.at(-1) ? prettyDate(weights.at(-1)!.date) : "—"}
                </p>
              </Card>

              <Card className="p-4">
                <SectionHeader title="Recent meals" className="mb-2" />
                <ul className="divide-y divide-hairline">
                  {meals
                    .slice(-6)
                    .reverse()
                    .map((m) => (
                      <li key={m.id} className="flex items-center gap-3 py-2.5">
                        <IconTile tone="orange" size={34}>
                          <IconFlame size={16} />
                        </IconTile>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium">{m.title}</span>
                          <span className="block text-[11px] text-muted">
                            {m.type} · {prettyDate(m.date)} · {m.items.join(", ")}
                          </span>
                        </span>
                        <span className="text-[12px] font-semibold text-muted">{m.kcal} kcal</span>
                      </li>
                    ))}
                </ul>
              </Card>
            </>
          ) : (
            <Card className="flex flex-col items-center gap-2 py-8 text-center">
              <IconTile tone="gray" size={52} shape="circle">
                <IconLock size={22} />
              </IconTile>
              <p className="text-[15px] font-semibold">Logs are hidden</p>
              <p className="max-w-[250px] text-[12px] text-muted">
                {client.name.split(" ")[0]} revoked sharing. Ask them to turn it back on to review their
                meals, glucose and weight.
              </p>
            </Card>
          )
        ) : null}

        {tab === "notes" ? (
          <>
            <button
              type="button"
              onClick={() => setNoteOpen(true)}
              className="press flex w-full items-center justify-center gap-2 rounded-full bg-lime py-3.5 text-[14px] font-semibold text-white"
            >
              <IconPlus size={18} />
              Write session note
            </button>
            {clientNotes.length === 0 ? (
              <Card className="flex flex-col items-center gap-2 py-8 text-center">
                <IconTile tone="orange" size={52} shape="circle">
                  <IconNote size={22} />
                </IconTile>
                <p className="text-[15px] font-semibold">No notes yet</p>
                <p className="max-w-[250px] text-[12px] text-muted">
                  Notes appear in the client&apos;s record and stay private between you and them.
                </p>
              </Card>
            ) : (
              clientNotes.map((n) => (
                <Card key={n.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <IconTile tone="teal" size={38}>
                      <IconNote size={18} />
                    </IconTile>
                    <div>
                      <p className="text-[14px] font-semibold">Session note</p>
                      <p className="text-[11px] text-muted">{prettyDate(n.date)}</p>
                    </div>
                  </div>
                  <dl className="mt-3 space-y-2.5 text-[12px] leading-relaxed">
                    {[
                      ["Subjective", n.subjective],
                      ["Assessment", n.assessment],
                      ["Plan", n.plan],
                    ].map(([label, body]) => (
                      <div key={label}>
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                          {label}
                        </dt>
                        <dd className="mt-0.5 text-ink">{body}</dd>
                      </div>
                    ))}
                  </dl>
                  <button
                    type="button"
                    onClick={() => {
                      setSubjective(n.subjective);
                      setAssessment(n.assessment);
                      setPlanText(n.plan);
                      setNoteOpen(true);
                    }}
                    className="press mt-3 w-full rounded-full bg-canvas py-2.5 text-[12px] font-semibold"
                  >
                    Duplicate & edit
                  </button>
                </Card>
              ))
            )}
          </>
        ) : null}

        {tab === "plan" ? (
          <>
            <button
              type="button"
              onClick={() => setPlanOpen(true)}
              className="press flex w-full items-center justify-center gap-2 rounded-full bg-lime py-3.5 text-[14px] font-semibold text-white"
            >
              <IconPlus size={18} />
              Assign new plan
            </button>
            {plan ? (
              <Card className="p-4">
                <SectionHeader title="Current plan" href="/meal-plans" action="Client view" className="mb-2" />
                <p className="text-[15px] font-semibold">{plan.title}</p>
                <p className="mt-1 text-[12px] text-muted">
                  Assigned {prettyDate(plan.createdAt.slice(0, 10))} · {plan.days.length} day rotation
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">{plan.instructions}</p>
                <div className="mt-3 space-y-2">
                  {plan.days.map((d) => (
                    <div key={d.day} className="rounded-[16px] bg-canvas p-3">
                      <p className="text-[12px] font-semibold">{d.day}</p>
                      <ul className="mt-1 space-y-1">
                        {d.items.map((i) => (
                          <li key={`${d.day}-${i.meal}`} className="flex justify-between text-[12px]">
                            <span className="text-muted">
                              {i.meal}: {i.title}
                            </span>
                            <span className="font-medium">{i.kcal} kcal</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col items-center gap-2 py-8 text-center">
                <IconTile tone="teal" size={52} shape="circle">
                  <IconClipboard size={22} />
                </IconTile>
                <p className="text-[15px] font-semibold">No plan assigned</p>
                <p className="max-w-[250px] text-[12px] text-muted">
                  Build a rotation from the template, set the calorie target, and the client sees it instantly.
                </p>
              </Card>
            )}
          </>
        ) : null}
      </div>

      {/* Note sheet */}
      <Sheet
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Session note"
        footer={
          <button
            type="button"
            onClick={() => {
              store.saveNote({
                appointmentId: appt?.id ?? "a_adhoc",
                clientId: client.id,
                dietitianId: DEMO_DIETITIAN_ID,
                date: store.today,
                subjective,
                assessment,
                plan: planText,
              });
              setSubjective("");
              setAssessment("");
              setPlanText("");
              setNoteOpen(false);
              push("Note saved to the shared record");
            }}
            className="press w-full rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white"
          >
            Save note
          </button>
        }
      >
        <div className="space-y-3">
          {[
            { label: "Subjective — what the client reports", value: subjective, set: setSubjective, placeholder: "Reports evening cravings, skipped breakfast twice…" },
            { label: "Assessment — your clinical read", value: assessment, set: setAssessment, placeholder: "Fasting glucose trending down, adherence to plan ~70%…" },
            { label: "Plan — what changes next", value: planText, set: setPlanText, placeholder: "Swap evening rice, add 20-minute walk, recheck in 2 weeks…" },
          ].map((f) => (
            <label key={f.label} className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-muted">{f.label}</span>
              <textarea
                rows={3}
                value={f.value}
                placeholder={f.placeholder}
                onChange={(e) => f.set(e.target.value)}
                className="w-full rounded-[16px] bg-canvas px-3.5 py-3 text-[13px] outline-none focus:ring-2 focus:ring-lime/60"
              />
            </label>
          ))}
          <p className="flex items-start gap-2 rounded-[14px] bg-canvas p-3 text-[11px] text-muted">
            <IconShield size={14} className="mt-0.5 shrink-0" />
            Notes are health data: visible to you and this client only, and logged for audit.
          </p>
        </div>
      </Sheet>

      {/* Plan sheet */}
      <Sheet
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        title="Assign meal plan"
        footer={
          <button
            type="button"
            onClick={createPlan}
            className="press w-full rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white"
          >
            Assign plan
          </button>
        }
      >
        <div className="space-y-4">
          <div className="rounded-[16px] bg-canvas p-3">
            <p className="text-[12px] text-muted">
              Template: <span className="font-semibold text-ink">blood-sugar friendly rotation</span>
            </p>
            <p className="mt-1 text-[11px] text-muted">
              Built around {client.conditions.join(", ").toLowerCase()}.{" "}
              {client.allergies.length ? `Allergens excluded: ${client.allergies.join(", ")}.` : ""}
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-[12px] font-medium text-muted">Daily calorie target</p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1400}
                max={2600}
                step={100}
                value={goalKcal}
                onChange={(e) => setGoalKcal(Number(e.target.value))}
                aria-label="Calorie target"
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-hatch accent-lime"
              />
              <span className="tnum w-[74px] text-right text-[15px] font-semibold">{goalKcal} kcal</span>
            </div>
          </div>
          <div className="space-y-2">
            {(["Breakfast", "Lunch", "Snack", "Dinner"] as MealType[]).map((m) => (
              <div key={m} className="flex items-center justify-between rounded-[14px] bg-canvas px-3 py-2.5">
                <span className="text-[12px] font-semibold">{m}</span>
                <span className="text-[11px] text-muted">
                  {Math.round(goalKcal * (m === "Lunch" ? 0.35 : m === "Dinner" ? 0.31 : m === "Breakfast" ? 0.21 : 0.1))}{" "}
                  kcal
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted">
            You can edit individual meals after assigning. The client gets a notification and can tick meals off.
          </p>
        </div>
      </Sheet>

      <ChatSheet open={chatOpen} onClose={() => setChatOpen(false)} appointmentId={appt?.id ?? ""} />
    </div>
  );
}
