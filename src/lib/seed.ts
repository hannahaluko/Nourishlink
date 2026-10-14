import {
  addDays,
  dayShort,
  lastNDays,
  prettyTime,
  startOfWeek,
  toISO,
} from "./format";
import type {
  Appointment,
  CartLine,
  ConsentState,
  DailyMetric,
  Dietitian,
  GlucoseLog,
  HealthProfile,
  MealLog,
  MealPlan,
  Order,
  Product,
  Reminder,
  SessionNote,
  WeightLog,
  AvailabilitySlot,
} from "./types";

export interface AppData {
  profile: HealthProfile;
  consent: ConsentState;
  activeRole: "client" | "dietitian" | "admin";
  clients: HealthProfile[];
  metrics: DailyMetric[];
  meals: MealLog[];
  glucose: GlucoseLog[];
  weights: WeightLog[];
  dietitians: Dietitian[];
  appointments: Appointment[];
  notes: SessionNote[];
  mealPlans: MealPlan[];
  products: Product[];
  cart: CartLine[];
  orders: Order[];
  reminders: Reminder[];
}

export const CLIENT_ID = "u_amara";
export const DEMO_DIETITIAN_ID = "d_ngozi";

/* ------------------------------- people ------------------------------- */

const baseProfile = (): HealthProfile => ({
  id: CLIENT_ID,
  name: "Amara Okonkwo",
  email: "amara@example.com",
  role: "client",
  phone: "+234 803 555 0142",
  city: "Lekki, Lagos",
  country: "Nigeria",
  heightCm: 168,
  weightKg: 82.4,
  goals: ["Lose weight", "Manage blood sugar", "Eat healthier"],
  conditions: ["Type 2 diabetes"],
  allergies: ["Peanuts", "Shellfish"],
  onboardedAt: null,
});

const caseload = (): HealthProfile[] => [
  {
    ...baseProfile(),
    city: "Lekki, Lagos",
  },
  {
    id: "u_kunle",
    name: "Kunle Adebayo",
    email: "kunle@example.com",
    role: "client",
    phone: "+234 806 555 0119",
    city: "Ikeja, Lagos",
    country: "Nigeria",
    heightCm: 176,
    weightKg: 94.2,
    goals: ["Lose weight", "Lower blood pressure"],
    conditions: ["Hypertension", "Obesity"],
    allergies: [],
    onboardedAt: `${addDays(toISO(new Date()), -74)}T10:20:00Z`,
  },
  {
    id: "u_fatima",
    name: "Fatima Bello",
    email: "fatima@example.com",
    role: "client",
    phone: "+234 810 555 0177",
    city: "Gwarinpa, Abuja",
    country: "Nigeria",
    heightCm: 161,
    weightKg: 71.5,
    goals: ["Manage blood sugar", "Eat healthier"],
    conditions: ["PCOS"],
    allergies: ["Lactose"],
    onboardedAt: `${addDays(toISO(new Date()), -58)}T08:05:00Z`,
  },
  {
    id: "u_segun",
    name: "Segun Ilori",
    email: "segun@example.com",
    role: "client",
    phone: "+234 802 555 0163",
    city: "Bodija, Ibadan",
    country: "Nigeria",
    heightCm: 182,
    weightKg: 78,
    goals: ["Build muscle", "Eat healthier"],
    conditions: ["None"],
    allergies: [],
    onboardedAt: `${addDays(toISO(new Date()), -31)}T17:41:00Z`,
  },
  {
    id: "u_chiamaka",
    name: "Chiamaka Nwosu",
    email: "chiamaka@example.com",
    role: "client",
    phone: "+234 809 555 0121",
    city: "GRA, Port Harcourt",
    country: "Nigeria",
    heightCm: 165,
    weightKg: 88.9,
    goals: ["Lose weight"],
    conditions: ["Type 2 diabetes", "High cholesterol"],
    allergies: ["Gluten"],
    onboardedAt: `${addDays(toISO(new Date()), -12)}T09:12:00Z`,
  },
  {
    id: "u_hauwa",
    name: "Hauwa Sani",
    email: "hauwa@example.com",
    role: "client",
    phone: "+234 807 555 0158",
    city: "Nassarawa, Kano",
    country: "Nigeria",
    heightCm: 158,
    weightKg: 64.1,
    goals: ["Gain weight", "Eat healthier"],
    conditions: ["None"],
    allergies: [],
    onboardedAt: `${addDays(toISO(new Date()), -4)}T19:03:00Z`,
  },
];

