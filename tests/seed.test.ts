import { describe, expect, it } from "vitest";
import { CLIENT_ID, DEMO_DIETITIAN_ID, createSeed } from "@/lib/seed";
import { glucoseInRangeRatio } from "@/lib/care";
import { addDays, startOfWeek, toISO } from "@/lib/format";

const TODAY = "2026-10-14";
const seed = createSeed(TODAY);

describe("seed data", () => {
  it("ships a demo client who has already completed onboarding", () => {
    expect(seed.profile.id).toBe(CLIENT_ID);
    expect(seed.profile.onboardedAt).toBeTruthy();
    expect(seed.consent.dataProcessing).toBe(true);
    expect(seed.activeRole).toBe("client");
  });

  it("covers the last seven days of metrics ending today", () => {
    expect(seed.metrics).toHaveLength(7);
    expect(seed.metrics.at(-1)!.date).toBe(TODAY);
    // seven consecutive days ending today
    expect(seed.metrics[0].date).toBe(addDays(TODAY, -6));
    expect(seed.metrics.every((m) => m.hrSeries.length === 12)).toBe(true);
    expect(startOfWeek(seed.metrics.at(-1)!.date)).toBe(startOfWeek(TODAY));
  });

  it("gives every dietitian slots that are inside the current week or later", () => {
    for (const d of seed.dietitians) {
      expect(d.slots.length).toBeGreaterThan(0);
      for (const s of d.slots) {
        expect(s.date >= startOfWeek(TODAY)).toBe(true);
        expect(["video", "chat"]).toContain(s.mode);
      }
    }
  });

  it("keeps Halima out of search until an admin verifies her", () => {
    const pending = seed.dietitians.filter((d) => d.verification.status === "pending");
    expect(pending.map((d) => d.id)).toEqual(["d_halima"]);
    expect(seed.dietitians.filter((d) => d.verification.status === "verified")).toHaveLength(5);
  });

  it("has a glucose history that broadly sits outside the healthy band", () => {
    const mine = seed.glucose.filter((g) => g.clientId === CLIENT_ID);
    expect(mine.length).toBeGreaterThan(10);
    expect(glucoseInRangeRatio(mine)).toBeLessThan(1); // a realistic, imperfect history
  });

  it("starts the demo client with a cart, an active order and a paid consult", () => {
    expect(seed.cart.length).toBeGreaterThan(0);
    expect(seed.orders.some((o) => o.clientId === CLIENT_ID && o.status !== "delivered")).toBe(true);
    const upcoming = seed.appointments.find((a) => a.id === "a_upcoming")!;
    expect(upcoming.payment).toBe("paid");
    expect(upcoming.status).toBe("confirmed");
    expect(upcoming.dietitianId).toBe(DEMO_DIETITIAN_ID);
  });

  it("keeps order arithmetic consistent", () => {
    for (const o of seed.orders) {
      expect(o.subtotal).toBe(o.lines.reduce((n, l) => n + l.price * l.qty, 0));
      expect(o.total).toBe(o.subtotal + o.deliveryFee);
    }
  });

  it("seeds a caseload and a plan for the dietitian workspace", () => {
    expect(seed.clients.length).toBeGreaterThanOrEqual(5);
    expect(seed.mealPlans[0].days[0].items.length).toBeGreaterThan(0);
    expect(seed.notes[0].plan.length).toBeGreaterThan(10);
    expect(seed.reminders.length).toBeGreaterThan(0);
  });

  it("is deterministic for a given day", () => {
    const again = createSeed(TODAY);
    expect(again.metrics).toEqual(seed.metrics);
    expect(again.dietitians.map((d) => d.id)).toEqual(seed.dietitians.map((d) => d.id));
    expect(toISO(new Date())).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
