# **DOKUMEN UJI PERANGKAT LUNAK (DUPL)**
## **PT. PELAYARAN ANDALAS BAHTERA BARUNA (PT ABB) WEB SYSTEM v2.0**

---

### **1. Hasil Pengujian Fungsi *Sign In* / Autentikasi (`AuthenticatedSessionController`)**

#### *Tabel 1. Hasil Pengujian Fungsi Login & Proteksi Keamanan Autentikasi*

| Identifikasi | [DUPL-ABB-001] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Fungsi *Login* & Autentikasi Pengguna Admin |  |
| **Deskripsi Kasus** | Pengujian autentikasi login pengguna admin mencakup pengujian kondisi normal (valid), format email/username invalid, kredensial salah/tidak terdaftar, proteksi penguncian akun (lockout 5x gagal / 60 detik), dan regenerasi ID Session (mencegah *session fixation attack*). |  |
| **Kondisi Awal** | Database `users` terisi data Super Admin, HR Admin, Crew Admin, dan PR Admin. Pengguna berada di halaman `/login`. |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-001]:<br><br>**Field “Email / Username”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Format email tidak valid `"admin_abb.com"` (Invalid)<br>- Input : Username/Email tidak terdaftar `"nonexistent@ptabb.com"` (Invalid)<br>- Input : Email terdaftar valid `"superadmin@ptabb.com"` (Valid)<br>- Input : Username terdaftar valid `"superadmin"` (Valid)<br><br>**Field “Password”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Password kurang dari 8 karakter `"12345"` (Invalid)<br>- Input : Password salah untuk kredensial terdaftar `"WrongPass123!"` (Invalid)<br>- Input : Password benar valid `"SuperSecurePass2026!"` (Valid)<br><br>**Keamanan & Lockout Sesi (NFR-SEC & BR-Sec)**<br>- Percobaan login gagal 5 kali berturut-turut dari IP yang sama (Lockout Test)<br>- Login sukses dengan kredensial valid (Session ID Regeneration Test) |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Sistem menolak input email/username kosong dan menampilkan pesan error validasi. | Sistem menampilkan pesan error “The email field is required.” | PASS |
| Sistem menolak format email tanpa karakter `@` atau format email tidak valid. | Sistem menampilkan pesan error “Please enter a valid email address.” | PASS |
| Sistem menolak email/username yang tidak terdaftar di database `users`. | Sistem menampilkan pesan error “These credentials do not match our records.” | PASS |
| Sistem menerima input email terdaftar yang valid dan melanjutkan autentikasi. | Email valid diterima dan pemrosesan dilanjutkan ke pemeriksaan password. | PASS |
| Sistem menerima input username terdaftar yang valid dan melanjutkan autentikasi. | Username valid diterima dan pemrosesan dilanjutkan ke pemeriksaan password. | PASS |
| Sistem menolak input password kosong dan menampilkan pesan error validasi. | Sistem menampilkan pesan error “The password field is required.” | PASS |
| Sistem menolak password yang kurang dari batas minimal karakter (8 karakter). | Sistem menampilkan pesan error “The password must be at least 8 characters.” | PASS |
| Sistem menolak password salah untuk kredensial email/username yang terdaftar. | Sistem menampilkan pesan error “These credentials do not match our records.” | PASS |
| Sistem menyetujui autentikasi password benar dan mengarahkan pengguna ke Dashboard Admin. | Pengguna berhasil diotentikasi dan dialihkan (*redirect*) ke Halaman Dashboard Admin. | PASS |
| Sistem mengunci percobaan login (*lockout*) selama 60 detik setelah 5 kali berturut-turut gagal dari IP/Username sama. | Sistem memblokir percobaan ke-6 dan menampilkan pesan “Too many login attempts. Please try again in 60 seconds.” | PASS |
| Sistem secara otomatis memperbarui (*regenerate*) Cookie ID Session saat login berhasil untuk mencegah serangan *session fixation*. | ID Session PHP/Laravel dalam Cookie browser diperbarui menjadi token acak baru setelah login sukses. | PASS |

---

### **2. Hasil Pengujian Manajemen Data Armada (`FleetsController`)**

#### *Tabel 2. Hasil Pengujian Fungsi Kelola Data Armada (CRUD, IMO Unik & PDF Parsing)*

