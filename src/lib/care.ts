/* Pure domain rules shared by screens. Keeping them here means the same rule
   powers the UI and the tests — no drift between what we show and what we check. */

import { prettyTime } from "./format";
import type { Appointment, Dietitian, GlucoseLog, Order, OrderStatus, WeightLog } from "./types";

/* ------------------------------- consults ------------------------------- */

/** A client can only enter the video room once the consult is paid for. */
export function canJoinConsult(appointment: Pick<Appointment, "payment" | "status">): boolean {
  return appointment.payment === "paid" && appointment.status === "confirmed";
}

/** Dietitians only appear in search after an admin verifies their licence,
 *  and only if they still have a bookable slot in the future. */
export function isDiscoverable(dietitian: Dietitian, today: string): boolean {
  if (dietitian.verification.status !== "verified") return false;
  return dietitian.slots.some((s) => !s.taken && s.date >= today);
}

export function nextOpenSlots(dietitian: Dietitian, today: string, limit = 3) {
  return dietitian.slots
    .filter((s) => !s.taken && s.date >= today)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, limit);
}

export const consultLabel = (appointment: Pick<Appointment, "date" | "time" | "mode">) =>
  `${appointment.date} at ${prettyTime(appointment.time)} · ${appointment.mode}`;

/* -------------------------------- orders -------------------------------- */

export const FREE_DELIVERY_THRESHOLD = 25_000;
export const STANDARD_DELIVERY_FEE = 1_500;

export function deliveryFeeFor(subtotal: number, fulfilment: "delivery" | "pickup"): number {
  if (fulfilment === "pickup") return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
}

const ORDER_FLOW: OrderStatus[] = ["placed", "packed", "dispatched", "delivered"];

export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  const i = ORDER_FLOW.indexOf(status);
  if (i === -1 || i === ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[i + 1];
}

export function orderProgress(status: OrderStatus): number {
  const i = ORDER_FLOW.indexOf(status);
  return i === -1 ? 0 : Math.round(((i + 1) / ORDER_FLOW.length) * 100);
}

export const orderTotal = (order: Pick<Order, "subtotal" | "deliveryFee">) =>
  order.subtotal + order.deliveryFee;

/* ------------------------------- tracking ------------------------------- */

export const GLUCOSE_TARGET = { low: 3.9, high: 7.8, veryHigh: 10 };

export function glucoseInRangeRatio(readings: Pick<GlucoseLog, "value">[]): number {
  if (readings.length === 0) return 0;
  const inRange = readings.filter((r) => r.value >= GLUCOSE_TARGET.low && r.value <= GLUCOSE_TARGET.high);
  return inRange.length / readings.length;
}

export function averageOf(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((n, v) => n + v, 0) / values.length;
}

/** Signed change across a weight series — negative means loss. */
export function weightChange(series: Pick<WeightLog, "kg">[]): number {
  if (series.length < 2) return 0;
  return Number((series[series.length - 1].kg - series[0].kg).toFixed(1));
}

export function loggingStreak(days: { kcal: number; steps: number }[]): number {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].kcal > 0 || days[i].steps > 0) streak++;
    else break;
  }
  return streak;
}
