-- phpMyAdmin SQL Dump
-- version 4.8.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 08. Feb 2020 um 15:11
-- Server-Version: 10.1.32-MariaDB
-- PHP-Version: 7.2.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `recommendation`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `vcaartist`
--

CREATE TABLE `vcaartist` (
  `vcaId` varchar(200) NOT NULL,
  `artistId` varchar(200) NOT NULL,
  `vcaType` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `vcaartist`
--

INSERT INTO `vcaartist` (`vcaId`, `artistId`, `vcaType`) VALUES
('11', '4Yttlv9ndGjCDCVLqM7ACq', 'ACTION'),
('1', '4Yttlv9ndGjCDCVLqM7ACq', 'USER'),
('11', '75ctWsRuGXmxMxnFPkuEwA', 'ACTION'),
('11', '4WZGDpNwrC0vNQyl9QzF7d', 'ACTION'),
('11', '08ao8gzTHBtNf5Laf9jjwR', 'ACTION'),
('11', '3q7HBObVc0L8jNeTe5Gofh', 'ACTION'),
('11', '0NbfKEOTQCcwd6o7wSDOHI', 'ACTION'),
('11', '18ISxWwWjV6rPLoVCXf1dz', 'ACTION'),
('11', '6NG0bF3tpQuQOixbzFPLIv', 'ACTION'),
('1', '6NG0bF3tpQuQOixbzFPLIv', 'USER'),
('1', '08ao8gzTHBtNf5Laf9jjwR', 'USER'),
('1', '1XKjtpH5P81gpOXDB91IEB', 'USER'),
('1', '0wwDZj4zgZORjTGhTujAKx', 'USER'),
('1', '13bDjug9N0pyv3ZUINjkDV', 'USER'),
('1', '18ISxWwWjV6rPLoVCXf1dz', 'USER'),
('22', '6wWVKhxIU2cEi0K81v7HvP', 'USER'),
('22', '65A714FqhSPjoFZeffQbTv', 'USER'),
('22', '2mZITUvfEwrKlksoGpHTsM', 'USER'),
('2', '6wWVKhxIU2cEi0K81v7HvP', 'ACTION'),
('2', '79bxUQsBIXO8nVLB9fYKf7', 'ACTION'),
('2', '05fG473iIaoy82BF1aGhL8', 'ACTION'),
('22', '1KiNsBHJte2NL9dNjiw1ye', 'USER'),
('22', '4ZtBx6rfSEXaqAgUWjCip6', 'USER'),
('22', '6clm0KQWlafhuC1UAb7eOX', 'USER'),
('22', '6wWVKhxIU2cEi0K81v7HvP', 'ACTION'),
('2', '4nBVmMKK89dAUaanGPBgpY', 'USER'),
('2', '7jy0nL3F5ehHJxXYMBImkk', 'USER'),
('2', '47oUEgg0OXCUJUHUUzd7TH', 'USER'),
('2', '4uJ0Z35toYgdlrDGF4eFY2', 'USER'),
('2', '2LbKyFADvaSJWHJI9v2UhA', 'USER'),
('2', '6VptBj8FGwldnfkvDQE8VU', 'USER'),
('999', '65A714FqhSPjoFZeffQbTv', 'USER'),
('999', '2mZITUvfEwrKlksoGpHTsM', 'USER'),
('999', '2mZITUvfEwrKlksoGpHTsM', 'USER'),
('999', '2mZITUvfEwrKlksoGpHTsM', 'USER'),
('999', '7EyzyrMNgqiK8bMrbkOT9l', 'USER'),
('999', '6wWVKhxIU2cEi0K81v7HvP', 'USER'),
('999', '4Yttlv9ndGjCDCVLqM7ACq', 'USER');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
