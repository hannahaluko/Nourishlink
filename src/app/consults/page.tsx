"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { naira, prettyDate, prettyTime, todayISO } from "@/lib/format";
import { useToast } from "@/components/app-providers";
import { Card, CircleButton, IconTile, Pill, SectionHeader, Tag } from "@/components/ui";
import { ChatSheet } from "@/components/log-sheets";
import {
  IconCalendar,
  IconChat,
  IconChevronRight,
  IconClipboard,
  IconPlus,
  IconUser,
  IconVerified,
  IconVideo,
} from "@/components/icons";

export default function ConsultsPage() {
  const store = useStore();
  const { profile, appointments, dietitianById, mealPlans, activeRole } = store;
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [chatId, setChatId] = useState<string | null>(null);
  const { push } = useToast();

  const today = todayISO();
  const mine = appointments
    .filter((a) =>
      activeRole === "dietitian" ? a.dietitianId === "d_ngozi" : a.clientId === profile.id,
    )
    .slice()
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  const upcoming = mine
    .filter((a) => a.date >= today && a.status !== "completed" && a.status !== "cancelled")
    .reverse();
  const past = mine.filter((a) => !upcoming.includes(a));
  const list = tab === "upcoming" ? upcoming : past;
  const plan = mealPlans.find((p) => p.clientId === profile.id);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] md:max-w-[760px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">
            {activeRole === "client" ? "Your care" : "Your practise"}
          </p>
          <h1 className="truncate text-[17px] font-semibold">Consults</h1>
        </div>
        <CircleButton label="Book a consult" href="/consults/book" size={44} variant="lime">
          <IconPlus size={20} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        <Card className="flex items-center gap-3 bg-lime-tint p-4">
          <IconTile tone="lime" size={44} shape="circle" className="bg-surface/80">
            <IconVideo size={20} />
          </IconTile>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">Talk to a verified dietitian</p>
            <p className="mt-0.5 text-[12px] text-ink/70">
              Video or chat, from ₦12,000. Follow-ups keep your plan on track.
            </p>
          </div>
          <Link
            href="/consults/book"
            className="press rounded-full bg-surface px-3.5 py-2 text-[13px] font-semibold text-lime-dark"
          >
            Find
          </Link>
        </Card>

        <div className="flex gap-2">
          <Tag active={tab === "upcoming"} onClick={() => setTab("upcoming")}>
            Upcoming ({upcoming.length})
          </Tag>
          <Tag active={tab === "past"} onClick={() => setTab("past")}>
            Past ({past.length})
          </Tag>
        </div>

        {list.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-8 text-center">
            <IconTile tone="blue" size={52} shape="circle">
              <IconCalendar size={22} />
            </IconTile>
            <p className="text-[15px] font-semibold">
              {tab === "upcoming" ? "No upcoming consults" : "No past consults"}
            </p>
            <p className="max-w-[240px] text-[12px] text-muted">
              {tab === "upcoming"
                ? "Book a session and your dietitian will see your logs before you meet."
                : "Completed sessions and their notes will show up here."}
            </p>
            <Link
              href="/consults/book"
              className="press mt-2 rounded-full bg-lime px-4 py-2.5 text-[13px] font-semibold text-white"
            >
              Find a dietitian
            </Link>
          </Card>
        ) : (
          list.map((a) => {
            const dietitian = dietitianById(a.dietitianId);
            const client = store.clientById(a.clientId);
            return (
              <Card key={a.id} className="p-4">
                <div className="flex items-start gap-3">
                  <IconTile tone={a.mode === "video" ? "lime" : "violet"} size={46} shape="circle">
                    {a.mode === "video" ? <IconVideo size={20} /> : <IconChat size={20} />}
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[15px] font-semibold">
                        {dietitian?.name ?? "Dietitian"}
                      </p>
                      <IconVerified size={14} className="text-lime-dark" />
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {prettyDate(a.date)} · {prettyTime(a.time)} · {a.mode}
                    </p>
                    {activeRole !== "client" ? (
                      <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted">
                        <IconUser size={12} />
                        {client?.name}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Pill
                        tone={
                          a.status === "confirmed"
                            ? "teal"
                            : a.status === "pending"
                              ? "amber"
                              : a.status === "cancelled"
                                ? "red"
                                : "gray"
                        }
                      >
                        {a.payment === "unpaid" ? "Awaiting payment" : a.status}
                      </Pill>
                      <Pill tone="gray">{naira(a.fee)}</Pill>
                    </div>
                  </div>
                  <CircleButton label="Open consult" href={`/consults/${a.id}`} size={36} className="bg-canvas">
                    <IconChevronRight size={18} />
                  </CircleButton>
                </div>

                {a.payment === "unpaid" ? (
                  <Link
                    href={`/consults/${a.id}`}
                    className="press mt-3 block rounded-[16px] bg-lime py-3 text-center text-[13px] font-semibold text-white"
                  >
                    Complete payment
                  </Link>
                ) : a.date >= today ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setChatId(a.id)}
                      className="press flex items-center justify-center gap-2 rounded-[16px] bg-canvas py-3 text-[13px] font-semibold"
                    >
                      <IconChat size={16} />
                      Message
                    </button>
                    <Link
                      href={`/consult/room/${a.id}`}
                      className="press flex items-center justify-center gap-2 rounded-[16px] bg-lime py-3 text-[13px] font-semibold text-white"
                    >
                      <IconVideo size={16} />
                      Join room
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => push("Notes are in your shared record")}
                    className="press mt-3 flex w-full items-center justify-center gap-2 rounded-[16px] bg-canvas py-3 text-[13px] font-semibold"
                  >
                    <IconClipboard size={16} />
                    View session notes
                  </button>
                )}
              </Card>
            );
          })
        )}

        {plan ? (
          <Card className="p-4">
            <SectionHeader title="Assigned meal plan" href="/meal-plans" action="Open" className="mb-2" />
            <p className="text-[15px] font-semibold">{plan.title}</p>
            <p className="mt-1 text-[12px] text-muted">
              From {dietitianById(plan.dietitianId)?.name} · {plan.days.length}-day rotation
            </p>
            <p className="mt-2 text-[13px] leading-relaxed">{plan.instructions}</p>
          </Card>
        ) : null}
      </div>

      <ChatSheet open={chatId !== null} onClose={() => setChatId(null)} appointmentId={chatId ?? ""} />
    </div>
  );
}
