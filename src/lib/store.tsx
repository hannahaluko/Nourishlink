"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createSeed, CLIENT_ID, DEMO_DIETITIAN_ID, type AppData } from "./seed";
import type {
  Appointment,
  CartLine,
  ConsentState,
  DailyMetric,
  Dietitian,
  GlucoseContext,
  GlucoseLog,
  HealthProfile,
  MealLog,
  MealPlan,
  MealType,
  Message,
  Order,
  OrderStatus,
  Product,
  Role,
  SessionNote,
} from "./types";
import { addDays, prettyTime, todayISO } from "./format";
import { deliveryFeeFor } from "./care";

const STORAGE_KEY = "nourishlink.state.v1";

interface StoreValue extends AppData {
  today: string;
  ready: boolean;
  /* profile + consent */
  updateProfile: (patch: Partial<HealthProfile>) => void;
  completeOnboarding: (patch: Partial<HealthProfile>) => void;
  setConsent: (patch: Partial<ConsentState>) => void;
  setRole: (role: Role) => void;
  /* tracking */
  addMeal: (meal: Omit<MealLog, "id" | "clientId" | "loggedAt">) => void;
  removeMeal: (id: string) => void;
  addGlucose: (log: { date: string; time: string; value: number; context: GlucoseContext; note?: string }) => void;
  addWeight: (log: { date: string; kg: number }) => void;
  addWater: (glasses: number) => void;
  /* consults */
  bookAppointment: (input: {
    dietitianId: string;
    date: string;
    time: string;
    mode: "video" | "chat";
    reason: string;
  }) => Appointment;
  payAppointment: (id: string) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
  sendMessage: (appointmentId: string, text: string, from: Message["from"]) => void;
  saveNote: (note: Omit<SessionNote, "id">) => void;
  assignMealPlan: (plan: Omit<MealPlan, "id" | "createdAt">) => void;
  /* shop */
  addToCart: (productId: string, qty?: number) => void;
  setCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  checkout: (address: string) => Order;
  advanceOrder: (id: string, status: OrderStatus) => void;
  /* admin */
  setVerification: (dietitianId: string, status: "verified" | "rejected" | "pending") => void;
  setStock: (productId: string, stock: number) => void;
  /* reminders */
  toggleReminder: (id: string) => void;
  /* demo */
  resetDemo: () => void;
  /* selectors */
  metricFor: (date: string, clientId?: string) => DailyMetric;
  mealsFor: (clientId: string, date?: string) => MealLog[];
  glucoseFor: (clientId: string) => GlucoseLog[];
  weightsFor: (clientId: string) => { date: string; kg: number }[];
  dietitianById: (id: string) => Dietitian | undefined;
  clientById: (id: string) => HealthProfile | undefined;
  cartLines: { line: CartLine; product: Product }[];
  cartSubtotal: number;
}

const StoreContext = createContext<StoreValue | null>(null);

