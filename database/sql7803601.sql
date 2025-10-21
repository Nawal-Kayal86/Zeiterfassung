-- =======================================================
-- Fertiger SQL-Dump für FreeSQLDatabase.com
-- Österreich/Wien Zeitzone (UTC+2 für Oktober)
-- =======================================================

-- Tabellen löschen, falls sie existieren
DROP TABLE IF EXISTS `work_sessions`;
DROP TABLE IF EXISTS `workflow`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `logs`;
DROP TABLE IF EXISTS `departments`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- Zeitzone für Wien (kompatibel mit FreeSQLDatabase)
SET time_zone = '+02:00';

-- Zeichensatz setzen
SET NAMES utf8mb4 COLLATE utf8mb4_general_ci;

-- =======================================================
-- Tabelle: departments
-- =======================================================
CREATE TABLE `departments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `departments` (`id`, `name`) VALUES
(1, 'IT'),
(2, 'HR'),
(3, 'Einkauf'),
(5, 'Trainer'),
(6, 'Öko Bosoter');

-- =======================================================
-- Tabelle: logs
-- =======================================================
CREATE TABLE `logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `message` TEXT,
  `level` ENUM('INFO','WARN','ERROR') DEFAULT 'INFO',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =======================================================
-- Tabelle: users
-- =======================================================
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `role` ENUM('user','admin') DEFAULT 'user',
  `department` VARCHAR(100) DEFAULT NULL,
  `nfc_tag` VARCHAR(50) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `nfc_tag` (`nfc_tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` 
(`id`, `name`, `email`, `role`, `department`, `nfc_tag`, `password_hash`, `created_at`) VALUES
(2, 'shabiyyah', 'm.shabiyyah@bfi.wien', 'admin', 'Einkauf', '1234567',
 '$2b$10$yin0y5F8pZ7hLuneo923geuo48AQUEeksw74N88LoxzEDj6faI5hW', 
 '2025-10-18 22:08:22');

-- =======================================================
-- Tabelle: workflow
-- =======================================================
CREATE TABLE `workflow` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `task` VARCHAR(255) NOT NULL,
  `status` ENUM('open','done') DEFAULT 'open',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `userid` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `workflow_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `workflow` (`id`, `task`, `status`, `created_at`, `userid`) VALUES
(1, 'asd', 'open', '2025-10-18 16:32:29', 2),
(2, 'm', 'open', '2025-10-18 19:51:41', 2),
(3, 'Neu', 'open', '2025-10-20 19:14:00', 2),
(4, 'shaWorkflow', 'open', '2025-10-20 19:16:21', 2);

-- =======================================================
-- Tabelle: work_sessions
-- =======================================================
CREATE TABLE `work_sessions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `start_time` DATETIME DEFAULT NULL,
  `end_time` DATETIME DEFAULT NULL,
  `date_today` DATE DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `work_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
