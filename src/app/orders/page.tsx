"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { naira, prettyDate, prettyTime } from "@/lib/format";
import { useToast } from "@/components/app-providers";
import { Card, CircleButton, IconTile, Pill, Tag } from "@/components/ui";
import {
  IconBag,
  IconChevronRight,
  IconTruck,
  IconCheck,
  IconClock,
} from "@/components/icons";

export default function OrdersPage() {
  const store = useStore();
  const { push } = useToast();
  const [tab, setTab] = useState<"active" | "past">("active");

  const mine = store.orders
    .filter((o) => o.clientId === store.profile.id)
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  const active = mine.filter((o) => o.status !== "delivered");
  const past = mine.filter((o) => o.status === "delivered");
  const list = tab === "active" ? active : past;

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Healthy food shop</p>
          <h1 className="truncate text-[17px] font-semibold">My orders</h1>
        </div>
        <CircleButton label="Shop" href="/shop" size={44}>
          <IconBag size={20} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Tag active={tab === "active"} onClick={() => setTab("active")}>
            In progress ({active.length})
          </Tag>
          <Tag active={tab === "past"} onClick={() => setTab("past")}>
            Delivered ({past.length})
          </Tag>
        </div>

        {list.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-10 text-center">
            <IconTile tone="gray" size={56} shape="circle">
              <IconTruck size={24} />
            </IconTile>
            <p className="text-[15px] font-semibold">
              {tab === "active" ? "No orders in progress" : "No delivered orders yet"}
            </p>
            <p className="max-w-[250px] text-[12px] text-muted">
              {tab === "active"
                ? "Order low-sugar staples and we will keep you posted at every step."
                : "Once an order is delivered it moves here with a reorder button."}
            </p>
            <Link
              href="/shop"
              className="press mt-2 rounded-full bg-lime px-5 py-3 text-[13px] font-semibold text-white"
            >
              Start an order
            </Link>
          </Card>
        ) : (
          list.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex items-start gap-3">
                <IconTile
                  tone={o.status === "delivered" ? "teal" : o.status === "placed" ? "amber" : "lime"}
                  size={46}
                  shape="circle"
                >
                  {o.status === "delivered" ? <IconCheck size={20} /> : <IconTruck size={20} />}
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold">{o.reference}</p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {o.lines.reduce((n, l) => n + l.qty, 0)} items · placed {prettyDate(o.placedAt.slice(0, 10))}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Pill tone={o.status === "delivered" ? "teal" : "lime"}>
                      <span className="capitalize">{o.status}</span>
                    </Pill>
                    <Pill tone="gray">{naira(o.total)}</Pill>
                    {o.status !== "delivered" ? (
                      <Pill tone="amber">
                        <IconClock size={12} />
                        {prettyDate(o.eta.slice(0, 10))}, {prettyTime(o.eta.slice(11, 16))}
                      </Pill>
                    ) : null}
                  </div>
                </div>
                <CircleButton label="Open order" href={`/orders/${o.id}`} size={36} className="bg-canvas">
                  <IconChevronRight size={18} />
                </CircleButton>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {o.lines.map((l) => (
                  <span
                    key={l.productId}
                    className="shrink-0 rounded-[12px] bg-canvas px-2.5 py-1.5 text-[11px] text-muted"
                  >
                    {l.qty} × {l.name}
                  </span>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href={`/orders/${o.id}`}
                  className="press rounded-full bg-canvas py-3 text-center text-[13px] font-semibold"
                >
                  {o.status === "delivered" ? "View receipt" : "Track order"}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    o.lines.forEach((l) => store.addToCart(l.productId, l.qty));
                    push("Items added back to your cart");
                  }}
                  className="press rounded-full bg-lime-wash py-3 text-[13px] font-semibold text-lime-dark"
                >
                  Reorder
                </button>
              </div>
            </Card>
          ))
        )}

        <p className="px-1 text-[11px] text-muted">
          Orders are fulfilled by verified vendors on NourishLink. Cold items travel in insulated bags with a
          temperature log you can request.
        </p>
      </div>
    </div>
  );
}
