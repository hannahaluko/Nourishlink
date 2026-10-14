"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { prettyDate } from "@/lib/format";
import { useToast } from "@/components/app-providers";
import { Avatar, Card, CircleButton, IconTile, Pill, ProgressBar, Tag } from "@/components/ui";
import { ChatSheet } from "@/components/log-sheets";
import {
  IconBack,
  IconCheck,
  IconChat,
  IconClipboard,
  IconFlame,
  IconLeaf,
  IconNote,
} from "@/components/icons";

export default function MealPlansPage() {
  const router = useRouter();
  const store = useStore();
  const { push } = useToast();
  const plans = store.mealPlans.filter((p) => p.clientId === store.profile.id);
  const [planId, setPlanId] = useState(plans[0]?.id ?? null);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  const [dayIndex, setDayIndex] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [chatOpen, setChatOpen] = useState(false);

  const appt = plan ? store.appointments.find((a) => a.dietitianId === plan.dietitianId) : undefined;

  if (!plan) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
        <header className="flex items-center gap-3 pt-5 pb-4">
          <CircleButton label="Back" size={44} onClick={() => router.back()}>
            <IconBack size={20} />
          </CircleButton>
          <h1 className="text-[17px] font-semibold">Meal plans</h1>
        </header>
        <Card className="flex flex-col items-center gap-2 py-10 text-center">
          <IconTile tone="lime" size={56} shape="circle">
            <IconClipboard size={24} />
          </IconTile>
          <p className="text-[15px] font-semibold">No meal plan yet</p>
          <p className="max-w-[250px] text-[12px] text-muted">
            Your dietitian assigns a plan after your first consult. It will appear here, meal by meal.
          </p>
          <Link
            href="/consults/book"
            className="press mt-2 rounded-full bg-lime px-5 py-3 text-[13px] font-semibold text-white"
          >
            Book a consult
          </Link>
        </Card>
      </div>
    );
  }

  const dietitian = store.dietitianById(plan.dietitianId);
  const day = plan.days[dayIndex];
  const totalMeals = plan.days.reduce((n, d) => n + d.items.length, 0);
  const ticked = Object.values(done).filter(Boolean).length;

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Assigned by your dietitian</p>
          <h1 className="truncate text-[17px] font-semibold">Meal plan</h1>
        </div>
        <CircleButton label="Message dietitian" size={44} onClick={() => setChatOpen(true)}>
          <IconChat size={20} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        <Card className="bg-lime-tint p-4">
          <div className="flex items-start gap-3">
            <IconTile tone="lime" size={44} shape="circle" className="bg-surface/80">
              <IconLeaf size={20} />
            </IconTile>
            <div className="min-w-0 flex-1">
              <h2 className="text-[18px] font-bold leading-tight">{plan.title}</h2>
              <p className="mt-1 text-[12px] text-ink/70">
                Created {prettyDate(plan.createdAt.slice(0, 10))} by {dietitian?.name}
              </p>
            </div>
          </div>
          <p className="mt-3 rounded-[16px] bg-surface/70 p-3 text-[12px] leading-relaxed text-ink">
            {plan.instructions}
          </p>
        </Card>

        {plans.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {plans.map((p) => (
              <Tag
                key={p.id}
                active={p.id === plan.id}
                onClick={() => {
                  setPlanId(p.id);
                  setDayIndex(0);
                }}
              >
                {p.title}
              </Tag>
            ))}
          </div>
        ) : null}

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold">Adherence</h2>
              <p className="mt-0.5 text-[12px] text-muted">
                {ticked} of {totalMeals} meals marked as eaten
              </p>
            </div>
            <Pill tone="lime">{Math.round((ticked / Math.max(1, totalMeals)) * 100)}%</Pill>
          </div>
          <ProgressBar className="mt-3" value={(ticked / Math.max(1, totalMeals)) * 100} />
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {plan.days.map((d, i) => (
            <Tag key={d.day} active={dayIndex === i} onClick={() => setDayIndex(i)}>
              {d.day}
            </Tag>
          ))}
        </div>

        <div className="space-y-3">
          {day.items.map((meal) => {
            const key = `${plan.id}_${day.day}_${meal.meal}`;
            const isDone = Boolean(done[key]);
            return (
              <Card key={key} className="p-4">
                <div className="flex items-start gap-3">
                  <IconTile
                    tone={meal.meal === "Breakfast" ? "orange" : meal.meal === "Lunch" ? "teal" : meal.meal === "Snack" ? "violet" : "blue"}
                    size={44}
                  >
                    <IconFlame size={20} />
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{meal.meal}</p>
                    <p className="text-[15px] font-semibold">{meal.title}</p>
                    <p className="mt-1 text-[12px] text-muted">{meal.items.join(" · ")}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-tint px-2 py-1 text-[11px] font-semibold text-amber">
                    <IconFlame size={12} />
                    {meal.kcal}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDone((d) => ({ ...d, [key]: !isDone }));
                      store.addMeal({
                        date: store.today,
                        type: meal.meal,
                        title: meal.title,
                        items: meal.items,
                        kcal: meal.kcal,
                      });
                      push(`${meal.meal} logged from your plan`);
                    }}
                    className={`press flex items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold ${
                      isDone ? "bg-lime-wash text-lime-dark" : "bg-lime text-white"
                    }`}
                  >
                    <IconCheck size={16} />
                    {isDone ? "Logged" : "I ate this"}
                  </button>
                  <button
                    type="button"
                    onClick={() => push("Swap request sent to your dietitian")}
                    className="press rounded-full bg-canvas py-3 text-[13px] font-semibold"
                  >
                    Swap this
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="flex items-start gap-3 p-4">
          <Avatar name={dietitian?.name ?? "Dietitian"} size={44} tone="teal" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold">{dietitian?.name}</p>
            <p className="mt-0.5 text-[12px] text-muted">
              Your plan updates after each follow-up. Message any time — swaps usually get answered the same
              day.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="press inline-flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2 text-[12px] font-semibold"
              >
                <IconChat size={14} />
                Message
              </button>
              <Link
                href="/consults/book"
                className="press inline-flex items-center gap-1.5 rounded-full bg-lime-wash px-3.5 py-2 text-[12px] font-semibold text-lime-dark"
              >
                <IconNote size={14} />
                Book follow-up
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <ChatSheet open={chatOpen} onClose={() => setChatOpen(false)} appointmentId={appt?.id ?? ""} />
    </div>
  );
}
