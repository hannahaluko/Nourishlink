/* ------------------------------------------------------------------
   NourishLink domain model
   Mirrors the Postgres/Supabase schema described in the PRD, so the
   mock store in ./store.tsx can be swapped for real queries.
------------------------------------------------------------------ */

export type Role = "client" | "dietitian" | "admin";

export type Condition = "Type 2 diabetes" | "Hypertension" | "Obesity" | "High cholesterol" | "PCOS" | "None";

export type Goal = "Lose weight" | "Manage blood sugar" | "Lower blood pressure" | "Eat healthier" | "Build muscle" | "Gain weight";

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export type GlucoseContext = "Fasting" | "Pre-meal" | "Post-meal" | "Bedtime";

export type ConsultMode = "video" | "chat";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type OrderStatus = "placed" | "packed" | "dispatched" | "delivered";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface HealthProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  city: string;
  country: string;
  heightCm: number | null;
  weightKg: number | null;
  goals: Goal[];
  conditions: Condition[];
  allergies: string[];
  onboardedAt: string | null;
}

export interface ConsentState {
  /** Share logs + profile with a booked dietitian (feature 1) */
  shareWithDietitian: boolean;
  /** Reminder notifications by push/email (feature 3) */
  reminders: boolean;
  /** Health data processing consent — required, GDPR/NDPA style */
  dataProcessing: boolean;
  agreedAt: string | null;
}

export interface DailyMetric {
  date: string; // YYYY-MM-DD
  steps: number;
  stepsTarget: number;
  water: number; // glasses
  waterTarget: number;
  kcal: number;
  kcalTarget: number;
  exerciseMin: number;
  exerciseTarget: number;
  restingHr: number;
  hrSeries: number[]; // hourly BPM samples
}

export interface MealLog {
  id: string;
  clientId: string;
  date: string;
  type: MealType;
  title: string;
  items: string[];
  kcal: number;
  loggedAt: string;
}

export interface GlucoseLog {
  id: string;
  clientId: string;
  date: string;
  time: string; // HH:MM
  value: number; // mmol/L
  context: GlucoseContext;
  note?: string;
}

export interface WeightLog {
  id: string;
  clientId: string;
  date: string;
  kg: number;
}

export interface AvailabilitySlot {
  id: string;
  date: string; // YYYY-MM-DD
  day: string; // Mon..Sun
  time: string; // HH:MM
  mode: ConsultMode;
  taken?: boolean;
}

export interface Dietitian {
  id: string;
  name: string;
  headline: string;
  city: string;
  country: string;
  specialties: Goal[];
  focus: string[];
  languages: string[];
  years: number;
  fee: number; // NGN per consult
  rating: number;
  reviews: number;
  bio: string;
  verification: {
    status: "verified" | "pending" | "rejected";
    licenceNo: string;
    verifiedBy?: string;
    verifiedAt?: string;
  };
  avatarTint: string;
  slots: AvailabilitySlot[];
}

export interface Appointment {
  id: string;
  clientId: string;
  dietitianId: string;
  date: string;
  time: string;
  mode: ConsultMode;
  status: AppointmentStatus;
  fee: number;
  payment: PaymentStatus;
  reference: string;
  reason: string;
  thread: Message[];
}

export interface Message {
  id: string;
  from: "client" | "dietitian";
  text: string;
  time: string;
}

export interface SessionNote {
  id: string;
  appointmentId: string;
  clientId: string;
  dietitianId: string;
  date: string;
  subjective: string;
  assessment: string;
  plan: string;
}

export interface MealPlanItem {
  meal: MealType;
  title: string;
  kcal: number;
  items: string[];
}

export interface MealPlan {
  id: string;
  clientId: string;
  dietitianId: string;
  title: string;
  createdAt: string;
  instructions: string;
  days: { day: string; items: MealPlanItem[] }[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: "Grains" | "Proteins" | "Snacks" | "Drinks" | "Produce" | "Dairy";
  price: number;
  unit: string;
  perServingKcal: number;
  dietTags: string[];
  stock: number;
  rating: number;
  vendor: string;
  tint: string;
  emoji: string;
  description: string;
}

export interface CartLine {
  productId: string;
  qty: number;
}

export interface OrderLine {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  clientId: string;
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  payment: PaymentStatus;
  placedAt: string;
  address: string;
  eta: string;
  reference: string;
}

export interface Reminder {
  id: string;
  clientId: string;
  title: string;
  detail: string;
  when: string; // ISO datetime
  kind: "log" | "consult" | "order";
  done: boolean;
}

export interface DietTag {
  id: string;
  label: string;
  tint: string;
}

export type DietFilter = "Weight loss" | "Diabetes" | "Hypertension" | "High protein" | "Gluten-free" | "Vegan";