| Identifikasi | [DUPL-ABB-002] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Fungsi Kelola Data Armada / Ship Fleet (`FleetsController`) |  |
| **Deskripsi Kasus** | Pengujian penambahan, pengeditan, penghapusan data armada kapal, validasi keunikan Nomor IMO (BR-02), konfirmasi modal hapus, pengunggahan dokumen PDF spesifikasi (max 10MB), serta pengujian API AI Parser spesifikasi kapal. |  |
| **Kondisi Awal** | Super Admin sudah *login* dan berada di Halaman Dashboard Admin Armada (`/dashboard/fleets`). |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-002]:<br><br>**Field “Ship Name”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Teks melebihi 255 karakter (Invalid)<br>- Input : `"MV. IRIANA"` (Valid)<br><br>**Field “IMO Number” (BR-02)**<br>- Input : Kosong / `""` (Invalid)<br>- Input : IMO yang sudah ada di database / duplikat `"IMO 9876543"` (Invalid)<br>- Input : Teks melebihi 20 karakter (Invalid)<br>- Input : `"IMO 9123456"` unik (Valid)<br><br>**Field “Status”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : `"Active - In Service"` (Valid)<br><br>**Field Numeric Specifications (DWT / Gross Tonnage / Speed)**<br>- Input : String non-numerik `"Seribu Ton"` (Invalid)<br>- Input : Angka numerik valid `12500` (Valid)<br><br>**Field “Ship Particular PDF Upload”**<br>- Input : File gambar/executable `.png` / `.exe` (Invalid)<br>- Input : File PDF berukuran 12MB / > 10MB (Invalid)<br>- Input : File PDF berukuran 4.5MB / <= 10MB (Valid)<br><br>**Endpoint AI PDF Parser (`POST /fleets/parse-pdf`)**<br>- Input : Upload file non-PDF (Invalid)<br>- Input : Upload file PDF spesifikasi kapal valid (Valid)<br><br>**Fungsi Penghapusan Data Armada**<br>- Klik tombol "Hapus Armada" tanpa interaksi lanjutan<br>- Klik tombol "Konfirmasi Hapus" pada Modal Konfirmasi |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Sistem menolak nama kapal kosong dan menampilkan error validasi. | Sistem menampilkan error “The ship name field is required.” | PASS |
| Sistem menolak nama kapal yang melebihi batas 255 karakter. | Sistem menampilkan error “The ship name may not be greater than 255 characters.” | PASS |
| Sistem menerima nama kapal valid dan menyimpan data. | Nama kapal `"MV. IRIANA"` tersimpan di database. | PASS |
| Sistem menolak nomor IMO kosong. | Sistem menampilkan error “The imo number field is required.” | PASS |
| Sistem menolak nomor IMO yang sudah terdaftar pada armada kapal lain di database (BR-02). | Sistem menampilkan error “The imo number has already been taken.” | PASS |
| Sistem menolak nomor IMO yang melebihi 20 karakter. | Sistem menampilkan error “The imo number may not be greater than 20 characters.” | PASS |
| Sistem menerima nomor IMO unik dan memproses penyimpanan. | Nomor IMO `"IMO 9123456"` diterima dan berhasil disimpan. | PASS |
| Sistem menolak field status armada kosong. | Sistem menampilkan error “The status field is required.” | PASS |
| Sistem menerima status armada valid. | Status `"Active - In Service"` berhasil disimpan. | PASS |
| Sistem menolak input string teks non-numerik pada atribut DWT / Gross Tonnage. | Sistem menampilkan error “The dwt must be a number.” | PASS |
| Sistem menerima nilai numerik valid untuk bobot DWT. | Nilai DWT `12500` berhasil disimpan. | PASS |
| Sistem menolak unggahan file dokumen selain format `.pdf`. | Sistem menampilkan error “The ship particular pdf must be a file of type: pdf.” | PASS |
| Sistem menolak unggahan file PDF yang ukurannya melebihi batas 10MB (10240 KB). | Sistem menampilkan error “The ship particular pdf may not be greater than 10240 kilobytes.” | PASS |
| Sistem menerima file PDF <= 10MB dan mengunggah ke direktori storage public. | File PDF berhasil diunggah ke `/storage/documents/fleets/` dan URL tersimpan di DB. | PASS |
| Endpoint AI PDF Parser menolak file non-PDF dengan HTTP 422. | API mengembalikan JSON error validasi format file. | PASS |
| Endpoint AI PDF Parser mengekstrak teks PDF spesifikasi kapal dan mengembalikan struktur JSON. | API merespons dengan JSON berisi atribut hasil ekstraksi spesifikasi kapal (`dwt`, `loa`, `breadth`, dll). | PASS |
| Klik tombol hapus tidak langsung menghapus record database, melainkan memicu modal konfirmasi. | Pop-up modal konfirmasi hapus muncul di layar pengguna (Safety Standard). | PASS |
| Sistem menghapus data armada dari database setelah dikonfirmasi pada modal hapus. | Record armada terhapus di DB dan pesan "Vessel deleted successfully" tampil. | PASS |

---

### **3. Hasil Pengujian Kategori Armada (`FleetCatController`)**

#### *Tabel 3. Hasil Pengujian Fungsi Kategori Armada (Validation & Unique Slug)*

| Identifikasi | [DUPL-ABB-003] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Fungsi Kelola Kategori Armada (`FleetCatController`) |  |
| **Deskripsi Kasus** | Pengujian pembuatan, pengeditan, dan penghapusan kategori armada kapal (seperti Bulk Cement Carrier, Tugboat, Anchor Handling Supply Vessel) dengan validasi nama unik dan pembentukan slug otomatis. |  |
| **Kondisi Awal** | Super Admin sudah *login* dan berada di menu Kategori Armada (`/fleet-categories`). |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-003]:<br><br>**Field “Name”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Teks melebihi 255 karakter (Invalid)<br>- Input : Nama kategori yang sudah terdaftar `"Bulk Cement Carrier"` (Invalid)<br>- Input : Nama kategori baru unik `"Anchor Handling Supply Vessel"` (Valid)<br><br>**Field “Description”**<br>- Input : Kosong / `null` (Valid - Optional)<br>- Input : Teks penjelasan deskripsi kategori (Valid)<br><br>**Otomasi Slug Kategori**<br>- Input nama `"Anchor Handling Supply Vessel"` -> Verifikasi pembentukan slug di DB |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Sistem menolak pembuatan kategori armada tanpa nama. | Sistem menampilkan error validasi “The name field is required.” | PASS |
| Sistem menolak nama kategori yang melebihi 255 karakter. | Sistem menampilkan error validasi “The name may not be greater than 255 characters.” | PASS |
| Sistem menolak nama kategori yang sudah ada di database. | Sistem menampilkan error validasi “The name has already been taken.” | PASS |
| Sistem menerima nama kategori baru yang unik dan menyimpan data. | Kategori `"Anchor Handling Supply Vessel"` tersimpan di database. | PASS |
| Sistem menerima field deskripsi kosong tanpa menghasilkan error. | Kategori tetap berhasil dibuat dengan nilai deskripsi `null`. | PASS |
| Sistem menyimpan deskripsi penjelasan kategori secara lengkap. | Deskripsi tersimpan dan ditampilkan pada detail kategori armada. | PASS |
| Sistem secara otomatis menggenerasi slug dari nama kategori. | Nama `"Anchor Handling Supply"` menghasilkan slug `anchor-handling-supply` di database. | PASS |

---

### **4. Hasil Pengujian Telemetri AIS & Waypoint Pelayaran (`VoyageWaypointsController` & `AisIngestController`)**

#### *Tabel 4. Hasil Pengujian Endpoint Waypoint Pelayaran & Ingest/Simulasi Telemetri AIS Live*

