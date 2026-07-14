# Skill: Membuat Ebook (output .docx)

Skill ini memandu pembuatan ebook dari nol sampai file `.docx`, satu alur penuh:
**judul → deskripsi → daftar bab → sub-bab → isi → build .docx**. Tiap bab disimpan
sebagai file Markdown, lalu di-compile jadi satu dokumen Word oleh tooling di repo ini.

Semua tahap mengikuti satu benang merah: **transformasi pembaca** — memindahkan
pembaca dari kondisi sekarang (BEFORE: masalah/frustrasi) ke kondisi yang diinginkan
(AFTER: hasil/identitas baru). Judul, deskripsi, struktur bab, dan isi semuanya
melayani perpindahan itu.

Struktur tiap ebook ada di `books/<slug>/`:

```
books/<slug>/
├── book.json          metadata: title, subtitle, author, language, chapters[]
├── outline.md         kerangka ebook (referensi saat menulis)
├── description.md     deskripsi/blurb pemasaran (sampul belakang / halaman jualan)
├── chapters/          satu file .md per bab, urut menurut nama (01-, 02-, ...)
│   ├── 01-....md
│   └── 02-....md
└── dist/<slug>.docx   hasil build (otomatis dibuat)
```

## Alur kerja

Jalankan tahap demi tahap. Di tiap tahap yang menghasilkan keputusan besar
(judul, deskripsi, daftar bab, kerangka sub-bab), **tunjukkan ke user dan minta
persetujuan/revisi sebelum lanjut.** Jangan bertanya bertubi-tubi — maksimal 2-3
pertanyaan sekaligus.

### 0. Gali kebutuhan
Sebelum mulai, pastikan tahu hal-hal inti (tanya yang belum jelas):
- **Topik & sudut pandang** — tentang apa, apa yang membuatnya beda (mekanisme unik).
- **Pembaca sasaran** — siapa, latar belakang, level (pemula/menengah/ahli).
- **BEFORE → AFTER** — masalah/frustrasi mereka sekarang vs hasil yang diimpikan.
- **Tujuan** — pembaca bisa apa setelah selesai membaca.
- **Nada & gaya & bahasa** — formal/santai/naratif/teknis; Indonesia/Inggris/lainnya.
- **Panjang** — perkiraan jumlah bab dan target kata per bab.

---

### 1. Judul + subjudul (format transformasi)

Tujuan: judul yang menjanjikan transformasi dari titik A ke titik B — terasa
personal, spesifik, dan menjual karena pembaca melihat dirinya di dalamnya.

Pola judul (kombinasikan/variasikan):
- **Dari [Before] Menjadi [After]** — "Dari Karyawan Jadi Bos untuk Diri Sendiri"
- **Cara [After] Tanpa [Pengorbanan]** — "Cara Fasih Bahasa Inggris Tanpa Kursus Mahal"
- **[Hasil] dalam [Waktu]** — "Sehat & Bugar dalam 90 Hari"
- **Berhenti [Before], Mulai [After]** — "Berhenti Menunda, Mulai Bertindak"
- **Rahasia/Cetak Biru [After] untuk [Pembaca]** — "Cetak Biru Cuan untuk Pemula"
- **[Angka] Langkah dari [Before] ke [After]** — "7 Langkah dari Bingung Jadi Berani Investasi"

Prinsip: **spesifik mengalahkan umum**, **manfaat mengalahkan fitur**, hindari klise
kosong ("Sukses Luar Biasa"), pakai kata kerja & hasil konkret.

Sajikan **7-10 kandidat** dengan sudut berbeda (kecepatan, identitas baru,
menghilangkan rasa sakit, status). Untuk kandidat kuat, tambahkan **subjudul** yang
memperjelas mekanisme/benefit. Diskusikan, lalu finalisasi 1 judul + 1 subjudul.

**Scaffold di sini:** `npm run new -- "Judul Final"` membuat `books/<slug>/` dengan
`book.json`, `outline.md`, dan satu contoh bab. Lalu edit `book.json` (`title`,
`subtitle`, `author`, `language`).

---

### 2. Deskripsi / blurb yang menjual

Tujuan: teks persuasif yang membuat calon pembaca merasa *"buku ini untukku"*.
Bukan ringkasan netral. Idealnya **120-200 kata**, gunakan **"kamu"**, fokus pada
manfaat & hasil konkret.

Struktur (tulis mengalir, bukan kaku):
1. **Hook** (1-2 kalimat) — sentuh masalah/keinginan. *"Capek kerja keras tapi tabungan jalan di tempat?"*
2. **Empati/agitasi** (2-3 kalimat) — tunjukkan kamu paham, perdalam sedikit.
3. **Janji transformasi** (1-2 kalimat) — buku sebagai jalan keluar: dari [before] ke [after].
4. **Apa yang akan kamu dapatkan** — 3-5 bullet berbasis hasil.
5. **Untuk siapa buku ini** — 1 kalimat penegasan sasaran.
6. **Penutup/ajakan** (1 kalimat) — dorong mulai membaca sekarang.

