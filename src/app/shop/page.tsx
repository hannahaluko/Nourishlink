"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { naira } from "@/lib/format";
import { DIET_TAGS } from "@/lib/seed";
import { useToast } from "@/components/app-providers";
import { Card, CircleButton, IconTile, Tag } from "@/components/ui";
import {
  IconBag,
  IconCart,
  IconFlame,
  IconLeaf,
  IconPlus,
  IconSearch,
  IconStar,
  IconTruck,
} from "@/components/icons";

const CATEGORIES = ["All", "Grains", "Proteins", "Produce", "Snacks", "Drinks", "Dairy"] as const;

export default function ShopPage() {
  const store = useStore();
  const { push } = useToast();
  const { products, cart, profile } = store;
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState<string | null>(null);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const cartCount = cart.reduce((n, l) => n + l.qty, 0);

  const results = products.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || `${p.name} ${p.brand} ${p.category} ${p.vendor}`.toLowerCase().includes(q);
    const matchesDiet = !diet || p.dietTags.includes(diet);
    const matchesCategory = category === "All" || p.category === category;
    return matchesQuery && matchesDiet && matchesCategory;
  });

  const recommended = useMemo(() => {
    const wants = new Set<string>();
    if (profile.conditions.includes("Type 2 diabetes")) wants.add("Diabetes");
    if (profile.conditions.includes("Hypertension")) wants.add("Hypertension");
    if (profile.goals.includes("Lose weight")) wants.add("Weight loss");
    if (profile.goals.includes("Build muscle")) wants.add("High protein");
    return products.filter((p) => p.dietTags.some((t) => wants.has(t))).slice(0, 3);
  }, [products, profile]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] md:max-w-[880px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Healthy food shop</p>
          <h1 className="truncate text-[17px] font-semibold">Eat well, delivered</h1>
        </div>
        <CircleButton label="Orders" href="/orders" size={44}>
          <IconTruck size={20} />
        </CircleButton>
        <Link
          href="/cart"
          aria-label="Cart"
          className="press relative grid h-11 w-11 place-items-center rounded-full bg-surface"
        >
          <IconCart size={20} />
          {cartCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          ) : null}
        </Link>
      </header>

      <div className="space-y-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 rounded-full bg-canvas px-3.5 py-3">
            <IconSearch size={18} className="text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rice, fish, yoghurt…"
              aria-label="Search products"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-faint"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <Tag active={diet === null} onClick={() => setDiet(null)}>
              All diets
            </Tag>
            {DIET_TAGS.map((t) => (
              <Tag key={t} active={diet === t} onClick={() => setDiet(t)}>
                {t}
              </Tag>
            ))}
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <Tag key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Tag>
            ))}
          </div>
        </Card>

        {recommended.length && !diet && !query ? (
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <IconTile tone="lime" size={38}>
                <IconLeaf size={18} />
              </IconTile>
              <div>
                <h2 className="text-[15px] font-semibold">Fits your profile</h2>
                <p className="text-[12px] text-muted">
                  Picked for {profile.conditions.join(", ").toLowerCase()} · {profile.goals[0].toLowerCase()}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {recommended.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.id}`}
                  className="press w-[150px] shrink-0 rounded-[18px] bg-canvas p-3"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-[14px] bg-surface text-[26px]">
                    {p.emoji}
                  </span>
                  <span className="mt-2 block truncate text-[13px] font-semibold">{p.name}</span>
                  <span className="mt-0.5 block text-[12px] text-muted">{naira(p.price)}</span>
                </Link>
              ))}
            </div>
          </Card>
        ) : null}

        <div className="flex items-center justify-between px-1">
          <p className="text-[13px] font-semibold">{results.length} products</p>
          <p className="text-[12px] text-muted">Free delivery over ₦25,000</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <Card key={p.id} className="flex flex-col p-3">
              <Link href={`/shop/${p.id}`} className="press flex-1">
                <div className="relative">
                  <span
                    className={`grid h-[86px] w-full place-items-center rounded-[16px] text-[38px] ${
                      p.tint === "amber"
                        ? "bg-amber-tint"
                        : p.tint === "blue"
                          ? "bg-blue-tint"
                          : p.tint === "red"
                            ? "bg-red-tint"
                            : p.tint === "teal"
                              ? "bg-teal-tint"
                              : p.tint === "orange"
                                ? "bg-orange-tint"
                                : "bg-violet-tint"
                    }`}
                  >
                    {p.emoji}
                  </span>
                  {p.stock <= 10 ? (
                    <span className="absolute left-2 top-2 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-red">
                      {p.stock} left
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug">{p.name}</p>
                <p className="mt-0.5 text-[11px] text-muted">{p.brand}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                  <IconStar size={11} className="text-amber" />
                  {p.rating.toFixed(1)}
                  <span className="inline-flex items-center gap-0.5">
                    <IconFlame size={11} className="text-amber" />
                    {p.perServingKcal} kcal
                  </span>
                </div>
                <p className="mt-1.5 text-[15px] font-semibold">
                  {naira(p.price)} <span className="text-[11px] font-normal text-muted">/ {p.unit}</span>
                </p>
              </Link>
              <button
                type="button"
                onClick={() => {
                  store.addToCart(p.id, 1);
                  push(`${p.name} added to cart`);
                }}
                className="press mt-2 flex items-center justify-center gap-1.5 rounded-full bg-lime-wash py-2.5 text-[12px] font-semibold text-lime-dark"
              >
                <IconPlus size={15} />
                Add
              </button>
            </Card>
          ))}
        </div>

        {results.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-8 text-center">
            <IconTile tone="gray" size={52} shape="circle">
              <IconBag size={22} />
            </IconTile>
            <p className="text-[15px] font-semibold">Nothing matched</p>
            <p className="max-w-[240px] text-[12px] text-muted">
              Try a different diet tag or clear the search. New stock drops every Tuesday.
            </p>
          </Card>
        ) : null}

        <p className="px-1 text-[11px] text-muted">
          Diet tags are set by our nutrition team from the product label. Always check packaging if you have
          a severe allergy.
        </p>
      </div>
    </div>
  );
}