/* ------------------------------- metrics ------------------------------ */

const hrSamples = (seed: number, resting: number) =>
  Array.from({ length: 12 }, (_, i) => {
    const wave = [0, 4, 9, 14, 18, 15, 11, 8, 12, 16, 9, 3][i];
    return resting + wave + ((seed + i) % 3) - 1;
  });

function seedMetrics(today: string): DailyMetric[] {
  const steps = [5820, 8410, 6420, 9180, 4760, 7290, 6310];
  const water = [6, 8, 5, 9, 4, 7, 6];
  const kcal = [1820, 1710, 1960, 1690, 2075, 1780, 1640];
  const exercise = [24, 42, 18, 51, 0, 36, 30];
  const resting = [70, 68, 69, 66, 71, 67, 68];

  return lastNDays(today, 7).map((date, i) => ({
    date,
    steps: steps[i],
    stepsTarget: 8000,
    water: water[i],
    waterTarget: 8,
    kcal: kcal[i],
    kcalTarget: 1800,
    exerciseMin: exercise[i],
    exerciseTarget: 30,
    restingHr: resting[i],
    hrSeries: hrSamples(i, resting[i]),
  }));
}

function seedMeals(today: string): MealLog[] {
  const templates: { type: MealLog["type"]; title: string; items: string[]; kcal: number }[] = [
    { type: "Breakfast", title: "Oats & banana", items: ["Rolled oats", "Banana", "Almond milk"], kcal: 380 },
    { type: "Lunch", title: "Brown rice & grilled fish", items: ["Brown rice", "Tilapia", "Ugu stew"], kcal: 640 },
    { type: "Snack", title: "Greek yoghurt", items: ["Plain yoghurt", "Strawberries"], kcal: 180 },
    { type: "Dinner", title: "Beans & plantain", items: ["Ewa agoyin", "Boiled plantain", "Garden egg"], kcal: 580 },
  ];
  const shifts = [0, 1, 2, 3, 1, 2, 3];
  const out: MealLog[] = [];
  lastNDays(today, 7).forEach((date, i) => {
    templates.forEach((t, j) => {
      const variant = templates[(j + shifts[i]) % templates.length];
      const logged = i === 6 && j > 1; // today: only the first two meals logged
      if (logged) return;
      out.push({
        id: `m_${date}_${j}`,
        clientId: CLIENT_ID,
        date,
        type: t.type,
        title: variant.title,
        items: variant.items,
        kcal: variant.kcal,
        loggedAt: `${date}T${["07:20", "13:05", "16:30", "20:10"][j]}:00Z`,
      });
    });
  });
  // A couple of meals for two caseload clients so the dietitian view has content
  ["u_kunle", "u_fatima"].forEach((clientId, idx) => {
    lastNDays(today, 3).forEach((date, i) => {
      out.push({
        id: `m_${clientId}_${date}`,
        clientId,
        date,
        type: "Lunch",
        title: idx === 0 ? "Ofada rice & turkey" : "Grilled chicken salad",
        items: idx === 0 ? ["Ofada rice", "Turkey", "Efo riro"] : ["Chicken breast", "Lettuce", "Olive oil"],
        kcal: idx === 0 ? 700 : 430,
        loggedAt: `${date}T13:15:00Z`,
      });
      if (i % 2 === 0) {
        out.push({
          id: `mb_${clientId}_${date}`,
          clientId,
          date,
          type: "Breakfast",
          title: idx === 0 ? "Pap & akara" : "Custard & wheat bread",
          items: idx === 0 ? ["Pap", "Akara"] : ["Custard", "Wheat bread"],
          kcal: idx === 0 ? 420 : 380,
          loggedAt: `${date}T07:40:00Z`,
        });
      }
    });
  });
  return out;
}

