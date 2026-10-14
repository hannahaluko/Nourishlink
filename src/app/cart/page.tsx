"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { naira } from "@/lib/format";
import { useToast } from "@/components/app-providers";
import { deliveryFeeFor, FREE_DELIVERY_THRESHOLD } from "@/lib/care";
import { Card, CircleButton, IconTile, Pill, Sheet } from "@/components/ui";
import {
  IconBack,
  IconBag,
  IconCardPay,
  IconCheck,
  IconLock,
  IconMinus,
  IconPlus,
  IconTrash,
  IconTruck,
  IconWallet,
  IconPin,
} from "@/components/icons";

const PAY_METHODS = [
  { id: "card", label: "Card ending 4291", hint: "Test mode", icon: <IconCardPay size={20} />, tone: "blue" as const },
  { id: "transfer", label: "Bank transfer", hint: "Paystack checkout", icon: <IconWallet size={20} />, tone: "teal" as const },
];

export default function CartPage() {
  const router = useRouter();
  const store = useStore();
  const { push } = useToast();
  const { cartLines, cartSubtotal, profile } = store;
  const [address, setAddress] = useState(`14 Admiralty Way, ${profile.city}`);
  const [delivery, setDelivery] = useState<"delivery" | "pickup">("delivery");
  const [method, setMethod] = useState("card");
  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [placed, setPlaced] = useState<{ id: string; reference: string; total: number } | null>(null);

  const deliveryFee = deliveryFeeFor(cartSubtotal, delivery);
  const total = cartSubtotal + deliveryFee;

  const placeOrder = () => {
    setPaying(true);
    window.setTimeout(() => {
      const order = store.checkout(delivery === "pickup" ? "Pickup · GreenBasket Lekki hub" : address);
      setPaying(false);
      setPayOpen(false);
      setPlaced({ id: order.id, reference: order.reference, total: order.total });
    }, 900);
  };

  if (placed) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
        <div className="anim-fade-up space-y-3 pt-8">
          <Card className="flex flex-col items-center gap-3 p-6 text-center">
            <IconTile tone="lime" size={62} shape="circle">
              <IconCheck size={28} />
            </IconTile>
            <h1 className="text-[19px] font-bold">Order confirmed</h1>
            <p className="text-[13px] text-muted">
              We sent a confirmation to {profile.email}. Your basket is being packed now.
            </p>
            <div className="mt-1 flex flex-wrap justify-center gap-1.5">
              <Pill tone="teal">
                <IconCheck size={13} />
                Paid {naira(placed.total)}
              </Pill>
              <Pill tone="gray">Ref {placed.reference}</Pill>
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/orders/${placed.id}`}
              className="press rounded-full bg-lime py-3.5 text-center text-[14px] font-semibold text-white"
            >
              Track order
            </Link>
            <Link
              href="/shop"
              className="press rounded-full bg-surface py-3.5 text-center text-[14px] font-semibold"
            >
              Keep shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">
            {cartLines.length} item{cartLines.length === 1 ? "" : "s"}
          </p>
          <h1 className="truncate text-[17px] font-semibold">Your cart</h1>
        </div>
      </header>

      {cartLines.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center">
          <IconTile tone="gray" size={56} shape="circle">
            <IconBag size={24} />
          </IconTile>
          <p className="text-[15px] font-semibold">Your cart is empty</p>
          <p className="max-w-[240px] text-[12px] text-muted">
            Add diabetes-friendly staples and we&apos;ll deliver them cold-chain checked.
          </p>
          <Link
            href="/shop"
            className="press mt-2 rounded-full bg-lime px-5 py-3 text-[13px] font-semibold text-white"
          >
            Browse the shop
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          <Card className="p-4">
            <ul className="divide-y divide-hairline">
              {cartLines.map(({ line, product }) => (
                <li key={product.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-canvas text-[24px]">
                    {product.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{product.name}</p>
                    <p className="text-[12px] text-muted">
                      {naira(product.price)} / {product.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => store.setCartQty(product.id, line.qty - 1)}
                      aria-label="Decrease quantity"
                      className="press grid h-8 w-8 place-items-center rounded-full bg-canvas"
                    >
                      <IconMinus size={15} />
                    </button>
                    <span className="tnum w-5 text-center text-[14px] font-semibold">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => store.setCartQty(product.id, Math.min(product.stock, line.qty + 1))}
                      aria-label="Increase quantity"
                      className="press grid h-8 w-8 place-items-center rounded-full bg-lime-tint text-lime-dark"
                    >
                      <IconPlus size={15} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => store.setCartQty(product.id, 0)}
                    aria-label={`Remove ${product.name}`}
                    className="press grid h-8 w-8 place-items-center rounded-full text-faint"
                  >
                    <IconTrash size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <h2 className="text-[16px] font-semibold">Delivery</h2>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["delivery", "pickup"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDelivery(d)}
                  aria-pressed={delivery === d}
                  className={`press rounded-[16px] py-3 text-[13px] font-semibold capitalize ${
                    delivery === d ? "bg-lime-tint text-ink" : "bg-canvas text-muted"
                  }`}
                >
                  {d === "delivery" ? "Home delivery" : "Pickup point"}
                </button>
              ))}
            </div>
            {delivery === "delivery" ? (
              <label className="mt-3 block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-muted">
                  <IconPin size={13} />
                  Delivery address
                </span>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-[16px] bg-canvas px-3.5 py-3 text-[13px] outline-none focus:ring-2 focus:ring-lime/60"
                />
              </label>
            ) : (
              <p className="mt-3 flex items-start gap-2 rounded-[16px] bg-canvas p-3 text-[12px] text-muted">
                <IconTruck size={14} className="mt-0.5 shrink-0" />
                Collect at GreenBasket hub, Admiralty Way, Lekki — ready in 3 hours. No delivery fee.
              </p>
            )}
          </Card>

          <Card className="p-4">
            <h2 className="text-[16px] font-semibold">Payment</h2>
            <div className="mt-2 space-y-2">
              {PAY_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  aria-pressed={method === m.id}
                  className={`press flex w-full items-center gap-3 rounded-[16px] p-3 text-left ${
                    method === m.id ? "bg-lime-tint" : "bg-canvas"
                  }`}
                >
                  <IconTile tone={m.tone} size={38}>
                    {m.icon}
                  </IconTile>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold">{m.label}</span>
                    <span className="block text-[11px] text-muted">{m.hint}</span>
                  </span>
                  {method === m.id ? <IconCheck size={18} className="text-lime-dark" /> : null}
                </button>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-2 text-[11px] text-muted">
              <IconLock size={13} />
              Payments run through the payment provider. NourishLink never stores card details.
            </p>
          </Card>

          <Card className="p-4">
            <dl className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tnum font-medium">{naira(cartSubtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="tnum font-medium">
                  {deliveryFee === 0 ? <span className="text-teal">Free</span> : naira(deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-hairline pt-2 text-[15px]">
                <dt className="font-semibold">Total</dt>
                <dd className="tnum font-bold">{naira(total)}</dd>
              </div>
            </dl>
            {deliveryFee > 0 ? (
              <p className="mt-2 rounded-[14px] bg-amber-tint p-2.5 text-[11px] font-medium text-amber">
                Add {naira(FREE_DELIVERY_THRESHOLD - cartSubtotal)} more for free delivery.
              </p>
            ) : null}
          </Card>
        </div>
      )}

      {cartLines.length > 0 ? (
        <div className="fixed inset-x-0 bottom-[92px] z-30 px-[18px] md:bottom-[104px]">
          <div className="mx-auto max-w-[484px] md:max-w-[604px]">
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="press flex w-full items-center justify-between rounded-full bg-lime px-5 py-4 text-white card-float"
            >
              <span className="text-[14px] font-semibold">Checkout</span>
              <span className="tnum text-[14px] font-bold">{naira(total)}</span>
            </button>
          </div>
        </div>
      ) : null}

      <Sheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Confirm order"
        footer={
          <button
            type="button"
            onClick={placeOrder}
            disabled={paying}
            className="press w-full rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white disabled:opacity-70"
          >
            {paying ? "Processing…" : `Pay ${naira(total)}`}
          </button>
        }
      >
        <div className="space-y-3">
          <ul className="space-y-2">
            {cartLines.map(({ line, product }) => (
              <li key={product.id} className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-canvas text-[20px]">
                  {product.emoji}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                  {line.qty} × {product.name}
                </span>
                <span className="tnum text-[13px] font-semibold">{naira(product.price * line.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-hairline pt-3 text-[14px]">
            <span className="font-semibold">Total</span>
            <span className="tnum font-bold">{naira(total)}</span>
          </div>
          <p className="flex items-start gap-2 rounded-[16px] bg-canvas p-3 text-[11px] text-muted">
            <IconTruck size={14} className="mt-0.5 shrink-0" />
            {delivery === "pickup"
              ? "Pickup at GreenBasket hub, ready in 3 hours."
              : "Next-day delivery in Lagos, 2–3 days elsewhere. You will get an SMS when the rider leaves."}
          </p>
          <button
            type="button"
            onClick={() => push("Address updated")}
            className="press text-[12px] font-semibold text-lime-dark"
          >
            Change address
          </button>
        </div>
      </Sheet>
    </div>
  );
}
