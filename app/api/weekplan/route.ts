// Plano da semana — diretriz proativa (qual registro em cada dia da semana).
import { getWeekPlan, setWeekPlan, type WeekPlan } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ plan: await getWeekPlan() });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { plan?: WeekPlan };
  if (Array.isArray(body.plan)) await setWeekPlan(body.plan);
  return Response.json({ ok: true });
}