function seedGlucose(today: string): GlucoseLog[] {
  const readings: [number, string, GlucoseLog["context"], number][] = [
    [0, "07:10", "Fasting", 7.4],
    [0, "21:00", "Bedtime", 8.1],
    [1, "07:05", "Fasting", 7.1],
    [1, "13:40", "Post-meal", 8.6],
    [2, "06:55", "Fasting", 6.8],
    [2, "22:05", "Bedtime", 7.2],
    [3, "07:20", "Fasting", 6.4],
    [3, "13:30", "Post-meal", 7.9],
    [4, "07:00", "Fasting", 6.9],
    [4, "20:45", "Bedtime", 7.6],
    [5, "07:15", "Fasting", 6.2],
    [5, "13:10", "Post-meal", 7.1],
    [6, "07:25", "Fasting", 6.0],
  ];
  const days = lastNDays(today, 7);
  const out: GlucoseLog[] = readings.map(([offset, time, context, value], i) => ({
    id: `g_${days[offset]}_${i}`,
    clientId: CLIENT_ID,
    date: days[offset],
    time,
    value,
    context,
  }));
  ["u_kunle", "u_fatima", "u_chiamaka"].forEach((clientId, idx) => {
    days.slice(idx === 0 ? 3 : 4).forEach((date, i) => {
      out.push({
        id: `g_${clientId}_${date}`,
        clientId,
        date,
        time: "07:15",
        value: Number((6.4 + ((i + idx) % 4) * 0.5).toFixed(1)),
        context: "Fasting",
      });
    });
  });
  return out;
}

function seedWeights(today: string): WeightLog[] {
  const start = 85.6;
  const series = [0, 0.6, 0.8, 1.4, 1.9, 2.3, 3.2];
  return series.map((drop, i) => ({
    id: `w_${i}`,
    clientId: CLIENT_ID,
    date: addDays(today, -(series.length - 1 - i) * 7),
    kg: Number((start - drop).toFixed(1)),
  }));
}

/* ----------------------------- dietitians ----------------------------- */

const slotTemplate = (today: string, base: string): AvailabilitySlot[] => {
  const monday = startOfWeek(today);
  const times = ["09:00", "10:30", "12:00", "15:00", "16:30", "18:00"];
  const out: AvailabilitySlot[] = [];
  for (let d = 0; d < 7; d++) {
    const date = addDays(monday, d);
    if (date < today) continue;
    times.forEach((time, i) => {
      if ((d + i) % 3 === 2) return;
      out.push({
        id: `${base}_${date}_${time}`,
        date,
        day: dayShort(date),
        time,
        mode: i % 3 === 1 ? "chat" : "video",
        taken: (d + i) % 7 === 3,
      });
    });
  }
  return out;
};

