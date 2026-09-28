"use client";

import { useActionState } from "react";
import { addAdmin, changePassword, type SettingsState } from "./actions";

function Message({ state }: { state: SettingsState }) {
  if (state?.error) return <p className="text-sm text-accent">{state.error}</p>;
  if (state?.success) return <p className="text-sm text-emerald-700">{state.success}</p>;
  return null;
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  return (
    <form action={action} className="space-y-3">
      <input name="current" type="password" placeholder="Dabartinis slaptažodis" autoComplete="current-password" className="input" />
      <input name="next" type="password" placeholder="Naujas slaptažodis (min. 10 simb.)" autoComplete="new-password" className="input" />
      <Message state={state} />
      <button disabled={pending} className="btn-outline py-2">
        Pakeisti slaptažodį
      </button>
    </form>
  );
}

export function AddAdminForm() {
  const [state, action, pending] = useActionState(addAdmin, null);
  return (
    <form action={action} className="space-y-3">
      <input name="email" type="email" placeholder="El. paštas" className="input" />
      <input name="password" type="password" placeholder="Laikinas slaptažodis (min. 10 simb.)" autoComplete="new-password" className="input" />
      <Message state={state} />
      <button disabled={pending} className="btn-outline py-2">
        Pridėti administratorių
      </button>
    </form>
  );
}
