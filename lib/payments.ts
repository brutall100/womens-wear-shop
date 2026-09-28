import "server-only";

import {
  ensureDemoKeys,
  getOrderByStamp,
  markOrderFailed,
  markOrderPaid,
  publicKeyFromPrivate,
  sebConfig,
  type Order,
} from "./db";
import {
  REQUEST_1012,
  RESPONSE_1111,
  RESPONSE_1911,
  fieldsForMac,
  formatBankAmount,
  normalizePublicKey,
  parseBankAmount,
  sepaText,
  signMac,
  verifyMac,
  vilniusTimestamp,
} from "./seb";

export type PaymentForm = {
  action: string;
  fields: Record<string, string>;
  demo: boolean;
};

export function buildPayment(order: Order, origin: string): PaymentForm {
  const config = sebConfig();
  const demo = !config.live;
  const fields: Record<string, string> = {
    VK_SERVICE: "1012",
    VK_VERSION: "009",
    VK_SND_ID: config.merchantId,
    VK_STAMP: order.stamp,
    VK_AMOUNT: formatBankAmount(order.amountCents),
    VK_CURR: "EUR",
    VK_REF: "",
    VK_MSG: sepaText(order.vkMsg),
    VK_RETURN: `${origin}/api/seb/return`,
    VK_CANCEL: `${origin}/api/seb/cancel`,
    VK_DATETIME: vilniusTimestamp(),
  };
  fields.VK_MAC = signMac(fieldsForMac(fields, REQUEST_1012), config.merchantKey);
  fields.VK_ENCODING = "UTF-8";
  fields.VK_LANG = "LIT";
  return {
    action: demo ? `${origin}/api/seb/demo` : config.gatewayUrl,
    fields,
    demo,
  };
}

export function verifyMerchantPacket(fields: Record<string, string>): boolean {
  const config = sebConfig();
  if (fields.VK_SERVICE !== "1012" || fields.VK_VERSION !== "009") return false;
  if (fields.VK_SND_ID !== config.merchantId) return false;
  const publicKey = publicKeyFromPrivate(config.merchantKey);
  return verifyMac(fieldsForMac(fields, REQUEST_1012), fields.VK_MAC ?? "", publicKey);
}

function bankPrivateKey(): string {
  if (sebConfig().live) {
    throw new Error("Banko privatus raktas naudojamas tik bandomojoje aplinkoje");
  }
  return ensureDemoKeys().bankPrivate;
}

/** Signs a reply the way the bank would. Only used by the test bank while real keys are missing. */
export function buildBankReply(order: Order, kind: "1111" | "1911"): Record<string, string> {
  const config = sebConfig();
  const common = {
    VK_SERVICE: kind,
    VK_VERSION: "009",
    VK_SND_ID: config.bankId || "SEBDEMO",
    VK_REC_ID: config.merchantId,
    VK_STAMP: order.stamp,
    VK_REF: "",
    VK_MSG: order.vkMsg,
  };
  const fields =
    kind === "1111"
      ? {
          ...common,
          VK_T_NO: String(Date.now()).slice(-10),
          VK_AMOUNT: formatBankAmount(order.amountCents),
          VK_CURR: "EUR",
          VK_REC_ACC: "",
          VK_REC_NAME: "MOT",
          VK_SND_ACC: "LT000000000000000000",
          VK_SND_NAME: "Bandomasis moketojas",
          VK_T_DATETIME: vilniusTimestamp(),
        }
      : common;
  const names = kind === "1111" ? RESPONSE_1111 : RESPONSE_1911;
  const signed: Record<string, string> = { ...fields };
  signed.VK_MAC = signMac(fieldsForMac(signed, names), bankPrivateKey());
  signed.VK_ENCODING = "UTF-8";
  signed.VK_LANG = "LIT";
  signed.VK_AUTO = "N";
  return signed;
}

export type BankResult =
  | { ok: true; auto: boolean; stamp: string; paid: boolean }
  | { ok: false; error: string; auto: boolean; stamp?: string };

export function applyBankResponse(params: Record<string, string>): BankResult {
  const auto = params.VK_AUTO === "Y";
  const service = params.VK_SERVICE;
  const stamp = params.VK_STAMP ?? "";
  const names = service === "1111" ? RESPONSE_1111 : service === "1911" ? RESPONSE_1911 : null;
  if (!names) return { ok: false, error: "Nežinoma banko užklausa", auto, stamp };
  const config = sebConfig();
  let bankKey = "";
  try {
    bankKey = normalizePublicKey(config.bankCert);
  } catch {
    return { ok: false, error: "Banko sertifikatas netinkamas", auto, stamp };
  }
  if (!verifyMac(fieldsForMac(params, names), params.VK_MAC ?? "", bankKey)) {
    return { ok: false, error: "Banko parašas netinkamas", auto, stamp };
  }
  if (params.VK_REC_ID !== config.merchantId) {
    return { ok: false, error: "Gavėjo identifikatorius nesutampa", auto, stamp };
  }
  const order = getOrderByStamp(stamp);
  if (!order) return { ok: false, error: "Užsakymas nerastas", auto, stamp };
  if (service === "1911") {
    markOrderFailed(stamp, params);
    return { ok: true, auto, stamp, paid: false };
  }
  const amount = parseBankAmount(params.VK_AMOUNT ?? "");
  if (amount === null || amount !== order.amountCents) {
    return { ok: false, error: "Suma nesutampa su užsakymu", auto, stamp };
  }
  markOrderPaid(stamp, params);
  return { ok: true, auto, stamp, paid: true };
}
