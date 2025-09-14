-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 14. Sep 2025 um 01:37
-- Server-Version: 10.4.32-MariaDB
-- PHP-Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `zeiterfassung`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('employee','admin') DEFAULT 'employee',
  `nfc_tag` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `name`, `role`, `nfc_tag`, `password_hash`, `created_at`) VALUES
(1, 'Nawal Kayal', 'employee', '123', '$2b$10$aPLDWTAGZKJG7Q4VF5MnjOM9bDbXjN1jLJkH8EETOQnav93Z9zsZO', '2025-09-13 21:38:11'),
(2, 'Ahmad Alalan', 'employee', '234', '$2b$10$aPLDWTAGZKJG7Q4VF5MnjOM9bDbXjN1jLJkH8EETOQnav93Z9zsZO', '2025-09-13 21:38:52'),
(3, 'Mohammad Shabiyyah', 'admin', '345', '$2b$10$aPLDWTAGZKJG7Q4VF5MnjOM9bDbXjN1jLJkH8EETOQnav93Z9zsZO', '2025-09-13 21:39:31'),
(7, 'admin', 'admin', NULL, '$2b$10$aPLDWTAGZKJG7Q4VF5MnjOM9bDbXjN1jLJkH8EETOQnav93Z9zsZO', '2025-09-13 23:26:42');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `work_sessions`
--

CREATE TABLE `work_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `work_sessions`
--

INSERT INTO `work_sessions` (`id`, `user_id`, `start_time`, `end_time`, `created_at`) VALUES
(1, 1, '2025-09-13 23:40:33', '2025-09-13 23:41:11', '2025-09-13 21:40:33'),
(2, 7, '2025-09-14 01:26:55', '2025-09-14 01:26:57', '2025-09-13 23:26:55'),
(3, 7, '2025-09-14 01:30:18', '2025-09-14 01:30:43', '2025-09-13 23:30:18'),
(4, 7, '2025-09-14 01:30:45', '2025-09-14 01:30:47', '2025-09-13 23:30:45'),
(5, 3, '2025-09-14 01:33:19', NULL, '2025-09-13 23:33:19'),
(6, 1, '2025-09-14 01:34:20', '2025-09-14 01:34:24', '2025-09-13 23:34:20'),
(7, 2, '2025-09-14 01:35:13', '2025-09-14 01:35:15', '2025-09-13 23:35:13'),
(8, 3, '2025-09-14 01:36:41', '2025-09-14 01:36:45', '2025-09-13 23:36:41');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nfc_tag` (`nfc_tag`);

--
-- Indizes für die Tabelle `work_sessions`
--
ALTER TABLE `work_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT für Tabelle `work_sessions`
--
ALTER TABLE `work_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `work_sessions`
--
ALTER TABLE `work_sessions`
  ADD CONSTRAINT `work_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
