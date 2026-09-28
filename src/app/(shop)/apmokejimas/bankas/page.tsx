import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sebMode } from "@/lib/seb";
import { formatPrice, orderNumber } from "@/lib/format";

async function complete(formData: FormData) {
  "use server";
  if (sebMode() !== "mock") notFound();
  const ref = String(formData.get("ref"));
  const state = formData.get("state") === "settled" ? "settled" : "abandoned";
  await prisma.payment.update({ where: { orderReference: ref }, data: { state } });
  redirect(`/api/payments/seb/return?order_reference=${encodeURIComponent(ref)}`);
}

export default async function MockBankPage(props: PageProps<"/apmokejimas/bankas">) {
  if (sebMode() !== "mock") notFound();
  const { ref } = await props.searchParams;
  if (typeof ref !== "string") notFound();
  const payment = await prisma.payment.findUnique({ where: { orderReference: ref } });
  if (!payment) notFound();

  return (
    <div className="mx-auto max-w-md px-4 pt-16">
      <div className="card overflow-hidden">
        <div className="bg-[#007a33] px-6 py-5 text-white">
          <p className="text-xs font-semibold tracking-widest uppercase opacity-80">Testinis režimas</p>
          <p className="mt-1 text-xl font-bold">SEB mokėjimo imitacija</p>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-sm text-muted">
            Tai lokalus mokėjimo puslapio pakaitalas. Nustačius <code>SEB_MODE=demo</code> arba <code>live</code>, klientas
            bus nukreiptas į tikrą SEB mokėjimo puslapį.
          </p>
          <div className="flex justify-between border-y border-line py-4">
            <span>Užsakymas {orderNumber(payment.orderId)}</span>
            <span className="font-semibold">{formatPrice(payment.amount)}</span>
          </div>
          <form action={complete} className="flex flex-col gap-3">
            <input type="hidden" name="ref" value={ref} />
            <button name="state" value="settled" className="btn w-full bg-[#007a33] text-white hover:bg-[#00632a]">
              Apmokėti sėkmingai
            </button>
            <button name="state" value="abandoned" className="btn-outline w-full">
              Atšaukti mokėjimą
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
