# **Software Requirements Specification (SRS)**

This document follows the IEEE Software Requirements Specification (SRS) structure, adapted for the PT. ABB Website Rebuild Project (v2.0) based on the legacy system specification.

---

# **Document Information**

**Project Name:** Rebuild Web Profile dan Dashboard PT. ABB v2.0  
**Version:** 1.0  
**Prepared by:** Fauzy (IT Intern)  
**Organization / Course:** PT. ABB - IT Department  
**Date:** 21 Juli 2026  

## **Revision History**

| Version | Date | Author | Description of Change |
| :--- | :--- | :--- | :--- |
| 1.0 | 21 Juli 2026 | Fauzy | Inisialisasi dokumen SRS untuk migrasi sistem dari Legacy Vanilla PHP ke Laravel 13 + Inertia.js v2 + React 18, mengintegrasikan spesifikasi lengkap dari Software Design Document (SDD). |

---

# **1. Introduction**

Dokumen Software Requirements Specification (SRS) ini disusun sebagai panduan teknis dan operasional dalam pembangunan kembali (rebuild) website profile dan dashboard PT. Pelayaran Andalas Bahtera Baruna (PT. ABB) dari arsitektur lama berbasis Vanilla PHP (monolitik non-MVC Page-Controller) menuju arsitektur baru berbasis Laravel 13, Inertia.js v2, dan React 18.

Rebuild ini bertujuan untuk meningkatkan aspek keamanan (security), pemeliharaan kode (maintainability), kinerja pemuatan halaman (performance), serta mempercepat proses pengembangan fitur baru. Dokumen ini mendefinisikan seluruh kebutuhan fungsional dan non-fungsional agar dapat dipahami secara seragam oleh seluruh pemangku kepentingan dalam tim IT PT. ABB.

---

## **1.1 Purpose**

Tujuan utama dari dokumen SRS ini adalah:
* Menjelaskan ruang lingkup fungsionalitas sistem baru hasil migrasi berdasarkan sistem warisan.
* Menetapkan batasan desain dan implementasi sistem dengan stack modern.
* Mendefinisikan mekanisme Role-Based Access Control (RBAC) bagi admin fungsional secara akurat sesuai dengan matriks hak akses.
* Menyediakan referensi utama bagi tim pengembang untuk menulis kode program dan tim penguji untuk melakukan skenario pengujian.

---

## **1.2 Document Conventions**

Dokumen ini menggunakan konvensi penulisan dan notasi standar sebagai berikut:
1. **Penomoran Identitas (ID):**
   * **R-[Nomor]:** Identified Requirements (Kebutuhan umum hasil elisitasi). Contoh: R-01.
   * **F-[Nomor]:** Fitur Utama (Feature List). Contoh: F-01.
   * **FR-[Nomor]:** Functional Requirements (Kebutuhan fungsional sistem). Contoh: FR-01.
   * **NFR-[Kode]-[Nomor]:** Non-Functional Requirements. Kode tambahan meliputi:
     * **P** untuk Performance (Kinerja).
     * **S** untuk Safety (Keamanan Data).
     * **SEC** untuk Security (Keamanan Akses/Sistem).
   * **BR-[Nomor]:** Business Rules (Aturan operasional bisnis). Contoh: BR-01.
   * **OR-[Nomor]:** Other Requirements (Kebutuhan tambahan). Contoh: OR-01.
   * **UI-[Nomor]:** User Interface / Wireframe ID. Contoh: UI-01.
   * **TBD-[Nomor]:** To Be Discussed (Poin yang masih memerlukan diskusi). Contoh: TBD-01.

2. **Skala Prioritas Fitur:**
   * **High:** Harus selesai pada tahap awal migrasi (MVP).
   * **Medium:** Penting, namun dapat diselesaikan setelah fungsi dasar berjalan.
   * **Low:** Opsional atau pelengkap.

3. **Format Teks:**
   * **Teks Tebal (Bold):** Digunakan untuk istilah penting, label ID, dan penekanan khusus.
   * *Teks Miring (Italic):* Digunakan untuk istilah teknis asing (bahasa Inggris) dan nama tabel database.

---

## **1.3 Intended Audience and Reading Suggestions**

Dokumen ini ditujukan bagi:
* **IT Mentor & Supervisor:** Untuk meninjau keselarasan arsitektur baru dengan kebutuhan bisnis perusahaan.
* **Full-stack Developer (Intern):** Sebagai panduan implementasi database, routing, controller (Laravel), dan halaman antarmuka (React).
* **QA / Tester:** Sebagai acuan pembuatan skenario unit testing (PHPUnit) dan manual testing.
* **Perwakilan Departemen (HRD, Operation, PR):** Sebagai gambaran fungsionalitas modul khusus mereka pada sistem baru.

---

## **1.4 Product Scope**

Ruang lingkup proyek rebuild website PT. ABB v2.0 mencakup:
* **Halaman Publik (Visitor Site):**
  * Landing page interaktif berisi profil perusahaan, ringkasan statistik, slider armada, berita terbaru, logo mitra, dan RAG AI Chatbot.
  * Halaman armada (*Fleet*) yang terintegrasi dengan Leaflet JS untuk menampilkan peta posisi armada global, detail kapal, modal spesifikasi, rute pelayaran, dan quick-view modal.
  * Halaman layanan (*Services*) yang menampilkan jenis charter (Time/Freight Charter), arsitektur sistem pneumatik, dan peta cakupan operasional berbasis Google GeoChart.
  * Halaman berita/artikel (*News*) dengan tabs kategori (Company News, Office Events, CSR) dan SEO tags dinamis.
  * Halaman karir (*Careers*) untuk melamar posisi kru kapal maupun staf kantor, lengkap dengan detail pekerjaan dan form lamaran.
  * Form hubungi kami (*Contact*) dengan klasifikasi department tujuan.
  * Popup / Banner pemberitahuan dinamis (tipe beranda atau karir) yang dikelola admin.
