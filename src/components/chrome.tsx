"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BottomNav } from "./bottom-nav";
import { useStore } from "@/lib/store";

const PUBLIC = [/^\/$/, /^\/login/, /^\/signup/, /^\/onboarding/, /^\/privacy/, /^\/consult\/room/];

function showsNav(pathname: string) {
  return !PUBLIC.some((re) => re.test(pathname));
}

export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, ready } = useStore();

  useEffect(() => {
    if (!ready) return;
    const isPublic = PUBLIC.some((re) => re.test(pathname));
    if (!isPublic && !profile.onboardedAt) {
      router.replace("/onboarding");
    }
  }, [pathname, profile.onboardedAt, ready, router]);

  return (
    <>
      {children}
      {showsNav(pathname) ? <BottomNav /> : null}
    </>
  );
}
