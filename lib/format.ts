export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "belum pernah diubah";

  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) return "diubah baru saja";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `diubah ${diffMin} menit lalu`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `diubah ${diffHour} jam lalu`;

  const diffDay = Math.floor(diffHour / 24);
  return `diubah ${diffDay} hari lalu`;
}