* **Halaman Internal (Admin Dashboard):**
  * Dashboard statistik kunjungan (*Analytics*) harian, jumlah klik per halaman, visualisasi browser, dan log aktivitas admin.
  * Modul autentikasi aman berbasis *username* dengan pembatasan percobaan login (rate limiting).
  * Modul manajemen armada (*Fleet*) & rute (*Voyage Waypoints*).
  * Modul manajemen lowongan karir (*Careers*).
  * Modul manajemen publikasi berita (*News* & *News Categories*).
  * Modul manajemen klien (*Clients*) & testimoni.
  * Modul manajemen popup pengumuman (*Notifications*).
  * Modul manajemen informasi kontak kantor (*Contact Info*).
  * Modul kontak masuk (*Contacts Inbox*).
  * Modul pengaturan situs global (*Settings*).

---

## **1.5 Reference**

Penyusunan dokumen ini mengacu pada:
* **IEEE Std 830-1998:** *IEEE Recommended Practice for Software Requirements Specifications.*
* **Technical Proposal (re.md):** Proposal usulan migrasi teknologi PT. ABB Website v2.0.
* **Software Design Document (SOFTWARE_DESIGN_DOCUMENT.md):** Spesifikasi arsitektur teknis dan rancangan database sistem eksisting.
* **Legacy PHP Codebase & Database Schema:** Basis data MySQL yang sudah ter-normalisasi berisi 17 tabel utama.

---

# **2. Requirements Elicitation**

Proses pengumpulan kebutuhan (elicitation) dilakukan dengan menganalisis utang teknis (technical debt) kode warisan serta kebutuhan operasional admin.

## **2.1 Data Collection Methods**

| Methods | Objectives |
| :--- | :--- |
| **Codebase Audit** | Menganalisis duplikasi kode, kerentanan keamanan, dan ketiadaan validasi data di sistem Vanilla PHP. |
| **Database Schema Analysis** | Mengevaluasi dan memetakan 17 tabel migrasi MySQL ke dalam Eloquent Models. |
| **User Story Mapping** | Menyusun kebutuhan fungsional berdasarkan hak akses (roles) dari berbagai departemen perusahaan sesuai dengan modul operasional nyata. |

---

## **2.2 Stakeholders**

| Stakeholder | Role |
| :--- | :--- |
| **Super Admin (IT Dept)** | Pemilik kendali penuh atas sistem, manajemen pengguna, data armada, pengaturan global, manajemen kontak kantor, dan analisis situs. |
| **Crew Admin (Operation)** | Pengelola data lowongan pekerjaan karir kru kapal serta peninjauan jumlah pelamar. |
| **HR Admin (HRD)** | Pengelola lowongan pekerjaan karir korporat/staf kantor, pelamar karir, serta pembuat pengumuman popup karir. |
| **PR Admin (Public Relations)** | Pengelola konten publik, berita perusahaan, testimonial klien, dan peninjauan pesan masuk kategori umum. |
| **Public Visitor (Warga/Klien)** | Pengakses profil perusahaan, lowongan kerja, peta armada, peta cakupan layanan, dan pengguna AI Chatbot. |

---

## **2.3 User Stories**

1. **Sebagai Super Admin**, saya ingin membatasi akses menu admin secara ketat berdasarkan matriks peran (RBAC) agar PR admin hanya mengelola berita dan HR admin hanya mengelola karir serta popup pengumuman karir.
2. **Sebagai Crew Admin**, saya ingin masuk ke modul lowongan karir agar saya dapat memperbarui kualifikasi kru kapal yang dibutuhkan secara mandiri.
3. **Sebagai HR Admin**, saya ingin mempublikasikan pengumuman penting mengenai rekrutmen kru menggunakan popup spanduk karir agar langsung terlihat oleh pencari kerja ketika membuka halaman karir.
4. **Sebagai PR Admin**, saya ingin menulis berita terbaru mengenai kegiatan CSR perusahaan dan mengatur meta title serta meta description agar peringkat SEO di mesin pencari optimal.
5. **Sebagai Public Visitor**, saya ingin mengklik penanda kapal di peta Leaflet di halaman publik agar saya dapat melihat detail spesifikasi kapal secara cepat melalui modal ringkasan.

---

## **2.4 Thematic Analysis**

Analisis terhadap hasil elisitasi mengelompokkan kebutuhan ke dalam empat tema besar:
* **Security & Auth:** Penerapan proteksi CSRF, enkripsi password, session regeneration, rate limiting, dan migrasi auth ke basis *username* (menggantikan *email*).
* **Modularization (MVC):** Pemisahan logika backend (Laravel), routing, dan tampilan frontend (React SPA) melalui Inertia.js untuk mengeliminasi file monolitik.
* **Interactive Visualization:** Visualisasi peta rute kapal menggunakan Leaflet JS dan peta cakupan wilayah operasional berbasis Google GeoChart.
* **Operational Autonomy (Strict RBAC):** Pembatasan hak akses yang jelas antara Super Admin, HR, Crew, dan PR admin untuk menjaga keamanan integritas data.

---

## **2.5 Identified Requirements Summary**

