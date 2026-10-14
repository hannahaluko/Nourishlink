"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { prettyLongDate, prettyTime } from "@/lib/format";
import { useToast } from "@/components/app-providers";
import { Avatar, Card, CircleButton, IconTile, Pill } from "@/components/ui";
import {
  IconBack,
  IconChat,
  IconCheck,
  IconClipboard,
  IconDroplet,
  IconLeaf,
  IconScale,
  IconShield,
  IconVideo,
} from "@/components/icons";

export default function ConsultRoomPage() {
  const params = useParams<{ appointmentId: string }>();
  const router = useRouter();
  const store = useStore();
  const { push } = useToast();
  const appt = store.appointments.find((a) => a.id === params.appointmentId);
  const dietitian = appt ? store.dietitianById(appt.dietitianId) : undefined;

  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [joined, setJoined] = useState(false);
  const [shareScreen, setShareScreen] = useState(false);

  useEffect(() => {
    if (!joined) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [joined]);

  const clock = `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  if (!appt) {
    return (
      <div className="mx-auto max-w-[520px] px-[18px] py-16 text-center">
        <p className="text-[15px] font-semibold">Room not found</p>
        <Link href="/consults" className="mt-3 inline-block text-[13px] font-semibold text-lime-dark">
          Back to consults
        </Link>
      </div>
    );
  }

  const checklist = [
    { label: "Camera and microphone", done: cameraOn },
    { label: "Fasting glucose logged this morning", done: true },
    { label: "Weigh-in up to date", done: true },
    { label: "Allergies shared with dietitian", done: store.consent.shareWithDietitian },
  ];

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] bg-ink px-[18px] pb-10 text-white">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Leave room" size={44} onClick={() => router.push(`/consults/${appt.id}`)} className="bg-white/10 text-white">
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-white/60">
            {prettyLongDate(appt.date)} · {prettyTime(appt.time)}
          </p>
          <h1 className="truncate text-[17px] font-semibold">{dietitian?.name ?? "Consult"}</h1>
        </div>
        <CircleButton label="Session notes" size={44} className="bg-white/10 text-white" onClick={() => push("Notes are saved after the session")}>
          <IconClipboard size={20} />
        </CircleButton>
      </header>

      {/* Stage */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#1c1c1c]">
        <div className="flex aspect-[3/4] flex-col items-center justify-center gap-4 p-6 text-center">
          {joined ? (
            <>
              <Avatar name={dietitian?.name ?? "Dietitian"} size={104} tone="lime" />
              <div>
                <p className="text-[16px] font-semibold">{dietitian?.name}</p>
                <p className="text-[12px] text-white/60">
                  {dietitian?.headline}
                </p>
              </div>
              <Pill tone="teal">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                Connected · {clock}
              </Pill>
              {shareScreen ? (
                <p className="rounded-full bg-white/10 px-3 py-1.5 text-[11px]">
                  You are sharing: Weekly glucose report
                </p>
              ) : null}
            </>
          ) : (
            <>
              <IconTile tone="lime" size={72} shape="circle" className="bg-white/10">
                <IconVideo size={30} className="text-lime" />
              </IconTile>
              <div>
                <p className="text-[16px] font-semibold">Ready to join?</p>
                <p className="mt-1 text-[12px] text-white/60">
                  Sessions run in the browser — nothing to install. Your dietitian can already see your
                  shared logs.
                </p>
              </div>
            </>
          )}
        </div>

        {/* self view */}
        <div className="absolute bottom-3 right-3 flex h-24 w-20 items-center justify-center rounded-[16px] border border-white/15 bg-white/5 text-[11px] text-white/60">
          {cameraOn ? "You" : "Camera off"}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <CircleButton
          label={muted ? "Unmute" : "Mute"}
          size={52}
          className="bg-white/10 text-white"
          onClick={() => setMuted((m) => !m)}
        >
          <IconChat size={20} />
        </CircleButton>
        <button
          type="button"
          onClick={() => setJoined((j) => !j)}
          className="press grid h-16 w-16 place-items-center rounded-full bg-lime text-white card-float"
        >
          <span className="sr-only">{joined ? "Leave call" : "Join call"}</span>
          {joined ? <IconBack size={24} /> : <IconVideo size={24} />}
        </button>
        <CircleButton
          label={cameraOn ? "Turn camera off" : "Turn camera on"}
          size={52}
          className="bg-white/10 text-white"
          onClick={() => setCameraOn((c) => !c)}
        >
          <IconLeaf size={20} />
        </CircleButton>
      </div>

      <div className="mt-5 space-y-3 text-ink">
        <Card className="p-4">
          <h2 className="text-[15px] font-semibold">Pre-session checklist</h2>
          <ul className="mt-2 space-y-2">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-2.5 text-[13px]">
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full ${
                    c.done ? "bg-lime text-white" : "bg-canvas text-faint"
                  }`}
                >
                  <IconCheck size={12} />
                </span>
                <span className={c.done ? "text-ink" : "text-muted"}>{c.label}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { href: "/track/glucose", label: "Glucose", icon: <IconDroplet size={16} />, tone: "blue" as const },
              { href: "/track/weight", label: "Weight", icon: <IconScale size={16} />, tone: "orange" as const },
              { href: "/track", label: "Week", icon: <IconClipboard size={16} />, tone: "teal" as const },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="press flex flex-col items-center gap-1.5 rounded-[16px] bg-canvas py-3 text-[11px] font-medium text-muted"
              >
                <IconTile tone={a.tone} size={32} shape="circle">
                  {a.icon}
                </IconTile>
                {a.label}
              </Link>
            ))}
          </div>
        </Card>

        <Card className="flex items-start gap-3 p-4">
          <IconTile tone="gray" size={40}>
            <IconShield size={19} />
          </IconTile>
          <p className="text-[12px] text-muted">
            This room is encrypted in transit and is a placeholder for the third-party video SDK (Daily or
            Twilio) wired up in production. Nothing is recorded without both parties agreeing.
          </p>
        </Card>
      </div>
    </div>
  );
}
