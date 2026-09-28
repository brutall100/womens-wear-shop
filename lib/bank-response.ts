import { NextResponse } from "next/server";
import { applyBankResponse } from "./payments";
import { appOrigin, formToRecord } from "./origin";
import { escapeHtml } from "./seb";

export async function readBankParams(request: Request): Promise<Record<string, string>> {
  if (request.method === "GET") {
    return Object.fromEntries(new URL(request.url).searchParams.entries());
  }
  const form = await request.formData();
  return formToRecord(form);
}

export async function handleBankResponse(request: Request): Promise<Response> {
  const params = await readBankParams(request);
  const result = applyBankResponse(params);
  if (result.auto) {
    return new Response(result.ok ? "OK" : result.error, {
      status: result.ok ? 200 : 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  if (!result.ok || !result.stamp) {
    const message = escapeHtml(result.ok ? "Mokėjimas nepatvirtintas." : result.error);
    return new Response(
      `<!doctype html><html lang="lt"><meta charset="utf-8"><title>Mokėjimas</title><body style="font-family:sans-serif;padding:40px"><p>${message}</p><p><a href="/krepselis">Grįžti</a></p></body></html>`,
      { status: 400, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }
  return NextResponse.redirect(`${appOrigin(request)}/uzsakymas/${result.stamp}`, 303);
}