const EMPTY_METRIC: Omit<DailyMetric, "date"> = {
  steps: 0,
  stepsTarget: 8000,
  water: 0,
  waterTarget: 8,
  kcal: 0,
  kcalTarget: 1800,
  exerciseMin: 0,
  exerciseTarget: 30,
  restingHr: 0,
  hrSeries: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

export function StoreProvider({
  children,
  today = todayISO(),
}: {
  children: React.ReactNode;
  today?: string;
}) {
  const seed = useMemo(() => createSeed(today), [today]);
  const [data, setData] = useState<AppData>(seed);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  /* Load any local session after mount (keeps server HTML deterministic). */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppData>;
        setData((prev) => ({
          ...prev,
          ...parsed,
          dietitians: parsed.dietitians?.length ? parsed.dietitians : prev.dietitians,
          products: parsed.products?.length ? parsed.products : prev.products,
        }));
      }
    } catch {
      /* ignore malformed storage */
    }
    hydrated.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!hydrated.current || !ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or blocked — demo continues in memory */
    }
  }, [data, ready]);

  const patch = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);

  const value = useMemo<StoreValue>(() => {
    const metricFor = (date: string): DailyMetric =>
      data.metrics.find((m) => m.date === date) ?? { date, ...EMPTY_METRIC };

    return {
      ...data,
      today,
      ready,

      updateProfile: (p) =>
        patch((d) => ({ ...d, profile: { ...d.profile, ...p }, clients: d.clients.map((c) => (c.id === d.profile.id ? { ...c, ...p } : c)) })),

      completeOnboarding: (p) =>
        patch((d) => {
          const next: HealthProfile = {
            ...d.profile,
            ...p,
            role: "client",
            onboardedAt: new Date().toISOString(),
          };
          return {
            ...d,
            profile: next,
            clients: d.clients.map((c) => (c.id === next.id ? next : c)),
            consent: { ...d.consent, agreedAt: new Date().toISOString() },
          };
        }),

      setConsent: (p) => patch((d) => ({ ...d, consent: { ...d.consent, ...p } })),

      setRole: (role) => patch((d) => ({ ...d, activeRole: role })),

      addMeal: (meal) =>
        patch((d) => {
          const log: MealLog = {
            ...meal,
            id: `m_${Date.now()}`,
            clientId: d.profile.id,
            loggedAt: new Date().toISOString(),
          };
          return {
            ...d,
            meals: [log, ...d.meals],
            metrics: d.metrics.map((m) =>
              m.date === meal.date ? { ...m, kcal: m.kcal + meal.kcal } : m,
            ),
          };
        }),

      removeMeal: (id) =>
        patch((d) => {
          const target = d.meals.find((m) => m.id === id);
          return {
            ...d,
            meals: d.meals.filter((m) => m.id !== id),
            metrics: target
              ? d.metrics.map((m) =>
                  m.date === target.date ? { ...m, kcal: Math.max(0, m.kcal - target.kcal) } : m,
                )
              : d.metrics,
          };
        }),

      addGlucose: (log) =>
        patch((d) => ({
          ...d,
          glucose: [
            {
              id: `g_${Date.now()}`,
              clientId: d.profile.id,
              ...log,
            },
            ...d.glucose,
          ],
        })),

      addWeight: (log) =>
        patch((d) => ({
          ...d,
          weights: [
            ...d.weights.filter((w) => !(w.clientId === CLIENT_ID && w.date === log.date)),
            { id: `w_${Date.now()}`, clientId: d.profile.id, ...log },
          ],
          profile: { ...d.profile, weightKg: log.kg },
        })),

      addWater: (glasses) =>
        patch((d) => {
          const date = d.metrics.at(-1)?.date ?? today;
          const has = d.metrics.some((m) => m.date === date);
          return {
            ...d,
            metrics: has
              ? d.metrics.map((m) =>
                  m.date === date
                    ? { ...m, water: Math.max(0, Math.min(m.waterTarget + 4, m.water + glasses)) }
                    : m,
                )
              : [...d.metrics, { date, ...EMPTY_METRIC, water: glasses }],
          };
        }),

      bookAppointment: (input) => {
        const appointment: Appointment = {
          id: `a_${Date.now()}`,
          clientId: data.profile.id,
          dietitianId: input.dietitianId,
          date: input.date,
          time: input.time,
          mode: input.mode,
          status: "pending",
          fee: data.dietitians.find((x) => x.id === input.dietitianId)?.fee ?? 0,
          payment: "unpaid",
          reference: `NL-CON-${Math.floor(1000 + Math.random() * 8999)}`,
          reason: input.reason,
          thread: [],
        };
        patch((d) => ({
          ...d,
          appointments: [appointment, ...d.appointments],
          dietitians: d.dietitians.map((x) =>
            x.id === input.dietitianId
              ? {
                  ...x,
                  slots: x.slots.map((s) =>
                    s.date === input.date && s.time === input.time ? { ...s, taken: true } : s,
                  ),
                }
              : x,
          ),
        }));
        return appointment;
      },

      payAppointment: (id) =>
        patch((d) => ({
          ...d,
          appointments: d.appointments.map((a) =>
            a.id === id ? { ...a, payment: "paid", status: "confirmed" } : a,
          ),
          reminders: [
            ...d.reminders,
            (() => {
              const appt = d.appointments.find((a) => a.id === id);
              const dietitian = d.dietitians.find((x) => x.id === appt?.dietitianId);
              return {
                id: `r_${Date.now()}`,
                clientId: d.profile.id,
                title: `${appt?.mode === "chat" ? "Chat" : "Video"} consult with ${
                  dietitian?.name ?? "your dietitian"
                }`,
                detail: `Booked slot ${appt ? prettyTime(appt.time) : ""} · ${appt?.reference ?? ""}`,
                when: `${appt?.date ?? today}T${appt?.time ?? "10:00"}:00Z`,
                kind: "consult" as const,
                done: false,
              };
            })(),
          ],
        })),

      updateAppointment: (id, p) =>
        patch((d) => ({
          ...d,
          appointments: d.appointments.map((a) => (a.id === id ? { ...a, ...p } : a)),
        })),

      cancelAppointment: (id) =>
        patch((d) => ({
          ...d,
          appointments: d.appointments.map((a) =>
            a.id === id
              ? { ...a, status: "cancelled", payment: a.payment === "paid" ? "refunded" : a.payment }
              : a,
          ),
        })),

      sendMessage: (appointmentId, text, from) =>
        patch((d) => {
          const appt = d.appointments.find((a) => a.id === appointmentId);
          if (!appt) return d;
          // Simple automated reply so the chat demo feels alive.
          const reply: Message | null =
            from === "client"
              ? {
                  id: `msg_${Date.now() + 1}`,
                  from: "dietitian",
                  text: "Got it — I'll review your logs before our session and adjust the plan.",
                  time: new Date().toISOString(),
                }
              : null;
          const next = [
            ...appt.thread,
            { id: `msg_${Date.now()}`, from, text, time: new Date().toISOString() },
            ...(reply ? [reply] : []),
          ];
          return {
            ...d,
            appointments: d.appointments.map((a) =>
              a.id === appointmentId ? { ...a, thread: next } : a,
            ),
          };
        }),

      saveNote: (note) =>
        patch((d) => ({
          ...d,
          notes: [{ ...note, id: `n_${Date.now()}` }, ...d.notes],
        })),

      assignMealPlan: (plan) =>
        patch((d) => ({
          ...d,
          mealPlans: [
            { ...plan, id: `mp_${Date.now()}`, createdAt: new Date().toISOString() },
            ...d.mealPlans,
          ],
        })),

      addToCart: (productId, qty = 1) =>
        patch((d) => {
          const existing = d.cart.find((l) => l.productId === productId);
          const cart = existing
            ? d.cart.map((l) => (l.productId === productId ? { ...l, qty: l.qty + qty } : l))
            : [...d.cart, { productId, qty }];
          return { ...d, cart };
        }),

      setCartQty: (productId, qty) =>
        patch((d) => ({
          ...d,
          cart:
            qty <= 0
              ? d.cart.filter((l) => l.productId !== productId)
              : d.cart.some((l) => l.productId === productId)
                ? d.cart.map((l) => (l.productId === productId ? { ...l, qty } : l))
                : [...d.cart, { productId, qty }],
        })),

      clearCart: () => patch((d) => ({ ...d, cart: [] })),

      checkout: (address) => {
        const lines = data.cart
          .map((l) => {
            const product = data.products.find((p) => p.id === l.productId);
            return product
              ? { productId: product.id, name: product.name, price: product.price, qty: l.qty }
              : null;
          })
          .filter(Boolean) as Order["lines"];
        const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
        const deliveryFee = deliveryFeeFor(subtotal, address.startsWith("Pickup") ? "pickup" : "delivery");
        const order: Order = {
          id: `o_${Date.now()}`,
          clientId: data.profile.id,
          lines,
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          status: "placed",
          payment: "paid",
          placedAt: new Date().toISOString(),
          address,
          eta: `${addDays(today, 1)}T14:00:00Z`,
          reference: `NL-ORD-${Math.floor(1100 + Math.random() * 899)}`,
        };
        patch((d) => ({
          ...d,
          orders: [order, ...d.orders],
          cart: [],
          products: d.products.map((p) => {
            const line = order.lines.find((l) => l.productId === p.id);
            return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
          }),
          reminders: [
            ...d.reminders,
            {
              id: `r_${Date.now()}`,
              clientId: d.profile.id,
              title: "Grocery delivery arriving",
              detail: `Order ${order.reference} · ${order.lines.length} item(s)`,
              when: order.eta,
              kind: "order" as const,
              done: false,
            },
          ],
        }));
        return order;
      },

      advanceOrder: (id, status) =>
        patch((d) => ({
          ...d,
          orders: d.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),

      setVerification: (dietitianId, status) =>
        patch((d) => ({
          ...d,
          dietitians: d.dietitians.map((x) =>
            x.id === dietitianId
              ? {
                  ...x,
                  verification: {
                    ...x.verification,
                    status,
                    verifiedBy: status === "verified" ? "NourishLink admin" : undefined,
                    verifiedAt: status === "verified" ? new Date().toISOString() : undefined,
                  },
                }
              : x,
          ),
        })),

      setStock: (productId, stock) =>
        patch((d) => ({
          ...d,
          products: d.products.map((p) => (p.id === productId ? { ...p, stock } : p)),
        })),

      toggleReminder: (id) =>
        patch((d) => ({
          ...d,
          reminders: d.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)),
        })),

      resetDemo: () => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setData(createSeed(today));
      },

      metricFor,

      mealsFor: (clientId, date) =>
        data.meals
          .filter((m) => m.clientId === clientId && (!date || m.date === date))
          .sort((a, b) => a.loggedAt.localeCompare(b.loggedAt)),

      glucoseFor: (clientId) =>
        data.glucose
          .filter((g) => g.clientId === clientId)
          .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),

      weightsFor: (clientId) =>
        data.weights
          .filter((w) => w.clientId === clientId)
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(({ date, kg }) => ({ date, kg })),

      dietitianById: (id) => data.dietitians.find((d) => d.id === id),
      clientById: (id) => data.clients.find((c) => c.id === id),

      cartLines: data.cart
        .map((line) => {
          const product = data.products.find((p) => p.id === line.productId);
          return product ? { line, product } : null;
        })
        .filter(Boolean) as { line: CartLine; product: Product }[],

      cartSubtotal: data.cart.reduce((sum, l) => {
        const product = data.products.find((p) => p.id === l.productId);
        return sum + (product ? product.price * l.qty : 0);
      }, 0),
    };
  }, [data, patch, ready, today]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export { CLIENT_ID, DEMO_DIETITIAN_ID };
export type { MealType };
