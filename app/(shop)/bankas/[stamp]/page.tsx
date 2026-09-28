import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { BankView } from "@/components/views/bank-view";
import { getOrderByStamp, sebConfig } from "@/lib/db";
import { canPay } from "@/lib/labels";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Bandomasis bankas", robots: { index: false } };

/** Opened by /api/seb/demo after it checked the shop's signed payment packet. */
export default async function TestBankPage({ params }: { params: Promise<{ stamp: string }> }) {
  const { stamp } = await params;
  if (sebConfig().live) notFound();
  const order = getOrderByStamp(stamp);
  if (!order) notFound();
  return (
    <BankView
      order={order}
      actions={
        canPay(order.status) ? (
          <form method="post" action="/api/seb/demo/confirm" className="flex flex-wrap gap-3">
            <input type="hidden" name="stamp" value={order.stamp} />
            <button type="submit" name="action" value="pay" className="btn btn-primary">
              <CheckIcon size={18} /> Patvirtinti mokėjimą
            </button>
            <button type="submit" name="action" value="reject" className="btn btn-ghost">
              <CloseIcon size={18} /> Atmesti
            </button>
          </form>
        ) : (
          <Link href={routes.order(order.stamp)} className="btn btn-ghost">
            Šis užsakymas jau apmokėtas – grįžti į užsakymą
          </Link>
        )
      }
    />
  );
}
