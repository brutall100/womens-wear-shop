import { NextResponse } from "next/server";
import { getSebSettings, updateSebSettings } from "@/lib/seb";

export async function GET() {
  try {
    const settings = getSebSettings();
    // Mask sensitive secrets partially for display
    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        clientSecret: settings.clientSecret
          ? settings.clientSecret.slice(0, 4) + "••••••••"
          : "",
      },
    });
  } catch (error) {
    console.error("GET /api/seb/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Nepavyko gauti SEB nustatymų" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      merchantId,
      clientId,
      clientSecret,
      banklinkServiceUrl,
      mode,
      accountIban,
      recipientName,
      privateKeyPem,
      sebPublicKeyPem,
    } = body;

    const toUpdate: Record<string, string> = {};
    if (merchantId) toUpdate.merchantId = merchantId;
    if (clientId) toUpdate.clientId = clientId;
    if (clientSecret && !clientSecret.includes("••••")) toUpdate.clientSecret = clientSecret;
    if (banklinkServiceUrl) toUpdate.banklinkServiceUrl = banklinkServiceUrl;
    if (mode) toUpdate.mode = mode;
    if (accountIban) toUpdate.accountIban = accountIban;
    if (recipientName) toUpdate.recipientName = recipientName;
    if (privateKeyPem) toUpdate.privateKeyPem = privateKeyPem;
    if (sebPublicKeyPem) toUpdate.sebPublicKeyPem = sebPublicKeyPem;

    const updated = updateSebSettings(toUpdate);

    return NextResponse.json({
      success: true,
      message: "SEB banko nustatymai išsaugoti",
      settings: updated,
    });
  } catch (error) {
    console.error("POST /api/seb/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Nepavyko išsaugoti SEB nustatymų" },
      { status: 500 }
    );
  }
}
