"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, IconTile, Pill, ProgressRing, LineChart } from "@/components/ui";
import {
  IconArrowRight,
  IconBag,
  IconCalendar,
  IconCheck,
  IconChat,
  IconClipboard,
  IconDroplet,
  IconFlame,
  IconFootsteps,
  IconHeart,
  IconLeaf,
  IconShield,
  IconSparkle,
  IconTrend,
  IconUser,
  IconVerified,
  IconVideo,
} from "@/components/icons";

export default function LandingPage() {
  const { setRole, profile, today, metricFor } = useStore();
  const metric = metricFor(today);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="mx-auto flex w-full max-w-[1100px] items-center gap-3 px-[18px] py-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-lime text-white">
          <IconLeaf size={21} />
        </span>
        <span className="text-[17px] font-bold tracking-tight">NourishLink</span>
        <nav className="ml-6 hidden items-center gap-6 text-[13px] font-medium text-muted md:flex">
          <a href="#how" className="press hover:text-ink">
            How it works
          </a>
          <a href="#features" className="press hover:text-ink">
            Features
          </a>
          <a href="#dietitians" className="press hover:text-ink">
            For dietitians
          </a>
          <Link href="/privacy" className="press hover:text-ink">
            Privacy
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className="press rounded-full bg-surface px-4 py-2.5 text-[13px] font-semibold"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="press rounded-full bg-lime px-4 py-2.5 text-[13px] font-semibold text-white"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-[1100px] items-center gap-8 px-[18px] pb-10 pt-6 md:grid-cols-2 md:pt-14">
        <div>
          <Pill tone="lime">
            <IconShield size={13} />
            Dietitians verified by our admin team
          </Pill>
          <h1 className="mt-4 text-[34px] font-bold leading-[1.1] tracking-tight md:text-[46px]">
            See a dietitian online. Track your numbers. Eat better, delivered.
          </h1>
          <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-muted">
            NourishLink connects you to verified dietitians wherever you are, keeps your meals, glucose and
            weight in one tidy timeline, and ships dietitian-approved groceries to your door.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="press flex items-center gap-2 rounded-full bg-lime px-6 py-4 text-[15px] font-semibold text-white card-float"
            >
              Create your health profile
              <IconArrowRight size={18} />
            </Link>
            <Link
              href="/app"
              className="press flex items-center gap-2 rounded-full bg-surface px-6 py-4 text-[15px] font-semibold"
            >
              Open the demo dashboard
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-muted">
            {[
              "Book in under 10 minutes",
              "Video or chat consults",
              "Works in the browser — nothing to install",
            ].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-lime-tint text-lime-dark">
                  <IconCheck size={12} />
                </span>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Product preview built from the real components */}
        <div className="relative">
          <div className="mx-auto w-full max-w-[380px] space-y-3">
            <Card className="bg-lime-tint p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Pill tone="lime" className="bg-surface/80">
                    <IconSparkle size={13} />
                    This week
                  </Pill>
                  <h2 className="mt-3 text-[18px] font-bold leading-tight">Your Weekly Progress</h2>
                  <p className="mt-1 text-[12px] text-ink/70">6 of 7 days logged · 4/7 on target</p>
                </div>
                <ProgressRing
                  value={86}
                  label="6"
                  caption="days"
                  size={82}
                  thickness={9}
                  color="var(--color-lime-dark)"
                  track="rgba(255,255,255,0.7)"
                />
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <span className="text-[13px] font-medium text-muted">Steps</span>
                  <IconTile tone="orange" size={34}>
                    <IconFootsteps size={17} />
                  </IconTile>
                </div>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="tnum text-[24px] font-semibold">8,410</span>
                  <span className="text-[11px] text-muted">steps</span>
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <span className="text-[13px] font-medium text-muted">Water</span>
                  <IconTile tone="blue" size={34}>
                    <IconDroplet size={17} />
                  </IconTile>
                </div>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="tnum text-[24px] font-semibold">8</span>
                  <span className="text-[11px] text-muted">/ 8 glass</span>
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <span className="text-[13px] font-medium text-muted">Heart rate</span>
                  <IconTile tone="red" size={34}>
                    <IconHeart size={17} />
                  </IconTile>
                </div>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="tnum text-[24px] font-semibold">{metric.restingHr}</span>
                  <span className="text-[11px] text-muted">bpm</span>
                </p>
                <LineChart values={metric.hrSeries} height={40} className="mt-2" />
              </Card>
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <span className="text-[13px] font-medium text-muted">Calories</span>
                  <IconTile tone="amber" size={34}>
                    <IconFlame size={17} />
                  </IconTile>
                </div>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="tnum text-[24px] font-semibold">1,640</span>
                  <span className="text-[11px] text-muted">Kcal</span>
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto w-full max-w-[1100px] px-[18px] py-10">
        <h2 className="text-[24px] font-bold tracking-tight">Four steps to a working plan</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {[
            { icon: <IconUser size={19} />, tone: "lime" as const, title: "Build your profile", body: "Goals, conditions, allergies and location — two minutes, edit any time." },
            { icon: <IconCalendar size={19} />, tone: "blue" as const, title: "Book a verified dietitian", body: "Search by specialty, city and price. Pay for a video or chat slot." },
            { icon: <IconClipboard size={19} />, tone: "teal" as const, title: "Track what matters", body: "Log meals, glucose and weight. Your dietitian sees the trend before you meet." },
            { icon: <IconBag size={19} />, tone: "orange" as const, title: "Order the food", body: "Shop dietitian-approved groceries tagged to your diet and get them delivered." },
          ].map((s, i) => (
            <Card key={s.title} className="p-4">
              <div className="flex items-center justify-between">
                <IconTile tone={s.tone} size={40}>
                  {s.icon}
                </IconTile>
                <span className="tnum text-[13px] font-bold text-faint">0{i + 1}</span>
              </div>
              <h3 className="mt-3 text-[15px] font-semibold">{s.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Who it is for */}
      <section className="mx-auto w-full max-w-[1100px] px-[18px] py-4">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              title: "Corporate & remote workers",
              body: "Consults outside office hours, reminders when the workday runs long, meal plans that survive a busy week.",
              icon: <IconCalendar size={19} />,
              tone: "blue" as const,
            },
            {
              title: "Artisans & self-employed",
              body: "Flexible slots, no hospital queue, and Naira pricing you can see before you book.",
              icon: <IconTrend size={19} />,
              tone: "orange" as const,
            },
            {
              title: "Living with a chronic condition",
              body: "Glucose, weight and meal logs in one timeline, with the dietitian who wrote your plan tracking the trend.",
              icon: <IconHeart size={19} />,
              tone: "red" as const,
            },
          ].map((a) => (
            <Card key={a.title} className="p-4">
              <IconTile tone={a.tone} size={40}>
                {a.icon}
              </IconTile>
              <h3 className="mt-3 text-[15px] font-semibold">{a.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{a.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-[1100px] px-[18px] py-10">
        <h2 className="text-[24px] font-bold tracking-tight">Everything in one app</h2>
        <p className="mt-2 max-w-[620px] text-[14px] text-muted">
          Five features, built end to end for v1: onboarding, consults, tracking, a dietitian workspace and a
          food shop.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            {
              title: "Health profile & consent",
              body: "You decide what is shared. Revoke dietitian access in one tap, export or delete everything from Profile.",
              icon: <IconShield size={19} />,
              tone: "lime" as const,
              href: "/onboarding",
              cta: "Try onboarding",
            },
            {
              title: "Verified dietitian discovery",
              body: "Filter by specialty, city and fee. Only licence-verified dietitians appear in search results.",
              icon: <IconVerified size={19} />,
              tone: "teal" as const,
              href: "/consults/book",
              cta: "Browse dietitians",
            },
            {
              title: "Video & chat consults",
              body: "Book, pay, get reminders 24 hours and 15 minutes before, join in the browser.",
              icon: <IconVideo size={19} />,
              tone: "blue" as const,
              href: "/consults",
              cta: "See your consults",
            },
            {
              title: "Meals, glucose & weight tracking",
              body: "Weekly bars with target hatching, an in-range glucose band, and trend lines your dietitian reads.",
              icon: <IconTrend size={19} />,
              tone: "violet" as const,
              href: "/track",
              cta: "Open tracking",
            },
            {
              title: "Dietitian client dashboard",
              body: "Caseload, shared logs, session notes and meal plan assignment — built for the practitioner side.",
              icon: <IconClipboard size={19} />,
              tone: "orange" as const,
              href: "/dietitian",
              cta: "View dashboard",
            },
            {
              title: "Healthy food shop",
              body: "Diet-tagged staples, cart, payment and order tracking, with stock managed by vendors.",
              icon: <IconBag size={19} />,
              tone: "amber" as const,
              href: "/shop",
              cta: "Shop healthy food",
            },
          ].map((f) => (
            <Card key={f.title} className="flex flex-col p-4">
              <IconTile tone={f.tone} size={40}>
                {f.icon}
              </IconTile>
              <h3 className="mt-3 text-[15px] font-semibold">{f.title}</h3>
              <p className="mt-1 flex-1 text-[13px] leading-relaxed text-muted">{f.body}</p>
              <Link
                href={f.href}
                className="press mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-lime-dark"
              >
                {f.cta}
                <IconArrowRight size={15} />
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Dietitian CTA */}
      <section id="dietitians" className="mx-auto w-full max-w-[1100px] px-[18px] py-10">
        <Card className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
          <div className="flex-1">
            <Pill tone="lime">
              <IconChat size={13} />
              For dietitians
            </Pill>
            <h2 className="mt-3 text-[22px] font-bold tracking-tight">
              See the client record before the session starts
            </h2>
            <p className="mt-2 max-w-[560px] text-[14px] leading-relaxed text-muted">
              Set your availability, accept bookings, read a client&apos;s shared logs, write SOAP-style notes
              and assign a meal plan they can open straight away.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/dietitian"
                onClick={() => setRole("dietitian")}
                className="press flex items-center gap-2 rounded-full bg-lime px-5 py-3.5 text-[14px] font-semibold text-white"
              >
                Open dietitian dashboard
                <IconArrowRight size={17} />
              </Link>
              <Link
                href="/admin"
                onClick={() => setRole("admin")}
                className="press flex items-center gap-2 rounded-full bg-canvas px-5 py-3.5 text-[14px] font-semibold"
              >
                Admin console
              </Link>
            </div>
          </div>
          <div className="w-full max-w-[320px] space-y-3">
            <Card className="bg-canvas p-4">
              <div className="flex items-center gap-3">
                <IconTile tone="lime" size={40} shape="circle">
                  <IconUser size={19} />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold">{profile.name}</p>
                  <p className="text-[11px] text-muted">Shared logs · consent recorded</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Pill tone="teal">Fasting 6.0 mmol/L</Pill>
                <Pill tone="orange">−3.2 kg in 7 weeks</Pill>
              </div>
            </Card>
            <Card className="bg-canvas p-4">
              <p className="text-[12px] font-semibold">Session note draft</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                Swap evening white rice for ofada. Keep the 20-minute post-dinner walk. Recheck fasting glucose
                in two weeks.
              </p>
            </Card>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-[1100px] px-[18px] py-10">
        <div className="flex flex-col gap-6 border-t border-hairline pt-8 md:flex-row md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-lime text-white">
                <IconLeaf size={19} />
              </span>
              <span className="text-[16px] font-bold">NourishLink</span>
            </div>
            <p className="mt-2 max-w-[320px] text-[12px] text-muted">
              Telemedicine for dietitians, health tracking and healthy food ordering. Prototype build — no real
              payments or consultations.
            </p>
          </div>
          <div className="flex gap-10 text-[13px]">
            <div className="space-y-2">
              <p className="font-semibold">Product</p>
              <Link href="/app" className="press block text-muted hover:text-ink">
                Dashboard
              </Link>
              <Link href="/shop" className="press block text-muted hover:text-ink">
                Shop
              </Link>
              <Link href="/consults" className="press block text-muted hover:text-ink">
                Consults
              </Link>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Company</p>
              <Link href="/privacy" className="press block text-muted hover:text-ink">
                Privacy policy
              </Link>
              <Link href="/signup" className="press block text-muted hover:text-ink">
                Create account
              </Link>
              <Link href="/login" className="press block text-muted hover:text-ink">
                Log in
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-8 text-[11px] text-muted">
          © {new Date().getFullYear()} NourishLink. Health data handled under NDPR and GDPR principles.
        </p>
      </footer>
    </div>
  );
}
