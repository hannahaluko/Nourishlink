"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Condition, Goal } from "@/lib/types";
import { Card, IconTile, ProgressBar, Tag, Toggle } from "@/components/ui";
import {
  IconArrowRight,
  IconCheck,
  IconDroplet,
  IconLeaf,
  IconLock,
  IconShield,
  IconSparkle,
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

const STEPS = ["About you", "Your goals", "Health", "Consent"];

export default function OnboardingPage() {
  const store = useStore();
  const router = useRouter();
  const { profile, consent } = store;

  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [city, setCity] = useState(profile.city);
  const [heightCm, setHeightCm] = useState(profile.heightCm ?? 168);
  const [weightKg, setWeightKg] = useState(profile.weightKg ?? 82);
  const [goals, setGoals] = useState<Goal[]>(profile.goals);
  const [conditions, setConditions] = useState<Condition[]>(profile.conditions);
  const [allergies, setAllergies] = useState<string[]>(profile.allergies);
  const [share, setShare] = useState(consent.shareWithDietitian);
  const [reminders, setReminders] = useState(consent.reminders);
  const [processing, setProcessing] = useState(false);

  const toggle = <T,>(list: T[], value: T, set: (next: T[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const finish = () => {
    store.setConsent({
      shareWithDietitian: share,
      reminders,
      dataProcessing: true,
      agreedAt: new Date().toISOString(),
    });
    store.completeOnboarding({
      name,
      email,
      phone,
      city,
      heightCm,
      weightKg,
      goals,
      conditions,
      allergies,
    });
    router.push("/app");
  };

  const canContinue =
    step === 0
      ? name.trim().length > 1 && email.includes("@") && city.trim().length > 1
      : step === 1
        ? goals.length > 0
        : step === 2
          ? true
          : processing;

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] py-6">
      <div className="flex items-center gap-3">
        <IconTile tone="lime" size={40}>
          <IconLeaf size={20} />
        </IconTile>
        <div className="flex-1">
          <p className="text-[13px] text-muted">
            Step {step + 1} of {STEPS.length}
          </p>
          <h1 className="text-[17px] font-semibold">{STEPS[step]}</h1>
        </div>
      </div>

      <ProgressBar className="mt-4" value={((step + 1) / STEPS.length) * 100} />

      <div className="mt-4 space-y-3">
        {step === 0 ? (
          <Card className="space-y-4 p-4">
            <p className="text-[13px] text-muted">
              We use this to match you with dietitians near you and to size your plans properly.
            </p>
            {[
              { label: "Full name", value: name, set: setName, type: "text", placeholder: "Amara Okonkwo" },
              { label: "Email", value: email, set: setEmail, type: "email", placeholder: "you@email.com" },
              { label: "Phone", value: phone, set: setPhone, type: "tel", placeholder: "+234 800 000 0000" },
              { label: "City / area", value: city, set: setCity, type: "text", placeholder: "Lekki, Lagos" },
            ].map((f) => (
              <label key={f.label} className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-muted">{f.label}</span>
                <input
                  type={f.type}
                  value={f.value}
                  placeholder={f.placeholder}
                  onChange={(e) => f.set(e.target.value)}
                  className="w-full rounded-[16px] bg-canvas px-3.5 py-3 text-[14px] outline-none focus:ring-2 focus:ring-lime/60"
                />
              </label>
            ))}
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
          </Card>
        ) : null}

        {step === 1 ? (
          <Card className="p-4">
            <p className="text-[13px] text-muted">
              Pick everything that matters to you. Your dietitian uses these to shape the plan.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <Tag key={g} active={goals.includes(g)} onClick={() => toggle(goals, g, setGoals)}>
                  {g}
                </Tag>
              ))}
            </div>
            <div className="mt-4 rounded-[16px] bg-canvas p-3">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold">
                <IconSparkle size={14} className="text-lime-dark" />
                {goals.length} selected
              </p>
              <p className="mt-0.5 text-[11px] text-muted">
                {goals.length > 1
                  ? "We will rank dietitians who specialise in your primary goal first."
                  : goals.length === 1
                    ? "Consider adding a second goal — most people have two."
                    : "Pick at least one goal to continue."}
              </p>
            </div>
          </Card>
        ) : null}

        {step === 2 ? (
          <>
            <Card className="p-4">
              <h2 className="text-[15px] font-semibold">Conditions we should plan around</h2>
              <p className="mt-1 text-[12px] text-muted">
                This is health data. It stays private and is only shared with a dietitian you book.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <Tag
                    key={c}
                    active={conditions.includes(c)}
                    onClick={() => toggle(conditions, c, setConditions)}
                  >
                    {c}
                  </Tag>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h2 className="text-[15px] font-semibold">Allergies and foods to avoid</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {ALLERGIES.map((a) => (
                  <Tag key={a} active={allergies.includes(a)} onClick={() => toggle(allergies, a, setAllergies)}>
                    {a}
                  </Tag>
                ))}
              </div>
            </Card>
            <Card className="flex items-start gap-3 p-4">
              <IconTile tone="blue" size={42}>
                <IconDroplet size={20} />
              </IconTile>
              <p className="text-[12px] text-muted">
                You can log meals, glucose and weight right away. Wearable and CGM sync is not part of v1 —
                readings are entered manually or imported from a CSV later.
              </p>
            </Card>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <IconTile tone="lime" size={40}>
                  <IconShield size={19} />
                </IconTile>
                <h2 className="text-[15px] font-semibold">Consent</h2>
              </div>
              <ul className="mt-3 space-y-3">
                <li className="flex items-start gap-3">
                  <Toggle checked={processing} onChange={setProcessing} label="Health data processing" />
                  <span className="flex-1">
                    <span className="block text-[13px] font-semibold">
                      Process my health data (required)
                    </span>
                    <span className="block text-[12px] text-muted">
                      Needed to store your logs, run reminders, and show trends. Data is encrypted and kept
                      under NDPR/GDPR rules.
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Toggle checked={share} onChange={setShare} label="Share with dietitian" />
                  <span className="flex-1">
                    <span className="block text-[13px] font-semibold">
                      Share my record with a dietitian I book
                    </span>
                    <span className="block text-[12px] text-muted">
                      Only the dietitian you book can see your profile and logs, for as long as you keep
                      sharing on.
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Toggle checked={reminders} onChange={setReminders} label="Reminders" />
                  <span className="flex-1">
                    <span className="block text-[13px] font-semibold">Send logging reminders</span>
                    <span className="block text-[12px] text-muted">
                      Evening nudges when a day has no entries, plus consult reminders.
                    </span>
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="flex items-start gap-3 p-4">
              <IconTile tone="gray" size={40}>
                <IconLock size={19} />
              </IconTile>
              <p className="text-[12px] text-muted">
                We never sell health data and never show it to vendors. Read the full{" "}
                <Link href="/privacy" className="font-semibold text-lime-dark">
                  privacy policy
                </Link>
                . You can export or delete everything from Profile.
              </p>
            </Card>

            <Card className="p-4">
              <h2 className="text-[15px] font-semibold">Your summary</h2>
              <dl className="mt-2 space-y-2 text-[13px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Goals</dt>
                  <dd className="text-right font-medium">{goals.join(", ") || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Conditions</dt>
                  <dd className="text-right font-medium">{conditions.join(", ") || "None"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Allergies</dt>
                  <dd className="text-right font-medium">{allergies.join(", ") || "None"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Location</dt>
                  <dd className="text-right font-medium">{city}</dd>
                </div>
              </dl>
            </Card>
          </>
        ) : null}
      </div>

      <div className="mt-5 flex items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="press rounded-full bg-surface px-5 py-3.5 text-[14px] font-semibold"
          >
            Back
          </button>
        ) : null}
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => (step === STEPS.length - 1 ? finish() : setStep((s) => s + 1))}
          className="press flex flex-1 items-center justify-center gap-2 rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white disabled:opacity-50"
        >
          {step === STEPS.length - 1 ? (
            <>
              <IconCheck size={18} />
              Finish setup
            </>
          ) : (
            <>
              Continue
              <IconArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted">
        Prototype data stays in your browser. Reset it any time from Profile.
      </p>
    </div>
  );
}
