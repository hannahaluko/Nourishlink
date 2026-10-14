"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { naira, prettyDate, prettyTime } from "@/lib/format";
import { useToast } from "@/components/app-providers";
import { nextOrderStatus } from "@/lib/care";
import { Card, CircleButton, IconTile, Pill } from "@/components/ui";
import {
  IconBack,
  IconCheck,
  IconChat,
  IconClock,
  IconNote,
  IconPin,
  IconTruck,
  IconWallet,
} from "@/components/icons";

const STEPS = [
  { key: "placed", label: "Order placed", detail: "Payment confirmed and sent to the vendor" },
  { key: "packed", label: "Packed", detail: "Items picked and quality-checked" },
  { key: "dispatched", label: "Out for delivery", detail: "Rider on the way with cold bags" },
  { key: "delivered", label: "Delivered", detail: "Handed over and signed for" },
] as const;

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const store = useStore();
  const { push } = useToast();
  const order = store.orders.find((o) => o.id === params.orderId);

  if (!order) {
    return (
      <div className="mx-auto max-w-[520px] px-[18px] py-16 text-center">
        <p className="text-[15px] font-semibold">Order not found</p>
        <Link href="/orders" className="mt-3 inline-block text-[13px] font-semibold text-lime-dark">
          Back to orders
        </Link>
      </div>
    );
  }

  const index = STEPS.findIndex((s) => s.key === order.status);
  const nextStatus = nextOrderStatus(order.status);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">{order.reference}</p>
          <h1 className="truncate text-[17px] font-semibold capitalize">{order.status}</h1>
        </div>
        <CircleButton label="Support" size={44} onClick={() => push("Support chat opening…")}>
          <IconChat size={20} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        <Card className="bg-lime-tint p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Pill tone="lime" className="bg-surface/80">
                <IconTruck size={13} />
                {order.status === "delivered" ? "Delivered" : "On the way"}
              </Pill>
              <p className="mt-3 text-[22px] font-bold leading-tight">
                {order.status === "delivered" ? "Delivered" : "Arriving"}
              </p>
              <p className="text-[13px] text-ink/70">
                {prettyDate(order.eta.slice(0, 10))} · {prettyTime(order.eta.slice(11, 16))}
              </p>
            </div>
            <IconTile tone="lime" size={46} shape="circle" className="bg-surface/80">
              <IconClock size={21} />
            </IconTile>
          </div>
          {nextStatus ? (
            <button
              type="button"
              onClick={() => {
                store.advanceOrder(order.id, nextStatus);
                push(`Status updated to ${nextStatus}`);
              }}
              className="press mt-3 w-full rounded-full bg-surface/80 py-2.5 text-[12px] font-semibold text-lime-dark"
            >
              Demo: advance to “{nextStatus}”
            </button>
          ) : null}
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-[16px] font-semibold">Progress</h2>
          <ol className="space-y-3">
            {STEPS.map((step, i) => {
              const done = i <= index;
              return (
                <li key={step.key} className="flex gap-3">
                  <span className="flex flex-col items-center">
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full ${
                        done ? "bg-lime text-white" : "bg-canvas text-faint"
                      }`}
                    >
                      {done ? <IconCheck size={15} /> : <span className="text-[11px] font-semibold">{i + 1}</span>}
                    </span>
                    {i < STEPS.length - 1 ? (
                      <span className={`mt-1 h-6 w-0.5 ${i < index ? "bg-lime" : "bg-hatch"}`} />
                    ) : null}
                  </span>
                  <span className="flex-1 pb-1">
                    <span className={`block text-[14px] font-semibold ${done ? "text-ink" : "text-muted"}`}>
                      {step.label}
                    </span>
                    <span className="block text-[12px] text-muted">{step.detail}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card className="p-4">
          <h2 className="mb-2 text-[16px] font-semibold">Items</h2>
          <ul className="divide-y divide-hairline">
            {order.lines.map((l) => (
              <li key={l.productId} className="flex items-center gap-3 py-3">
                <IconTile tone="lime" size={38}>
                  <IconNote size={18} />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{l.name}</p>
                  <p className="text-[12px] text-muted">
                    {l.qty} × {naira(l.price)}
                  </p>
                </div>
                <p className="tnum text-[14px] font-semibold">{naira(l.price * l.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-2 border-t border-hairline pt-3 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tnum">{naira(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="tnum">{order.deliveryFee === 0 ? "Free" : naira(order.deliveryFee)}</dd>
            </div>
            <div className="flex justify-between text-[15px]">
              <dt className="font-semibold">Total paid</dt>
              <dd className="tnum font-bold">{naira(order.total)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <IconTile tone="blue" size={42}>
              <IconPin size={19} />
            </IconTile>
            <div className="flex-1">
              <p className="text-[13px] font-semibold">Delivery address</p>
              <p className="mt-0.5 text-[12px] text-muted">{order.address}</p>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-3">
            <IconTile tone="teal" size={42}>
              <IconWallet size={19} />
            </IconTile>
            <div className="flex-1">
              <p className="text-[13px] font-semibold">Payment</p>
              <p className="mt-0.5 text-[12px] text-muted capitalize">
                {order.payment} · card ending 4291 · {order.reference}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              order.lines.forEach((l) => store.addToCart(l.productId, l.qty));
              push("Items added back to your cart");
            }}
            className="press rounded-full bg-lime py-3.5 text-[14px] font-semibold text-white"
          >
            Reorder
          </button>
          <button
            type="button"
            onClick={() => push("Receipt sent to your email")}
            className="press rounded-full bg-surface py-3.5 text-[14px] font-semibold"
          >
            Email receipt
          </button>
        </div>
      </div>
    </div>
  );
}
