"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { naira } from "@/lib/format";
import { useToast } from "@/components/app-providers";
import { Card, CircleButton, IconTile, Pill, SectionHeader } from "@/components/ui";
import {
  IconBack,
  IconCart,
  IconCheck,
  IconLeaf,
  IconMinus,
  IconPlus,
  IconShield,
  IconStar,
  IconTruck,
} from "@/components/icons";

export default function ProductPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const store = useStore();
  const { push } = useToast();
  const product = store.products.find((p) => p.id === params.productId);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="mx-auto max-w-[520px] px-[18px] py-16 text-center">
        <p className="text-[15px] font-semibold">Product not found</p>
        <Link href="/shop" className="mt-3 inline-block text-[13px] font-semibold text-lime-dark">
          Back to shop
        </Link>
      </div>
    );
  }

  const fits = product.dietTags.filter(
    (t) =>
      (t === "Diabetes" && store.profile.conditions.includes("Type 2 diabetes")) ||
      (t === "Hypertension" && store.profile.conditions.includes("Hypertension")) ||
      (t === "Weight loss" && store.profile.goals.includes("Lose weight")),
  );

  const related = store.products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">{product.category}</p>
          <h1 className="truncate text-[17px] font-semibold">{product.brand}</h1>
        </div>
        <CircleButton label="Cart" href="/cart" size={44}>
          <IconCart size={20} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        <Card className="p-4">
          <div
            className={`grid h-[190px] place-items-center rounded-[20px] text-[76px] ${
              product.tint === "amber"
                ? "bg-amber-tint"
                : product.tint === "blue"
                  ? "bg-blue-tint"
                  : product.tint === "red"
                    ? "bg-red-tint"
                    : product.tint === "teal"
                      ? "bg-teal-tint"
                      : product.tint === "orange"
                        ? "bg-orange-tint"
                        : "bg-violet-tint"
            }`}
          >
            {product.emoji}
          </div>
          <h2 className="mt-4 text-[19px] font-bold">{product.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-muted">
            <span className="inline-flex items-center gap-1">
              <IconStar size={13} className="text-amber" />
              {product.rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>{product.vendor}</span>
            <span>·</span>
            <span className={product.stock <= 10 ? "font-semibold text-red" : ""}>
              {product.stock} in stock
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.dietTags.map((t) => (
              <Pill key={t} tone={fits.includes(t) ? "lime" : "gray"}>
                {t}
              </Pill>
            ))}
          </div>

          <p className="mt-3 flex items-baseline gap-1">
            <span className="tnum text-[28px] font-bold">{naira(product.price)}</span>
            <span className="text-[12px] text-muted">/ {product.unit}</span>
          </p>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Nutrition per serving" className="mb-3" />
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Energy", value: `${product.perServingKcal}`, unit: "kcal", tone: "amber" as const },
              { label: "Category", value: product.category, unit: "aisle", tone: "teal" as const },
              { label: "Unit", value: product.unit.split(" ")[0], unit: product.unit.split(" ").slice(1).join(" "), tone: "blue" as const },
            ].map((n) => (
              <div key={n.label} className="rounded-[16px] bg-canvas p-3">
                <p className="text-[11px] text-muted">{n.label}</p>
                <p className="tnum mt-1 text-[16px] font-semibold">{n.value}</p>
                <p className="text-[10px] text-muted">{n.unit}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink">{product.description}</p>
        </Card>

        {fits.length ? (
          <Card className="flex items-start gap-3 p-4">
            <IconTile tone="lime" size={42}>
              <IconLeaf size={20} />
            </IconTile>
            <div>
              <p className="text-[14px] font-semibold">Good for your plan</p>
              <p className="mt-0.5 text-[12px] text-muted">
                Tagged {fits.join(", ").toLowerCase()} — matches the goals you set during onboarding.
              </p>
            </div>
          </Card>
        ) : null}

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted">Quantity</p>
              <p className="text-[15px] font-semibold">{naira(product.price * qty)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="press grid h-11 w-11 place-items-center rounded-full bg-canvas"
              >
                <IconMinus size={18} />
              </button>
              <span className="tnum w-6 text-center text-[18px] font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                aria-label="Increase quantity"
                className="press grid h-11 w-11 place-items-center rounded-full bg-lime-tint text-lime-dark"
              >
                <IconPlus size={18} />
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                store.addToCart(product.id, qty);
                push(`${qty} × ${product.name} added`);
              }}
              className="press rounded-full bg-lime-wash py-3.5 text-[13px] font-semibold text-lime-dark"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => {
                store.addToCart(product.id, qty);
                router.push("/cart");
              }}
              className="press rounded-full bg-lime py-3.5 text-[13px] font-semibold text-white"
            >
              Buy now
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1">
              <IconTruck size={13} />
              Next-day in Lagos
            </span>
            <span className="inline-flex items-center gap-1">
              <IconShield size={13} />
              Cold chain checked
            </span>
          </div>
        </Card>

        {related.length ? (
          <Card className="p-4">
            <SectionHeader title="More in this aisle" className="mb-3" />
            <div className="space-y-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/shop/${r.id}`}
                  className="press flex items-center gap-3 rounded-[16px] bg-canvas p-3"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-surface text-[22px]">
                    {r.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{r.name}</span>
                    <span className="block text-[11px] text-muted">
                      {naira(r.price)} / {r.unit}
                    </span>
                  </span>
                  <IconCheck size={16} className="text-lime-dark" />
                </Link>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