| Identifikasi | [DUPL-ABB-004] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Fungsi Route Waypoint Pelayaran & Ingest Telemetri AIS (`AisIngestController`) |  |
| **Deskripsi Kasus** | Pengujian pengambilan data rute pelayaran armada, eksekusi endpoint ingest telemetri live dari AISStream.io (`/api/ais/ingest`), dan simulasi pergerakan kapal otomatis (`/api/ais/simulate`). |  |
| **Kondisi Awal** | Armada kapal terdaftar di database `fleets`, endpoint API telemetri aktif. |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-004]:<br><br>**GET `/voyage-waypoints` (Web / JSON)**<br>- Permintaan daftar rute pelayaran armada via JSON/Inertia<br><br>**POST `/api/ais/ingest` (Live Feed AIS Payload)**<br>- Input Payload : Tanpa objek `MetaData` (Invalid Payload)<br>- Input Payload : `MetaData` ada tetapi `Latitude`/`Longitude` `null` (Static Data Payload)<br>- Input Payload : MMSI / Nama kapal terdaftar valid dengan Lat, Lng, SOG, COG (Valid Payload)<br>- Input Payload : MMSI tidak terdaftar tetapi ada fleet di DB (Fallback Index Mapping Payload)<br><br>**GET `/api/ais/simulate` (Telemetry Simulator Endpoint)**<br>- Eksekusi pembaruan lokasi kapal otomatis via cron/web request |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Endpoint `/voyage-waypoints` merespons JSON berisi daftar koordinat rute pelayaran seluruh armada secara valid (< 2.5s). | Response JSON berisi array `voyage_waypoints` dengan koordinat `lat`, `lng`, `speed`, dan `route_points` berformat Leaflet.js. | PASS |
| Ingest AIS mengabaikan payload tanpa objek `MetaData`. | Response JSON mengembalikan `{"status": "ignored", "reason": "No MetaData present"}` dengan HTTP 200. | PASS |
| Ingest AIS mengabaikan pesan telemetri tanpa koordinat GPS. | Response JSON mengembalikan `{"status": "ignored", "reason": "Static data message without GPS coordinates"}`. | PASS |
| Ingest AIS memperbarui waypoint sequence 1 untuk armada terdaftar dari payload valid. | Waypoint armada diperbarui di DB dengan koordinat live, SOG, COG, dan catatan sumber AIS. | PASS |
| Ingest AIS memetakan koordinat ke indeks armada database secara deterministik jika nama kapal tidak cocok persis. | Telemetri berhasil dipetakan ke armada database terdekat dan waypoint diperbarui. | PASS |
| Endpoint `/api/ais/simulate` berhasil memperbarui posisi seluruh kapal secara otomatis di perairan Indonesia. | Lokasi seluruh armada di-update dengan koordinat baru di perairan Indonesia dan mengembalikan JSON sukses. | PASS |

---

### **5. Hasil Pengujian Lowongan Karir (`CareersController` & RBAC BR-01)**

#### *Tabel 5. Hasil Pengujian Fungsi Lowongan Karir (Office/Crew, Deadlines & RBAC Isolation)*

| Identifikasi | [DUPL-ABB-005] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Fungsi Kelola Lowongan Karir & Penegakan Otorisasi RBAC (`CareersController`) |  |
| **Deskripsi Kasus** | Pengujian penambahan lowongan kantor (corporate) dan pelaut (crew), validasi batas waktu lamaran, otomasi status expired, serta penegakan aturan hak akses RBAC: HR Admin vs Crew Admin vs PR Admin (BR-01). |  |
| **Kondisi Awal** | Akun HR Admin, Crew Admin, dan PR Admin telah dikonfigurasi di sistem. |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-005]:<br><br>**Field “Position Title”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Teks melebihi 255 karakter (Invalid)<br>- Input : `"Chief Engineer"` (Valid)<br><br>**Field “Employment Type”**<br>- Input : Value selain pilihan `"freelance"` (Invalid)<br>- Input : `"fulltime"`, `"contract"`, atau `"internship"` (Valid)<br><br>**Field “Application Deadline” & Otomasi Status**<br>- Input : Date string tidak valid `"2026-02-31"` (Invalid)<br>- Input : Tanggal di masa lalu `"2026-01-01"` (Valid - Auto set Status `expired`)<br>- Input : Tanggal di masa depan `"2026-12-31"` (Valid - Auto set Status `open`)<br><br>**Otorisasi Hak Akses RBAC (BR-01)**<br>- PR Admin mencoba mengakses / membuat lowongan karir (Ditolak)<br>- HR Admin membuat / mengubah lowongan kategori `corporate` (Diizinkan)<br>- HR Admin mencoba mengubah lowongan kategori `crew` (Ditolak)<br>- Crew Admin membuat / mengubah lowongan kategori `crew` (Diizinkan)<br>- Crew Admin mencoba mengubah lowongan kategori `corporate` (Ditolak) |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Sistem menolak judul posisi karir kosong. | Sistem menampilkan error validasi “The position field is required.” | PASS |
| Sistem menolak judul posisi karir melebihi 255 karakter. | Sistem menampilkan error validasi “The position may not be greater than 255 characters.” | PASS |
| Sistem menerima judul posisi karir valid. | Judul posisi `"Chief Engineer"` berhasil disimpan. | PASS |
| Sistem menolak pilihan tipe pekerjaan di luar enum yang ditentukan. | Sistem menampilkan error validasi “The selected employment type is invalid.” | PASS |
| Sistem menerima tipe pekerjaan valid (`fulltime`, `contract`, `internship`). | Tipe pekerjaan `"fulltime"` tersimpan dengan sukses. | PASS |
| Sistem menolak format tanggal deadline yang tidak valid. | Sistem menampilkan error validasi “The application deadline is not a valid date.” | PASS |
| Sistem secara otomatis menetapkan status lowongan `expired` apabila deadline berada di masa lalu. | Lowongan disimpan dengan kolom `status` bernilai `'expired'`. | PASS |
| Sistem secara otomatis menetapkan status lowongan `open` apabila deadline berada di masa depan. | Lowongan disimpan dengan kolom `status` bernilai `'open'`. | PASS |
| Sistem memblokir total PR Admin yang mencoba mengelola modul karir (BR-01). | Sistem menolak akses dengan HTTP 403 Forbidden: “PR Admin is not authorized to access Careers module.” | PASS |
| HR Admin berhasil mengelola lowongan kategori kantor (`corporate`). | HR Admin dapat membuat dan memperbarui lowongan kategori `corporate`. | PASS |
| Sistem memblokir HR Admin yang mencoba mengedit lowongan kategori pelaut (`crew`). | Sistem menolak aksi edit dengan HTTP 403 Forbidden: “Unauthorized.” | PASS |
| Crew Admin berhasil mengelola lowongan kategori pelaut (`crew`). | Crew Admin dapat membuat dan memperbarui lowongan kategori `crew`. | PASS |
| Sistem memblokir Crew Admin yang mencoba mengedit lowongan kategori kantor (`corporate`). | Sistem menolak aksi edit dengan HTTP 403 Forbidden: “Unauthorized.” | PASS |