function seedDietitians(today: string): Dietitian[] {
  const raw: Omit<Dietitian, "slots">[] = [
    {
      id: DEMO_DIETITIAN_ID,
      name: "Ngozi Adeyemi",
      headline: "Consultant dietitian · Diabetes & weight management",
      city: "Lekki, Lagos",
      country: "Nigeria",
      specialties: ["Manage blood sugar", "Lose weight"],
      focus: ["Type 2 diabetes", "Pre-diabetes", "Insulin resistance"],
      languages: ["English", "Igbo"],
      years: 11,
      fee: 18000,
      rating: 4.9,
      reviews: 148,
      bio: "I help people with diabetes eat well without giving up the food they love. Sessions are practical: we build a plan around your work schedule, your market and your budget.",
      verification: { status: "verified", licenceNo: "NG-DTN-4471", verifiedBy: "NourishLink admin", verifiedAt: `${addDays(today, -120)}T09:00:00Z` },
      avatarTint: "lime",
    },
    {
      id: "d_ifeanyi",
      name: "Ifeanyi Balogun",
      headline: "Dietitian · Hypertension & heart-healthy eating",
      city: "Wuse 2, Abuja",
      country: "Nigeria",
      specialties: ["Lower blood pressure", "Lose weight"],
      focus: ["Hypertension", "High cholesterol", "Salt reduction"],
      languages: ["English", "Pidgin"],
      years: 8,
      fee: 15000,
      rating: 4.8,
      reviews: 96,
      bio: "Low-sodium cooking that still tastes like home. I work with busy professionals who eat out often and want numbers they can follow.",
      verification: { status: "verified", licenceNo: "NG-DTN-5120", verifiedBy: "NourishLink admin", verifiedAt: `${addDays(today, -96)}T09:00:00Z` },
      avatarTint: "blue",
    },
    {
      id: "d_zainab",
      name: "Zainab Musa",
      headline: "Clinical dietitian · PCOS & hormonal health",
      city: "Nassarawa, Kano",
      country: "Nigeria",
      specialties: ["Manage blood sugar", "Eat healthier"],
      focus: ["PCOS", "Thyroid", "Fertility nutrition"],
      languages: ["English", "Hausa"],
      years: 9,
      fee: 22000,
      rating: 4.9,
      reviews: 74,
      bio: "Evidence-based nutrition for hormonal conditions, delivered in short, doable steps across chat and video follow-ups.",
      verification: { status: "verified", licenceNo: "NG-DTN-3390", verifiedBy: "NourishLink admin", verifiedAt: `${addDays(today, -64)}T09:00:00Z` },
      avatarTint: "violet",
    },
    {
      id: "d_chidinma",
      name: "Chidinma Eze",
      headline: "Dietitian · Realistic weight loss for shift workers",
      city: "GRA, Port Harcourt",
      country: "Nigeria",
      specialties: ["Lose weight", "Eat healthier"],
      focus: ["Obesity", "Shift work", "Meal prep"],
      languages: ["English", "Igbo"],
      years: 6,
      fee: 12000,
      rating: 4.7,
      reviews: 61,
      bio: "Affordable, no-gimmick coaching. We start with what you already eat and change three things per week.",
      verification: { status: "verified", licenceNo: "NG-DTN-6082", verifiedBy: "NourishLink admin", verifiedAt: `${addDays(today, -40)}T09:00:00Z` },
      avatarTint: "orange",
    },
    {
      id: "d_tunde",
      name: "Tunde Fashola",
      headline: "Sports dietitian · Muscle & recovery",
      city: "Bodija, Ibadan",
      country: "Nigeria",
      specialties: ["Build muscle", "Eat healthier"],
      focus: ["High protein", "Gym support", "Sports performance"],
      languages: ["English", "Yoruba"],
      years: 7,
      fee: 20000,
      rating: 4.8,
      reviews: 88,
      bio: "Protein targets that fit Nigerian food, plus supplement advice that is actually worth your money.",
      verification: { status: "verified", licenceNo: "NG-DTN-7714", verifiedBy: "NourishLink admin", verifiedAt: `${addDays(today, -22)}T09:00:00Z` },
      avatarTint: "teal",
    },
    {
      id: "d_halima",
      name: "Halima Yusuf",
      headline: "Dietitian · Family and child nutrition",
      city: "Yaba, Lagos",
      country: "Nigeria",
      specialties: ["Eat healthier", "Gain weight"],
      focus: ["Family meals", "Underweight", "Iron deficiency"],
      languages: ["English", "Hausa", "Yoruba"],
      years: 5,
      fee: 16000,
      rating: 0,
      reviews: 0,
      bio: "Awaiting licence verification — will appear in search once an admin approves the uploaded practising certificate.",
      verification: { status: "pending", licenceNo: "NG-DTN-9021" },
      avatarTint: "amber",
    },
  ];
  return raw.map((d) => ({ ...d, slots: slotTemplate(today, d.id) }));
}

/* ------------------------------ products ------------------------------ */

