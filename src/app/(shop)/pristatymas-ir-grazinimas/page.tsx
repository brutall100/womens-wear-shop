import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";
import { shippingMethods, store } from "@/config/store";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Pristatymas ir grąžinimas" };

export default function DeliveryPage() {
  return (
    <ProsePage title="Pristatymas ir grąžinimas">
      <h2>Pristatymas</h2>
      <p>Prekes pristatome visoje Lietuvoje. Užsakymą išsiunčiame per 1 darbo dieną nuo apmokėjimo.</p>
      <ul>
        {shippingMethods.map((m) => (
          <li key={m.id}>
            {m.name} — {formatPrice(m.price)} ({m.description.toLowerCase()})
          </li>
        ))}
      </ul>
      <p>Užsakymams nuo {formatPrice(store.freeShippingFrom)} pristatymas nemokamas.</p>

      <h2>Grąžinimas</h2>
      <p>
        Vadovaujantis Lietuvos Respublikos civiliniu kodeksu, turite teisę per 14 dienų nuo prekės gavimo atsisakyti
        pirkimo nenurodydami priežasties. Grąžinama prekė turi būti nenešiota, nesugadinta, su etiketėmis.
      </p>
      <p>
        Norėdami grąžinti prekę, parašykite mums adresu <a href={`mailto:${store.email}`} className="underline">{store.email}</a>{" "}
        nurodydami užsakymo numerį. Pinigus grąžinsime per 14 dienų nuo prekės gavimo į sąskaitą, iš kurios buvo
        atliktas mokėjimas.
      </p>
    </ProsePage>
  );
}