| ID | Requirement | Source |
| :--- | :--- | :--- |
| **R-01** | Sistem harus membatasi hak akses halaman dashboard menggunakan middleware RBAC. | Codebase Audit, User Story |
| **R-02** | Autentikasi admin harus berbasis *username* dengan batasan rate-limiting 5 kali percobaan. | Proposal re.md, Security |
| **R-03** | Manajemen data armada kapal (*fleet*) lengkap dengan spesifikasi teknis (IMO, GT, DWT, LOA). | Database Schema Analysis |
| **R-04** | Peta rute pelayaran interaktif berbasis koordinat lintang/bujur (*voyage waypoints*). | User Story, Codebase Audit |
| **R-05** | Pengelolaan lowongan pekerjaan (*careers*) dengan pemisahan kategori kru dan korporat. | User Story, Database Schema Analysis |
| **R-06** | Publikasi berita (*news*) yang dilengkapi generator slug otomatis dan pengisian SEO meta-tags. | Codebase Audit |
| **R-07** | Manajemen daftar logo klien (*clients*) dan testimoni publik. | Database Schema Analysis |
| **R-08** | Formulir kontak masuk publik (*contacts*) dengan klasifikasi department tujuan otomatis. | User Story, Database Schema Analysis |
| **R-09** | Manajemen pengaturan sistem global (*settings*) berbasis key-value. | Database Schema Analysis |
| **R-10** | Dashboard visualisasi statistik pengunjung (*visitor_analytics*) dan page views. | Proposal re.md |
| **R-11** | RAG AI Chatbot widget terintegrasi pada halaman publik dengan fallback multi-layer. | Proposal re.md, Audit |
| **R-12** | Seluruh form input harus memiliki validasi ketat (Laravel Form Request) & perlindungan CSRF. | Security |
| **R-13** | Manajemen pengumuman spanduk popup (*notifications*) tipe beranda dan karir. | SDD Elicitation |
| **R-14** | Manajemen informasi kontak kantor (*contact_info*) seperti alamat, telepon, email, sosial. | SDD Elicitation |

---

# **3. Overall Description**

## **3.1 Product Perspective**

Sistem v2.0 ini merupakan **membangun kembali (rebuild) secara total** terhadap website profile PT. ABB. Database lama tetap dipertahankan dengan migrasi schema ke Laravel Migrations. Sistem baru ini menggunakan arsitektur Hybrid SPA (Single Page Application) menggunakan Inertia.js, di mana React menangani rendering UI secara dinamis di sisi klien, sementara Laravel menangani routing, database ORM, dan policy otorisasi di sisi server.

---

## **3.2 Product Functions**

| ID-Requirement | ID-Feature | Feature |
| :--- | :--- | :--- |
| R-02, R-12 | **F-01** | Autentikasi & Security (Login, Logout, Rate Limit) |
| R-01 | **F-02** | User Management (Manajemen Akun Admin) |
| R-03 | **F-03** | Fleet Management (Armada Kapal - Super Admin) |
| R-04 | **F-04** | Voyage Waypoint Management (Peta Pelayaran - Super Admin) |
| R-05 | **F-05** | Career & Recruitment Management (Super, HR, Crew Admin) |
| R-06 | **F-06** | News & Articles Management (SEO Optimized - Super, PR Admin) |
| R-07 | **F-07** | Client & Testimonial Management (Super Admin) |
| R-08 | **F-08** | Contact Inbox & Routing Department (Super, HR, PR Admin) |
| R-09 | **F-09** | Global Site Settings (Super Admin) |
| R-10 | **F-10** | Visitor & Page View Analytics Dashboard (Super Admin) |
| R-11 | **F-11** | RAG AI Chatbot Widget (Sistem Publik) |
| R-13 | **F-12** | Popup & Notification Banner Manager (Super, HR Admin) |
| R-14 | **F-13** | Contact Info CMS (Super Admin) |

---

## **3.3 User Classes and Characteristics**

Sistem baru menerapkan hak akses minimal (*least-privilege default*) yang dipetakan langsung dari matriks hak akses legacy:

| ID-User | User Type | Role | Accessible Features | Description |
| :---: | :--- | :--- | :--- | :--- |
| **User01** | Public Visitor | Guest / Warga | Membaca profil, armada, karir, berita, GeoChart layanan, mengirim kontak, RAG Chatbot, popup. | Pengunjung eksternal yang mencari informasi profil perusahaan. |
| **User02** | Super Admin | IT Department | Mengakses seluruh fitur F-01 s/d F-13 tanpa batasan. | Pengelola penuh sistem, manajemen user, database armada, dan konfigurasi global. |
| **User03** | HR Admin | HRD Manager | F-01, F-05 (Karir), F-08 (Inbox HRD), F-12 (Popup Manager). | Pengelola data lamaran, lowongan karir staf, dan spanduk pengumuman karir. |
| **User04** | Crew Admin | Operation Manager | F-01, F-05 (Karir - Kategori Kru), F-08 (Inbox Crew/Operation). | Pengelola lowongan kerja kru kapal dan peninjauan kebutuhan kualifikasi kru. |
| **User05** | PR Admin | Public Relations | F-01, F-06 (Berita), F-08 (Inbox General / Commercial), F-07 (Testimoni/Klien). | Pengelola siaran pers, artikel berita, testimoni klien, dan kontak kategori umum. |

---

## **3.4 Operating Environment**

* **Architecture:** Monolithic Architecture (React Frontend integrated via Inertia.js, Laravel Backend, and MySQL Database)
* **Frontend Library:** React 18
* **Styling Framework:** Tailwind CSS v3
* **Backend Framework:** Laravel 13 (PHP 8.2+)
* **Database Engine:** MySQL 8.0+ / MariaDB 10.11+
* **Build Tool:** Vite 8
* **Server Environment:** Laragon (Development), Linux VPS / cPanel (Production)
* **Supported Browsers:** Google Chrome, Safari, Mozilla Firefox, Microsoft Edge (Versi terbaru)
* **Client Devices:** Desktop, Laptop, Tablet, Smartphone (Fully Responsive Layout)

---

## **3.5 Design and Implementation Constraints**