const PRODUCTS: Product[] = [
  { id: "p_ofada", name: "Ofada brown rice", brand: "Farmfresh Naija", category: "Grains", price: 4500, unit: "5 kg bag", perServingKcal: 340, dietTags: ["Diabetes", "Weight loss", "Vegan"], stock: 42, rating: 4.7, vendor: "GreenBasket Lagos", tint: "amber", emoji: "🌾", description: "Unpolished local rice with a low glycaemic index — a direct swap for white rice." },
  { id: "p_oats", name: "Rolled oats", brand: "Morning Harvest", category: "Grains", price: 3200, unit: "1 kg", perServingKcal: 150, dietTags: ["Diabetes", "High protein", "Vegan"], stock: 88, rating: 4.8, vendor: "GreenBasket Lagos", tint: "amber", emoji: "🥣", description: "Slow-release carbs for steady morning sugars. Cook in 5 minutes." },
  { id: "p_chicken", name: "Skinless chicken breast", brand: "Farmhouse Poultry", category: "Proteins", price: 6900, unit: "1 kg", perServingKcal: 165, dietTags: ["High protein", "Weight loss", "Gluten-free"], stock: 25, rating: 4.6, vendor: "Farmhouse Poultry", tint: "red", emoji: "🍗", description: "Trimmed and vacuum sealed. 31 g protein per 100 g." },
  { id: "p_tilapia", name: "Fresh tilapia fillets", brand: "Lakeside Catch", category: "Proteins", price: 8400, unit: "1 kg", perServingKcal: 128, dietTags: ["Hypertension", "High protein", "Gluten-free"], stock: 14, rating: 4.5, vendor: "Lakeside Catch", tint: "blue", emoji: "🐟", description: "Omega-3 rich fish, cleaned and deboned. Great for heart health." },
  { id: "p_beans", name: "Honey beans", brand: "Farmfresh Naija", category: "Proteins", price: 3800, unit: "2 kg", perServingKcal: 210, dietTags: ["Diabetes", "Weight loss", "Vegan"], stock: 60, rating: 4.7, vendor: "GreenBasket Lagos", tint: "amber", emoji: "🫘", description: "Stone-free honey beans, high in fibre and plant protein." },
  { id: "p_yoghurt", name: "Plain Greek yoghurt", brand: "DairyFresh", category: "Dairy", price: 2900, unit: "500 g", perServingKcal: 120, dietTags: ["High protein", "Diabetes"], stock: 37, rating: 4.6, vendor: "DairyFresh", tint: "blue", emoji: "🥛", description: "No added sugar, 12 g protein per cup. Pair with fruit for a snack." },
  { id: "p_ugwu", name: "Ugu (fluted pumpkin) leaves", brand: "Market Direct", category: "Produce", price: 1500, unit: "2 bunches", perServingKcal: 45, dietTags: ["Hypertension", "Vegan", "Diabetes"], stock: 52, rating: 4.4, vendor: "Market Direct Ikorodu", tint: "teal", emoji: "🥬", description: "Iron-rich greens, harvested the morning of delivery." },
  { id: "p_plantain", name: "Unripe plantain", brand: "Market Direct", category: "Produce", price: 2200, unit: "6 fingers", perServingKcal: 120, dietTags: ["Diabetes", "Hypertension", "Gluten-free"], stock: 70, rating: 4.5, vendor: "Market Direct Ikorodu", tint: "teal", emoji: "🍌", description: "Boil instead of frying for a lower-glycaemic side dish." },
  { id: "p_almonds", name: "Raw almonds", brand: "Nuts & Co", category: "Snacks", price: 5600, unit: "500 g", perServingKcal: 160, dietTags: ["High protein", "Gluten-free", "Vegan"], stock: 31, rating: 4.8, vendor: "Nuts & Co", tint: "orange", emoji: "🥜", description: "Unsalted and dry-roasted. A 20-gram portion keeps mid-afternoon hunger away." },
  { id: "p_zobo", name: "Hibiscus (zobo) tea pack", brand: "Naija Herb Co", category: "Drinks", price: 1900, unit: "12 sachets", perServingKcal: 10, dietTags: ["Hypertension", "Vegan", "Gluten-free"], stock: 120, rating: 4.3, vendor: "Naija Herb Co", tint: "red", emoji: "🫖", description: "Brew unsweetened. Naturally caffeine-free, no added sugar." },
  { id: "p_bread", name: "Whole wheat bread", brand: "Crumb & Co", category: "Grains", price: 3400, unit: "800 g loaf", perServingKcal: 90, dietTags: ["Diabetes", "High protein"], stock: 18, rating: 4.2, vendor: "Crumb & Co", tint: "amber", emoji: "🍞", description: "Baked daily with 100% wholemeal flour and a little honey." },
  { id: "p_quinoa", name: "Quinoa", brand: "Morning Harvest", category: "Grains", price: 7200, unit: "1 kg", perServingKcal: 180, dietTags: ["High protein", "Gluten-free", "Vegan"], stock: 9, rating: 4.6, vendor: "GreenBasket Lagos", tint: "violet", emoji: "🌾", description: "Complete plant protein, ready in 15 minutes. Great for lunch bowls." },
];

