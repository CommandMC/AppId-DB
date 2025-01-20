CREATE DATABASE IF NOT EXISTS `appid_db`;
USE `appid_db`;

CREATE TABLE IF NOT EXISTS `t_games` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `title` varchar(50) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `t_platforms` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `slug` varchar(20) NOT NULL,
    `name` varchar(50) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `t_platform_ids` (
    `game_id` int(10) unsigned NOT NULL,
    `platform_id` int(10) unsigned NOT NULL,
    `id_on_platform` varchar(50) NOT NULL,
    PRIMARY KEY (`game_id`,`platform_id`,`id_on_platform`),
    KEY `FK_t_platform_ids_t_platforms` (`platform_id`),
    CONSTRAINT `FK_t_platform_ids_t_games` FOREIGN KEY (`game_id`) REFERENCES `t_games` (`id`),
    CONSTRAINT `FK_t_platform_ids_t_platforms` FOREIGN KEY (`platform_id`) REFERENCES `t_platforms` (`id`)
);