* Pembangunan kembali harus menggunakan database MySQL yang sudah ada tanpa merusak struktur relasi data lama (*foreign keys*).
* Sistem otorisasi admin wajib menggunakan pencocokan *username* (bukan *email*) karena menyesuaikan kredensial admin eksisting.
* Aplikasi tidak boleh memicu full page reload saat berpindah halaman publik (wajib memanfaatkan navigasi SPA Inertia.js Link).
* Seluruh credential database dan kunci API AI Chatbot tidak boleh ditulis langsung di kode (*no hardcoding*), melainkan dimuat dari file `.env`.
* Peta cakupan operasional di halaman Services wajib diimplementasikan menggunakan Google GeoChart API, dan peta posisi armada menggunakan Leaflet JS.

---

## **3.6 User Documentation**

* **User Manual Dashboard:** Panduan untuk masing-masing admin departemen (HRD, Operation, PR, IT) dalam melakukan entri data.
* **API Documentation:** Dokumentasi endpoint kontak, waypoint, dan chatbot untuk integrasi masa depan.
* **Deployment Guide:** Dokumen langkah-langkah deployment Vite build dan Laravel artisan commands pada server cPanel/VPS.

---

## **3.7 Assumptions**

* Database MySQL eksisting dalam kondisi bersih dan terstruktur dengan baik.
* Server hosting tujuan mendukung PHP 8.2 ke atas. Node.js hanya diperlukan pada tahap kompilasi (*build-time*) aset Vite (dapat dilakukan di lingkungan lokal sebelum unggah/deploy atau di server jika menggunakan CI/CD), sehingga cPanel tidak wajib menjalankan service Node.js pada saat *runtime*.
* Klien/Visitor memiliki koneksi internet yang memadai untuk memuat peta Leaflet, Google GeoChart, dan memicu API Chatbot.

---

# **4. External Interface Requirements**

## **4.1 User Interfaces**

| Interface ID | Interface Name | User Access | Description | Main Elements |
| :--- | :--- | :--- | :--- | :--- |
| **UI-01** | Login Page | All Admins | Halaman login admin berbasis *username*. | Username field, Password field, Rate limiter indicator, Login button. |
| **UI-02** | Admin Dashboard | All Admins | Halaman utama panel admin menampilkan ringkasan data situs. | Navigation sidebar (filtered by role), analytics chart, activity log. |
| **UI-03** | Fleet Management | Super Admin | Form CRUD data kapal dan spesifikasi teknisnya. | Ship name input, IMO unique number field, build year, classification input, submit button. |
| **UI-04** | Waypoint Editor | Super Admin | Antarmuka untuk mengatur rute kapal per armada secara berurutan. | Map marker editor, sequence input, ETA/ETD date-time picker, save route button. |
| **UI-05** | Career Board | HRD, Crew, Super | Halaman pengelolaan lowongan kerja dan pelamar. | Position title, employment type dropdown, requirements rich text, status toggle. |
| **UI-06** | News Publisher | PR, Super | Halaman penulisan artikel berita dan optimasi metadata SEO. | Title input, auto-slug generator, content rich-editor, meta-tag input, publish toggle. |
| **UI-07** | Client Manager | PR, Super | Pengelolaan logo klien dan testimoninya. | Company name input, client logo uploader, testimonial textarea. |
| **UI-08** | Contact Inbox | PR, HRD, Super | Panel membaca pesan masuk yang dikirim pengunjung publik. | Sender info panel, message body text, status flag (new/read/replied). |
| **UI-09** | Global Settings | Super Admin | Halaman modifikasi konfigurasi situs secara dinamis. | Key name, Value input, key description text. |
| **UI-10** | Analytics Dashboard | Super Admin | Visualisasi jumlah visitor harian dan statistik browser. | Line charts, browser pie charts, popular page list table. |
| **UI-11** | AI Chatbot Widget | Guest | Widget balon obrolan pada pojok kanan bawah halaman publik. | Chat window, message history, text input, send button, typing indicator. |
| **UI-12** | Popup Manager | HRD, Super | Halaman pengelolaan popup spanduk untuk beranda atau karir. | Title, type select (home/career), image uploader, status select (active/inactive). |
| **UI-13** | Contact Info Editor | Super Admin | Pengelolaan data kontak kantor resmi (HQ). | Label, value, icon class, type (office/phone/email/social). |

---

## **4.2 Hardware Interfaces**

* **Development Server:** Komputer/Laptop dengan spesifikasi minimal Dual-Core CPU, RAM 8GB, SSD untuk menjalankan Laragon, Node.js, dan Vite.
* **Production Web Server:** Virtual Private Server (VPS) / Dedicated Hosting dengan RAM minimal 2GB, 1 vCPU, SSD untuk melayani traffic publik dan database query.

---

## **4.3 Software Interfaces**

* **MySQL Database:** Engine penyimpanan data persisten yang diakses menggunakan Laravel Eloquent ORM.
* **Leaflet JS Map API:** Library pemetaan open-source yang digunakan di frontend React untuk memvisualisasikan posisi armada global dan rute pelayaran individual.
* **Google Visualization GeoChart:** Library pemetaan wilayah yang digunakan untuk menggambar peta cakupan operasional di halaman layanan.
* **OpenAI / OpenRouter LLM API:** API LLM eksternal untuk menjawab pertanyaan pengunjung terkait profil PT. ABB.

---

## **4.4 Communications Interfaces**

* **HTTP/HTTPS Protocols:** Digunakan untuk seluruh komunikasi data antara browser klien dan server web.
* **Secure Sockets Layer (SSL):** Wajib diaktifkan di production untuk mengamankan data formulir login dan kontak masuk.

---

# **5. System Features**

## **5.1 Feature Description**

Sistem baru PT. ABB v2.0 menyediakan 13 fitur utama yang dioptimalkan untuk mempermudah manajemen informasi korporat maritim secara dinamis dan aman.

