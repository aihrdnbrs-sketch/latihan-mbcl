import { NextRequest, NextResponse } from "next/server";
import { TEAM_MEMBERS, slugify } from "@/data/team-members";
import { getAllMemberStatuses, setMemberStatus, STATUSES } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  const members = await getAllMemberStatuses();
  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = body?.id;
  const status = body?.status;
  const task = body?.task;

  const validIds = TEAM_MEMBERS.map(slugify);
  if (typeof id !== "string" || !validIds.includes(id)) {
    return NextResponse.json({ error: "Anggota tidak dikenali." }, { status: 400 });
  }
  if (typeof status !== "string" || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  const cleanTask = typeof task === "string" ? task.trim().slice(0, 60) : "";
  const saved = await setMemberStatus(id, status as (typeof STATUSES)[number], cleanTask);

  return NextResponse.json({ id, ...saved });
}