---

### **6. Hasil Pengujian Berita & Kategori Berita (`NewsController` & `NewsCatController`)**

#### *Tabel 6. Hasil Pengujian Fungsi Kelola Berita, Auto Slug Unik (BR-03) & Konversi WebP*

| Identifikasi | [DUPL-ABB-006] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Fungsi Kelola Berita, Auto-Slug Unik (BR-03) & Konversi Gambar (`NewsController`) |  |
| **Deskripsi Kasus** | Pengujian penulisan artikel berita, validasi input wajib, otomasi pembentukan URL slug unik dari judul (BR-03), pengunggahan gambar cover, serta otorisasi khusus PR Admin & Super Admin. |  |
| **Kondisi Awal** | PR Admin sudah *login* ke Dashboard Admin Berita (`/dashboard/news`). |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-006]:<br><br>**Field “Title”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Teks melebihi 255 karakter (Invalid)<br>- Input : `"Ekspansi Rute Pelayaran Sumatera 2026"` (Valid)<br><br>**Field “Content”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Teks HTML artikel lengkap (Valid)<br><br>**Field “Status”**<br>- Input : Value selain published/draft `"archived"` (Invalid)<br>- Input : `"published"` atau `"draft"` (Valid)<br><br>**Field “Featured Image”**<br>- Input : File non-gambar `.pdf` / `.docx` (Invalid)<br>- Input : File gambar `.jpg` / `.png` (Valid - diunggah ke storage public)<br><br>**Otomasi Auto-Slug Unik (BR-03)**<br>- Pengujian pembuatan berita dengan judul sama berturut-turut untuk memastikan garansi keunikan slug URL.<br><br>**Otorisasi Hak Akses RBAC (BR-01)**<br>- Admin selain PR Admin / Super Admin (misal HR Admin) mengakses `/dashboard/news` (Ditolak) |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Sistem menolak pembuatan artikel berita tanpa judul. | Sistem menampilkan error validasi “The title field is required.” | PASS |
| Sistem menolak judul berita yang melebihi 255 karakter. | Sistem menampilkan error validasi “The title may not be greater than 255 characters.” | PASS |
| Sistem menerima judul berita valid. | Judul berita tersimpan di database. | PASS |
| Sistem menolak pembuatan artikel berita tanpa isi konten. | Sistem menampilkan error validasi “The content field is required.” | PASS |
| Sistem menerima konten berita lengkap. | Konten artikel berita berhasil disimpan. | PASS |
| Sistem menolak status berita di luar pilihan `published` atau `draft`. | Sistem menampilkan error validasi “The selected status is invalid.” | PASS |
| Sistem menerima status berita valid (`published` / `draft`). | Status berita tersimpan sebagai `published`. | PASS |
| Sistem menolak pengunggahan file cover yang bukan berformat gambar. | Sistem menampilkan error validasi gambar. | PASS |
| Sistem menerima pengunggahan gambar cover `.jpg`/`.png` dan menyimpannya di storage. | Gambar diunggah ke `/storage/news/` dan path tersimpan di DB. | PASS |
| Sistem menggenerasi slug URL unik dari judul berita secara otomatis (BR-03). | Judul `"Ekspansi Rute"` menghasilkan slug `ekspansi-rute-pelayaran-sumatera-2026-{timestamp}`. | PASS |
| Pembuatan berita dengan judul persis sama menghasilkan slug unik yang tidak bertabrakan (BR-03). | Artikel kedua dengan judul sama menghasilkan slug berakhiran timestamp berbeda sehingga tidak bentrok. | PASS |
| Sistem menolak akses manajemen berita untuk pengguna non-PR/Super Admin. | HR Admin / Crew Admin yang mencoba mengakses diblokir dengan HTTP 403 Forbidden: “Only Super Admin and PR Admin can access News management.” | PASS |

---

### **7. Hasil Pengujian Client / Mitra Perusahaan (`ClientsController`)**

#### *Tabel 7. Hasil Pengujian Fungsi Kelola Data Client & Mitra Perusahaan*

| Identifikasi | [DUPL-ABB-007] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Fungsi Kelola Data Client / Mitra Perusahaan (`ClientsController`) |  |
| **Deskripsi Kasus** | Pengujian penambahan mitra perusahaan, pengunggahan logo client, pembaruan data tanpa mengubah logo lama, dan pembatasan akses RBAC (PR Admin & Super Admin). |  |
| **Kondisi Awal** | PR Admin sudah *login* dan berada di menu Client (`/dashboard/clients`). |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-007]:<br><br>**Field “Client Name”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Teks melebihi 255 karakter (Invalid)<br>- Input : `"PT Semen Indonesia (Persero) Tbk"` (Valid)<br><br>**Field “Category”**<br>- Input : Teks melebihi 50 karakter (Invalid)<br>- Input : `"Industrial Cargo Partner"` (Valid)<br><br>**Field “Logo File” (Upload & Edit State)**<br>- Input : Upload file non-image `.zip` / `.txt` (Invalid)<br>- Input : Upload file logo gambar `.png` / `.webp` (Valid)<br>- Update Data Client tanpa melampirkan file logo baru (Verifikasi Retain Logo Lama)<br><br>**Otorisasi Hak Akses RBAC (BR-01)**<br>- Crew Admin / HR Admin mencoba menambah / mengedit client (Ditolak) |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Sistem menolak penambahan client tanpa nama perusahaan. | Sistem menampilkan error validasi “The name field is required.” | PASS |
| Sistem menolak nama client yang melebihi 255 karakter. | Sistem menampilkan error validasi “The name may not be greater than 255 characters.” | PASS |
| Sistem menerima nama client valid. | Nama perusahaan `"PT Semen Indonesia (Persero) Tbk"` berhasil disimpan. | PASS |
| Sistem menolak string kategori yang melebihi 50 karakter. | Sistem menampilkan error validasi “The category may not be greater than 50 characters.” | PASS |
| Sistem menerima kategori client valid. | Kategori `"Industrial Cargo Partner"` berhasil disimpan. | PASS |
| Sistem menolak unggahan logo yang bukan berupa file gambar. | Sistem menampilkan error validasi gambar. | PASS |
| Sistem mengunggah logo gambar ke storage server. | Logo tersimpan di `/storage/clients/` dan tampil di carousel halaman client publik. | PASS |
| Sistem mempertahankan logo gambar lama saat data client di-update tanpa mengunggah file logo baru. | Path logo lama tetap utuh di DB dan tidak terhapus / ter-nullifier. | PASS |
| Sistem menolak pengguna selain PR Admin & Super Admin untuk mengelola client. | Crew Admin diblokir dengan HTTP 403 Forbidden: “Only Super Admin and PR Admin can access Clients management.” | PASS |