export const DIET_TAGS = [
  "Weight loss",
  "Diabetes",
  "Hypertension",
  "High protein",
  "Gluten-free",
  "Vegan",
] as const;

/* --------------------------- full seed payload --------------------------- */

export function createSeed(today: string): AppData {
  const dietitians = seedDietitians(today);
  const people = caseload();
  const profile = people[0];

  const appointments: Appointment[] = [
    {
      id: "a_upcoming",
      clientId: CLIENT_ID,
      dietitianId: DEMO_DIETITIAN_ID,
      date: addDays(today, 3),
      time: "10:30",
      mode: "video",
      status: "confirmed",
      fee: 18000,
      payment: "paid",
      reference: "NL-CON-1042",
      reason: "Fortnightly review — fasting glucose has been creeping up.",
      thread: [
        { id: "t1", from: "dietitian", text: "See you Thursday. Please log your fasting readings on the morning of the consult.", time: `${addDays(today, -1)}T16:40:00Z` },
        { id: "t2", from: "client", text: "Noted. I've also started boiling plantain instead of frying.", time: `${addDays(today, -1)}T18:02:00Z` },
      ],
    },
    {
      id: "a_history",
      clientId: CLIENT_ID,
      dietitianId: "d_chidinma",
      date: addDays(today, -17),
      time: "17:00",
      mode: "chat",
      status: "completed",
      fee: 12000,
      payment: "paid",
      reference: "NL-CON-0977",
      reason: "Kick-off consult — goals, allergies and food history.",
      thread: [],
    },
  ];

  const notes: SessionNote[] = [
    {
      id: "n_1",
      appointmentId: "a_history",
      clientId: CLIENT_ID,
      dietitianId: "d_chidinma",
      date: addDays(today, -17),
      subjective: "42 y/o, desk-based, skips breakfast 3x/week. Reports fatigue mid-afternoon and evening cravings for sweet drinks. No hypoglycaemic episodes reported.",
      assessment: "Type 2 diabetes, sub-optimally controlled (fasting 7.1-7.4 mmol/L). Overweight (BMI 29.2). Intake shows high refined-carb and sugar-sweetened beverage load; fibre intake below target.",
      plan: "1) Swap white rice and bread for ofada rice, oats and whole wheat. 2) Cut sweet drinks to zero, replace with unsweetened zobo. 3) 20-minute post-dinner walk 5x/week. 4) Log fasting glucose daily, review in 2 weeks.",
    },
  ];

  const mealPlans: MealPlan[] = [
    {
      id: "mp_1",
      clientId: CLIENT_ID,
      dietitianId: "d_chidinma",
      title: "Two-week blood-sugar reset",
      createdAt: addDays(today, -17),
      instructions: "Aim for 1,800 kcal a day. Nothing is banned — the point is portion and cooking method. Tick meals off in the app as you go.",
      days: [
        {
          day: "Mon",
          items: [
            { meal: "Breakfast", title: "Oats, banana & almond milk", kcal: 380, items: ["Rolled oats 60 g", "Banana", "Unsweetened almond milk"] },
            { meal: "Lunch", title: "Ofada rice, tilapia & ugu", kcal: 640, items: ["Ofada rice 1 cup", "Grilled tilapia", "Ugu stew, less palm oil"] },
            { meal: "Snack", title: "Greek yoghurt & strawberries", kcal: 180, items: ["Plain yoghurt 150 g", "Strawberries"] },
            { meal: "Dinner", title: "Beans & boiled plantain", kcal: 560, items: ["Honey beans 1 cup", "Unripe plantain 2 fingers"] },
          ],
        },
        {
          day: "Tue",
          items: [
            { meal: "Breakfast", title: "Whole wheat toast & eggs", kcal: 400, items: ["Whole wheat bread 2 slices", "2 boiled eggs"] },
            { meal: "Lunch", title: "Chicken & quinoa bowl", kcal: 610, items: ["Skinless chicken breast 120 g", "Quinoa 1 cup", "Mixed greens"] },
            { meal: "Snack", title: "Almonds", kcal: 160, items: ["Raw almonds 20 g"] },
            { meal: "Dinner", title: "Pepper soup with fish", kcal: 480, items: ["Catfish", "Light pepper soup spices"] },
          ],
        },
      ],
    },
  ];

  const orders: Order[] = [
    {
      id: "o_1091",
      clientId: CLIENT_ID,
      lines: [
        { productId: "p_oats", name: "Rolled oats", price: 3200, qty: 2 },
        { productId: "p_yoghurt", name: "Plain Greek yoghurt", price: 2900, qty: 3 },
      ],
      subtotal: 15100,
      deliveryFee: 1500,
      total: 16600,
      status: "delivered",
      payment: "paid",
      placedAt: `${addDays(today, -6)}T09:12:00Z`,
      address: "14 Admiralty Way, Lekki Phase 1, Lagos",
      eta: `${addDays(today, -5)}T11:00:00Z`,
      reference: "NL-ORD-1091",
    },
    {
      id: "o_1123",
      clientId: CLIENT_ID,
      lines: [
        { productId: "p_tilapia", name: "Fresh tilapia fillets", price: 8400, qty: 1 },
        { productId: "p_ugwu", name: "Ugu (fluted pumpkin) leaves", price: 1500, qty: 2 },
      ],
      subtotal: 11400,
      deliveryFee: 1500,
      total: 12900,
      status: "dispatched",
      payment: "paid",
      placedAt: `${today}T08:05:00Z`,
      address: "14 Admiralty Way, Lekki Phase 1, Lagos",
      eta: `${today}T18:30:00Z`,
      reference: "NL-ORD-1123",
    },
    {
      id: "o_1044",
      clientId: "u_kunle",
      lines: [{ productId: "p_zobo", name: "Hibiscus (zobo) tea pack", price: 1900, qty: 2 }],
      subtotal: 3800,
      deliveryFee: 1500,
      total: 5300,
      status: "placed",
      payment: "paid",
      placedAt: `${today}T07:41:00Z`,
      address: "22 Allen Avenue, Ikeja, Lagos",
      eta: `${addDays(today, 1)}T14:00:00Z`,
      reference: "NL-ORD-1044",
    },
  ];

  const reminders: Reminder[] = [
    { id: "r1", clientId: CLIENT_ID, title: "Log your bedtime glucose", detail: "Last time you logged 8.1 mmol/L", when: `${today}T21:00:00Z`, kind: "log", done: false },
    { id: "r2", clientId: CLIENT_ID, title: "Grocery delivery arriving", detail: "Order NL-ORD-1123 · tilapia and ugu", when: `${today}T18:30:00Z`, kind: "order", done: false },
    { id: "r3", clientId: CLIENT_ID, title: "Video consult with Ngozi Adeyemi", detail: "Bring your fasting readings", when: `${addDays(today, 3)}T10:30:00Z`, kind: "consult", done: false },
    { id: "r4", clientId: CLIENT_ID, title: "Weigh in", detail: "Weekly weigh-in, same time as last week", when: `${addDays(today, 1)}T07:00:00Z`, kind: "log", done: false },
  ];

  return {
    profile: { ...profile, onboardedAt: `${addDays(today, -90)}T08:00:00Z` },
    consent: {
      shareWithDietitian: true,
      reminders: true,
      dataProcessing: true,
      agreedAt: `${addDays(today, -90)}T08:00:00Z`,
    },
    activeRole: "client",
    clients: people,
    metrics: seedMetrics(today),
    meals: seedMeals(today),
    glucose: seedGlucose(today),
    weights: seedWeights(today),
    dietitians,
    appointments,
    notes,
    mealPlans,
    products: PRODUCTS,
    cart: [
      { productId: "p_chicken", qty: 1 },
      { productId: "p_almonds", qty: 2 },
    ],
    orders,
    reminders,
  };
}

export const greetingFor = (hour: number) =>
  hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

export const prettySlotLabel = (time: string) => prettyTime(time);
