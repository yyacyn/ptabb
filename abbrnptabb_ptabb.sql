-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 20, 2026 at 11:26 AM
-- Server version: 10.11.18-MariaDB-cll-lve
-- PHP Version: 8.4.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `abbrnptabb_ptabb`
--

-- --------------------------------------------------------

--
-- Table structure for table `careers`
--

CREATE TABLE `careers` (
  `id` int(11) NOT NULL,
  `author_id` int(11) DEFAULT NULL,
  `author_name` varchar(100) DEFAULT NULL,
  `author_role` varchar(50) DEFAULT NULL,
  `position` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'corporate',
  `location` varchar(100) DEFAULT NULL,
  `employment_type` enum('fulltime','contract','internship') DEFAULT 'fulltime',
  `description` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `responsibilities` text DEFAULT NULL,
  `status` enum('open','closed') DEFAULT 'open',
  `application_deadline` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `careers`
--

INSERT INTO `careers` (`id`, `author_id`, `author_name`, `author_role`, `position`, `department`, `category`, `location`, `employment_type`, `description`, `requirements`, `responsibilities`, `status`, `application_deadline`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, NULL, 'General Manager Operations', 'Operations', 'corporate', 'Jakarta HQ', 'fulltime', 'Leading the strategic maritime operations and fleet efficiency.', 'Minimum 10 years experience in senior maritime management.', '', 'open', '2026-03-31', '2026-01-21 08:14:33', '2026-03-08 07:51:23'),
(2, NULL, NULL, NULL, 'Senior Finance Controller', 'Finance', 'corporate', 'Jakarta HQ', 'fulltime', 'Managing corporate financial planning and tax strategy.', 'CA/CPA qualification with 7+ years in maritime finance.', '• Financial reporting\n• Budget management\n• Tax planning\n• Audit coordination', 'open', '2026-03-31', '2026-01-21 08:14:33', '2026-01-21 08:14:33'),
(4, NULL, NULL, NULL, 'Senior Technical Buyer', 'Procurement', 'corporate', 'Jakarta HQ', 'fulltime', 'Managing global supply chain for engine parts and dry-docking.', 'Technical degree with 5 years experience in marine procurement.', '• Vendor management\n• Procurement planning\n• Quality control\n• Inventory management', 'open', '2026-03-31', '2026-01-21 08:14:33', '2026-01-21 08:14:33'),
(5, NULL, NULL, NULL, 'Corporate Legal Counsel', 'Legal', 'corporate', 'Jakarta HQ', 'fulltime', 'Handling maritime contracts, charter parties, and compliance.', 'Master of Law (LLM) with focus on International Maritime Law.', '• Contract drafting\n• Legal compliance\n• Dispute resolution\n• Regulatory advisory', 'open', '2026-03-31', '2026-01-21 08:14:33', '2026-01-21 08:14:33'),
(6, NULL, NULL, NULL, 'Vessel Master (Captain)', 'Deck', 'crew', 'Regional Fleet', 'fulltime', 'Overall command of tanker vessels ensuring safety and compliance.', 'Master Mariner Class I (ANT I) with tanker endorsements.', '• Vessel navigation\n• Crew management\n• Safety procedures\n• Port operations', 'open', '2026-03-31', '2026-01-21 08:14:33', '2026-03-08 07:50:25'),
(7, NULL, NULL, NULL, 'Chief Engineer', 'Engine', 'crew', 'Regional Fleet', 'fulltime', 'Responsible for main engine maintenance and technical operations.', 'Marine Engineer Class I (ATT I) with experience in low-speed engines.', '• Engine maintenance\n• Technical troubleshooting\n• Spare parts management\n• Safety inspections', 'open', '2026-03-31', '2026-01-21 08:14:33', '2026-02-21 06:03:42'),
(8, NULL, NULL, NULL, 'Second Officer', 'Deck', 'crew', 'Regional Fleet', 'fulltime', 'Assisting in navigation watches and safety equipment maintenance.', 'ANT II/III certificate with valid STCW documents.', '• Navigation watch\n• Safety equipment checks\n• Chart updates\n• Port documentation', 'open', '2026-03-31', '2026-01-21 08:14:33', '2026-02-21 06:03:42'),
(9, NULL, NULL, NULL, 'Pumpman / Deck Fitter', 'Engine/Cargo', 'crew', 'Regional Fleet', 'fulltime', 'Specialized maintenance of cargo pumping systems on tankers.', 'Certified Pumpman with specialized tanker training.', '• Pump system maintenance\n• Cargo operations\n• Deck maintenance\n• Safety procedures', 'open', '2026-03-31', '2026-01-21 08:14:33', '2026-02-21 06:03:42');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` enum('international','domestic') NOT NULL DEFAULT 'international',
  `logo` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `name`, `category`, `logo`, `created_at`, `updated_at`) VALUES
(40, 'PT. Bahtera Bestari Shipping', 'domestic', '1777650268_PT__Bahtera_Bes.png', '2026-04-06 15:34:51', '2026-05-01 15:44:28'),
(41, 'PT. Bahtera Alam Sejahtera', 'domestic', '1777650146_PT__Bahtera_Ala.png', '2026-04-06 15:35:25', '2026-05-01 15:42:26'),
(42, 'PT. Dian Bahari Sejati', 'domestic', '1777650114_PT__Dian_Bahari.png', '2026-04-06 15:36:13', '2026-05-01 15:41:54'),
(43, 'PT. Lafarge Cement Indonesia, Tbk', 'domestic', '1777650087_PT__Lafarge_Cem.png', '2026-04-06 15:37:41', '2026-05-01 15:41:27'),
(44, 'PT. Solusi Bangun Indonesia, Tbk', 'domestic', '1777649875_PT__Solusi_Bang.png', '2026-04-06 15:38:07', '2026-05-01 15:37:55'),
(45, 'PT. Semen Padang', 'domestic', '1777649829_PT__Semen_Padan.png', '2026-04-06 15:38:40', '2026-05-01 15:37:09'),
(46, 'PT. Semen Bosowa Maros', 'domestic', '1777649795_PT__Semen_Bosow.png', '2026-04-06 15:39:00', '2026-05-01 15:36:35'),
(47, 'PT. Semen Tonasa', 'domestic', '1777649742_PT__Semen_Tonas.png', '2026-04-06 15:39:23', '2026-05-01 15:35:42'),
(48, 'PT. Semen Bosowa Indonesia', 'domestic', '1777649674_PT__Semen_Bosow.png', '2026-04-06 15:39:43', '2026-05-01 15:34:34'),
(49, 'PT. Cemindo Gemilang', 'domestic', '1777649646_PT__Cemindo_Gem.png', '2026-04-06 15:40:02', '2026-05-01 15:34:06'),
(50, 'PT. Indocement Tunggal Perkasa, Tbk', 'domestic', '1777649352_PT__Indocement_.png', '2026-04-06 15:40:20', '2026-05-01 15:29:12'),
(51, 'PT. Semen Gresik', 'domestic', '1777649295_PT__Semen_Gresi.png', '2026-04-06 15:40:45', '2026-05-01 15:28:15'),
(52, 'PT. Semen Indonesia (Persero), Tbk', 'domestic', '1777649240_PT__Semen_Indon.png', '2026-04-06 15:41:05', '2026-05-01 15:27:20'),
(53, 'Minti International', 'international', '1777649193_Minti_Internati.png', '2026-04-06 15:42:03', '2026-05-01 15:26:33'),
(54, 'Max Bridge', 'international', '1777649156_Max_Bridge.png', '2026-04-06 15:42:20', '2026-05-01 15:25:56'),
(55, 'KRnG Indonesia', 'international', '1777648379_KRnG_Indonesia.png', '2026-04-06 15:42:38', '2026-05-01 15:12:59'),
(56, 'KGJS Cement', 'international', '1777648348_KGJS_Cement.png', '2026-04-06 15:43:09', '2026-05-01 15:12:28'),
(57, 'United Ocean Shipping (UOS) Co., Ltd', 'international', '1777648264_United_Ocean_Sh.png', '2026-04-06 15:43:47', '2026-05-01 15:11:04'),
(58, 'Shinchang Shipping Co., Ltd', 'international', '1777648213_Shinchang_Shipp.png', '2026-04-06 15:44:04', '2026-05-01 15:10:13'),
(59, 'Ranchan Maritime Sdn Bhd', 'international', '1777648179_Ranchan_Maritim.png', '2026-04-06 15:44:44', '2026-05-01 15:09:39'),
(60, 'Weltrans Marine Services Inc.', 'international', '1777648070_Weltrans_Marine.png', '2026-04-06 15:45:12', '2026-05-01 15:07:50'),
(61, 'Full Max Corporation Limited', 'international', '1777648024_Full_Max_Corpor.png', '2026-04-06 15:45:28', '2026-05-01 15:07:04'),
(62, 'Jumewah Shipping Sdn Bhd (YTL Group)', 'international', '1777647999_Jumewah_Shippin.png', '2026-04-06 15:45:54', '2026-05-01 15:06:39'),
(63, 'Asia Cement Corporation', 'international', '1777647968_Asia_Cement_Cor.png', '2026-04-06 15:46:07', '2026-05-01 15:06:08'),
(64, 'Taiwan Cement', 'international', '1777647882_Taiwan_Cement.png', '2026-04-06 15:46:32', '2026-05-01 15:04:42'),
(65, 'Sampyo Cement', 'international', '1777647537_Sampyo_Cement.png', '2026-04-06 15:46:49', '2026-05-01 14:58:57'),
(66, 'Sangyoung Cement', 'international', '1777647468_Sangyoung_Cemen.png', '2026-04-06 15:47:08', '2026-05-01 14:57:48'),
(67, 'Republic Cement Iligan, Inc', 'international', '1777647433_Republic_Cement.png', '2026-04-06 15:47:23', '2026-05-01 14:57:13'),
(68, 'Lafarge Holcim Malaysia', 'international', '1777647374_Lafarge_Holcim_.png', '2026-04-06 15:47:40', '2026-05-01 14:56:14'),
(70, 'Raysut Cement Company', 'international', '1777642947_Raysut_Cement_C.png', '2026-05-01 13:42:27', '2026-05-01 13:42:27'),
(71, 'Cementis Group', 'international', '1778835519_Cementis_Group.png', '2026-05-15 08:58:39', '2026-05-15 08:58:39');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `department` enum('commercial','operation','hrd','general') DEFAULT 'general',
  `status` enum('new','read','replied') DEFAULT 'new',
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_info`
--

CREATE TABLE `contact_info` (
  `id` int(11) NOT NULL,
  `type` enum('office','phone','email','social') NOT NULL,
  `label` varchar(100) NOT NULL,
  `value` varchar(255) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `display_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_info`
--

INSERT INTO `contact_info` (`id`, `type`, `label`, `value`, `icon`, `is_primary`, `display_order`) VALUES
(1, 'office', 'Kantor Pusat', 'Jl. Pelabuhan No. 123, Jakarta', 'location', 1, 1),
(2, 'phone', 'Telepon', '+62-21-1234567', 'phone', 1, 2),
(3, 'email', 'Email Commercial', 'commercial@abb.com', 'email', 1, 3);

-- --------------------------------------------------------

--
-- Table structure for table `fleets`
--

CREATE TABLE `fleets` (
  `id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `ship_name` varchar(255) NOT NULL,
  `imo_number` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `build_year` int(4) DEFAULT NULL,
  `dwt` decimal(10,2) DEFAULT NULL COMMENT 'Deadweight Tonnage',
  `capacity` decimal(10,2) DEFAULT NULL COMMENT 'Kapasitas muat semen curah',
  `status` enum('in_service','available','in_docking','maintenance','chartered') DEFAULT 'in_service',
  `operational_area` varchar(255) DEFAULT NULL,
  `voyage_route_image` varchar(255) DEFAULT NULL COMMENT 'Gambar route voyage',
  `ship_particular_pdf` varchar(255) DEFAULT NULL COMMENT 'File PDF ship particular',
  `voyage_description` text DEFAULT NULL COMMENT 'Deskripsi route voyage',
  `featured_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `flag` varchar(100) DEFAULT NULL,
  `deadweight` decimal(10,2) DEFAULT NULL,
  `classification_society` varchar(100) DEFAULT NULL,
  `gross_tonnage` decimal(10,2) DEFAULT NULL,
  `net_tonnage` decimal(10,2) DEFAULT NULL,
  `vessel_type` varchar(100) DEFAULT NULL,
  `loa` decimal(8,2) DEFAULT NULL,
  `lbp` decimal(8,2) DEFAULT NULL,
  `breadth` decimal(8,2) DEFAULT NULL,
  `depth` decimal(8,2) DEFAULT NULL,
  `speed` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fleets`
--

INSERT INTO `fleets` (`id`, `category_id`, `ship_name`, `imo_number`, `description`, `build_year`, `dwt`, `capacity`, `status`, `operational_area`, `voyage_route_image`, `ship_particular_pdf`, `voyage_description`, `featured_image`, `created_at`, `updated_at`, `flag`, `deadweight`, `classification_society`, `gross_tonnage`, `net_tonnage`, `vessel_type`, `loa`, `lbp`, `breadth`, `depth`, `speed`) VALUES
(7, 1, 'MV. IRIANA', '9821158', '', 2015, 11.04, 8.86, 'in_service', 'Europe', NULL, 'ship_3463756_MV__Iriana_1766677019.pdf', NULL, 'ship_9821158_1767455250.jpg', '2025-12-16 21:06:41', '2026-01-05 02:07:49', 'INDONESIA', 10.68, 'RINA', 7.75, 3.45, 'PNEUMATIC & MANIFOLD', NULL, NULL, NULL, NULL, NULL),
(8, 1, 'MV. PRILLY', '9875734', '', NULL, NULL, NULL, 'in_service', 'Middle East', NULL, 'ship_9875734_MV__Prilly_1766677114.pdf', NULL, 'ship_9875734_1767432025.jpg', '2025-12-25 08:38:34', '2026-01-03 08:54:51', 'INDONESIA', 0.00, 'BKI', 0.00, 0.00, 'Bulk Carrier', NULL, NULL, NULL, NULL, NULL),
(10, 4, 'PB. ASUWA / ASUWA 1', '1234567', '', NULL, NULL, NULL, 'in_service', 'Asia', NULL, NULL, NULL, 'ship_1234567_1767432013.jpg', '2026-01-01 00:14:28', '2026-01-03 02:20:13', 'INDONESIA', 0.00, 'BKI', 0.00, 0.00, 'Tug & Barge', NULL, NULL, NULL, NULL, NULL),
(11, 4, 'PB. KUNIMI / KUNIMI 1', '2345678', '', NULL, NULL, NULL, 'in_service', 'Southeast Asia', NULL, NULL, NULL, 'ship_2345678_1767431997.jpg', '2026-01-01 00:15:05', '2026-01-03 02:19:57', 'INDONESIA', 0.00, 'BKI', 0.00, 0.00, 'Tug & Barge', NULL, NULL, NULL, NULL, NULL),
(12, 1, 'MV. FUYO 18', '3456789', '', NULL, NULL, NULL, 'in_service', 'Middle East', NULL, NULL, NULL, 'ship_3456789_1767431981.png', '2026-01-01 00:15:57', '2026-01-03 08:53:23', 'INDONESIA', 0.00, 'BKI', 0.00, 0.00, 'Bulk Carrier', NULL, NULL, NULL, NULL, NULL),
(13, 1, 'MV. NAGAKO', '4567890', '', NULL, NULL, NULL, 'in_service', 'Asia', NULL, NULL, NULL, 'ship_4567890_1767431967.jpg', '2026-01-01 00:17:01', '2026-01-03 02:19:27', 'INDONESIA', 0.00, 'BKI', 0.00, 0.00, 'Bulk Carrier', NULL, NULL, NULL, NULL, NULL),
(14, 1, 'MV. SENSHO', '5678901', '', NULL, NULL, NULL, 'in_service', 'Europe', NULL, NULL, NULL, 'ship_5678901_1768125420.jpg', '2026-01-01 00:17:31', '2026-01-11 02:57:00', 'INDONESIA', 0.00, 'BKI', 0.00, 0.00, 'Bulk Carrier', NULL, NULL, NULL, NULL, NULL),
(15, 1, 'MV. MONTOK', '6789012', '', NULL, NULL, NULL, 'in_docking', 'Europe', NULL, NULL, NULL, 'ship_6789012_1767431851.jpg', '2026-01-01 00:18:13', '2026-01-03 02:17:31', 'INDONESIA', 0.00, 'BKI', 0.00, 0.00, 'Bulk Carrier', NULL, NULL, NULL, NULL, NULL),
(17, NULL, 'MV. KENYO', '9876765', '', NULL, NULL, NULL, 'in_docking', 'Asia', NULL, NULL, NULL, 'ship_9876765_1767426461.png', '2026-01-03 00:47:41', '2026-01-03 02:21:39', '', 0.00, '', 0.00, 0.00, '', NULL, NULL, NULL, NULL, NULL),
(18, NULL, 'PB. OSHIMA 1', '6785390', '', NULL, NULL, NULL, 'in_service', 'Southeast Asia', NULL, NULL, NULL, 'ship_6785390_1767603442.png', '2026-01-05 01:57:22', '2026-01-05 01:57:22', '', 0.00, '', 0.00, 0.00, '', NULL, NULL, NULL, NULL, NULL),
(19, NULL, 'MV. RYUOH', '5647921', '', NULL, NULL, NULL, 'in_service', 'Middle East', NULL, NULL, NULL, 'ship_5647921_1767784825.jpg', '2026-01-07 04:20:25', '2026-01-07 04:20:25', '', 0.00, '', 0.00, 0.00, '', NULL, NULL, NULL, NULL, NULL),
(20, NULL, 'MV. YURICO', '2354876', '', NULL, NULL, NULL, 'in_service', 'Middle East', NULL, NULL, NULL, 'ship_2354876_1768125569.jpg', '2026-01-11 02:59:29', '2026-01-11 02:59:29', '', 0.00, '', 0.00, 0.00, '', NULL, NULL, NULL, NULL, NULL),
(21, NULL, 'MV. RYOKO 8', '9789878', '', NULL, NULL, NULL, 'in_service', 'Europe', NULL, NULL, NULL, 'ship_9789878_1768125615.jpg', '2026-01-11 03:00:15', '2026-01-11 03:00:15', '', 0.00, '', 0.00, 0.00, '', NULL, NULL, NULL, NULL, NULL),
(22, NULL, 'MV. SOPHIA', '1122334', '', NULL, NULL, NULL, 'in_service', 'East Asia', NULL, NULL, NULL, 'ship_1122334_1768125651.jpg', '2026-01-11 03:00:51', '2026-01-11 03:00:51', '', 0.00, '', 0.00, 0.00, '', NULL, NULL, NULL, NULL, NULL),
(23, NULL, 'MV. UNGGUL', '0099009', '', NULL, NULL, NULL, 'in_service', 'Asia,Southeast Asia', NULL, NULL, NULL, 'ship_0099009_1768126755.jpg', '2026-01-11 03:01:25', '2026-01-11 03:19:15', '', 0.00, '', 0.00, 0.00, '', NULL, NULL, NULL, NULL, NULL),
(24, NULL, 'MV. MUMBAI', '6655778', '', NULL, NULL, NULL, 'in_service', 'Asia', NULL, NULL, NULL, 'ship_6655778_1768125725.jpg', '2026-01-11 03:02:05', '2026-02-19 07:52:20', '', 0.00, '', 0.00, 0.00, '', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `fleet_categories`
--

CREATE TABLE `fleet_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fleet_categories`
--

INSERT INTO `fleet_categories` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Bulk Cement Carrier', 'Kapal khusus pengangkut semen curah', '2025-12-17 04:53:11'),
(2, 'Pusher', 'Kapal penarik/pendorong', '2025-12-17 04:53:11'),
(3, 'Barge', 'Tongkang', '2025-12-17 04:53:11'),
(4, 'Pusher & Barge', 'Kombinasi pusher dan tongkang', '2025-12-17 04:53:11');

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `featured_image` varchar(255) DEFAULT NULL,
  `youtube_url` varchar(255) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `status` enum('published','draft') DEFAULT 'published',
  `view_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `category_id`, `title`, `slug`, `excerpt`, `content`, `featured_image`, `youtube_url`, `author`, `publish_date`, `meta_title`, `meta_description`, `status`, `view_count`, `created_at`, `updated_at`) VALUES
(2, 3, 'Annual Medical Check Up 2026 at TZU CHI Hospital', 'annual-medical-check-up-2026-at-tzu-chi-hospital', 'Comprehensive health screenings to ensure employee well-being and enforce maritime safety standards.', '<p style=\"text-align: justify;\">As part of its commitment to employee health and workplace safety, PT. Pelayaran Andalas Bahtera Baruna conducted the 2026 Medical Check Up (MCU) for all staff members.</p>\r\n<p style=\"text-align: justify;\">The program took place at TZU CHI Hospital - PIK, North Jakarta, a modern healthcare facility equipped with comprehensive medical services and professional staff. Through thorough examinations, the company ensured that every employee received a complete health evaluation, ranging from basic check-ups to advanced medical screenings as required.</p>\r\n<p style=\"text-align: justify;\">This annual MCU is not merely a routine, but a strategic effort to uphold the company&rsquo;s maritime safety standards and support overall productivity. By maintaining well-monitored health conditions, employees are expected to perform their duties optimally while fostering a safe and sustainable working environment.</p>', 'assets/images/news/1779185004_annual-medical-check-up-2026-a.jpg', NULL, 'ABB Media Team', '2026-04-01', 'Annual Medical Check Up 2026 at TZU CHI Hospital', 'Comprehensive health screenings to ensure employee well-being and enforce maritime safety standards.', 'published', 71, '2026-01-21 08:14:33', '2026-07-20 03:33:52'),
(3, 5, 'Eco-Green Project: Plastic-Free Vessels', 'eco-green-project-plastic-free-vessels', 'Implementing sustainable waste management across the entire fleet.', 'No Content', '../assets/images/news/green-vessel.jpg', NULL, 'ABB Media Team', '2024-05-05', 'Eco-Green Project: Plastic-Free Vessels', 'Implementing sustainable waste management across the entire fleet.', 'published', 55, '2026-01-21 08:14:33', '2026-07-20 03:34:08'),
(4, 3, 'ABB Expands Fleet with Two New Eco-Friendly Vessels', 'abb-new-eco-vessels', 'Adding modern, fuel-efficient ships to strengthen our operational capacity.', '<p>PT. ABB is proud to announce the acquisition of two new eco-friendly vessels, MV Andalas Green and MV Bahtera Eco. These vessels feature state-of-the-art technology that reduces fuel consumption by 25% and lowers carbon emissions significantly.</p>\r\n<p>Key features include:</p>\r\n<ul>\r\n<li>Advanced hull design for better hydrodynamics</li>\r\n<li>Energy-efficient engine systems</li>\r\n<li>Waste heat recovery systems</li>\r\n<li>Ballast water treatment systems</li>\r\n</ul>\r\n<p>This expansion brings our total fleet to 28 vessels, enhancing our capacity to serve clients across Southeast Asia.</p>', '../assets/images/news/new-vessels.jpg', NULL, 'ABB Management', '2024-04-20', 'ABB Expands Fleet with Eco-Friendly Vessels', 'PT. ABB adds two new eco-friendly vessels to its fleet, enhancing operational capacity with modern, sustainable technology.', 'published', 55, '2026-01-22 02:31:05', '2026-07-20 03:34:08'),
(5, 4, 'End Year Dinner 2025 at HATTORI Japanese Shabu & Yakiniku', 'end-year-dinner-2025-at-hattori-japanese-shabu-yakiniku', 'An evening of celebration with green & red attire, gift exchange, and exciting door prizes.', '<p>To close the year on a joyful note, PT. Pelayaran Andalas Bahtera Baruna held its End Year Dinner 2025 at HATTORI Japanese Shabu &amp; Yakiniku, Jakarta Utara. The event brought together employees in a festive atmosphere, with the unique concept of wearing green and red attire to symbolize warmth, harmony, and holiday cheer.</p>\r\n<p>The evening was filled with laughter and camaraderie, highlighted by a gift exchange session that strengthened bonds among colleagues. Excitement peaked during the door prize distribution, where lucky winners brought home special surprises, adding to the spirit of celebration.</p>\r\n<p>This End Year Dinner not only marked the conclusion of 2025 but also reflected ABB&rsquo;s commitment to fostering togetherness, appreciation, and a positive work culture. With shared joy and memorable moments, the company looks forward to entering the new year with renewed energy and unity.</p>', 'assets/images/news/1778839096_end-year-dinner-2025-at-hattor.jpg', NULL, 'ABB Media Team', '2025-12-19', 'End Year Dinner 2025 at HATTORI Japanese Shabu & Yakiniku', 'An evening of celebration with green & red attire, gift exchange, and exciting door prizes.', 'published', 58, '2026-01-22 02:31:05', '2026-07-20 03:33:59'),
(6, 5, 'ABB Partners with Local Communities for Coastal Cleanup', 'abb-coastal-cleanup', 'Joining hands with local communities to protect marine ecosystems.', '<p>PT. ABB, in collaboration with local communities and environmental NGOs, organized a large-scale coastal cleanup program across three locations in Indonesia.</p>\r\n<p>The initiative achieved:</p>\r\n<ul>\r\n<li>Collection of over 2 tons of marine debris</li>\r\n<li>Planting of 500 mangrove seedlings</li>\r\n<li>Environmental education for 300 local students</li>\r\n<li>Installation of waste collection bins in coastal areas</li>\r\n</ul>\r\n<p>This program is part of our ongoing commitment to environmental stewardship and community engagement under our CSR framework.</p>', '../assets/images/news/coastal-cleanup.jpg', NULL, 'CSR Team', '2024-04-10', 'ABB Coastal Cleanup Initiative Protects Marine Environment', 'PT. ABB partners with local communities for coastal cleanup, removing marine debris and promoting environmental awareness.', 'published', 40, '2026-01-22 02:31:05', '2026-07-20 03:34:08'),
(10, 3, 'ABB Achieves ISO 9001:2015 Recertification', 'abb-iso-recertification-2024', 'Quality management system recertification demonstrates commitment to excellence.', '<p>PT. ABB has successfully achieved recertification for ISO 9001:2015 Quality Management System following a comprehensive audit.</p>', '../assets/images/news/iso-certification.jpg', NULL, 'Quality Department', '2024-03-28', 'ABB ISO 9001:2015 Recertification', 'PT. ABB achieves ISO quality management recertification', 'published', 44, '2026-01-22 04:59:45', '2026-07-20 03:34:08'),
(15, 4, 'PABB Annual Company Outing 2026 at The Village Resort Bogor', 'pabb-annual-company-outing-2026-at-the-village-resort-bogor', 'Three days of team building, relaxation, and celebration at the scenic Village Resort Bogor.', '<h2>Strengthening Bonds Through Shared Experiences</h2>\r\n<p>PT. PABB successfully organized its annual company outing from January 16-18, 2026 at The Village Resort Bogor, bringing together over 100 employees from various departments for three days of team building, relaxation, and celebration.</p>\r\n<h3>Event Highlights</h3>\r\n<ul>\r\n<li><strong>Day 1 - Arrival &amp; Welcome Dinner:</strong> Employees arrived at the resort and were welcomed with a traditional Sundanese dinner accompanied by cultural performances.</li>\r\n<li><strong>Day 2 - Team Building Activities:</strong> A full day of competitive games including raft building, obstacle courses, and problem-solving challenges designed to enhance teamwork and communication.</li>\r\n<li><strong>Day 3 - Leadership Sessions &amp; Award Ceremony:</strong> Interactive workshops led by senior management followed by the annual awards ceremony recognizing outstanding employee contributions.</li>\r\n</ul>\r\n<h3>Special Activities</h3>\r\n<p>The resort facilities allowed for various recreational activities:</p>\r\n<ul>\r\n<li>Swimming pool games and water sports</li>\r\n<li>Mountain biking through resort trails</li>\r\n<li>Traditional cooking classes</li>\r\n<li>Bonfire night with live music</li>\r\n</ul>\r\n<h3>Management Message</h3>\r\n<blockquote>\r\n<p>\"This annual gathering is more than just a company event - it\"s an investment in our most valuable asset: our people. The bonds formed here translate directly into better collaboration in the workplace.\"<br>- <strong>Mr. Eldmond Laurenzi, CEO of PT. PABB</strong></p>\r\n</blockquote>\r\n<h3>Employee Feedback</h3>\r\n<p>Participants expressed high satisfaction with the event organization:</p>\r\n<ul>\r\n<li>\"The team building activities really helped break down departmental barriers.\" - <em>Sarah, Finance Department</em></li>\r\n<li>\"Great balance between structured activities and free time to relax.\" - <em>Andi, Operations Team</em></li>\r\n<li>\"The resort setting was perfect for both work and leisure.\" - <em>Dewi, HR Department</em></li>\r\n</ul>\r\n<h3>Looking Ahead</h3>\r\n<p>Based on the success of this year\'s outing, planning has already begun for the 2027 company gathering, with consideration being given to expanding the event to include employee families.</p>\r\n<p><strong>Date:</strong> January 16-18, 2026<br><strong>Location:</strong> The Village Resort, Bogor<br><strong>Participants:</strong> 120 employees across all departments<br><strong>Theme:</strong> \"One Team, One Vision\"</p>', 'assets/images/news/1773119467_abb-annual-company-outing-2026.jpg', NULL, 'ABB Media Team', '2026-01-16', 'PABB Annual Company Outing 2026 at The Village Resort Bogor', 'Three days of team building, relaxation, and celebration at the scenic Village Resort Bogor.', 'published', 92, '2026-01-22 07:22:37', '2026-07-20 03:33:57'),
(16, 4, 'ABB Celebrates Chinese New Year, Ramadan Gathering & 26th Anniversary', 'abb-celebrates-chinese-new-year-ramadan-gathering-26th-anniversary', 'Halal Bihalal Imlek 2577 Kongzili & Ramadan Gathering Celebrating ABB’s 26th Anniversary – 2026', '<h2><strong>Halal Bihalal Imlek 2577 Kongzili &amp; Ramadan Gathering Celebrating ABB&rsquo;s 26th Anniversary &ndash; 2026</strong></h2>\r\n<figure class=\"image image-style-align-left\"><img style=\"aspect-ratio: 800/600;\" src=\"../assets/images/news/inline_1773197621_820.jpg\" width=\"800\" height=\"600\"></figure>\r\n<p><br>PT. Pelayaran Andalas Bahtera Baruna (ABB) held a special evening of celebration and fellowship to commemorate the Chinese New Year of 2577 Kongzili, a Ramadan gathering, and the company&rsquo;s 26th anniversary.</p>\r\n<p>The event took place on Tuesday, March 3, 2026, at Hotel Mercure Jakarta Batavia, bringing together management, employees, and invited partners in a warm atmosphere of appreciation and togetherness.</p>\r\n<p>This meaningful gathering served as a moment to strengthen relationships among ABB&rsquo;s team members and to reflect on the company&rsquo;s journey over the past 26 years. Through shared traditions and cultural harmony, the event highlighted ABB&rsquo;s commitment to unity, mutual respect, and a collaborative working environment.</p>\r\n<p>During the evening, guests enjoyed a series of activities including remarks from company leadership, celebratory moments marking ABB&rsquo;s anniversary milestone, and a communal iftar during the holy month of Ramadan.</p>\r\n<p>The celebration also reflected ABB&rsquo;s appreciation for cultural diversity, embracing both the spirit of Chinese New Year and the values of togetherness during Ramadan.</p>\r\n<p>As ABB continues to grow and expand its maritime operations, events such as this reinforce the company&rsquo;s strong organizational culture &mdash; one built on teamwork, respect, and shared success.</p>\r\n<p>The evening concluded with renewed optimism for the future as ABB moves forward with continued dedication to operational excellence and strong partnerships across the maritime industry.</p>', 'assets/images/news/1773129852_abb-celebrates-chinese-new-yea.jpg', NULL, 'ABB Media Team', '2026-03-03', 'ABB Celebrates Chinese New Year, Ramadan Gathering & 26th Anniversary', 'Halal Bihalal Imlek 2577 Kongzili & Ramadan Gathering Celebrating ABB’s 26th Anniversary – 2026', 'published', 104, '2026-01-22 09:09:38', '2026-07-20 03:33:55');

-- --------------------------------------------------------

--
-- Table structure for table `news_categories`
--

CREATE TABLE `news_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `news_categories`
--

INSERT INTO `news_categories` (`id`, `name`, `slug`, `description`) VALUES
(3, 'Company News', 'company-news', 'Updates and announcements from PT. ABB'),
(4, 'Office Events', 'office-events', 'Events and activities at PT. ABB offices'),
(5, 'CSR & Sustainability', 'csr-sustainability', 'Corporate Social Responsibility and sustainability initiatives');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('home','career') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'home',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'inactive',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `title`, `type`, `content`, `image`, `status`, `created_at`, `updated_at`) VALUES
(1, 'BEWARE OF RECRUITMENT SCAMS!', 'career', 'PT. Pelayaran Andalas Bahtera Baruna (PT. ABB) NEVER requests any fees, payments, or uses third-party travel agents during the recruitment process. All official communications will only come from emails ending in @ptabb.com.', NULL, 'active', '2026-02-23 03:59:10', '2026-02-23 03:59:10'),
(4, '', 'home', '', 'assets/images/popups/1771827747_482.png', 'inactive', '2026-02-23 06:22:27', '2026-03-08 08:57:46'),
(5, '', 'home', '', 'assets/images/popups/1772960266_215.png', 'inactive', '2026-03-08 08:57:46', '2026-04-06 08:55:53');

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `status` enum('published','draft') DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `page_views`
--

CREATE TABLE `page_views` (
  `id` int(11) NOT NULL,
  `page_url` varchar(500) NOT NULL,
  `view_date` date NOT NULL,
  `view_count` int(11) DEFAULT 1,
  `unique_visitors` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `page_views`
--

INSERT INTO `page_views` (`id`, `page_url`, `view_date`, `view_count`, `unique_visitors`, `created_at`, `updated_at`) VALUES
(1, '/abb-website/index.php', '2025-11-10', 21, 1, '2025-11-10 09:21:18', '2025-11-10 10:19:58'),
(14, '/abb-website/pages/about.php', '2025-11-10', 7, 1, '2025-11-10 09:30:34', '2025-11-10 10:19:52'),
(15, '/abb-website/pages/fleet.php', '2025-11-10', 16, 1, '2025-11-10 09:30:47', '2025-11-10 10:20:01'),
(16, '/abb-website/pages/news.php', '2025-11-10', 6, 1, '2025-11-10 09:30:50', '2025-11-10 10:19:55'),
(17, '/abb-website/pages/careers.php', '2025-11-10', 4, 1, '2025-11-10 09:30:58', '2025-11-10 09:37:42'),
(18, '/abb-website/pages/contact.php', '2025-11-10', 2, 1, '2025-11-10 09:31:06', '2025-11-10 09:37:16'),
(49, '/abb-website/pages/fleet.php?search=&capacity=small', '2025-11-10', 1, 1, '2025-11-10 10:19:22', '2025-11-10 10:19:22'),
(58, '/abb-website/index.php', '2025-12-16', 27, 1, '2025-12-16 07:47:42', '2025-12-16 15:46:50'),
(62, '/abb-website/pages/contact.php', '2025-12-16', 7, 1, '2025-12-16 08:01:06', '2025-12-16 15:13:16'),
(63, '/abb-website/pages/careers.php', '2025-12-16', 9, 1, '2025-12-16 08:01:08', '2025-12-16 15:13:29'),
(65, '/abb-website/pages/contact.php?', '2025-12-16', 1, 1, '2025-12-16 08:01:16', '2025-12-16 08:01:16'),
(66, '/abb-website/pages/news.php', '2025-12-16', 14, 1, '2025-12-16 08:01:33', '2025-12-16 15:47:43'),
(68, '/abb-website/pages/about.php', '2025-12-16', 16, 1, '2025-12-16 08:07:05', '2025-12-16 15:46:51'),
(132, '/abb-website/pages/news.php', '2025-12-17', 8, 1, '2025-12-17 02:24:05', '2025-12-17 07:27:53'),
(134, '/abb-website/INDEX.PHP', '2025-12-17', 14, 1, '2025-12-17 02:30:03', '2025-12-17 07:27:48'),
(142, '/abb-website/pages/about.php', '2025-12-17', 4, 1, '2025-12-17 02:30:39', '2025-12-17 07:27:52'),
(144, '/abb-website/pages/careers.php', '2025-12-17', 5, 1, '2025-12-17 02:30:43', '2025-12-17 07:27:54'),
(145, '/abb-website/pages/contact.php', '2025-12-17', 4, 1, '2025-12-17 02:30:47', '2025-12-17 07:27:55'),
(167, '/abb-website/index.php', '2025-12-25', 1, 1, '2025-12-25 08:30:42', '2025-12-25 08:30:42'),
(168, '/abb-website/pages/about.php', '2025-12-25', 1, 1, '2025-12-25 08:30:44', '2025-12-25 08:30:44');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('text','json','boolean') DEFAULT 'text',
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`) VALUES
(1, 'company_name', 'PT. Pelayaran Andalas Bahtera Baruna', 'text', 'Nama perusahaan'),
(2, 'company_abbreviation', 'ABB', 'text', 'Singkatan nama perusahaan'),
(3, 'company_full_name', 'PT. Pelayaran Andalas Bahtera Baruna', 'text', 'Nama lengkap perusahaan'),
(4, 'company_tagline', 'Connecting Markets with Maritime Excellence', 'text', 'Tagline perusahaan'),
(5, 'primary_color', '#1b5983', 'text', 'Warna utama website'),
(6, 'secondary_color', '#743c3a', 'text', 'Warna sekunder website'),
(7, 'logo_url', 'assets/images/logo-abb.jpg', 'text', 'URL logo perusahaan');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('super_admin','hr_admin','crew_admin','pr_admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `last_login`, `created_at`) VALUES
(1, 'superadmin', '$2y$10$3KzHhCIRAdcIyUbigNM22uGIZYIYVZIAO/.nVIvfbYY.QzCt0WQe2', 'IT Super Admin', 'super_admin', '2026-07-20 11:03:56', '2026-03-07 13:38:10'),
(2, 'hrd_admin', '$2y$10$wZvD.mKhS/XnZlneNndn9O18AE2OtU7T2IZiDrNbWRmurjZr1.eeK', 'HR Department', 'hr_admin', '2026-03-10 09:13:07', '2026-03-07 13:38:10'),
(3, 'crew_admin', '$2y$10$1TG/G/NFR28r7z8IV2Zm0.GChfKVC5EMFent2H0LkNlL7ePobh9Qm', 'Crewing Department', 'crew_admin', '2026-03-10 09:12:48', '2026-03-07 13:38:10'),
(4, 'pr_admin', '$2y$10$HLdgn6F32sE49VuBxWkV7.yzepgpxnag7pXmt9TpE0qKIao2flvh6', 'PR Department', 'pr_admin', '2026-03-11 12:06:36', '2026-03-09 02:01:26');

-- --------------------------------------------------------

--
-- Table structure for table `visitor_analytics`
--

CREATE TABLE `visitor_analytics` (
  `id` int(11) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `page_url` varchar(500) DEFAULT NULL,
  `referrer` varchar(500) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `device_type` enum('desktop','tablet','mobile') DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `operating_system` varchar(100) DEFAULT NULL,
  `visit_date` date DEFAULT NULL,
  `visit_time` time DEFAULT NULL,
  `time_spent` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visitor_analytics`
--

INSERT INTO `visitor_analytics` (`id`, `session_id`, `ip_address`, `user_agent`, `page_url`, `referrer`, `country`, `city`, `device_type`, `browser`, `operating_system`, `visit_date`, `visit_time`, `time_spent`, `created_at`) VALUES
(1, '', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 OPR/123.0.0.0', '/abb-website/index.php', 'http://localhost/abb-website/admin/dashboard.php', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-11-10', '16:21:18', 0, '2025-11-10 09:21:18'),
(2, '', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', '/abb-website/index.php', 'http://localhost/abb-website/pages/contact.php', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-16', '14:47:42', 0, '2025-12-16 07:47:42'),
(3, 'c6r7km7lsipdo5jh8n1fv37dnb', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', '/abb-website/index.php', 'http://localhost/abb-website/pages/fleet.php', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-16', '15:38:00', 0, '2025-12-16 08:38:00'),
(4, 'csslqcoe6gde6obbh0lnfc0k5g', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', '/abb-website/index.php', '', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-16', '16:37:52', 0, '2025-12-16 09:37:52'),
(5, 'ekcd41uprems6q9jq8r5rpr5ps', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', '/abb-website/index.php', '', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-16', '16:40:52', 0, '2025-12-16 09:40:52'),
(6, 'hglc5a22b26po3hqorcru41ccr', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '/abb-website/index.php', '', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-16', '16:43:43', 0, '2025-12-16 09:43:43'),
(7, '2edrdqmj68t2clrpimk08r3h7m', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', '/abb-website/index.php', '', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-16', '16:44:06', 0, '2025-12-16 09:44:06'),
(8, 'qj34pb0og7up3mbkimmkg1tbpb', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', '/abb-website/index.php', '', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-16', '17:20:43', 0, '2025-12-16 10:20:43'),
(9, '0tbqpptv14stri1nv37n8rj71j', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', '/abb-website/index.php', '', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-16', '19:00:36', 0, '2025-12-16 12:00:36'),
(10, '0j9mbb3pkqb38lrihu6b6t3uqf', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', '/abb-website/index.php', '', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-16', '22:13:05', 0, '2025-12-16 15:13:05'),
(11, '0j9mbb3pkqb38lrihu6b6t3uqf', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', '/abb-website/pages/news.php', 'http://localhost/abb-website/pages/news.php', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-17', '09:24:05', 0, '2025-12-17 02:24:05'),
(12, 'sorvgh4oli67odda3hbfu1u70t', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', '/abb-website/INDEX.PHP', '', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-17', '09:30:03', 0, '2025-12-17 02:30:03'),
(13, '0ii79t03pvh2tuck0ak7un8hu0', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', '/abb-website/index.php', '', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-17', '09:30:34', 0, '2025-12-17 02:30:34'),
(14, '80l9geld8lg28md0eqaa7hsbn2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', '/abb-website/index.php', 'http://localhost/abb-website/pages/fleet.php', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-17', '10:57:17', 0, '2025-12-17 03:57:17'),
(15, 'c50uqggpg2hqidv5qs6dderla9', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', '/abb-website/index.php', '', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-17', '14:27:48', 0, '2025-12-17 07:27:48'),
(16, '4sa15u08kp6ps6l0ghlnbh4f6o', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '/abb-website/index.php', 'http://localhost/abb-website/pages/fleet.php', NULL, NULL, 'desktop', 'Chrome', NULL, '2025-12-25', '15:30:42', 0, '2025-12-25 08:30:42');

-- --------------------------------------------------------

--
-- Table structure for table `voyage_waypoints`
--

CREATE TABLE `voyage_waypoints` (
  `id` int(11) NOT NULL,
  `fleet_id` int(11) NOT NULL,
  `sequence` int(11) DEFAULT 1,
  `waypoint_type` enum('departure','transit','destination') DEFAULT 'transit',
  `port_name` varchar(100) NOT NULL,
  `country` varchar(50) DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `eta` datetime DEFAULT NULL,
  `etd` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `maritime_route_coordinates` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `voyage_waypoints`
--

INSERT INTO `voyage_waypoints` (`id`, `fleet_id`, `sequence`, `waypoint_type`, `port_name`, `country`, `latitude`, `longitude`, `eta`, `etd`, `notes`, `created_at`, `maritime_route_coordinates`) VALUES
(50, 8, 1, 'departure', 'Port of Shanghai', 'China', 31.23777800, 121.47555600, '2024-03-14 09:00:00', '2024-03-14 21:00:00', NULL, '2026-01-01 16:29:01', NULL),
(51, 8, 2, 'transit', 'Port of Busan', 'South Korea', 35.10777800, 129.04333300, '2024-03-16 12:00:00', '2024-03-17 00:00:00', NULL, '2026-01-01 16:29:01', NULL),
(52, 8, 3, 'destination', 'Port of Tokyo', 'Japan', 35.65833300, 139.74527800, '2024-03-18 08:00:00', '2024-03-19 20:00:00', NULL, '2026-01-01 16:29:01', NULL),
(53, 10, 1, 'departure', 'Port of Colombo', 'Sri Lanka', 6.92707900, 79.86124400, '2024-03-10 09:00:00', '2024-03-10 21:00:00', NULL, '2026-01-01 16:29:01', NULL),
(54, 10, 2, 'destination', 'Port of Mumbai', 'India', 18.93586400, 72.83499500, '2024-03-12 12:00:00', '2024-03-13 00:00:00', NULL, '2026-01-01 16:29:01', NULL),
(55, 11, 1, 'departure', 'Port of Sydney', 'Australia', -33.86882000, 151.20929000, '2024-03-20 08:00:00', '2024-03-20 20:00:00', NULL, '2026-01-01 16:29:01', NULL),
(56, 11, 2, 'destination', 'Port of Melbourne', 'Australia', -37.81362800, 144.96305800, '2024-03-22 10:00:00', '2024-03-23 06:00:00', NULL, '2026-01-01 16:29:01', NULL),
(57, 15, 1, 'transit', 'Port of Colombo', 'Sri Lanka', 6.92707900, 79.86124400, NULL, NULL, '', '2026-01-03 09:17:55', NULL),
(58, 15, 2, 'destination', 'Port of Shanghai', 'China', 31.23777800, 121.47555600, NULL, NULL, '', '2026-01-03 09:18:16', NULL),
(60, 7, 1, 'departure', 'Port of Shanghai', 'China', 31.23777800, 121.47555600, NULL, NULL, '', '2026-01-04 06:21:03', NULL),
(61, 7, 2, 'transit', 'Port of Colombo', 'Sri Lanka', 6.92707900, 79.86124400, NULL, NULL, '', '2026-01-04 06:21:29', NULL),
(62, 7, 3, 'destination', 'Port of Busan', 'South Korea', 35.10777800, 129.04333300, NULL, NULL, '', '2026-01-04 06:21:55', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `careers`
--
ALTER TABLE `careers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_info`
--
ALTER TABLE `contact_info`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fleets`
--
ALTER TABLE `fleets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `imo_number` (`imo_number`),
  ADD KEY `category_id` (`category_id`);
ALTER TABLE `fleets` ADD FULLTEXT KEY `operational_area` (`operational_area`);

--
-- Indexes for table `fleet_categories`
--
ALTER TABLE `fleet_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `news_categories`
--
ALTER TABLE `news_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `page_views`
--
ALTER TABLE `page_views`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_page_date` (`page_url`,`view_date`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `visitor_analytics`
--
ALTER TABLE `visitor_analytics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_visit_date` (`visit_date`),
  ADD KEY `idx_device_type` (`device_type`);

--
-- Indexes for table `voyage_waypoints`
--
ALTER TABLE `voyage_waypoints`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fleet_id` (`fleet_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `careers`
--
ALTER TABLE `careers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_info`
--
ALTER TABLE `contact_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `fleets`
--
ALTER TABLE `fleets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `fleet_categories`
--
ALTER TABLE `fleet_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `news_categories`
--
ALTER TABLE `news_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `page_views`
--
ALTER TABLE `page_views`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=169;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `visitor_analytics`
--
ALTER TABLE `visitor_analytics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `voyage_waypoints`
--
ALTER TABLE `voyage_waypoints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `fleets`
--
ALTER TABLE `fleets`
  ADD CONSTRAINT `fleets_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `fleet_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `news`
--
ALTER TABLE `news`
  ADD CONSTRAINT `news_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `voyage_waypoints`
--
ALTER TABLE `voyage_waypoints`
  ADD CONSTRAINT `voyage_waypoints_ibfk_1` FOREIGN KEY (`fleet_id`) REFERENCES `fleets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
