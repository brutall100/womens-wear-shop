"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { syncPayment } from "@/lib/payments";
import { orderStatuses } from "@/config/store";

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!orderStatuses[status]) return;
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/uzsakymai/${id}`);
}

export async function refreshPayment(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const payments = await prisma.payment.findMany({ where: { orderId: id }, orderBy: { createdAt: "desc" } });
  for (const p of payments) {
    await syncPayment({ paymentReference: p.paymentReference, orderReference: p.orderReference }).catch((e) =>
      console.error("[admin] Nepavyko atnaujinti mokėjimo", e),
    );
  }
  revalidatePath(`/admin/uzsakymai/${id}`);
}