---

### **8. Hasil Pengujian Popup & Banner Pengumuman (`NotificationsController` & BR-06)**

#### *Tabel 8. Hasil Pengujian Fungsi Popup Banner & Batasan 1 Popup Aktif Per Tipe (BR-06)*

| Identifikasi | [DUPL-ABB-008] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Kelola Banner Pengumuman Popup & Penegakan Aturan 1 Aktif per Tipe (`NotificationsController`) |  |
| **Deskripsi Kasus** | Pengujian pembuatan banner pengumuman untuk halaman `home` atau `career`, serta penegakan Aturan Bisnis BR-06: Maksimal 1 popup banner aktif per tipe di DB/Service Layer secara otomatis. |  |
| **Kondisi Awal** | Terdapat 1 popup banner bertipe `home` yang sedang aktif (`status = 'active'`). HR Admin / Super Admin sudah login di `/dashboard/notifications`. |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-008]:<br><br>**Field “Title” & “Content”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Data teks pengumuman valid (Valid)<br><br>**Field “Type”**<br>- Input : Value selain home/career `"about"` (Invalid)<br>- Input : `"home"` atau `"career"` (Valid)<br><br>**Field “Status”**<br>- Input : Value selain active/inactive `"pending"` (Invalid)<br>- Input : `"active"` atau `"inactive"` (Valid)<br><br>**Penegakan Aturan Bisnis BR-06 (Auto Inactivate Popup Lama)**<br>- Skenario 1 : Pengguna mengaktifkan (`status = 'active'`) popup baru bertipe `home`<br>- Skenario 2 : Pengguna mengaktifkan (`status = 'active'`) popup bertipe `career` |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Sistem menolak judul pengumuman kosong. | Sistem menampilkan error validasi “The title field is required.” | PASS |
| Sistem menolak tipe banner di luar enum `home` atau `career`. | Sistem menampilkan error validasi “The selected type is invalid.” | PASS |
| Sistem menolak status banner di luar enum `active` atau `inactive`. | Sistem menampilkan error validasi “The selected status is invalid.” | PASS |
| Pengaktifan popup baru bertipe `home` secara otomatis mengubah status popup `home` lama menjadi `inactive` (BR-06). | Sistem mengeksekusi update query: popup `home` terdahulu berubah menjadi `status = 'inactive'`. Hanya 1 popup `home` aktif di DB. | PASS |
| Pengaktifan popup bertipe `career` tidak menonaktifkan popup bertipe `home` yang sedang aktif (Independen per tipe). | Popup `home` aktif dan popup `career` aktif berjalan secara independen tanpa saling menimpa. | PASS |
| HR Admin dan Super Admin diizinkan mengelola popup banner pengumuman. | Banner berhasil dibuat/di-update dan flash message "Notification banner created successfully" tampil. | PASS |
| Admin lain (Crew / PR Admin) diblokir dari pengelolaan popup pengumuman. | Akses ditolak dengan HTTP 403 Forbidden. | PASS |

---

### **9. Hasil Pengujian Kantor Cabang (`BranchesController`)**

#### *Tabel 9. Hasil Pengujian Fungsi Kelola Data Kantor Cabang & Rep Office*

| Identifikasi | [DUPL-ABB-009] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Fungsi Kelola Data Kantor Cabang Perusahaan (`BranchesController`) |  |
| **Deskripsi Kasus** | Pengujian pendaftaran kantor cabang (Banyuwangi, Batam, Padang, Tuban, Pontianak, Singapore), validasi alamat, email, nomor telepon, link map iframe Google Maps, dan penguji visual tab kantor cabang. |  |
| **Kondisi Awal** | Super Admin berada di menu Kelola Cabang (`/dashboard/branches`). |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-009]:<br><br>**Field “Name” / “Type” / “Company Name”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Teks melebihi 255 karakter (Invalid)<br>- Input : `"Banyuwangi Branch / Branch Office / PT ABB"` (Valid)<br><br>**Field “Email”**<br>- Input : Format email tidak sesuai `"branch.banyuwangi.com"` (Invalid)<br>- Input : `"banyuwangi@ptabb.com"` (Valid)<br><br>**Field “Address”**<br>- Input : Teks melebihi 1000 karakter (Invalid)<br>- Input : Alamat lengkap kantor cabang (Valid)<br><br>**Field “Map URL”**<br>- Input : String URL melebihi 2000 karakter (Invalid)<br>- Input : Embed URL Google Maps valid (Valid)<br><br>**Field “Image File”**<br>- Input : File melebihi ukuran 5MB / 5120KB (Invalid)<br>- Input : Gambar `.webp` / `.png` <= 5MB (Valid) |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Sistem menolak pembuatan data kantor cabang tanpa nama / tipe / nama perusahaan. | Sistem menampilkan error validasi “The name/type/company_name field is required.” | PASS |
| Sistem menolak input teks nama/tipe yang melebihi 255 karakter. | Sistem menampilkan error validasi panjang karakter maksimum. | PASS |
| Sistem menerima input nama, tipe, dan nama perusahaan yang valid. | Data identitas kantor cabang tersimpan di database. | PASS |
| Sistem menolak format email kantor cabang yang tidak valid. | Sistem menampilkan error validasi “The email must be a valid email address.” | PASS |
| Sistem menerima email kantor cabang berformat valid. | Email cabang `"banyuwangi@ptabb.com"` berhasil disimpan. | PASS |
| Sistem menolak teks alamat yang melebihi 1000 karakter. | Sistem menampilkan error validasi “The address may not be greater than 1000 characters.” | PASS |
| Sistem menerima teks alamat lengkap kantor cabang. | Alamat cabang tersimpan di database. | PASS |
| Sistem menolak URL Google Maps Embed yang melebihi 2000 karakter. | Sistem menampilkan error validasi “The map url may not be greater than 2000 characters.” | PASS |
| Sistem menerima URL Google Maps Embed valid dan merepresentasikan peta lokasi kantor cabang. | Link iframe Google Maps tersimpan dan dapat dimuat di UI kontak publik. | PASS |
| Sistem menolak unggahan gambar kantor cabang yang melebihi ukuran 5MB. | Sistem menampilkan error validasi “The image file may not be greater than 5120 kilobytes.” | PASS |
| Sistem menerima unggahan gambar kantor cabang <= 5MB. | File gambar tersimpan di `/storage/branches/` dan path tersimpan di DB. | PASS |

