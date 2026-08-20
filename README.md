# Website — Hasan Mukti, ST, MBA (AI Trainer & Productivity Consultant)

Landing page satu halaman, statis (HTML/CSS/JS murni, tanpa build tool), dioptimalkan untuk konversi B2B: WhatsApp CTA di semua touchpoint + form permintaan penawaran training korporat.

## Struktur File

```
index.html            → seluruh konten & section halaman
assets/css/style.css  → styling, tema dark + aksen amber, semua animasi CSS
assets/js/main.js     → interaksi: nav, reveal on scroll, counter, slider testimoni, link WA/telepon
```

## Menjalankan secara lokal

Cukup buka `index.html` langsung di browser, atau jalankan server statis sederhana:

```bash
python3 -m http.server 8080
# lalu buka http://localhost:8080
```

## Cara mengganti aset placeholder

1. **Foto profil** — sudah terpasang di `assets/img/hasan-mukti-profile.png`, dipakai di section Hero (`.hero__avatar`) & Tentang (`.about__avatar`). File yang terpasang saat ini beresolusi kecil (84×112px) — ganti file tersebut dengan foto resolusi lebih tinggi (disarankan minimal 400×400px, format persegi) kapan pun tersedia, nama file & path bisa tetap sama.
2. **Logo klien** — ganti isi `.marquee__track` (list `<span class="logo-pill">`) dengan `<img>` logo klien asli.
3. **Testimoni** — ganti teks di section `#testimoni` (ditandai sebagai contoh/placeholder) dengan testimoni asli klien.
4. **Nomor WhatsApp / Email** — cukup ubah 3 variabel di awal `assets/js/main.js`:
   ```js
   var PHONE_DISPLAY = "0812 1636 2030";
   var PHONE_WA = "6281216362030";
   ```
   Email sudah tertaut ke `hasan.mukti@gmail.com` di beberapa tempat pada `index.html` (cari `mailto:`).

## Deploy

Situs ini statis sepenuhnya, bisa langsung di-deploy ke:
- **GitHub Pages** — aktifkan Pages dari branch ini, root folder.
- **Netlify / Vercel** — drag-and-drop folder atau hubungkan repo, tanpa build command.
- Hosting statis lain apa pun (cukup upload isi folder ini).