## **5.1.1 Stimulus/Response Sequences**

| Step | User Action (Stimulus) | System Response |
| :---: | :--- | :--- |
| **1** | Pengunjung mengakses halaman armada (*fleet*). | Sistem memuat data kapal dari database dan merender peta Leaflet menggunakan koordinat waypoint terakhir. |
| **2** | Pengunjung mengirimkan formulir kontak dengan departemen tujuan "HRD". | Sistem memvalidasi input, menyimpan data ke tabel *contacts*, dan memicu notifikasi khusus di dashboard HR Admin. |
| **3** | Admin (HRD) membuka modul *Careers* dan menekan "Tambah Lowongan". | Sistem menampilkan form input lowongan kerja. |
| **4** | Admin (HRD) menyimpan lowongan baru. | Sistem memvalidasi, menyimpan data, dan langsung memperbarui daftar karir di halaman React publik tanpa perlu reload. |
| **5** | Admin salah memasukkan password sebanyak 5 kali berturut-turut. | Sistem mengaktifkan rate limiter, mengunci username + IP tersebut selama 60 detik, dan menampilkan pesan penolakan. |
| **6** | Pengunjung membuka halaman beranda (*home*). | Sistem memeriksa tabel *notifications* untuk mencari entri bertipe 'home' dengan status 'active' dan merendernya sebagai popup spanduk di atas halaman utama. |

---

## **5.1.2 Functional Requirements**

| ID | Features | Requirement Description |
| :--- | :--- | :--- |
| **FR-01** | Authentication | Sistem harus mengamankan login admin menggunakan *username* dan menerapkan rate-limiting (lockout setelah 5 kali gagal). |
| **FR-02** | User & RBAC Management | Sistem harus membatasi akses menu panel admin berdasarkan peran (`super_admin`, `hr_admin`, `crew_admin`, `pr_admin`). |
| **FR-03** | Fleet CRUD | Sistem harus memfasilitasi pengelolaan armada kapal (tambah, edit, hapus, detail kapal) beserta berkas PDF spesifikasinya. (Khusus Super Admin). |
| **FR-04** | Voyage Waypoints | Sistem harus mencatat daftar rute pelayaran per kapal secara sekuensial menggunakan koordinat geografis (Latitude, Longitude). (Khusus Super Admin). |
| **FR-05** | Career Postings | Sistem harus menyediakan form pembuatan lowongan karir yang dapat diakses oleh Super, HR, dan Crew admin. |
| **FR-06** | News Publisher | Sistem harus memiliki generator slug otomatis dari judul berita dan mendukung upload gambar unggulan artikel. (Akses oleh Super & PR Admin). |
| **FR-07** | Client Logo & Testimonial | Sistem harus mendukung penyimpanan testimoni klien dan logo perusahaan mitra. (Khusus Super & PR Admin). |
| **FR-08** | Contact Routing | Sistem harus menyimpan pesan pengunjung dan mengarahkannya ke dashboard admin yang sesuai berdasarkan department tujuan. |
| **FR-09** | Global Settings | Sistem harus mengizinkan Super Admin mengubah data konfigurasi situs (misal: email kontak utama, link sosmed) secara dinamis. |
| **FR-10** | Visitor Analytics | Sistem harus mencatat statistik kunjungan halaman publik (IP, User-Agent, Page URL) tanpa melanggar privasi pengguna. |
| **FR-11** | AI RAG Chatbot | Sistem harus menampilkan widget chatbot AI di halaman publik yang merespons pertanyaan pengunjung dengan context profile perusahaan. |
| **FR-12** | Form CSRF Protection | Sistem harus menolak seluruh request form POST/PUT/DELETE yang tidak menyertakan token CSRF yang valid. |
| **FR-13** | Popup Spanduk Manager | Sistem harus menyediakan antarmuka CRUD popup pengumuman spanduk (*notifications*) bertipe beranda/karir dengan status aktif/inaktif. (Super & HR Admin). |
| **FR-14** | Contact Info CMS | Sistem harus mengizinkan Super Admin mengedit alamat kantor, nomor telepon, email resmi, dan media sosial perusahaan. |

---

## **5.2 System Model**

### **5.2.1 Use Case Diagram**

```mermaid
usecaseDiagram
    actor "Public Visitor" as guest
    actor "Super Admin" as super
    actor "HR Admin" as hr
    actor "Crew Admin" as crew
    actor "PR Admin" as pr

    guest --> (Melihat Detail Armada & Peta)
    guest --> (Mencari Lowongan Kerja)
    guest --> (Mengirim Kontak / Pesan)
    guest --> (Interaksi Chatbot AI)
    guest --> (Melihat Popup Spanduk)

    super --> (Mengelola Seluruh Sistem)
    super --> (Manajemen Pengguna & Role)
    super --> (Melihat Analytics Dashboard)
    super --> (Mengelola Armada Kapal)
    super --> (Mengatur Voyage Waypoints)
    super --> (Mengedit Contact Info HQ)

    hr --> (Mengelola Lowongan Karir)
    hr --> (Mengelola Popup Spanduk)
    hr --> (Melihat Kontak HRD)

    crew --> (Mengelola Lowongan Karir Kru)
    crew --> (Melihat Statistik Lowongan)

    pr --> (Mengelola Berita & Artikel)
    pr --> (Mengelola Klien & Testimoni)
    pr --> (Mengelola Inbox General)
    
    (Mengelola Armada Kapal) ..> (Login Admin) : include
    (Mengatur Voyage Waypoints) ..> (Login Admin) : include
    (Mengelola Lowongan Karir) ..> (Login Admin) : include
    (Mengelola Berita & Artikel) ..> (Login Admin) : include
    (Mengelola Seluruh Sistem) ..> (Login Admin) : include
    (Mengelola Popup Spanduk) ..> (Login Admin) : include
```

