import { handleBankResponse } from "@/lib/bank-response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleBankResponse(request);
}

export async function POST(request: Request) {
  return handleBankResponse(request);
}
