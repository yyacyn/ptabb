
### **RINCIAN SKENARIO PENGUJIAN GAGAL (FAIL) & DALAM ANTREAN (PENDING)**

#### **1. Skenario Gagal (FAIL) — 23 Skenario**

| No | Modul / Controller | Skenario Uji | Ekspektasi (Yang Diharapkan) | Pengamatan (Hasil Aktual) |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **FleetsController** | Upload Featured Image Kosong | Menolak upload gambar kosong | Gambar kosong diterima & web menampilkan placeholder |
| 2 | **FleetsController** | Upload Featured Image Non-Gambar | Menolak file selain `.jpg`/`.png`/`.webp` | File non-gambar diterima & memuat preview kosong |
| 3 | **FleetsController** | Upload PDF Spec Non-PDF | Menolak file dokumen selain format `.pdf` | Menampilkan pesan berhasil upload PDF tanpa validasi |
| 4 | **FleetsController** | Upload PDF Spec > 10MB | Menolak file PDF dengan ukuran > 10MB | Menampilkan pesan berhasil upload PDF tanpa validasi ukuran |
| 5 | **FleetCatController** | Name Kategori Kosong | Menolak pembuatan kategori tanpa nama | Kapal berhasil ditambahkan tanpa kategori |
| 6 | **FleetCatController** | Name Kategori > 255 Karakter | Menolak nama kategori > 255 karakter | Menampilkan error "Failed to parse category response" |
| 7 | **FleetCatController** | Name Kategori Duplikat | Menolak nama kategori yang sudah ada di DB | Menampilkan error "Failed to parse category response" |
| 8 | **CareersController** | Position Title > 255 Karakter | Menolak judul posisi > 255 karakter | Tidak terjadi apa-apa ketika klik submit |
| 9 | **CareersController** | Application Deadline Invalid (default) | Menolak format tanggal deadline invalid | Lowongan tetap berhasil disimpan |
| 10 | **NewsController** | Content Berita Kosong | Menolak pembuatan berita tanpa isi konten | Tidak terjadi apa-apa ketika klik submit |
| 11 | **NewsController** | Content Berita > 10000 Karakter | Menolak isi konten > 10.000 karakter | Konten diterima dan disimpan ke database |
| 12 | **NewsController** | Upload Featured Image Kosong | Menolak upload gambar kosong | Gambar kosong diterima & web menampilkan placeholder |
| 13 | **NewsController** | Upload Featured Image Non-Gambar | Menolak file cover non-gambar | File diterima & memuat preview hitam/kosong |
| 14 | **ClientsController** | Client Name > 255 Karakter | Menolak nama client > 255 karakter | Tidak terjadi apa-apa ketika klik submit |
| 15 | **ClientsController** | Logo File Non-Gambar | Menolak upload logo non-gambar | File diterima & memuat preview kosong |
| 16 | **BranchesController** | Short Description > 255 Karakter | Menolak deskripsi singkat > 255 karakter | Tidak terjadi apa-apa ketika klik submit |
| 17 | **BranchesController** | Map URL Tanpa `maps/embed` | Menolak URL Google Maps tanpa `maps/embed` | Tidak terjadi apa-apa ketika klik submit |
| 18 | **BranchesController** | Map URL dengan Tag `<iframe>` | Menerima embed URL ber-tag `<iframe>` | Tidak terjadi apa-apa ketika klik submit |
| 19 | **BranchesController** | Branch Image Photo >= 5MB | Menolak unggahan gambar kantor cabang >= 5MB | Gambar >= 5MB tetap diterima sistem |
| 20 | **UsersController** | Password Kosong saat Create User | Menolak pembuatan user tanpa password | User gagal dibuat namun pesan error tidak tampil |
| 21 | **ProfileController** | Self-Deletion Account Super Admin | Memblokir Super Admin menghapus akun sendiri | Tidak terjadi apa-apa ketika dihapus |
| 22 | **ChatbotController** | Message Chatbot > 1000 Karakter | Menolak pesan pengguna > 1000 karakter | Respon fallback lokal dikembalikan |
| 23 | **Public Pages** | Semantic HTML Tag `<h1>` | Setiap halaman publik memiliki elemen `<h1>` tunggal | Tidak ada halaman yang memiliki `<h1>` |

---

#### **2. Skenario Dalam Antrean (PENDING) — 2 Skenario**

| No | Modul / Controller | Skenario Uji | Status / Alasan Pending |
| :-: | :--- | :--- | :--- |
| 1 | **FleetsController** | Klik tombol Hapus Armada memicu Modal Konfirmasi | *To be implemented* |
| 2 | **FleetsController** | Penghapusan data armada di DB setelah dikonfirmasi | *To be implemented* |
