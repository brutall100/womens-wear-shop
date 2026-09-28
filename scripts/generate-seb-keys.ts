/**
 * Sugeneruoja bandomąsias RSA raktų poras SEB banklink integracijai.
 *
 *   .keys/merchant-private.pem  – pardavėjo privatus raktas (pasirašo užklausas)
 *   .keys/merchant-public.pem   – pardavėjo viešasis raktas (perduodamas bankui)
 *   .keys/bank-private.pem      – tik bandomajam bankui
 *   .keys/bank-public.pem       – tik bandomajam bankui
 *
 * Tikram darbui su SEB naudokite banko išduotus raktus ir nurodykite juos per
 * SEB_PRIVATE_KEY_PATH bei SEB_BANK_PUBLIC_KEY_PATH aplinkos kintamuosius.
 *
 * Paleidimas: npm run seb:keys
 */
import path from "node:path";
import { ensureDevKeys } from "../src/lib/seb/keys";

ensureDevKeys();

console.log(`Raktai paruošti kataloge ${path.join(process.cwd(), ".keys")}`);
console.log("Katalogas .keys yra .gitignore sąraše – raktai į saugyklą nepatenka.");
