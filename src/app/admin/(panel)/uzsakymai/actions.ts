"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export type OrderUpdateState = { error?: string; success?: string };

export async function updateOrder(
  _prev: OrderUpdateState,
  formData: FormData,
): Promise<OrderUpdateState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "");

  if (!id) return { error: "Užsakymas nerastas" };
  if (!ORDER_STATUSES.includes(status)) return { error: "Netinkama užsakymo būsena" };
  if (!PAYMENT_STATUSES.includes(paymentStatus)) {
    return { error: "Netinkama apmokėjimo būsena" };
  }

  const current = await prisma.order.findUnique({ where: { id } });
  if (!current) return { error: "Užsakymas nerastas" };

  await prisma.order.update({
    where: { id },
    data: {
      status,
      paymentStatus,
      paidAt:
        paymentStatus === "PAID"
          ? (current.paidAt ?? new Date())
          : paymentStatus === "PENDING"
            ? null
            : current.paidAt,
    },
  });

  revalidatePath("/admin/uzsakymai");
  revalidatePath(`/admin/uzsakymai/${id}`);

  return { success: "Užsakymas atnaujintas" };
}
