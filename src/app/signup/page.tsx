"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, IconTile, Pill, Toggle } from "@/components/ui";
import { IconArrowRight, IconCheck, IconLeaf, IconLock, IconShield } from "@/components/icons";

export default function SignupPage() {
  const store = useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const valid = name.trim().length > 1 && email.includes("@") && password.length >= 6 && agree;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    /* New account: profile saved, onboarding still to be completed. */
    store.updateProfile({
      name,
      email,
      onboardedAt: null,
      goals: [],
      conditions: [],
      allergies: [],
    });
    router.push("/onboarding");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col justify-center px-[18px] py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-lime text-white">
          <IconLeaf size={22} />
        </span>
        <div>
          <p className="text-[13px] text-muted">Welcome to NourishLink</p>
          <h1 className="text-[19px] font-bold">Create your account</h1>
        </div>
      </div>

      <Card className="p-5">
        <form onSubmit={submit} className="space-y-4">
          {[
            { label: "Full name", value: name, set: setName, type: "text", placeholder: "Amara Okonkwo" },
            { label: "Email", value: email, set: setEmail, type: "email", placeholder: "you@email.com" },
            { label: "Password", value: password, set: setPassword, type: "password", placeholder: "6+ characters" },
          ].map((f) => (
            <label key={f.label} className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-muted">{f.label}</span>
              <input
                type={f.type}
                value={f.value}
                placeholder={f.placeholder}
                onChange={(e) => f.set(e.target.value)}
                className="w-full rounded-[16px] bg-canvas px-3.5 py-3.5 text-[14px] outline-none focus:ring-2 focus:ring-lime/60"
              />
            </label>
          ))}

          <div className="flex items-start gap-3 rounded-[16px] bg-canvas p-3">
            <Toggle checked={agree} onChange={setAgree} label="Agree to terms and privacy policy" />
            <p className="flex-1 text-[12px] text-muted">
              I agree to the{" "}
              <Link href="/privacy" className="font-semibold text-lime-dark">
                privacy policy
              </Link>{" "}
              and consent to NourishLink processing my health data to deliver care.
            </p>
          </div>

          <button
            type="submit"
            disabled={!valid}
            className="press flex w-full items-center justify-center gap-2 rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white disabled:opacity-50"
          >
            Continue to health profile
            <IconArrowRight size={18} />
          </button>
        </form>

        <p className="mt-4 text-center text-[12px] text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-lime-dark">
            Log in
          </Link>
        </p>
      </Card>

      <Card className="mt-3 p-4">
        <div className="flex items-start gap-3">
          <IconTile tone="lime" size={40}>
            <IconShield size={19} />
          </IconTile>
          <div>
            <p className="text-[13px] font-semibold">What happens next</p>
            <ol className="mt-2 space-y-1.5 text-[12px] text-muted">
              <li className="flex items-center gap-2">
                <IconCheck size={13} className="text-lime-dark" /> Goals, conditions and allergies
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={13} className="text-lime-dark" /> Consent screens before anything is shared
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={13} className="text-lime-dark" /> Straight into the dashboard
              </li>
            </ol>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Pill tone="gray">
                <IconLock size={12} />
                Encrypted health record
              </Pill>
              <Pill tone="lime">NDPR & GDPR</Pill>
            </div>
          </div>
        </div>
      </Card>

      <button
        type="button"
        onClick={() => router.push("/app")}
        className="press mt-4 text-center text-[12px] font-semibold text-muted"
      >
        Skip — continue with the demo account
      </button>
    </div>
  );
}
