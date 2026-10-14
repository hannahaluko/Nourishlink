"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { naira, prettyDate } from "@/lib/format";
import { useToast } from "@/components/app-providers";
import { Avatar, Card, CircleButton, IconTile, Pill, Tag } from "@/components/ui";
import {
  IconBack,
  IconCheck,
  IconClose,
  IconNote,
  IconSearch,
  IconShield,
  IconStar,
  IconVerified,
} from "@/components/icons";

type Filter = "all" | "pending" | "verified" | "rejected";

export default function AdminDietitiansPage() {
  const router = useRouter();
  const store = useStore();
  const { push } = useToast();
  const [filter, setFilter] = useState<Filter>("pending");
  const [query, setQuery] = useState("");

  const list = store.dietitians
    .filter((d) => (filter === "all" ? true : d.verification.status === filter))
    .filter((d) => {
      const q = query.trim().toLowerCase();
      return (
        !q ||
        `${d.name} ${d.city} ${d.verification.licenceNo}`.toLowerCase().includes(q)
      );
    });

  const counts = {
    all: store.dietitians.length,
    pending: store.dietitians.filter((d) => d.verification.status === "pending").length,
    verified: store.dietitians.filter((d) => d.verification.status === "verified").length,
    rejected: store.dietitians.filter((d) => d.verification.status === "rejected").length,
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] md:max-w-[760px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Admin console</p>
          <h1 className="truncate text-[17px] font-semibold">Dietitian verification</h1>
        </div>
      </header>

      <div className="space-y-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 rounded-full bg-canvas px-3.5 py-3">
            <IconSearch size={18} className="text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, city or licence number"
              aria-label="Search dietitians"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-faint"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {(["pending", "verified", "rejected", "all"] as Filter[]).map((f) => (
              <Tag key={f} active={filter === f} onClick={() => setFilter(f)}>
                <span className="capitalize">
                  {f} ({counts[f]})
                </span>
              </Tag>
            ))}
          </div>
        </Card>

        {list.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-8 text-center">
            <IconTile tone="teal" size={52} shape="circle">
              <IconCheck size={22} />
            </IconTile>
            <p className="text-[15px] font-semibold">Nothing here</p>
            <p className="max-w-[250px] text-[12px] text-muted">
              No dietitians match this filter. Pending applications appear automatically when a dietitian
              uploads their licence.
            </p>
          </Card>
        ) : (
          list.map((d) => (
            <Card key={d.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar name={d.name} size={50} tone="teal" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[15px] font-semibold">{d.name}</p>
                    {d.verification.status === "verified" ? (
                      <IconVerified size={14} className="text-lime-dark" />
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[12px] text-muted">{d.headline}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Pill
                      tone={
                        d.verification.status === "verified"
                          ? "teal"
                          : d.verification.status === "pending"
                            ? "amber"
                            : "red"
                      }
                    >
                      <IconShield size={12} />
                      {d.verification.status}
                    </Pill>
                    <Pill tone="gray">Licence {d.verification.licenceNo}</Pill>
                    <Pill tone="gray">{d.years} yrs</Pill>
                    <Pill tone="gray">
                      <IconStar size={11} />
                      {d.rating ? d.rating.toFixed(1) : "New"}
                    </Pill>
                  </div>
                </div>
              </div>

              <dl className="mt-3 space-y-1.5 text-[12px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Location</dt>
                  <dd className="text-right font-medium">{d.city}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Fee</dt>
                  <dd className="text-right font-medium">{naira(d.fee)} per consult</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Specialties</dt>
                  <dd className="text-right font-medium">{d.focus.join(", ")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Languages</dt>
                  <dd className="text-right font-medium">{d.languages.join(", ")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Verified</dt>
                  <dd className="text-right font-medium">
                    {d.verification.verifiedAt ? prettyDate(d.verification.verifiedAt.slice(0, 10)) : "—"}
                  </dd>
                </div>
              </dl>

              <div className="mt-3 flex items-center gap-2 rounded-[14px] bg-canvas p-3">
                <IconTile tone="gray" size={34}>
                  <IconNote size={16} />
                </IconTile>
                <p className="text-[11px] text-muted">
                  Documents: practising certificate.pdf · government-id.jpg · indemnity.pdf
                </p>
              </div>

              {d.verification.status !== "verified" ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      store.setVerification(d.id, "verified");
                      push(`${d.name} verified — now visible in search`);
                    }}
                    className="press flex items-center justify-center gap-2 rounded-full bg-lime py-3 text-[13px] font-semibold text-white"
                  >
                    <IconCheck size={16} />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      store.setVerification(d.id, "rejected");
                      push(`${d.name} rejected · applicant notified`);
                    }}
                    className="press flex items-center justify-center gap-2 rounded-full bg-red-tint py-3 text-[13px] font-semibold text-red"
                  >
                    <IconClose size={16} />
                    Reject
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    store.setVerification(d.id, "pending");
                    push(`${d.name} sent back to review`);
                  }}
                  className="press mt-3 w-full rounded-full bg-canvas py-3 text-[13px] font-semibold"
                >
                  Re-open for review
                </button>
              )}
            </Card>
          ))
        )}

        <Card className="flex items-start gap-3 p-4">
          <IconTile tone="lime" size={40}>
            <IconShield size={19} />
          </IconTile>
          <p className="text-[12px] text-muted">
            Only verified dietitians appear in client search. Verification covers licence number, practising
            certificate, government ID and professional indemnity — re-checked annually.
          </p>
        </Card>
      </div>
    </div>
  );
}