---

### **10. Hasil Pengujian Form Pesan Kontak Publik & Isolasi HRD (`ContactsController`)**

#### *Tabel 10. Hasil Pengujian Form Kontak Publik, Parameterized Query (BR-SEC) & Rute Isolasi HRD (BR-04)*

| Identifikasi | [DUPL-ABB-010] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Pengiriman Form Kontak Publik, Parameterized Query & Isolasi Pesan HRD (`ContactsController`) |  |
| **Deskripsi Kasus** | Pengujian pengiriman pesan oleh pengunjung web di `/contacts`, sanitasi dari serangan SQL Injection (BR-SEC), serta penyaringan hak akses pesan berdasarkan role admin: Pesan departemen `hrd` dilarang dibaca Crew Admin & PR Admin (BR-04). |  |
| **Kondisi Awal** | Form kontak publik di `/contacts` aktif. Akun Super Admin, HR Admin, Crew Admin, dan PR Admin telah disiapkan. |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-010]:<br><br>**Field “Name” / “Subject” / “Message”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Message melebihi 2000 karakter (Invalid)<br>- Input : Teks valid (Valid)<br><br>**Field “Email”**<br>- Input : Format email tanpa `@` `"budi_gmail.com"` (Invalid)<br>- Input : `"budi@gmail.com"` (Valid)<br><br>**Field “Department”**<br>- Input : Value selain enum `"it_support"` (Invalid)<br>- Input : `"commercial"`, `"operation"`, `"hrd"`, atau `"general"` (Valid)<br><br>**Uji Keamanan SQL Injection (BR-SEC)**<br>- Input string bermuatan sintaks SQLi pada field nama & pesan: `' OR '1'='1'; DROP TABLE users; --`<br><br>**Penyaringan Hak Akses Pesan Admin Panel (BR-04)**<br>- Crew Admin / PR Admin membuka halaman inbox pesan kontak (`/dashboard/contacts`)<br>- HR Admin / Super Admin membuka halaman inbox pesan kontak (`/dashboard/contacts`) |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Sistem menolak pengiriman form kontak jika nama, subjek, atau pesan kosong. | Sistem menampilkan pesan error validasi pada field wajib. | PASS |
| Sistem menolak isi pesan yang melebihi batas 2000 karakter. | Sistem menampilkan error validasi “The message may not be greater than 2000 characters.” | PASS |
| Sistem menolak pengiriman form kontak dengan format email invalid. | Sistem menampilkan error validasi “The email must be a valid email address.” | PASS |
| Sistem menolak pilihan departemen tujuan di luar enum yang telah ditentukan. | Sistem menampilkan error validasi “The selected department is invalid.” | PASS |
| Sistem mengamankan input dari serangan SQL Injection menggunakan Parameterized Query Eloquent (BR-SEC). | String SQL Injection disimpan murni sebagai karakter teks biasa di DB tanpa mengeksekusi perintah SQL atau merusak struktur database. | PASS |
| Pesan kontak dengan rute departemen `hrd` secara ketat disaring (filtered out) dari tampilan Crew Admin dan PR Admin di level query database (`BR-04`). | Eloquent query `where('department', '!=', 'hrd')` menapis data: Crew Admin & PR Admin tidak dapat melihat atau mengakses pesan rute HRD. | PASS |
| HR Admin dan Super Admin dapat membaca seluruh pesan kontak termasuk pesan bertipe rute departemen `hrd`. | HR Admin & Super Admin berhasil melihat isi pesan rute HRD pada daftar inbox pesan kontak. | PASS |

---

### **11. Hasil Pengujian Informasi Kontak Kantor Pusat (`ContactInfosController`)**

#### *Tabel 11. Hasil Pengujian Fungsi Kelola Informasi Kontak HQ (RBAC Super Admin Only)*

| Identifikasi | [DUPL-ABB-011] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Fungsi Kelola Informasi Kontak HQ Perusahaan (`ContactInfosController`) |  |
| **Deskripsi Kasus** | Pengujian penambahan dan pembaruan detail kontak kantor pusat (alamat, telepon, email, sosmed) serta pembatasan hak akses eksklusif untuk Super Admin. |  |
| **Kondisi Awal** | Super Admin sudah *login* di `/dashboard/contact-infos`. |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-011]:<br><br>**Field “Label” & “Value”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Label > 100 karakter atau Value > 255 karakter (Invalid)<br>- Input : Label `"Head Office Phone"`, Value `"+62 21 691 8822"` (Valid)<br><br>**Field “Type”**<br>- Input : Value di luar enum `"whatsapp"` (Invalid)<br>- Input : `"office"`, `"phone"`, `"email"`, atau `"social"` (Valid)<br><br>**Otorisasi Hak Akses RBAC (BR-01)**<br>- HR Admin, Crew Admin, atau PR Admin mencoba mengelola kontak HQ (Ditolak) |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Sistem menolak penambahan informasi kontak tanpa label atau value. | Sistem menampilkan error validasi “The label/value field is required.” | PASS |
| Sistem menolak input label > 100 karakter atau value > 255 karakter. | Sistem menampilkan error validasi batas maksimum karakter. | PASS |
| Sistem menerima data label dan value kontak valid. | Data kontak kantor pusat berhasil disimpan di database. | PASS |
| Sistem menolak tipe kontak di luar enum `office`, `phone`, `email`, atau `social`. | Sistem menampilkan error validasi “The selected type is invalid.” | PASS |
| Sistem menerima tipe kontak valid. | Tipe kontak `"phone"` tersimpan dengan sukses. | PASS |
| Sistem memblokir pengguna non-Super Admin (HR, Crew, PR Admin) yang mencoba mengelola informasi kontak HQ. | Sistem menolak akses dengan HTTP 403 Forbidden: “Only Super Admin can manage HQ contact information.” | PASS |

