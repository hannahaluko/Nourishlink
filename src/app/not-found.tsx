import Link from "next/link";
import { Card, IconTile } from "@/components/ui";
import { IconLeaf, IconSearch } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col justify-center px-[18px] py-10">
      <Card className="flex flex-col items-center gap-3 p-6 text-center">
        <IconTile tone="lime" size={62} shape="circle">
          <IconLeaf size={28} />
        </IconTile>
        <h1 className="text-[19px] font-bold">This page does not exist</h1>
        <p className="max-w-[300px] text-[13px] text-muted">
          The link may be old or mistyped. Head back to your dashboard, or jump into the healthy food shop.
        </p>
        <div className="mt-2 grid w-full grid-cols-2 gap-3">
          <Link
            href="/app"
            className="press rounded-full bg-lime py-3.5 text-center text-[14px] font-semibold text-white"
          >
            Go to dashboard
          </Link>
          <Link
            href="/shop"
            className="press rounded-full bg-canvas py-3.5 text-center text-[14px] font-semibold"
          >
            Browse the shop
          </Link>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
          <IconSearch size={12} />
          Every screen in the prototype is linked from the dashboard.
        </p>
      </Card>
    </div>
  );
}
