"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { naira, num, prettyDate, prettyTime } from "@/lib/format";
import {
  Card,
  CircleButton,
  IconTile,
  Pill,
  ProgressBar,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import {
  IconBag,
  IconCheck,
  IconGrid,
  IconLeaf,
  IconPlus,
  IconTruck,
  IconUser,
  IconUsers,
  IconVerified,
  IconTrend,
} from "@/components/icons";

export default function AdminOverview() {
  const store = useStore();
  const { dietitians, orders, products, clients, appointments } = store;

  const verified = dietitians.filter((d) => d.verification.status === "verified");
  const pending = dietitians.filter((d) => d.verification.status === "pending");
  const openOrders = orders.filter((o) => o.status !== "delivered");
  const gmv = orders.reduce((n, o) => n + o.total, 0) + appointments.reduce((n, a) => n + a.fee, 0);
  const lowStock = products.filter((p) => p.stock <= 12);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <IconTile tone="lime" size={44}>
          <IconGrid size={21} />
        </IconTile>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">NourishLink operations</p>
          <h1 className="truncate text-[17px] font-semibold">Admin console</h1>
        </div>
        <CircleButton label="Open shop admin" href="/admin/orders" size={44}>
          <IconBag size={20} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="Verified dietitians"
            value={`${verified.length}`}
            unit={`of ${dietitians.length}`}
            icon={<IconVerified size={19} />}
            tone="teal"
            footer={<ProgressBar value={(verified.length / Math.max(1, dietitians.length)) * 100} tone="teal" />}
          />
          <StatTile
            label="Awaiting verification"
            value={`${pending.length}`}
            unit="to review"
            icon={<IconUser size={19} />}
            tone="amber"
            footer={
              <Link href="/admin/dietitians" className="press text-[11px] font-semibold text-lime-dark">
                Review licences →
              </Link>
            }
          />
          <StatTile
            label="Orders to fulfil"
            value={`${openOrders.length}`}
            unit="in progress"
            icon={<IconTruck size={19} />}
            tone="blue"
          />
          <StatTile
            label="Platform volume"
            value={naira(gmv, true)}
            unit="this cycle"
            icon={<IconTrend size={19} />}
            tone="lime"
          />
        </div>

        {/* Verification queue */}
        <Card className="p-4">
          <SectionHeader
            title="Verification queue"
            href="/admin/dietitians"
            action="Open"
            className="mb-1"
          />
          {pending.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-muted">
              Every dietitian on the platform is verified. Nice.
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {pending.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3">
                  <IconTile tone="amber" size={42} shape="circle">
                    <IconUser size={19} />
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{d.name}</p>
                    <p className="text-[11px] text-muted">
                      Licence {d.verification.licenceNo} · {d.city}
                    </p>
                    <p className="mt-1 text-[11px] text-faint">
                      Practising certificate + ID uploaded ·{" "}
                      {d.specialties.join(", ") || "no specialties"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => store.setVerification(d.id, "verified")}
                      className="press rounded-full bg-lime px-3 py-1.5 text-[11px] font-semibold text-white"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      onClick={() => store.setVerification(d.id, "rejected")}
                      className="press rounded-full bg-canvas px-3 py-1.5 text-[11px] font-semibold text-muted"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Orders */}
        <Card className="p-4">
          <SectionHeader title="Orders in flight" href="/admin/orders" action="Manage" className="mb-1" />
          <ul className="divide-y divide-hairline">
            {openOrders.map((o) => (
              <li key={o.id} className="flex items-center gap-3 py-3">
                <IconTile tone="blue" size={42}>
                  <IconTruck size={19} />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">{o.reference}</p>
                  <p className="text-[11px] text-muted">
                    {store.clientById(o.clientId)?.name} · {o.lines.length} items · {naira(o.total)}
                  </p>
                  <p className="text-[11px] text-faint">
                    ETA {prettyDate(o.eta.slice(0, 10))}, {prettyTime(o.eta.slice(11, 16))}
                  </p>
                </div>
                <Pill tone={o.status === "placed" ? "amber" : "lime"}>{o.status}</Pill>
              </li>
            ))}
          </ul>
        </Card>

        {/* Stock */}
        <Card className="p-4">
          <SectionHeader title="Low stock" className="mb-1" />
          <ul className="divide-y divide-hairline">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-canvas text-[22px]">
                  {p.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{p.name}</p>
                  <p className="text-[11px] text-muted">
                    {p.stock} left · {p.vendor}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => store.setStock(p.id, p.stock + 24)}
                  className="press flex items-center gap-1.5 rounded-full bg-lime-wash px-3 py-2 text-[11px] font-semibold text-lime-dark"
                >
                  <IconPlus size={13} />
                  Restock 24
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Pilot progress */}
        <Card className="p-4">
          <SectionHeader title="Pilot readiness" className="mb-2" />
          <div className="space-y-3">
            {[
              { label: "Dietitians onboarded", value: verified.length, target: 5 },
              { label: "Pilot users in the cycle", value: clients.length + 14, target: 20 },
              { label: "Consults completed", value: appointments.filter((a) => a.status === "completed").length, target: 10 },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted">{m.label}</span>
                  <span className="font-semibold">
                    {m.value} / {m.target}
                  </span>
                </div>
                <ProgressBar className="mt-1.5" value={(m.value / m.target) * 100} />
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-2 rounded-[14px] bg-canvas p-3 text-[11px] text-muted">
            <IconLeaf size={14} className="mt-0.5 shrink-0 text-lime-dark" />
            Definition of done: five real dietitians and twenty pilot users complete a full cycle — book,
            consult, track and order.
          </p>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Platform totals" className="mb-2" />
          <dl className="space-y-2 text-[13px]">
            {[
              ["Clients", `${num(clients.length)} active`],
              ["Consults booked", `${appointments.length}`],
              ["Orders placed", `${orders.length}`],
              ["Products listed", `${products.length}`],
              ["Gross volume", naira(gmv)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/admin/dietitians"
              className="press inline-flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2 text-[12px] font-semibold"
            >
              <IconUsers size={14} />
              Dietitians
            </Link>
            <Link
              href="/admin/orders"
              className="press inline-flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2 text-[12px] font-semibold"
            >
              <IconBag size={14} />
              Orders & stock
            </Link>
            <Link
              href="/privacy"
              className="press inline-flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2 text-[12px] font-semibold"
            >
              <IconCheck size={14} />
              Privacy policy
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