---

## **5.2.2 Use Case Description**

### **1. Mengatur Voyage Waypoints**
* **Aktor:** Super Admin
* **Deskripsi:** Menambahkan titik koordinat rute pelayaran kapal secara berurutan untuk ditampilkan di Leaflet Map.
* **Pre-condition:** Admin telah login dan memiliki role Super Admin.
* **Post-condition:** Koordinat rute baru tersimpan di database dan divisualisasikan pada peta publik.
* **Main Flow:**
  1. Admin memilih kapal yang ingin diatur rutenya.
  2. Admin masuk ke tab "Voyage Waypoints".
  3. Admin memasukkan nama pelabuhan (*port name*), tipe waypoint (keberangkatan/transisi/tujuan), koordinat latitude/longitude, dan estimasi waktu (ETA/ETD).
  4. Admin menekan tombol "Simpan Rute".
  5. Sistem memvalidasi urutan sekuensial dan menyimpan data ke tabel *voyage_waypoints*.

### **2. Mengelola Popup Spanduk**
* **Aktor:** HR Admin, Super Admin
* **Deskripsi:** Membuat pengumuman popup untuk halaman depan (beranda) atau halaman karir.
* **Pre-condition:** Admin telah login dan memiliki role HR Admin atau Super Admin.
* **Post-condition:** Popup aktif akan otomatis muncul saat pengguna mengakses halaman publik terkait.
* **Main Flow:**
  1. Admin membuka halaman "Popup Manager".
  2. Admin menekan tombol "Tambah Popup Baru".
  3. Admin memasukkan judul, memilih tipe ('home' atau 'career'), mengunggah gambar spanduk, dan menyetel status ke 'active'.
  4. Admin menekan tombol "Simpan".
  5. Sistem mengubah popup lainnya dengan tipe yang sama menjadi 'inactive' (karena hanya satu yang boleh aktif per tipe), lalu menyimpan entri baru.

#### **3. Interaksi Chatbot AI (RAG)**
* **Aktor:** Public Visitor (Guest)
* **Deskripsi:** Pengunjung menanyakan informasi tentang armada, karir, berita, atau informasi umum perusahaan dan mendapatkan jawaban instan dari asisten AI yang kontekstual.
* **Pre-condition:** Pengunjung membuka halaman website PT. ABB yang memuat widget chat.
* **Post-condition:** Pengunjung menerima balasan yang relevan, akurat, dan ramah yang diformat dalam format markdown.
* **Main Flow:**
  1. Pengunjung mengetik pertanyaan di input chat widget dan mengirimkannya.
  2. Sistem (JavaScript frontend) mengirim payload JSON berisi pesan ke endpoint backend `api/chat.php`.
  3. Backend memicu proses deteksi maksud (*intent detection*) menggunakan pencocokan sinonim kata kunci statis dan dinamis yang dimuat dari database.
  4. Backend memicu kueri SQL tertarget (*targeted retrieval*) ke database MySQL berdasarkan maksud yang terdeteksi untuk mengambil data spesifik (armada, lowongan karir aktif, atau berita terbaru).
  5. Backend menggabungkan data profil statis perusahaan dan data dinamis hasil kueri menjadi sebuah *context string*.
  6. Backend menyusun *system prompt* LLM (menetapkan peran, instruksi bahasa, batas paragraf, dan menyuntikkan *context string*).
  7. Backend memicu panggilan API ke OpenRouter menggunakan model utama (*Primary Model*).
  8. Balasan dari LLM diterima, dikirim kembali ke frontend sebagai respons JSON, dan dirender ke dalam chat DOM menggunakan parser markdown sederhana.

* **Alternative Flow (OpenRouter API Outage / Timeout):**
  1. Jika panggilan ke *Primary Model* gagal atau mengalami *timeout* (12 detik), backend otomatis memicu panggilan ulang menggunakan model cadangan (*Fallback Model*).
  2. Jika *Fallback Model* juga gagal atau API key tidak terkonfigurasi, backend beralih ke *Local Rule-Based Fallback Engine* untuk mencocokkan kata kunci secara lokal dan memberikan tanggapan terprogram yang tetap relevan.

---

### **5.2.3 RAG AI Chatbot System Architecture**

Implementasi RAG (Retrieval-Augmented Generation) pada PT. ABB v2.0 dirancang menggunakan arsitektur sederhana namun sangat efisien untuk lingkungan shared hosting (cPanel), tanpa memerlukan database vektor eksternal. Alur arsitektur ini digambarkan sebagai berikut:

```
                  ┌──────────────────────┐
                  │ Pengunjung (Browser) │
                  └──────────┬───────────┘
                             │ (POST JSON)
                             ▼
                    ┌─────────────────┐
                    │  api/chat.php   │
                    └────────┬────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [Intent Detection]               [Targeted Retrieval]
 (Synonym & Keyword Scan)        (PDO Dynamic SQL Queries)
            │                                 │
            └────────────────┬────────────────┘
                             ▼
                    [Context Assembly]
                (Static Info + DB Context)
                             ▼
                    [System Prompt Init]
                (Behavioral Instructions)
                             ▼
                     [OpenRouter API] ──────────┐ (Fail / Timeout)
                 (gemma-4-26b / nemotron)       │
                             │                  ▼
                             │       [Local Fallback Engine]
                             │       (Deterministic Match)
                             │                  │
                             ▼                  ▼
                  ┌──────────────────────────────┐
                  │      JSON Response `{}`      │
                  └──────────────────────────────┘
```