---

### **12. Hasil Pengujian Manajemen Pengguna & Profil Admin (`UsersController` & `ProfileController`)**

#### *Tabel 12. Hasil Pengujian Manajemen User Admin, Bcrypt, Proteksi Self-Delete & Edit Profile*

| Identifikasi | [DUPL-ABB-012] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Manajemen User Admin, Enkripsi Bcrypt, Proteksi Self-Delete & Profil Admin |  |
| **Deskripsi Kasus** | Pengujian pembuatan akun admin baru, alokasi role RBAC, verifikasi hashing password Bcrypt, proteksi pencegahan penghapusan akun diri sendiri yang aktif, serta pengeditan profil admin di `/profile`. |  |
| **Kondisi Awal** | Super Admin *login* di `/dashboard/users`. Pengguna lain *login* di `/profile`. |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-012]:<br><br>**Field “Username” & “Email”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Username/Email yang sudah terdaftar di DB (Invalid)<br>- Input : Username & Email unik terdaftar valid (Valid)<br><br>**Field “Password”**<br>- Input : Kosong saat pembuatan akun baru (Invalid)<br>- Input : Kurang dari 8 karakter `"12345"` (Invalid)<br>- Input : `"StrictAdminPass2026!"` (Valid - Verifikasi Hash Bcrypt `$2y$...`)<br><br>**Field “Role” (BR-01)**<br>- Input : Value di luar enum `"editor"` (Invalid)<br>- Input : `"super_admin"`, `"hr_admin"`, `"crew_admin"`, atau `"pr_admin"` (Valid)<br><br>**Proteksi Self-Deletion Account**<br>- Super Admin mencoba menghapus akunnya sendiri yang sedang dipakai *login*<br><br>**Halaman Edit Profil (`/profile`)**<br>- Pengguna memperbarui nama dan email pribadi<br>- Pengguna mencoba menghapus akun tanpa menginput password konfirmasi (Invalid) |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Sistem menolak pembuatan pengguna tanpa username atau email. | Sistem menampilkan error validasi “The username/email field is required.” | PASS |
| Sistem menolak pembuatan pengguna dengan username/email yang sudah terdaftar. | Sistem menampilkan error validasi “The username/email has already been taken.” | PASS |
| Sistem menerima username dan email unik valid. | Data identitas pengguna baru berhasil tersimpan. | PASS |
| Sistem menolak pembuatan pengguna baru tanpa password. | Sistem menampilkan error validasi “The password field is required.” | PASS |
| Sistem menolak password yang kurang dari 8 karakter. | Sistem menampilkan error validasi “The password must be at least 8 characters.” | PASS |
| Sistem mengenkripsi password menggunakan algoritma Hashing Bcrypt murni di database. | Kolom `password` pada tabel `users` tersimpan dalam format hash terenkripsi `$2y$12$...`. | PASS |
| Sistem menolak alokasi role di luar enum empat role resmi PT ABB. | Sistem menampilkan error validasi “The selected role is invalid.” | PASS |
| Sistem menetapkan role RBAC resmi sesuai pilihan Super Admin. | Akun baru terdaftar dengan role yang dikonfigurasi (`hr_admin` / `crew_admin` / `pr_admin`). | PASS |
| Sistem memblokir Super Admin yang mencoba menghapus akun aktif miliknya sendiri. | Sistem membatalkan aksi dan menampilkan error: “You cannot delete your own active account.” | PASS |
| Non-Super Admin yang mencoba mengakses `/dashboard/users` diblokir total. | Akses diblokir dengan HTTP 403 Forbidden: “Only Super Admin can manage system users.” | PASS |
| Pengguna berhasil mengedit nama dan email pribadi pada halaman profil (`/profile`). | Profil berhasil diperbarui dan email_verified_at direset jika email diubah. | PASS |
| Penghapusan akun pribadi di `/profile` ditolak jika password konfirmasi tidak diisi. | Sistem menampilkan error validasi “The password field is required.” | PASS |

---

### **13. Hasil Pengujian AI Chatbot RAG & Fallback Chain (`ChatbotController` & BR-05)**

#### *Tabel 13. Hasil Pengujian AI Chatbot RAG, Fallback Chain Models & Proteksi Halusinasi (BR-05)*

| Identifikasi | [DUPL-ABB-013] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Asisten AI Chatbot RAG, Fallback Chain Models & Handling Out-of-Scope (BR-05 & NFR-P) |  |
| **Deskripsi Kasus** | Pengujian respons chatbot terhadap pertanyaan seputar Armada, Karir, Kontak, dan Berita PT ABB, eksekusi Fallback Chain Model (Groq Primary -> OpenRouter Fallback -> Local Substring Matcher), batas kecepatan respon (< 2 detik), dan garansi proteksi halusinasi (BR-05). |  |
| **Kondisi Awal** | Widget AI Chatbot pada pojok kanan bawah halaman publik dalam posisi aktif. |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-013]:<br><br>**Field “Message”**<br>- Input : Kosong / `""` (Invalid)<br>- Input : Teks pesan melebihi 1000 karakter (Invalid)<br>- Input : Pertanyaan seputar Alamat & Telepon HQ PT ABB (Valid Intent 'contact')<br>- Input : Pertanyaan seputar spesifikasi armada kapal (Valid Intent 'fleet')<br>- Input : Pertanyaan di luar konteks bisnis PT ABB `"Berapa harga tiket pesawat ke bulan?"` (Off-Topic / Low Confidence)<br><br>**Eksekusi Chain Fallback Model**<br>- Kondisi 1 : Primary Groq API aktif & merespons<br>- Kondisi 2 : Primary Groq API offline / rate limited -> Sistem otomatis ke OpenRouter API<br>- Kondisi 3 : Semua API LLM offline / tanpa koneksi internet -> Sistem otomatis ke Local Substring Matcher<br><br>**Waktu Respon API (NFR-P)**<br>- Pengukuran latensi waktu sampai indikasi balasan / typing indicator pertama muncul di UI |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Sistem menolak pengiriman pesan chatbot kosong. | API merespons HTTP 422 dengan pesan “The message field is required.” | PASS |
| Sistem menolak pesan pengguna yang melebihi 1000 karakter. | API merespons HTTP 422 dengan pesan “The message may not be greater than 1000 characters.” | PASS |
| Chatbot mendeteksi intent 'contact' dan memberikan alamat HQ & telepon resmi PT ABB tanpa halusinasi data (BR-05). | Chatbot menjawab secara akurat menggunakan data context DB: "Jl. Roa Malaka Utara No. 17-18, Jakarta Barat, Telp +62 21 691 8822". | PASS |
| Chatbot mendeteksi intent 'fleet' dan menyajikan rincian armada kapal sesuai basis data. | Chatbot menyajikan informasi armada bulk cement carrier dan tugboat dari database. | PASS |
| Chatbot secara sopan mengarahkan pengunjung ke Form Kontak ketika menerima pertanyaan di luar konteks bisnis / low-confidence (BR-05). | Chatbot menyampaikan tidak memiliki informasi tersebut secara sopan dan menyarankan pengisian Form Kontak PT ABB. | PASS |
| Chatbot mengembalikan balasan dari Groq API saat layanan primary Groq berstatus aktif. | Response JSON mengembalikan `model: "groq"` dan jawaban relevan. | PASS |
| Chatbot secara otomatis mengalihkan permintaan ke OpenRouter API saat Groq API mengalami kendala. | Log sistem mencatat warning fallback dan response JSON mengembalikan `model: "openrouter"`. | PASS |
| Chatbot beralih ke Local Substring Matcher saat seluruh API LLM eksternal tidak dapat diakses. | Chatbot tetap memberikan jawaban jawaban statistik dasar lokal tanpa error/crash (`model: "local_fallback"`). | PASS |
| Chatbot memberikan indikasi balasan / typing indicator di UI dalam rentang waktu < 2 detik (NFR-P). | Waktu respon pertama sampai typing indicator muncul berada di kisaran ~0.7s - 1.3s. | PASS |

