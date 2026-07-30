// Daftar anggota tim yang muncul di Papan Status Tim.
//
// CARA EDIT: ganti nama-nama di bawah ini dengan nama tim Anda yang sebenarnya
// (5-10 nama), lalu simpan, commit, dan push/deploy ulang ke Vercel.
// Pastikan setiap nama unik (tidak ada dua orang dengan nama persis sama).
export const TEAM_MEMBERS: string[] = [
  "Andi",
  "Budi",
  "Citra",
  "Dewi",
  "Eka",
  "Fajar",
  "Gita",
  "Hana",
];

// Mengubah nama menjadi id yang stabil untuk disimpan di database.
// Tidak perlu diubah.
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
