import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { siteUrl } from "@/lib/payments";
import { PageHeader } from "../ui";
import { ConfirmButton } from "../confirm-button";
import { AddAdminForm, ChangePasswordForm } from "./forms";
import { removeAdmin } from "./actions";

const MODE_LABELS: Record<string, { label: string; tone: string; text: string }> = {
  mock: {
    label: "Testinis (be banko)",
    tone: "bg-amber-100 text-amber-800",
    text: "Mokėjimai imituojami lokaliai. Nustatykite SEB_MODE=demo ir SEB prisijungimo duomenis, kad testuotumėte su SEB.",
  },
  demo: {
    label: "SEB demo aplinka",
    tone: "bg-sky-100 text-sky-800",
    text: "Mokėjimai vyksta SEB testinėje aplinkoje — tikri pinigai nenuskaitomi.",
  },
  live: {
    label: "Tikri mokėjimai",
    tone: "bg-emerald-100 text-emerald-800",
    text: "Parduotuvė priima tikrus mokėjimus per SEB.",
  },
};

export default async function SettingsPage() {
  const me = await requireAdmin();
  const admins = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  const mode = (process.env.SEB_MODE || "mock").toLowerCase();
  const info = MODE_LABELS[mode] ?? MODE_LABELS.mock;
  const configured = Boolean(process.env.SEB_API_USERNAME && process.env.SEB_API_SECRET && process.env.SEB_ACCOUNT_NAME);

  return (
    <>
      <PageHeader title="Nustatymai" />
      <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
        <section className="card space-y-4 p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">SEB mokėjimai</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${info.tone}`}>{info.label}</span>
          </div>
          <p className="text-sm text-muted">{info.text}</p>
          {mode !== "mock" && !configured && (
            <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-dark">
              Trūksta SEB_API_USERNAME, SEB_API_SECRET arba SEB_ACCOUNT_NAME.
            </p>
          )}
          <dl className="grid gap-3 text-sm sm:grid-cols-[12rem_1fr]">
            <dt className="text-muted">API vartotojas</dt>
            <dd className="font-mono">{process.env.SEB_API_USERNAME || "—"}</dd>
            <dt className="text-muted">Apdorojimo sąskaita</dt>
            <dd className="font-mono">{process.env.SEB_ACCOUNT_NAME || "—"}</dd>
            <dt className="text-muted">Callback URL (įrašykite SEB portale)</dt>
            <dd className="font-mono break-all">{siteUrl()}/api/payments/seb/callback</dd>
          </dl>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-semibold">Mano slaptažodis</h2>
          <ChangePasswordForm />
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-semibold">Administratoriai</h2>
          <ul className="mb-5 divide-y divide-line text-sm">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2">
                <span>
                  {a.email} {a.id === me.id && <span className="text-xs text-muted">(jūs)</span>}
                </span>
                {a.id !== me.id && (
                  <form action={removeAdmin}>
                    <input type="hidden" name="id" value={a.id} />
                    <ConfirmButton message={`Pašalinti ${a.email}?`} className="text-xs text-accent underline">
                      Pašalinti
                    </ConfirmButton>
                  </form>
                )}
              </li>
            ))}
          </ul>
          <AddAdminForm />
        </section>
      </div>
    </>
  );
}