1. **Dynamic Keyword Elicitation:**
   Sistem memuat kata kunci dinamis secara otomatis langsung dari database saat inisialisasi:
   * Nama kapal (misal: "Iriana", "Prilly") dan wilayah operasional armada.
   * Judul posisi pekerjaan, departemen, dan lokasi lowongan karir yang aktif (*status = 'open'*).
   * Judul artikel berita dan kategori berita yang diterbitkan (*status = 'published'*).

2. **Targeted Retrieval Policy:**
   Pencarian data kontekstual bersifat modular untuk menjaga kinerja kueri database dan efisiensi kuota token prompt LLM:
   * **Fleet Intent:** Menjalankan kueri data ke tabel *fleets*. Jika mendeteksi nama kapal spesifik, kueri SQL akan difilter menggunakan `LIKE` khusus untuk kapal tersebut. Jika kueri bersifat umum, sistem membatasi hasil maksimal 5 kapal teratas.
   * **Career Intent:** Menjalankan kueri data ke tabel *careers*. Jika mendeteksi departemen/posisi spesifik, kueri SQL akan menyaring lowongan yang relevan. Kueri umum dibatasi maksimal 3 lowongan.
   * **News Intent:** Menjalankan kueri ke tabel *news* dan *news_categories*, mengambil artikel terbaru dengan batasan 2-5 berita terakhir.
   * **General Query:** Jika tidak ada maksud spesifik yang terdeteksi, sistem mengambil ringkasan kecil (*summary*) dari seluruh modul untuk disajikan sebagai referensi serbaguna bagi LLM.

3. **API Multi-Layer Fallback Chain:**
   Untuk menjamin keandalan layanan 100% asisten chat, sistem menerapkan rantai penanganan kegagalan (*fallback chain*):
   * **Layer 1 (Primary Model):** `google/gemma-4-26b-a4b-it:free` (Model LLM utama yang dioptimalkan untuk instruksi terstruktur).
   * **Layer 2 (Fallback Model):** `nvidia/nemotron-3-ultra-550b-a55b:free` (Model cadangan jika model utama sibuk/habis kuota gratis).
   * **Layer 3 (Local Fallback Engine):** Fungsi pencocokan substring teks PHP lokal yang langsung mengembalikan jawaban statis yang relevan dengan topik (Armada, Karir, Kontak, atau Layanan).

---

## **5.3 Low-Fidelity Wireframe**

| ID UI | ID Feature | Deskripsi Antarmuka |
| :--- | :--- | :--- |
| **UI-01** | F-01 | Form login minimalis di tengah layar dengan background kapal PT. ABB. |
| **UI-02** | F-10 | Dashboard dengan grid panel berisi total kapal, berita aktif, lowongan kerja, dan grafik tren pengunjung. |
| **UI-03** | F-03 | Tabel list armada kapal dengan filter status (in_service, available, docking, maintenance). |
| **UI-04** | F-04 | Antarmuka peta interaktif dengan sidebar form input titik koordinat lintang & bujur. |
| **UI-05** | F-05 | Form input karir dengan editor rich text untuk deskripsi pekerjaan dan persyaratan. |
| **UI-06** | F-06 | Editor artikel blog dengan kolom input SEO meta title dan meta description di bagian bawah. |
| **UI-08** | F-08 | Tampilan inbox pesan dengan tab filter "Baru", "Dibaca", dan "Dibalas". |
| **UI-11** | F-11 | Chat widget melayang dengan balon teks otomatis dari asisten AI PT. ABB. |
| **UI-12** | F-12 | Panel daftar spanduk popup pengumuman dengan tombol toggle ON/OFF untuk aktivasi cepat. |
| **UI-13** | F-13 | Formulir entri data kontak kantor (telepon, alamat, email) dengan tombol urutan tampilan (*display order*). |

---

# **6. Other Nonfunctional Requirements**

Sistem baru PT. ABB v2.0 dikembangkan untuk memberikan keandalan operasional, keamanan data maksimal, dan performa pemuatan yang cepat.

## **6.1 Performance Requirements**

| Requirement ID | Description |
| :--- | :--- |
| **NFR-P01** | Waktu respon pemindahan halaman (*client-side routing*) menggunakan Inertia.js Link harus di bawah 1 detik (SPA experience). |
| **NFR-P02** | Aset CSS dan JS harus dikompresi dan dipilah (*code splitting*) oleh Vite untuk menghasilkan ukuran bundle di bawah 500KB saat load awal. |
| **NFR-P03** | Halaman detail armada yang memuat Leaflet Map dan rute koordinat harus termuat kurang dari 2.5 detik pada jaringan 4G stabil. |
| **NFR-P04** | API RAG AI Chatbot harus memberikan respons awal (typing indicator atau streaming response) dalam waktu maksimal 2 detik. |

---

## **6.2 Safety Requirements**

| Requirement ID | Description |
| :--- | :--- |
| **NFR-S01** | Penghapusan data armada (*fleets*) atau lowongan kerja (*careers*) harus menampilkan pop-up konfirmasi eksplisit kepada admin untuk mencegah penghapusan tidak sengaja. |
| **NFR-S02** | Unggahan file spesifikasi kapal (*ship_particular_pdf*) wajib divalidasi hanya menerima ekstensi `.pdf` dengan ukuran maksimal 10MB untuk menjaga kestabilan file system server. |

---

## **6.3 Security Requirements**

