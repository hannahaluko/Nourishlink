import { describe, expect, it } from "vitest";
import {
  FREE_DELIVERY_THRESHOLD,
  STANDARD_DELIVERY_FEE,
  averageOf,
  canJoinConsult,
  deliveryFeeFor,
  glucoseInRangeRatio,
  isDiscoverable,
  loggingStreak,
  nextOpenSlots,
  nextOrderStatus,
  orderProgress,
  orderTotal,
  weightChange,
} from "@/lib/care";
import type { Dietitian } from "@/lib/types";

const TODAY = "2026-10-14";

const dietitian = (over: Partial<Dietitian> = {}): Dietitian =>
  ({
    id: "d_test",
    name: "Test Dietitian",
    headline: "",
    city: "Lekki, Lagos",
    country: "Nigeria",
    specialties: [],
    focus: [],
    languages: ["English"],
    years: 5,
    fee: 15000,
    rating: 4.5,
    reviews: 10,
    bio: "",
    verification: { status: "verified", licenceNo: "NG-1" },
    avatarTint: "lime",
    slots: [
      { id: "s1", date: "2026-10-20", day: "Tue", time: "09:00", mode: "video" },
      { id: "s2", date: "2026-10-12", day: "Mon", time: "10:30", mode: "video" },
      { id: "s3", date: "2026-10-21", day: "Wed", time: "12:00", mode: "chat", taken: true },
    ],
    ...over,
  }) as Dietitian;

describe("consult rules", () => {
  it("only lets a client join a paid, confirmed consult", () => {
    expect(canJoinConsult({ payment: "paid", status: "confirmed" })).toBe(true);
    expect(canJoinConsult({ payment: "unpaid", status: "confirmed" })).toBe(false);
    expect(canJoinConsult({ payment: "paid", status: "pending" })).toBe(false);
    expect(canJoinConsult({ payment: "refunded", status: "confirmed" })).toBe(false);
  });

  it("keeps unverified dietitians out of discovery even when slots exist", () => {
    const pending = dietitian({ verification: { status: "pending", licenceNo: "NG-2" } });
    // One bookable slot remains, but the licence gate is what hides them in search.
    expect(nextOpenSlots(pending, TODAY)).toHaveLength(1);
    expect(isDiscoverable(pending, TODAY)).toBe(false);
    expect(isDiscoverable(dietitian(), TODAY)).toBe(true);
  });

  it("lists future, untaken slots in chronological order", () => {
    const slots = nextOpenSlots(dietitian(), TODAY);
    expect(slots.map((s) => s.id)).toEqual(["s1"]);
    expect(nextOpenSlots(dietitian(), TODAY, 5).map((s) => s.date)).toEqual(["2026-10-20"]);
  });
});

describe("ordering rules", () => {
  it("waives delivery above the free threshold and for pickup", () => {
    expect(deliveryFeeFor(10_000, "delivery")).toBe(STANDARD_DELIVERY_FEE);
    expect(deliveryFeeFor(FREE_DELIVERY_THRESHOLD, "delivery")).toBe(0);
    expect(deliveryFeeFor(9_000, "pickup")).toBe(0);
  });

  it("walks the fulfilment flow forward and stops at delivered", () => {
    expect(nextOrderStatus("placed")).toBe("packed");
    expect(nextOrderStatus("packed")).toBe("dispatched");
    expect(nextOrderStatus("dispatched")).toBe("delivered");
    expect(nextOrderStatus("delivered")).toBeNull();
    expect(orderProgress("placed")).toBe(25);
    expect(orderProgress("delivered")).toBe(100);
  });

  it("adds delivery to the order total", () => {
    expect(orderTotal({ subtotal: 15_100, deliveryFee: 1_500 })).toBe(16_600);
  });
});

describe("tracking rules", () => {
  it("computes the share of readings inside the glucose band", () => {
    expect(glucoseInRangeRatio([])).toBe(0);
    expect(glucoseInRangeRatio([{ value: 6 }, { value: 6.5 }, { value: 9 }, { value: 3.5 }])).toBe(0.5);
  });

  it("averages an empty list safely", () => {
    expect(averageOf([])).toBe(0);
    expect(averageOf([6, 7, 8])).toBe(7);
  });

  it("reports signed weight change across a series", () => {
    expect(weightChange([{ kg: 85.6 }, { kg: 82.4 }])).toBe(-3.2);
    expect(weightChange([{ kg: 80 }])).toBe(0);
  });

  it("counts a logging streak from the most recent day backwards", () => {
    expect(
      loggingStreak([
        { kcal: 1800, steps: 5000 },
        { kcal: 0, steps: 0 },
        { kcal: 1700, steps: 6000 },
        { kcal: 1600, steps: 8000 },
      ]),
    ).toBe(2);
    expect(loggingStreak([{ kcal: 0, steps: 0 }])).toBe(0);
  });
});
