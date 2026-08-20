-- Database: `abbrnptabb_ptabb`
-- Clean Core Domain ERD/UML Schema (Excluding Laravel framework infrastructure tables)
-- Prepared for ERD / UML diagram generation

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','hr_admin','crew_admin','pr_admin') NOT NULL DEFAULT 'super_admin',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `fleet_categories`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `fleet_categories` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `fleets`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `fleets` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ship_name` varchar(255) NOT NULL,
  `imo_number` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `particulars_data` json DEFAULT NULL,
  `build_year` int(11) DEFAULT NULL,
  `dwt` decimal(10,2) DEFAULT NULL,
  `capacity` decimal(10,2) DEFAULT NULL,
  `status` enum('in_service','available','in_docking','maintenance','chartered') NOT NULL DEFAULT 'in_service',
  `operational_area` varchar(255) DEFAULT NULL,
  `voyage_route_image` varchar(255) DEFAULT NULL,
  `ship_particular_pdf` varchar(255) DEFAULT NULL,
  `voyage_description` text DEFAULT NULL,
  `featured_image` varchar(255) DEFAULT NULL,
  `flag` varchar(100) DEFAULT NULL,
  `port_of_registry` varchar(100) DEFAULT NULL,
  `call_sign` varchar(50) DEFAULT NULL,
  `mmsi` varchar(50) DEFAULT NULL,
  `hull_no` varchar(50) DEFAULT NULL,
  `deadweight` decimal(10,2) DEFAULT NULL,
  `classification_society` varchar(100) DEFAULT NULL,
  `gross_tonnage` decimal(10,2) DEFAULT NULL,
  `net_tonnage` decimal(10,2) DEFAULT NULL,
  `light_ship` decimal(10,2) DEFAULT NULL,
  `vessel_type` varchar(100) DEFAULT NULL,
  `loa` decimal(8,2) DEFAULT NULL,
  `lbp` decimal(8,2) DEFAULT NULL,
  `breadth` decimal(8,2) DEFAULT NULL,
  `depth` decimal(8,2) DEFAULT NULL,
  `summer_draft` decimal(8,2) DEFAULT NULL,
  `speed` decimal(5,2) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fleets_imo_number_unique` (`imo_number`),
  KEY `fleets_category_id_foreign` (`category_id`),
  FULLTEXT KEY `fleets_fulltext` (`ship_name`,`description`,`operational_area`,`vessel_type`),
  CONSTRAINT `fleets_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `fleet_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `voyage_waypoints`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `voyage_waypoints` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `fleet_id` bigint(20) UNSIGNED NOT NULL,
  `sequence` int(11) NOT NULL DEFAULT 1,
  `waypoint_type` enum('departure','transit','destination') NOT NULL DEFAULT 'transit',
  `port_name` varchar(100) NOT NULL,
  `country` varchar(50) DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `eta` datetime DEFAULT NULL,
  `etd` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `maritime_route_coordinates` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `voyage_waypoints_fleet_id_foreign` (`fleet_id`),
  CONSTRAINT `voyage_waypoints_fleet_id_foreign` FOREIGN KEY (`fleet_id`) REFERENCES `fleets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `careers`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `careers` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `author_id` bigint(20) UNSIGNED DEFAULT NULL,
  `position` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'corporate',
  `location` varchar(100) DEFAULT NULL,
  `employment_type` enum('fulltime','contract','internship') NOT NULL DEFAULT 'fulltime',
  `description` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `responsibilities` text DEFAULT NULL,
  `status` enum('open','closed','expired') NOT NULL DEFAULT 'open',
  `application_deadline` date DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `careers_author_id_foreign` (`author_id`),
  FULLTEXT KEY `careers_fulltext` (`position`,`department`,`location`,`description`,`requirements`),
  CONSTRAINT `careers_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `news_categories`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `news_categories` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `news_categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `news`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `news` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
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
  `status` enum('published','draft') NOT NULL DEFAULT 'published',
  `view_count` int(11) NOT NULL DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `news_slug_unique` (`slug`),
  KEY `news_category_id_foreign` (`category_id`),
  FULLTEXT KEY `news_fulltext` (`title`,`excerpt`,`content`),
  CONSTRAINT `news_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `contacts`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `contacts` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `resume_path` varchar(255) DEFAULT NULL,
  `department` enum('commercial','operation','hrd','crew','general') NOT NULL DEFAULT 'general',
  `status` enum('new','read','replied') NOT NULL DEFAULT 'new',
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `contact_info`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `contact_info` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` enum('office','phone','email','social') NOT NULL,
  `label` varchar(100) NOT NULL,
  `value` varchar(255) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `clients`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `clients` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` enum('international','domestic') NOT NULL DEFAULT 'international',
  `country` varchar(100) DEFAULT NULL,
  `logo` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `milestones`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `milestones` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `year` varchar(20) NOT NULL,
  `milestone` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `notifications`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `type` enum('home','career','celebration') NOT NULL DEFAULT 'home',
  `content` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('active','inactive','scheduled') NOT NULL DEFAULT 'inactive',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `branches`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `branches` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `short_desc` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `map_url` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `branches_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `pages`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `pages` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `status` enum('published','draft') NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `page_views`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `page_views` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `page_url` varchar(500) NOT NULL,
  `route_name` varchar(100) DEFAULT NULL,
  `view_date` date NOT NULL,
  `view_count` int(11) NOT NULL DEFAULT 1,
  `unique_visitors` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_page_date` (`page_url`(255),`view_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `settings`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `settings` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('text','json','boolean') NOT NULL DEFAULT 'text',
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_setting_key_unique` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `visitor_analytics`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `visitor_analytics` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `page_url` varchar(500) DEFAULT NULL,
  `route_name` varchar(100) DEFAULT NULL,
  `referrer` varchar(500) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `device_type` enum('desktop','tablet','mobile') DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `operating_system` varchar(100) DEFAULT NULL,
  `visit_date` date DEFAULT NULL,
  `visit_time` time DEFAULT NULL,
  `time_spent` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `visitor_analytics_visit_date_index` (`visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
