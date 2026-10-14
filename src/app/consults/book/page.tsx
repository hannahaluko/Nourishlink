"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { naira, prettyDate } from "@/lib/format";
import type { Goal } from "@/lib/types";
import { isDiscoverable, nextOpenSlots } from "@/lib/care";
import { Avatar, Card, CircleButton, IconTile, Pill, Tag } from "@/components/ui";
import {
  IconBack,
  IconChevronDown,
  IconClock,
  IconPin,
  IconSearch,
  IconStar,
  IconVerified,
} from "@/components/icons";

const SPECIALTIES: (Goal | "All")[] = [
  "All",
  "Lose weight",
  "Manage blood sugar",
  "Lower blood pressure",
  "Eat healthier",
  "Build muscle",
];

export default function BookConsultPage() {
  const { dietitians, today } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<(typeof SPECIALTIES)[number]>("All");
  const [city, setCity] = useState("All");
  const [maxFee, setMaxFee] = useState(25000);
  const [sort, setSort] = useState<"rating" | "price">("rating");

  /* Only admin-verified dietitians are discoverable (PRD definition of done). */
  const verified = dietitians.filter((d) => d.verification.status === "verified");
  const cities = useMemo(
    () => ["All", ...Array.from(new Set(verified.map((d) => d.city.split(", ").at(-1) ?? d.city)))],
    [verified],
  );

  const results = verified
    .filter((d) => {
      const haystack = `${d.name} ${d.headline} ${d.city} ${d.focus.join(" ")} ${d.languages.join(" ")}`.toLowerCase();
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesSpecialty = specialty === "All" || d.specialties.includes(specialty);
      const matchesCity = city === "All" || d.city.includes(city);
      return matchesQuery && matchesSpecialty && matchesCity && d.fee <= maxFee && isDiscoverable(d, today);
    })
    .sort((a, b) => (sort === "rating" ? b.rating - a.rating : a.fee - b.fee));

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Verified dietitians</p>
          <h1 className="truncate text-[17px] font-semibold">Find a dietitian</h1>
        </div>
        <CircleButton
          label="Sort"
          size={44}
          onClick={() => setSort((s) => (s === "rating" ? "price" : "rating"))}
          className="text-[12px] font-semibold"
        >
          <IconChevronDown size={18} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 rounded-full bg-canvas px-3.5 py-3">
            <IconSearch size={18} className="text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, location or condition"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-faint"
              aria-label="Search dietitians"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {SPECIALTIES.map((s) => (
              <Tag key={s} active={specialty === s} onClick={() => setSpecialty(s)}>
                {s}
              </Tag>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
            {cities.map((c) => (
              <Tag key={c} active={city === c} onClick={() => setCity(c)}>
                {c}
              </Tag>
            ))}
          </div>
          <div className="mt-3 rounded-[16px] bg-canvas px-3.5 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-muted">Max fee per consult</span>
              <span className="tnum text-[13px] font-semibold">{naira(maxFee)}</span>
            </div>
            <input
              type="range"
              min={10000}
              max={25000}
              step={1000}
              value={maxFee}
              onChange={(e) => setMaxFee(Number(e.target.value))}
              aria-label="Maximum fee"
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-hatch accent-lime"
            />
          </div>
        </Card>

        <p className="px-1 text-[12px] text-muted">
          {results.length} dietitian{results.length === 1 ? "" : "s"} available · sorted by{" "}
          {sort === "rating" ? "rating" : "lowest fee"}
        </p>

        {results.map((d) => {
          const next = nextOpenSlots(d, today);
          return (
            <Card key={d.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar name={d.name} size={54} tone="lime" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[16px] font-semibold">{d.name}</p>
                    <IconVerified size={15} className="shrink-0 text-lime-dark" />
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[12px] text-muted">{d.headline}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                    <span className="inline-flex items-center gap-1">
                      <IconPin size={12} />
                      {d.city}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <IconStar size={12} className="text-amber" />
                      {d.rating ? d.rating.toFixed(1) : "New"} ({d.reviews})
                    </span>
                    <span>{d.years} yrs</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.focus.slice(0, 3).map((f) => (
                  <Pill key={f} tone="lime">
                    {f}
                  </Pill>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                {next.map((s) => (
                  <span
                    key={s.id}
                    className="shrink-0 rounded-[12px] bg-canvas px-2.5 py-2 text-[11px] font-medium text-muted"
                  >
                    {prettyDate(s.date).slice(0, 6)} · {s.time}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[11px] text-muted">From</p>
                  <p className="tnum text-[18px] font-semibold">{naira(d.fee)}</p>
                </div>
                <Link
                  href={`/consults/book/${d.id}`}
                  className="press rounded-full bg-lime px-5 py-3 text-[13px] font-semibold text-white"
                >
                  Book consult
                </Link>
              </div>
            </Card>
          );
        })}

        {results.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-8 text-center">
            <IconTile tone="gray" size={52} shape="circle">
              <IconClock size={22} />
            </IconTile>
            <p className="text-[15px] font-semibold">No match for these filters</p>
            <p className="max-w-[260px] text-[12px] text-muted">
              Try widening the fee range or clearing the location filter. Dietitians awaiting
              verification are hidden until an admin approves their licence.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
