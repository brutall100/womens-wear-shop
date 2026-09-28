import {
  deleteShippingMethod,
  saveShippingMethod,
} from "@/app/admin/(panel)/pristatymas/actions";
import { centsToInput, formatPrice } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { buttonClass, cn } from "@/lib/ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pristatymo būdai" };

type Method = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceCents: number;
  freeFromCents: number | null;
  isActive: boolean;
  sortOrder: number;
};

export default async function AdminShippingPage() {
  const methods = await prisma.shippingMethod.findMany({
    orderBy: [{ sortOrder: "asc" }, { priceCents: "asc" }],
  });

  return (
    <div>
      <header>
        <h1 className="text-3xl">Pristatymo būdai</h1>
        <p className="mt-1 text-sm text-muted">
          Šie būdai rodomi atsiskaitymo puslapyje. „Nemokamai nuo“ palikus tuščią,
          nuolaida netaikoma.
        </p>
      </header>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="border border-line bg-shell">
          {methods.length === 0 ? (
            <p className="px-5 py-14 text-center text-sm text-muted">
              Pristatymo būdų dar nėra
            </p>
          ) : (
            <ul className="divide-y divide-line/70">
              {methods.map((method) => (
                <li key={method.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 hover:bg-sand/50">
                      <span className="w-8 text-xs text-muted">{method.sortOrder}</span>
                      <span className="flex-1">
                        <span className="text-sm">{method.name}</span>
                        <span className="block text-xs text-muted">{method.code}</span>
                      </span>
                      <span className="text-sm">
                        {method.priceCents === 0
                          ? "Nemokamai"
                          : formatPrice(method.priceCents)}
                      </span>
                      <span
                        className={cn(
                          "border px-2 py-0.5 text-[11px]",
                          method.isActive
                            ? "border-success/40 text-success"
                            : "border-line text-muted",
                        )}
                      >
                        {method.isActive ? "Aktyvus" : "Išjungtas"}
                      </span>
                      <span className="text-xs text-clay group-open:hidden">Redaguoti</span>
                    </summary>

                    <div className="border-t border-line bg-cream/60 px-5 py-5">
                      <MethodForm method={method} />
                      <form
                        action={async () => {
                          "use server";
                          await deleteShippingMethod(method.id);
                        }}
                        className="mt-5 border-t border-line pt-4"
                      >
                        <button
                          type="submit"
                          className="text-xs text-muted link-underline hover:text-danger cursor-pointer"
                        >
                          Ištrinti pristatymo būdą
                        </button>
                      </form>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="h-fit border border-line bg-shell p-5">
          <h2 className="text-lg">Naujas būdas</h2>
          <div className="mt-4">
            <MethodForm />
          </div>
        </aside>
      </div>
    </div>
  );
}

function MethodForm({ method }: { method?: Method }) {
  const suffix = method?.id ?? "new";

  return (
    <form action={saveShippingMethod} className="space-y-4">
      {method && <input type="hidden" name="id" value={method.id} />}

      <div>
        <label className="field-label" htmlFor={`name-${suffix}`}>
          Pavadinimas *
        </label>
        <input
          id={`name-${suffix}`}
          name="name"
          className="field"
          defaultValue={method?.name ?? ""}
          placeholder="Omniva paštomatas"
          required
        />
      </div>

      {!method && (
        <div>
          <label className="field-label" htmlFor={`code-${suffix}`}>
            Kodas (nebūtina)
          </label>
          <input
            id={`code-${suffix}`}
            name="code"
            className="field"
            placeholder="omniva"
          />
        </div>
      )}

      <div>
        <label className="field-label" htmlFor={`description-${suffix}`}>
          Aprašymas
        </label>
        <textarea
          id={`description-${suffix}`}
          name="description"
          rows={2}
          className="field"
          defaultValue={method?.description ?? ""}
          placeholder="Pristatymas per 1–2 darbo dienas"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor={`price-${suffix}`}>
            Kaina (€)
          </label>
          <input
            id={`price-${suffix}`}
            name="price"
            inputMode="decimal"
            className="field"
            defaultValue={method ? centsToInput(method.priceCents) : "0.00"}
          />
        </div>
        <div>
          <label className="field-label" htmlFor={`freeFrom-${suffix}`}>
            Nemokamai nuo (€)
          </label>
          <input
            id={`freeFrom-${suffix}`}
            name="freeFrom"
            inputMode="decimal"
            className="field"
            defaultValue={method?.freeFromCents ? centsToInput(method.freeFromCents) : ""}
            placeholder="60.00"
          />
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div className="w-28">
          <label className="field-label" htmlFor={`sortOrder-${suffix}`}>
            Eiliškumas
          </label>
          <input
            id={`sortOrder-${suffix}`}
            name="sortOrder"
            type="number"
            min={0}
            className="field"
            defaultValue={method?.sortOrder ?? 0}
          />
        </div>
        <label className="flex items-center gap-2 pb-2.5 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={method?.isActive ?? true}
            className="accent-[var(--color-clay)]"
          />
          Aktyvus
        </label>
      </div>

      <button type="submit" className={buttonClass("primary", "md")}>
        {method ? "Išsaugoti" : "Pridėti"}
      </button>
    </form>
  );
}