Simpan ke `books/<slug>/description.md` (terpisah dari isi buku).

---

### 3. Daftar bab (outline tingkat bab)

**WAJIB tanya jumlah bab dulu** sebelum menyusun apa pun. Beri rekomendasi:
- Ebook ringkas / lead magnet: **3-5 bab**
- Ebook standar: **6-10 bab**
- Buku panduan lengkap: **10-15 bab**

Susun bab sebagai **perjalanan transformasi** — tiap bab memajukan pembaca satu
langkah dari BEFORE ke AFTER. Pola yang mengalir baik:
1. Bab pembuka — kenapa penting / janji transformasi / mindset.
2. Bab fondasi — dasar/konsep yang harus dipahami dulu.
3. Bab inti (beberapa) — langkah/metode utama, dari mudah ke lanjut.
4. Bab penerapan — praktik, contoh, mengatasi hambatan.
5. Bab penutup — konsolidasi, langkah selanjutnya, ajakan bertindak.

Untuk tiap bab tuliskan: **judul** (boleh berorientasi hasil), **ringkasan 1-2
kalimat**, dan **tujuan** (setelah bab ini pembaca bisa/paham apa). **Tunjukkan
seluruh daftar bab ke user untuk persetujuan/revisi**, lalu catat ke `outline.md`.

---

### 4. Sub-bab (struktur dalam tiap bab)

Pecah tiap bab jadi **3-6 sub-bab** (sesuaikan bobot materi; boleh tanya user kalau
ingin jumlah tertentu). Tiap sub-bab = satu gagasan/langkah utuh, urut dari
pengantar → inti → penerapan. Pola dalam satu bab: buka (kenapa penting) →
konsep/langkah → contoh/praktik → ringkasan atau jembatan ke bab berikutnya.

Tulis sub-bab sebagai heading `##` di file bab, di bawah judul `#`. Sertakan
ringkasan singkat sebagai panduan mengisi. Contoh `chapters/03-membangun-kebiasaan.md`:

```markdown
# Membangun Kebiasaan yang Bertahan

## Kenapa Kebiasaan Lama Selalu Kembali
> Ringkasan: jebakan motivasi vs sistem.

## Aturan 1% Setiap Hari
> Ringkasan: kekuatan perbaikan kecil yang konsisten.

## Merancang Lingkungan Pemicu
> Ringkasan: mengubah lingkungan agar kebiasaan baik jadi default.
```

Tunjukkan kerangka sub-bab ke user untuk persetujuan sebelum mengisi.

---

### 5. Isi sub-bab (tulis kontennya)

Tulis isi penuh tiap sub-bab — **substantif dan utuh, bukan placeholder** — tepat
di bawah heading `##`-nya. Target umum **300-800 kata** per sub-bab. Bangun dari:
- **Pembuka menarik** — pertanyaan, fakta, atau cerita pendek relevan.
- **Penjelasan inti** — gagasan utama, jelas dan terstruktur.
- **Contoh konkret / analogi / studi kasus** — bikin abstrak jadi nyata.
- **Langkah actionable** — list bernomor, blockquote tips, atau tabel bila relevan.
- **Jembatan/penutup** — sambungkan ke sub-bab/bab berikutnya.

Aturan kualitas:
- Tiap file bab mulai dengan `# Judul Bab` (heading 1) — ini jadi judul bab di .docx.
- Pakai `##`/`###`, list, **tebal**, *miring*, blockquote, tabel sesuai kebutuhan.
- Jaga konsistensi nada, istilah, sudut pandang antarbab/sub-bab. Rujuk `outline.md`.
- Hindari mengulang isi bagian lain; tiap bagian menambah sesuatu yang baru.
- **Untuk ebook panjang, tulis beberapa bab/sub-bab lalu checkpoint ke user untuk
  umpan balik** — jangan menulis 15 bab sekaligus tanpa checkpoint.

Kalau memakai urutan eksplisit, daftarkan nama file di `book.json` → `chapters`.
Kalau dikosongkan, urutan diambil otomatis dari nama file (numeric sort).

---

### 6. Build ke .docx

```bash
npm run build -- <slug>
```

Hasilnya di `books/<slug>/dist/<slug>.docx`. Sampaikan path-nya ke user. Kalau ada
error, baca pesannya — biasanya `book.json` tidak valid atau folder `chapters/` kosong.

## Tips kualitas
- Halaman judul dibuat otomatis dari `title`/`subtitle`/`author` di `book.json`.
- Tiap bab otomatis mulai di halaman baru; nomor halaman ada di footer.
- Heading sudah pakai style Word, jadi user bisa Insert → Table of Contents di Word.
- Konsistensi terminologi sangat penting di buku panjang — pertahankan istilah sama.

## Perintah cepat
- `npm run new -- "Judul"` — scaffold ebook baru
- `npm run list` — daftar ebook di repo
- `npm run build -- <slug>` — compile jadi .docx