| Requirement ID | Description |
| :--- | :--- |
| **NFR-SEC01** | Seluruh sandi pengguna (*password*) wajib di-hash menggunakan algoritma Bcrypt (bawaan Laravel) sebelum disimpan ke basis data. |
| **NFR-SEC02** | Sesi login admin wajib dihancurkan dan diregenerasi ulang secara otomatis setiap kali login berhasil untuk mencegah serangan *session fixation*. |
| **NFR-SEC03** | Form login harus dikunci selama 60 detik jika mendeteksi kegagalan login sebanyak 5 kali berturut-turut dari kombinasi username dan alamat IP yang sama. |
| **NFR-SEC04** | Seluruh data input pengunjung pada form kontak wajib disanitasi menggunakan query builder Eloquent (PDO parameterized queries) untuk mencegah serangan *SQL Injection*. |
| **NFR-SEC05** | Akses panel admin wajib diproteksi menggunakan HTTPS. Sistem akan memaksa redirect dari HTTP biasa ke HTTPS. |

---

## **6.4 Software Quality Attributes**

* **Usability:** Antarmuka dashboard admin menggunakan layout responsif berbasis Tailwind CSS yang mudah dipahami tanpa keahlian teknis khusus.
* **Maintainability:** Struktur kode mengikuti standar MVC Laravel 13 dengan penamaan controller yang teratur (misalnya: `FleetController`, `CareerController`) dan database seeder untuk replikasi lingkungan dev secara instan.
* **Reliability:** Sistem tidak boleh crash saat database MySQL mengalami lonjakan query (menerapkan database connection pooling jika didukung VPS).
* **Scalability:** Sistem dipersiapkan untuk mudah dikembangkan ke arah mobile app di masa depan dengan memisahkan logic controller sehingga mempermudah pembuatan API routing baru.

---

## **6.5 Business Rules**

| Rule ID | Business Rule | Description |
| :--- | :--- | :--- |
| **BR-01** | **Role-Gated Access Control** | Pembatasan akses harus sesuai matriks peran legacy (Super Admin mengelola Fleet, Kontak HQ, dan User; HR Admin mengelola Careers & Popups; Crew Admin mengelola Careers Kru; PR Admin mengelola News & Clients). |
| **BR-02** | **Unique IMO Number** | Setiap kapal yang didaftarkan ke sistem harus memiliki nomor IMO (*International Maritime Organization*) yang unik dan tidak boleh ganda. |
| **BR-03** | **Unique News Slug** | URL artikel berita (*slug*) harus unik dan dihasilkan secara otomatis berdasarkan judul berita saat pertama kali disimpan. |
| **BR-04** | **Contact Routing Logic** | Pesan pengunjung yang ditujukan ke departemen HRD secara otomatis akan masuk ke filter inbox HR Admin dan tidak dapat dibaca oleh Crew/PR Admin. |
| **BR-05** | **AI Fallback System** | Jika RAG AI Chatbot mendeteksi pertanyaan di luar konteks bisnis PT. ABB atau memiliki skor akurasi rendah, sistem harus mengarahkan pengguna secara sopan untuk mengirim pesan lewat form kontak resmi atau mengaktifkan fallback model LLM cadangan. |
| **BR-06** | **Popup Active Limit** | Hanya boleh ada 1 (satu) popup pengumuman spanduk yang aktif (*status = 'active'*) untuk setiap tipe ('home' atau 'career') dalam satu waktu. |

---

# **7. Other Requirements**

| Requirement ID | Requirement | Description |
| :--- | :--- | :--- |
| **OR-01** | **Daily Database Backup** | Sistem di server production harus menjalankan backup otomatis database MySQL setiap hari pukul 02:00 AM. |
| **OR-02** | **Automated Tests** | Tim pengembang wajib membuat unit/feature testing menggunakan PHPUnit untuk memastikan fungsionalitas login, registrasi, dan pengiriman kontak aman sebelum dipublikasikan. |
| **OR-03** | **Image Optimization** | Seluruh gambar unggulan armada kapal, berita, dan spanduk popup yang diunggah harus otomatis di-resize dan dikonversi ke format `.webp` oleh sistem backend untuk menghemat bandwidth. |

---

# **Appendix A: Glossary**

* **Laravel 13:** Framework aplikasi web PHP berbasis MVC yang menawarkan sintaks elegan dan fitur bawaan lengkap untuk keamanan dan database.
* **Inertia.js v2:** Library penghubung yang memungkinkan pembuatan aplikasi SPA menggunakan React tanpa perlu memisahkan backend API dan frontend secara fisik.
* **React 18:** Library JavaScript component-based untuk membangun antarmuka pengguna yang dinamis dan interaktif.
* **Tailwind CSS v3:** Framework CSS utility-first untuk mempercepat styling UI dengan kelas-kelas utilitas langsung di markup HTML.
* **IMO Number:** Nomor identifikasi kapal unik berstandar internasional dari International Maritime Organization.
* **DWT (Deadweight Tonnage):** Berat total yang dapat diangkut kapal dengan aman, termasuk kargo, bahan bakar, air tawar, kru, dan perbekalan.
* **LOA (Length Overall):** Panjang total maksimum kapal dari ujung haluan sampai ujung buritan.
* **RAG AI Chatbot (Retrieval-Augmented Generation):** Chatbot AI yang mengintegrasikan pencarian dokumen atau konteks profil armada/karir/berita perusahaan sebelum memberikan jawaban kepada pengguna.
* **Bcrypt:** Algoritma satu arah (one-way hashing) untuk enkripsi password.

---

# **To Be Discussed (TBD)**

| TBD ID | Topic | Owner | Status |
| :--- | :--- | :--- | :--- |
| **TBD-01** | Penyedia Layanan Peta Voyage Waypoints (Leaflet default OpenStreetMap atau Google Maps API). | IT Supervisor & Dev Team | **To Be Discussed** |
| **TBD-02** | Batasan ukuran maksimal file unggahan PDF spesifikasi armada kapal di server production. | Dev Team & System Admin | **Under Review** |
| **TBD-03** | Skema penyimpanan riwayat chat pengunjung dengan AI Chatbot (apakah disimpan selamanya atau dihapus per bulan). | IT Supervisor | **Pending** |
