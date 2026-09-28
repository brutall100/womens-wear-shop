/**
 * SEB banklink (IPIZZA 1.3) nustatymai.
 *
 * Realiam darbui reikia iš SEB gautos e. prekybos sutarties duomenų:
 *  - SEB_SND_ID       – pardavėjo (prekybininko) ID banke;
 *  - SEB_PAYMENT_URL  – banko mokėjimo formos adresas;
 *  - privataus rakto ir banko viešojo rakto (sertifikato) PEM failų.
 */

export type SebMode = "mock" | "live";
export type SebAlgorithm = "sha1" | "sha256";

export type SebConfig = {
  mode: SebMode;
  /** Pardavėjo ID (VK_SND_ID) */
  senderId: string;
  /** Banko ID (VK_REC_ID atsakyme) */
  receiverId: string;
  /** Banko mokėjimo formos adresas */
  paymentUrl: string;
  /** Parašo algoritmas – pagal sutartį su banku */
  algorithm: SebAlgorithm;
  /** VK_LANG */
  language: string;
  /** Parduotuvės adresas grąžinimo nuorodoms */
  appUrl: string;
  /** Ilgio prefikso skaičiavimas MAC eilutėje */
  macLengthMode: "chars" | "bytes";
};

function env(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : fallback;
}

export function getSebConfig(): SebConfig {
  const mode = env("SEB_MODE", "mock") === "live" ? "live" : "mock";
  const appUrl = env("APP_URL", "http://localhost:3000").replace(/\/+$/, "");

  return {
    mode,
    senderId: env("SEB_SND_ID", "testvendor"),
    receiverId: env("SEB_REC_ID", "SEB"),
    paymentUrl:
      mode === "mock"
        ? `${appUrl}/api/mokejimai/seb/bandomasis-bankas`
        : env("SEB_PAYMENT_URL", "https://e.seb.lt/mainib/site/login.aspx"),
    algorithm: env("SEB_ALGORITHM", "sha1") === "sha256" ? "sha256" : "sha1",
    language: env("SEB_LANG", "LIT"),
    appUrl,
    macLengthMode: env("SEB_MAC_LENGTH_MODE", "chars") === "bytes" ? "bytes" : "chars",
  };
}

export function sebReturnUrl(config: SebConfig): string {
  return `${config.appUrl}/api/mokejimai/seb/grizimas`;
}

export function sebCancelUrl(config: SebConfig): string {
  return `${config.appUrl}/api/mokejimai/seb/grizimas`;
}
