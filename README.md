# Papan Status Tim

Satu layar sederhana yang menampilkan status kerja tim (Belum Mulai / Dikerjakan
/ Selesai), tugas singkat, dan kapan terakhir diubah. Setiap orang hanya bisa
mengubah barisnya sendiri, tanpa login/password.

## 1. Edit daftar nama tim Anda

Buka `data/team-members.ts` dan ganti daftar nama contoh dengan nama tim Anda
yang sebenarnya (5-10 nama, harus unik):

```ts
export const TEAM_MEMBERS: string[] = [
  "Andi",
  "Budi",
  // ... nama tim Anda
];
```

Simpan, commit, lalu push — setiap perubahan file ini butuh deploy ulang agar
tampil di web (Vercel otomatis deploy ulang setiap kali Anda push ke branch
yang terhubung).

## 2. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New... → Project**.
2. Import repository GitHub ini.
3. Framework Preset akan otomatis terdeteksi sebagai **Next.js**. Klik **Deploy**
   (deploy pertama ini akan gagal/kosong datanya karena database belum dibuat —
   tidak apa-apa, lanjut ke langkah 3).

## 3. Buat database (Upstash Redis) — untuk menyimpan status yang berubah-ubah

1. Di dashboard project Vercel Anda, buka tab **Storage**.
2. Klik **Create Database**, lalu pilih **Upstash** → **Redis** (gratis untuk
   skala kecil, dan paling cepat disetup untuk aplikasi ini).
3. Beri nama bebas (misalnya `papan-status-tim-db`), pilih region terdekat
   (misalnya Singapore), lalu buat.
4. Saat diminta menghubungkan ke project, pilih project **Papan Status Tim**
   Anda dan centang environment **Production** (dan **Preview**/**Development**
   jika tersedia). Vercel akan otomatis mengisi environment variable yang
   dibutuhkan (nama persisnya bisa `KV_REST_API_URL`/`KV_REST_API_TOKEN` atau
   `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` tergantung versi
   integrasi — kode aplikasi ini sudah mendukung keduanya) — Anda tidak perlu
   mengetik apa pun secara manual.
5. Kembali ke tab **Deployments**, buka deployment terakhir, klik titik tiga →
   **Redeploy** (agar env variable baru terpakai).

Setelah ini, buka URL project Anda — Papan Status Tim akan tampil dengan daftar
nama dari `data/team-members.ts`.

## 4. (Opsional) Jalankan di komputer sendiri (local dev)

```bash
npm install
npx vercel link          # hubungkan folder ini ke project Vercel Anda
npx vercel env pull .env.local   # ambil KV_* env variable dari Vercel
npm run dev
```

Buka http://localhost:3000.

## Cara pakai (untuk tim)

1. Buka link web dari HP.
2. Saat pertama kali buka, pilih nama Anda dari daftar — ini akan diingat oleh
   browser/HP tersebut, tidak perlu pilih ulang setiap buka.
3. Baris dengan tanda "Ini saya" adalah baris yang bisa Anda ubah: pilih status
   (Belum Mulai / Dikerjakan / Selesai) dan tulis tugas singkat, lalu tekan
   **Simpan**.
4. Semua orang bisa melihat semua baris. Layar memperbarui diri sendiri setiap
   beberapa detik; ada juga tombol **Perbarui** untuk memuat ulang manual.
5. Salah pilih nama? Tekan **"Bukan saya? Ganti nama"** di bagian bawah layar.

## Struktur singkat

- `data/team-members.ts` — daftar nama tim (edit manual di sini).
- `app/page.tsx` — tampilan utama (satu layar).
- `app/api/status/route.ts` — API untuk membaca & menyimpan status.
- `lib/kv.ts` — akses ke database KV.
