"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/app-providers";
import { Card, IconTile, Pill } from "@/components/ui";
import { IconLeaf, IconUser, IconVerified, IconGrid } from "@/components/icons";

export default function LoginPage() {
  const store = useStore();
  const router = useRouter();
  const { push } = useToast();
  const [email, setEmail] = useState("amara@example.com");
  const [password, setPassword] = useState("nourish123");

  const signIn = (role: "client" | "dietitian" | "admin") => {
    store.setRole(role);
    store.updateProfile({ email, onboardedAt: store.profile.onboardedAt ?? new Date().toISOString() });
    push(role === "client" ? "Signed in" : `Signed in as ${role}`);
    router.push(role === "client" ? "/app" : role === "dietitian" ? "/dietitian" : "/admin");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col justify-center px-[18px] py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-lime text-white">
          <IconLeaf size={22} />
        </span>
        <div>
          <p className="text-[13px] text-muted">Welcome back</p>
          <h1 className="text-[19px] font-bold">Log in to NourishLink</h1>
        </div>
      </div>

      <Card className="p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            signIn("client");
          }}
          className="space-y-4"
        >
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-muted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[16px] bg-canvas px-3.5 py-3.5 text-[14px] outline-none focus:ring-2 focus:ring-lime/60"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-muted">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[16px] bg-canvas px-3.5 py-3.5 text-[14px] outline-none focus:ring-2 focus:ring-lime/60"
            />
          </label>
          <button
            type="submit"
            className="press w-full rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white"
          >
            Log in
          </button>
        </form>

        <button
          type="button"
          onClick={() => push("Reset link sent (demo)")}
          className="press mt-3 w-full text-center text-[12px] font-semibold text-muted"
        >
          Forgot password?
        </button>
      </Card>

      <Card className="mt-3 p-4">
        <p className="text-[13px] font-semibold">Demo accounts</p>
        <p className="mt-1 text-[12px] text-muted">
          This prototype ships with three roles so you can review both sides of the product.
        </p>
        <div className="mt-3 space-y-2">
          {[
            { role: "client" as const, label: "Amara · client", hint: "Tracking, booking, ordering", icon: <IconUser size={18} />, tone: "lime" as const },
            { role: "dietitian" as const, label: "Ngozi · dietitian", hint: "Caseload, notes, availability", icon: <IconVerified size={18} />, tone: "teal" as const },
            { role: "admin" as const, label: "Admin console", hint: "Verify dietitians, fulfil orders", icon: <IconGrid size={18} />, tone: "violet" as const },
          ].map((a) => (
            <button
              key={a.role}
              type="button"
              onClick={() => signIn(a.role)}
              className="press flex w-full items-center gap-3 rounded-[16px] bg-canvas p-3 text-left"
            >
              <IconTile tone={a.tone} size={38}>
                {a.icon}
              </IconTile>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">{a.label}</span>
                <span className="block text-[11px] text-muted">{a.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      <p className="mt-4 text-center text-[12px] text-muted">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-lime-dark">
          Create an account
        </Link>
      </p>
      <div className="mt-3 text-center">
        <Pill tone="gray">Prototype · no real authentication</Pill>
      </div>
    </div>
  );
}
