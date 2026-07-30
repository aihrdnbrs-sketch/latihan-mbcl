import { Redis } from "@upstash/redis";
import { TEAM_MEMBERS, slugify } from "@/data/team-members";

// Mendukung nama env variable dari integrasi Vercel Marketplace (KV_REST_API_*)
// maupun konvensi Upstash langsung (UPSTASH_REDIS_REST_*).
const kv = new Redis({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "",
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

export const STATUSES = ["belum_mulai", "dikerjakan", "selesai"] as const;
export type Status = (typeof STATUSES)[number];

export interface MemberStatus {
  id: string;
  name: string;
  status: Status;
  task: string;
  updatedAt: string | null;
}

interface StoredValue {
  status: Status;
  task: string;
  updatedAt: string;
}

const KV_KEY = "papan-status-tim";

function parseStored(raw: unknown): StoredValue | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as StoredValue;
    } catch {
      return null;
    }
  }
  return raw as StoredValue;
}

export async function getAllMemberStatuses(): Promise<MemberStatus[]> {
  const raw = (await kv.hgetall(KV_KEY)) as Record<string, unknown> | null;

  return TEAM_MEMBERS.map((name) => {
    const id = slugify(name);
    const saved = parseStored(raw?.[id]);

    return {
      id,
      name,
      status: saved?.status ?? "belum_mulai",
      task: saved?.task ?? "",
      updatedAt: saved?.updatedAt ?? null,
    };
  });
}

export async function setMemberStatus(
  id: string,
  status: Status,
  task: string
): Promise<StoredValue> {
  const value: StoredValue = {
    status,
    task,
    updatedAt: new Date().toISOString(),
  };
  await kv.hset(KV_KEY, { [id]: JSON.stringify(value) });
  return value;
}
