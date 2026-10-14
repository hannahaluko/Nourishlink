"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { naira, num, prettyDate, prettyTime } from "@/lib/format";
import { useToast } from "@/components/app-providers";
import { nextOrderStatus } from "@/lib/care";
import { Card, CircleButton, IconTile, Pill, SectionHeader, Tag } from "@/components/ui";
import {
  IconBack,
  IconCheck,
  IconMinus,
  IconPlus,
  IconTruck,
  IconBag,
  IconLeaf,
} from "@/components/icons";

export default function AdminOrdersPage() {
  const router = useRouter();
  const store = useStore();
  const { push } = useToast();
  const [tab, setTab] = useState<"orders" | "stock">("orders");

  const orders = [...store.orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt));

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] md:max-w-[760px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Admin console</p>
          <h1 className="truncate text-[17px] font-semibold">Orders & inventory</h1>
        </div>
      </header>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Tag active={tab === "orders"} onClick={() => setTab("orders")}>
            Orders ({orders.length})
          </Tag>
          <Tag active={tab === "stock"} onClick={() => setTab("stock")}>
            Inventory ({store.products.length})
          </Tag>
        </div>

        {tab === "orders"
          ? orders.map((o) => {
              const next = nextOrderStatus(o.status);
              return (
                <Card key={o.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <IconTile
                      tone={o.status === "delivered" ? "teal" : o.status === "placed" ? "amber" : "lime"}
                      size={44}
                      shape="circle"
                    >
                      {o.status === "delivered" ? <IconCheck size={20} /> : <IconTruck size={20} />}
                    </IconTile>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold">{o.reference}</p>
                      <p className="text-[11px] text-muted">
                        {store.clientById(o.clientId)?.name} · placed{" "}
                        {prettyDate(o.placedAt.slice(0, 10))} {prettyTime(o.placedAt.slice(11, 16))}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Pill tone={o.status === "delivered" ? "teal" : "lime"}>{o.status}</Pill>
                        <Pill tone="gray">{naira(o.total)}</Pill>
                        <Pill tone="gray">{o.payment}</Pill>
                      </div>
                    </div>
                  </div>

                  <ul className="mt-3 divide-y divide-hairline">
                    {o.lines.map((l) => (
                      <li key={l.productId} className="flex items-center justify-between py-2 text-[12px]">
                        <span className="truncate text-muted">
                          {l.qty} × {l.name}
                        </span>
                        <span className="font-medium">{naira(l.price * l.qty)}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-2 text-[11px] text-muted">
                    Deliver to: {o.address} · ETA {prettyDate(o.eta.slice(0, 10))},{" "}
                    {prettyTime(o.eta.slice(11, 16))}
                  </p>

                  {next ? (
                    <button
                      type="button"
                      onClick={() => {
                        store.advanceOrder(o.id, next);
                        push(`${o.reference} marked ${next}`);
                      }}
                      className="press mt-3 w-full rounded-full bg-lime py-3 text-[13px] font-semibold text-white"
                    >
                      Mark as {next}
                    </button>
                  ) : (
                    <p className="mt-3 flex items-center justify-center gap-2 rounded-full bg-canvas py-3 text-[12px] font-semibold text-muted">
                      <IconCheck size={15} />
                      Completed and receipted
                    </p>
                  )}
                </Card>
              );
            })
          : (
            <Card className="p-4">
              <SectionHeader title="Vendor listings" className="mb-2" />
              <ul className="divide-y divide-hairline">
                {store.products.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-3">
                    <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-canvas text-[22px]">
                      {p.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">{p.name}</p>
                      <p className="text-[11px] text-muted">
                        {naira(p.price)} / {p.unit} · {p.vendor}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.dietTags.slice(0, 2).map((t) => (
                          <Pill key={t} tone="lime">
                            <IconLeaf size={11} />
                            {t}
                          </Pill>
                        ))}
                        {p.stock <= 12 ? <Pill tone="red">{p.stock} left</Pill> : <Pill tone="gray">{p.stock} in stock</Pill>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => store.setStock(p.id, p.stock + 10)}
                        aria-label={`Add stock for ${p.name}`}
                        className="press grid h-8 w-8 place-items-center rounded-full bg-lime-wash text-lime-dark"
                      >
                        <IconPlus size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => store.setStock(p.id, Math.max(0, p.stock - 10))}
                        aria-label={`Reduce stock for ${p.name}`}
                        className="press grid h-8 w-8 place-items-center rounded-full bg-canvas text-muted"
                      >
                        <IconMinus size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

        <Card className="p-4">
          <SectionHeader title="Fulfilment summary" className="mb-2" />
          <dl className="space-y-2 text-[13px]">
            {[
              ["Awaiting pack", `${store.orders.filter((o) => o.status === "placed").length}`],
              ["In transit", `${store.orders.filter((o) => o.status === "dispatched").length}`],
              ["Delivered", `${store.orders.filter((o) => o.status === "delivered").length}`],
              ["Units to pick", `${num(store.orders.filter((o) => o.status !== "delivered").reduce((n, o) => n + o.lines.reduce((m, l) => m + l.qty, 0), 0))}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 flex items-start gap-2 rounded-[14px] bg-canvas p-3 text-[11px] text-muted">
            <IconBag size={14} className="mt-0.5 shrink-0" />
            Vendors manage their own listings and stock; admins step in for exceptions, refunds and delivery
            escalations.
          </p>
        </Card>
      </div>
    </div>
  );
}
