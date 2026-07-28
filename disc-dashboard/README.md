# DISC Assessment Tools (Google Apps Script)

Dashboard tes kepribadian DISC online, diadaptasi dari file `DISC Master System.xlsx`.
Peserta mengisi tes 24 soal langsung dari browser, hasil (grafik + tipe kepribadian +
rekomendasi training karier) langsung tampil di layar dan dikirim otomatis ke email
peserta. Semua data tersimpan di Google Sheet. Ada juga panel admin sederhana untuk
melihat rekap semua peserta.

## Isi Project

- `Code.gs` — backend: data 24 soal, tabel 40 tipe kepribadian, mesin scoring, simpan ke
  Sheet, kirim email hasil, dan endpoint untuk panel admin.
- `Index.html` — satu halaman web (form tes, halaman hasil, dan panel admin) dengan tab
  navigasi sederhana.
- `appsscript.json` — manifest opsional (runtime V8 + pengaturan default web app). Boleh
  dilewati jika Anda lebih suka mengatur lewat menu **Deploy**.

## Cara Deploy (5 menit)

1. Buka [sheets.google.com](https://sheets.google.com) → buat Spreadsheet baru, beri nama
   misalnya "DISC Assessment - Data".
2. Di spreadsheet itu, buka **Extensions > Apps Script**.
3. Di editor Apps Script:
   - Hapus isi `Code.gs` bawaan, tempel isi `Code.gs` dari project ini.
   - Klik **+ > HTML**, beri nama file **Index** (harus persis "Index", tanpa `.html`),
     tempel isi `Index.html` dari project ini.
   - (Opsional) Klik ikon roda gigi **Project Settings**, centang "Show appsscript.json
     manifest file in editor", lalu tempel isi `appsscript.json`.
4. Set password admin: buka **Project Settings > Script Properties > Add script
   property**, isi:
   - `ADMIN_PASSWORD` = password pilihan Anda (default sementara: `admin123` jika tidak
     diset — segera ganti).
   - `ADMIN_CC_EMAIL` = alamat email yang ingin menerima salinan (CC) setiap hasil tes,
     misal `hasan.mukti@gmail.com` (opsional, boleh dikosongkan).
5. Klik **Deploy > New deployment**.
   - Pilih tipe **Web app**.
   - **Execute as**: Me (akun Anda) — supaya email terkirim dari akun Anda.
   - **Who has access**: Anyone — supaya peserta bisa mengisi tanpa login Google.
   - Klik **Deploy**, izinkan (authorize) akses yang diminta.
6. Salin **Web app URL** yang muncul. Itulah link dashboard tes DISC Anda — bisa
   dibagikan ke peserta.

Setiap kali Anda mengubah `Code.gs`/`Index.html` setelah deploy pertama, buat
**deployment baru** (atau gunakan "Manage deployments > Edit > New version") supaya
perubahan ikut ter-publish ke URL yang sama.

## Cara Kerja

- **Ambil Tes**: peserta isi biodata (nama, email, usia, jenis kelamin, jabatan opsional)
  lalu menjawab 24 soal (pilih P = paling menggambarkan diri, K = paling tidak
  menggambarkan diri, untuk kalimat yang berbeda pada setiap nomor).
- **Scoring**: mengikuti logika asli file Excel — setiap jawaban dikonversi ke huruf
  D/I/S/C, dihitung skor "Most" dan "Least", lalu skor "Result" = Most − Least per
  faktor. Tiga faktor dengan skor Result tertinggi (urut) menentukan **kode tipe**
  (misal `D-I-S`), yang dicocokkan ke salah satu dari 40 tipe kepribadian pada tabel
  `Def` di file Excel sumber (nama tipe, deskripsi, dan area karier — persis seperti di
  file Excel, hanya diterjemahkan ke format online).
- **Hasil**: langsung tampil di layar (grafik batang, nama tipe, deskripsi, rekomendasi
  training, area karier) dan dikirim sebagai email HTML (dengan gambar grafik) ke email
  peserta, dengan salinan (CC) ke `ADMIN_CC_EMAIL` jika diset.
- **Rekomendasi Training**: karena file Excel sumber tidak memuat rekomendasi training,
  bagian ini disusun baru — dikomposisi dari 2 faktor dominan hasil tes peserta (faktor
  primer + sekunder), berisi fokus pengembangan, daftar training yang disarankan, dan
  tips sukses karier.
- **Panel Admin**: tab "Admin" di halaman yang sama, dilindungi password
  (`ADMIN_PASSWORD`). Menampilkan rekap jumlah peserta per tipe kepribadian dan tabel
  semua peserta, dengan tombol "Kirim Ulang" email per peserta.

## Struktur Data di Google Sheet

Sheet `Responses` dibuat otomatis saat submission pertama, dengan kolom:

```
Timestamp | ResponseId | Nama | Email | Usia | JenisKelamin | Jabatan |
Most_D..C | Least_D..C | Result_D..C | KodeTipe | NamaTipe | EmailTerkirim
```

Boleh dibuka & dianalisis manual di Sheet kapan saja (mis. dengan Pivot Table),
terpisah dari panel Admin di web app.

## Keamanan & Batasan yang Perlu Diketahui

- Password admin disimpan sebagai Script Property (bukan di kode/sheet), tapi ini
  proteksi ringan — cukup untuk penggunaan internal tim kecil/menengah, bukan untuk data
  sangat sensitif.
- Kuota `MailApp.sendEmail` mengikuti akun Google yang menjalankan Apps Script: ±100
  email/hari untuk akun Gmail biasa, ±1.500/hari untuk akun Google Workspace. Cukup
  untuk penggunaan tim/perusahaan skala menengah; untuk volume sangat besar
  pertimbangkan layanan email transaksional terpisah.
- Algoritma penentuan tipe menggunakan metode ranking Result (Most − Least) standar
  DISC — bukan replikasi bit-per-bit dari mesin grafik "shape-matching" 40-pola di
  balik file Excel aslinya (yang memakai tabel referensi grafis tersembunyi). Nama
  tipe, deskripsi, dan daftar karier tetap diambil persis dari 40 entri tabel `Def` di
  file sumber, sehingga hasil akhirnya tetap konsisten dan bermakna sama.

## Uji Coba Cepat

Setelah deploy, buka Web App URL, isi tes dengan jawaban asal untuk memastikan alur
selesai (hasil tampil + email masuk). Lalu buka tab **Admin**, login dengan
`ADMIN_PASSWORD`, pastikan data peserta tadi muncul di tabel.