---

### **14. Hasil Pengujian Halaman Profil Publik & Transisi Inertia (`AboutUs`, `Services`, `Milestones`, `Home`, `Dashboard`)**

#### *Tabel 14. Hasil Pengujian Navigasi Client-Side Inertia.js, SEO Best Practices & Performa Bundle*

| Identifikasi | [DUPL-ABB-014] |  |
| ----- | :---- | :---- |
| **Nama Kasus Uji** | Navigasi Client-Side Inertia.js, SEO Semantic HTML & Ukuran Bundle Build Vite |  |
| **Deskripsi Kasus** | Pengujian kelancaran transisi navigasi antar halaman publik (`/`, `/about-us`, `/services`, `/milestones`, `/contacts`), pemenuhan SEO Best Practices (Judul deskriptif, meta description, H1 tunggal), serta ukuran bundle JavaScript awal (< 500KB). |  |
| **Kondisi Awal** | Aplikasi web berjalan di lingkungan staging / lokal hasil build Vite (`npm run dev` / `bun run dev`). |  |
| **Tanggal Pengujian** | 06 Agustus 2026 |  |
| **Penguji** | Tim Penguji QA PT ABB |  |
| **Skenario** |  |  |
| **Metode : Equivalent Partitioning**<br>Langkah-langkah prosedur uji untuk kasus uji [DUPL-ABB-014]:<br><br>**Navigasi Router Inertia.js (`<Link>`)**<br>- Perpindahan halaman antar rute publik (Home -> About Us -> Services -> Milestones -> Contacts)<br><br>**Verifikasi SEO & Semantic HTML**<br>- Inspeksi elemen DOM halaman untuk keberadaan single `<h1>`, tag `<title>`, `<meta name="description">`, dan ID unik pada elemen interaktif.<br><br>**Ukuran Bundle Build Vite (Code-Splitting)**<br>- Pemeriksaan ukuran file JavaScript initial bundle pada Network tab browser devtools. |  |  |
| **Hasil** |  |  |
| **Yang Diharapkan** | **Pengamatan** | **Kesimpulan** |
| Perpindahan antar halaman via komponen Inertia `<Link>` berlangsung mulus tanpa *full page reload* dengan latensi transisi < 1 detik. | Transisi halaman berlangsung instan dengan durasi rerata ~200ms - 380ms tanpa blink putih reload. | PASS |
| Setiap halaman publik memiliki elemen `<h1>` tunggal yang jelas dan deskriptif. | Struktur dokumen HTML5 memiliki hirarki 1 elemen `<h1>` utama per halaman. | PASS |
| Setiap halaman publik dilengkapi dengan Tag `<title>` dan Meta Description deskriptif untuk optimalisasi SEO. | Tag `<title>` dan `<meta name="description">` terpasang unik di setiap rute halaman. | PASS |
| Ukuran file JavaScript initial bundle hasil build Vite terbagi secara efisien (Code-Splitting) dengan ukuran di bawah 500KB. | Ukuran initial bundle JS yang dimuat pertama kali adalah sebesar ~320KB (< 500KB limit). | PASS |

---

### **REKAPITULASI HASIL PENGUJIAN DUPL PT ABB v2.0**

| Total Kasus Uji | Total Skenario Test Cases | Jumlah Lolos (PASS) | Jumlah Gagal (FAIL) | Persentase Keberhasilan |
| :---: | :---: | :---: | :---: | :---: |
| **14 Kasus Uji** | **132 Skenario** | **132 Skenario** | **0 Skenario** | **100%** |

> **Kesimpulan Akhir Dokumen Uji Perangkat Lunak:**
> Seluruh modul controller (`FleetsController`, `CareersController`, `NewsController`, `NotificationsController`, `BranchesController`, `ContactsController`, `ContactInfosController`, `UsersController`, `ClientsController`, `ChatbotController`, dll.), sistem otorisasi RBAC berbasis role (`BR-01`), aturan keunikan nomor IMO & auto-slug berita (`BR-02` & `BR-03`), penyaringan isolasi pesan kontak HRD (`BR-04`), keandalan RAG AI Chatbot & Fallback Chain (`BR-05`), pembatasan 1 popup banner aktif per tipe (`BR-06`), serta seluruh standar keamanan Bcrypt, Parameterized Query (`BR-SEC`), dan performa transisi Inertia.js v2 web PT ABB v2.0 dinyatakan **MEMENUHI SPESIFIKASI TESTING (PASS / SIAP SHIP PROD)**.
