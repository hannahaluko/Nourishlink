"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconBag,
  IconCalendar,
  IconCart,
  IconGrid,
  IconNote,
  IconScan,
  IconSearch,
  IconUser,
  IconUsers,
  IconVerified,
  IconDroplet,
  IconFlame,
  IconScale,
} from "./icons";
import { Sheet as _Sheet } from "./ui";
import { useStore } from "@/lib/store";
import { useToast } from "./app-providers";

const NAV_BG =
  "bg-surface card-nav border-t border-hairline md:border md:rounded-[24px] md:mb-3 md:border-hairline";

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="press flex flex-1 flex-col items-center justify-end gap-1 pb-2 pt-2.5"
    >
      <span className={active ? "text-ink" : "text-faint"}>{icon}</span>
      <span
        className={`text-[11px] leading-none ${
          active ? "font-bold text-ink" : "font-medium text-muted"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { activeRole, addMeal, addGlucose, addWater, today } = useStore();
  const { push } = useToast();
  const [quickOpen, setQuickOpen] = useState(false);

  const clientNav = [
    { href: "/app", label: "Home", icon: <IconGrid size={21} /> },
    { href: "/shop", label: "Shop", icon: <IconBag size={21} /> },
    { href: "/consults", label: "Consults", icon: <IconCalendar size={21} /> },
    { href: "/profile", label: "Profile", icon: <IconUser size={21} /> },
  ];

  const dietitianNav = [
    { href: "/dietitian", label: "Clients", icon: <IconUsers size={21} /> },
    { href: "/consults", label: "Consults", icon: <IconCalendar size={21} /> },
    { href: "/dietitian/schedule", label: "Schedule", icon: <IconNote size={21} /> },
    { href: "/profile", label: "Profile", icon: <IconUser size={21} /> },
  ];

  const adminNav = [
    { href: "/admin", label: "Overview", icon: <IconGrid size={21} /> },
    { href: "/admin/dietitians", label: "Dietitians", icon: <IconVerified size={21} /> },
    { href: "/admin/orders", label: "Orders", icon: <IconCart size={21} /> },
    { href: "/profile", label: "Profile", icon: <IconUser size={21} /> },
  ];

  const items =
    activeRole === "dietitian" ? dietitianNav : activeRole === "admin" ? adminNav : clientNav;

  const [left, ...rest] = items;
  const secondColumn = rest.slice(0, 2);
  const thirdColumn = rest.slice(2);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 md:bottom-2">
        <div className={`mx-auto flex w-full max-w-[520px] items-stretch md:rounded-[24px] ${NAV_BG}`}>
          <NavLink {...left} active={pathname === left.href} />
          {secondColumn.map((item) => (
            <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />
          ))}

          {/* Raised lime action button with white ring */}
          <div className="relative flex w-[74px] shrink-0 justify-center">
            <button
              type="button"
              onClick={() => setQuickOpen(true)}
              aria-label="Quick add"
              className="press absolute -top-6 grid h-[58px] w-[58px] place-items-center rounded-full border-[5px] border-surface bg-lime text-white card-float"
            >
              <IconScan size={24} />
            </button>
          </div>

          {thirdColumn.map((item) => (
            <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />
          ))}
        </div>
      </nav>

      <QuickAddSheet
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        role={activeRole}
        onMeal={() => {
          setQuickOpen(false);
          addMeal({
            date: today,
            type: "Snack",
            title: "Mixed nuts",
            items: ["Raw almonds 20 g"],
            kcal: 160,
          });
          push("Snack logged · 160 kcal");
        }}
        onGlucose={() => {
          setQuickOpen(false);
          addGlucose({ date: today, time: "12:30", value: 6.5, context: "Pre-meal" });
          push("Glucose 6.5 mmol/L saved");
        }}
        onWater={() => {
          setQuickOpen(false);
          addWater(1);
          push("Glass of water logged");
        }}
      />
    </>
  );
}

function QuickAddSheet({
  open,
  onClose,
  role,
  onMeal,
  onGlucose,
  onWater,
}: {
  open: boolean;
  onClose: () => void;
  role: "client" | "dietitian" | "admin";
  onMeal: () => void;
  onGlucose: () => void;
  onWater: () => void;
}) {
  const { push } = useToast();
  const quick = [
    { label: "Log a meal", icon: <IconFlame size={20} />, onClick: onMeal },
    { label: "Log glucose", icon: <IconDroplet size={20} />, onClick: onGlucose },
    { label: "Log water", icon: <IconDroplet size={20} />, onClick: onWater },
    { label: "Log weight", icon: <IconScale size={20} />, onClick: () => (window.location.href = "/track/weight") },
  ];
  const scan = {
    label: "Scan a barcode",
    icon: <IconScan size={20} />,
    onClick: () => {
      push("Barcode scanning ships right after the pilot");
      onClose();
    },
  };
  const staff = [
    { label: "Find a client", icon: <IconSearch size={20} />, onClick: () => (window.location.href = "/dietitian") },
    { label: "Write a session note", icon: <IconNote size={20} />, onClick: () => (window.location.href = "/dietitian") },
    { label: "Open schedule", icon: <IconCalendar size={20} />, onClick: () => (window.location.href = "/dietitian/schedule") },
    { label: "Verify a dietitian", icon: <IconVerified size={20} />, onClick: () => (window.location.href = "/admin/dietitians") },
  ];
  const actions = role === "client" ? quick : staff;

  return (
    <_Sheet open={open} onClose={onClose} title="Quick add">
      <p className="mb-4 text-[13px] text-muted">
        {role === "client"
          ? "Log something in two taps — your dietitian sees it instantly."
          : "Shortcuts for your daily workflow."}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {(role === "client" ? [...actions, scan] : actions).map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className="press flex items-center gap-3 rounded-[18px] bg-canvas p-3 text-left"
          >
            <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-lime-tint text-lime-dark">
              {a.icon}
            </span>
            <span className="text-[13px] font-medium">{a.label}</span>
          </button>
        ))}
      </div>
    </_Sheet>
  );
}
