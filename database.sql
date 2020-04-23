-- Adminer 4.7.1 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';



DROP TABLE IF EXISTS `bidders`;
CREATE TABLE `bidders` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  `address` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  `avatar` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `birthday` timestamp NULL DEFAULT NULL,
  `password` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0: not verified, 1: verified, 2: blocked',
  `facebook_id` varchar(191) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bidders_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `bidders` (`name`, `address`, `email`, `avatar`, `birthday`, `password`, `status`) VALUES
('Son', 'HCM', 'abc@gmail.com', 'images/avatar/son.jpg', '1999-2-28', '$2a$10$/yNLZTb7N6xzo2nuOV/gVejT865oN9C2HDsNEfepJLVeimdiBBVAO', '1');

DROP TABLE IF EXISTS `sellers`;
CREATE TABLE `sellers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `seller_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `expiry_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bidders_seller_id_foreign` (`seller_id`),
  CONSTRAINT `bidders_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `bidders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `sellers` (`seller_id`, `created_at`, `expiry_date`) VALUES
(1, '2019-12-4 03:05:09',  '2019-12-4 03:05:09');

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT ,
  `seller_id` int(10) unsigned NOT NULL,
  `name` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  `price_start` int(11) DEFAULT NULL,
  `price_end` int(11) DEFAULT NULL,
  `buy_now` int(11) DEFAULT NULL,
  `step` int(11) DEFAULT NULL,
  `auto_renew` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0: not, 1: yes',
  `description` varchar(1000) COLLATE utf8_unicode_ci NOT NULL,
  `duration` timestamp NULL DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0: fail, 1: success, 2: action',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sellers_seller_id_foreign` (`seller_id`),
  CONSTRAINT `sellers_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`seller_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `products` (`seller_id` ,`name`, `price_start`, `price_end`, `buy_now`, `step`, `auto_renew`, `description`, `duration`,`status`, `created_at`) VALUES
(1,'Asus VivoBook X509F' , 10000000, 20000000, 20000000 ,100000 , '1', 'Asus Vivobook X509FJ (EJ133T) có cấu hình mạnh mẽ bao gồm bộ xử lý Intel Core i7 8565U thế hệ thứ 8, RAM 8 được cài sẵn Windown 10, máy có thể đáp ứng tốt nhu cầu học tập, giải trí, đồ họa, văn phòng như Microsoft Office, Photoshop, Adobe Illustrator giúp bạn có thể hoàn thành mọi công việc nhanh chóng và hiệu quả.', '2019-12-4 03:05:09' ,'1', '2019-12-4 03:05:09'),
(1,'Asus VivoBook X409U' , 10000000, 20000000, 20000000 ,100000 , '1', 'Laptop Asus VivoBook X409U (EK205T) là chiếc laptop có thiết kế nhỏ gọn, hợp thời trang, màn hình chân thực, sắc nét cùng cấu hình ổn định đáp ứng nhu cầu học tập, làm việc văn phòng.  Đây là một sự lựa chọn dành cho sinh viên nhân viên văn phòng với nhu cầu học tập, văn phòng và giải trí cơ bản.', '2019-12-4 03:05:09' ,'1', '2019-12-4 03:05:09'),
(1,'Asus VivoBook X409FA' , 10000000, 20000000, 20000000 ,100000 , '1', 'Nếu bạn đang tìm kiếm một chiếc laptop học tập văn phòng có mức giá rẻ nhưng vẫn có một cấu hình đủ để giải quyết công việc cũng như giải trí hằng ngày thì ASUS VivoBook X409FA i3 (EK306T) chính là một lựa chọn hợp lí. Máy có kiểu dáng gọn nhẹ, hài hòa, hiệu năng ổn định và nhiều tính năng hữu ích.', '2019-12-4 03:05:09' ,'1', '2019-12-4 03:05:09'),




DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `image` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_images_product_id_foreign` (`product_id`),
  CONSTRAINT `product_images_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `product_images` (`product_id`, `image`) VALUES
(1 , '/images/product/small-size/1.jpg');

DROP TABLE IF EXISTS `descriptions`;
CREATE TABLE `descriptions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `descriptions_product_id_foreign` (`product_id`),
  CONSTRAINT `descriptions_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `descriptions` (`product_id`, `description`, `created_at`) VALUES
(1, 'description', '2019-12-4 03:05:09');

DROP TABLE IF EXISTS `history_auctions`;
CREATE TABLE `history_auctions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `bidder_id` int(10) unsigned NOT NULL,
  `price` int(11) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `status`  tinyint(4) NOT NULL DEFAULT '0',
  `price_end` int(11) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `history_auctions_product_id_foreign` (`product_id`),
  KEY `history_auctions_bidder_id_foreign` (`bidder_id`),
  CONSTRAINT `history_auctions_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `history_bidders_product_id_foreign` FOREIGN KEY (`bidder_id`) REFERENCES `bidders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `history_auctions` (`product_id`, `bidder_id`, `price`, `created_at`) VALUES
(1, 1, 16000000, '2019-12-4 03:05:09');

DROP TABLE IF EXISTS `bidder_reviews`;
CREATE TABLE `bidder_reviews` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `seller_id` int(10) unsigned NOT NULL,
  `love` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0: dislike, 1: like',
  `review` text COLLATE utf8_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bidder_reviews_product_id_foreign` (`product_id`),
  CONSTRAINT `bidder_reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `bidder_reviews` (`product_id`, `seller_id`, `love`, `review`, `created_at`) VALUES
(1, 1, 1, 'good', '2019-12-4 03:05:09');

DROP TABLE IF EXISTS `seller_reviews`;
CREATE TABLE `seller_reviews` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `bidder_id` int(10) unsigned NOT NULL,
  `love` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0: dislike, 1: like',
  `review` text COLLATE utf8_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `seller_reviews_product_id_foreign` (`product_id`),
  CONSTRAINT `seller_reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `seller_reviews` (`product_id`, `bidder_id`, `love`, `review`, `created_at`) VALUES
(1, 1, 1, 'good', '2019-12-4 03:05:09');


DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  `cate_parent` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categories_cate_parent_foreign` (`cate_parent`),
  CONSTRAINT `categories_cate_parent_foreign` FOREIGN KEY (`cate_parent`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `categories` (`name`, `cate_parent`) VALUES
('Laptop', NULL),
('Mobile Phone', NULL),
('Tablet', NULL),
('ASUS', 1),
('HP', 1),
('Acer', 1),
('Macbook', 1),
('MSI', 1),
('Iphone', 2),
('Huwei', 2),
('Samsung', 2),
('Oppo', 2),
('Samsung', 3),
('Ipad', 3),
('Lenovo', 3);


DROP TABLE IF EXISTS `product_categories`;
CREATE TABLE `product_categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `category_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `products_product_id_product_categories_foreign` (`product_id`),
  KEY `categories_category_id_product_categories_foreign` (`category_id`),
  CONSTRAINT `products_product_id_product_categories_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `categories_category_id_product_categories_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `product_categories` (`product_id`, `category_id`) VALUES
(1,1);

DROP TABLE IF EXISTS `sliders`;
CREATE TABLE `sliders` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `image` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `status`  tinyint(4) NOT NULL DEFAULT '0' COMMENT '0: unactivity, 1: activity',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `sliders` (`image`, `status`) VALUES
('/images/avatar/son.jpg', 1);

DROP TABLE IF EXISTS `blocked_auctions`;
CREATE TABLE `blocked_auctions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `bidder_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `products_product_id_blocked_auctions_foreign` (`product_id`),
  KEY `bidders_bidder_id_blocked_auctions_foreign` (`bidder_id`),
  CONSTRAINT `products_product_id_blocked_auctions_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `bidders_bidder_id_blocked_auctions_foreign` FOREIGN KEY (`bidder_id`) REFERENCES `bidders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `blocked_auctions` (`product_id`, `bidder_id`) VALUES
(1,1);

DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  `address` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  `avatar` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `birthday` timestamp NULL DEFAULT NULL,
  `password` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `admins` (`name`, `address`, `email`, `avatar`, `birthday`,`password`) VALUES
('son', 'HCM', 'son@gmail.com','images/avatar/son.jpg', '2019-12-4 03:05:09', '$2a$10$/yNLZTb7N6xzo2nuOV/gVejT865oN9C2HDsNEfepJLVeimdiBBVAO');

DROP TABLE IF EXISTS `admin_managers`;
CREATE TABLE `admin_managers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  `icon` varchar(20) COLLATE utf8_unicode_ci,
  `parent_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `admin_managers_parent_id_foreign` (`parent_id`),
  CONSTRAINT `admin_managers_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `admin_managers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `admin_managers` (`name`, `icon`, `parent_id`) VALUES
('Dashboard', 'icon-speedometer',  NULL),
('Product', 'ti-layout-grid2', NULL),
('User','ti-user', NULL),
('Category', 'ti-palette', NULL),
('Action', NULL, 2),
('Success', NULL, 2),
('Fail', NULL, 2),
('Seller', NULL, 3),
('Bidder', NULL, 3),
('Upgrade Request', NULL, 3);


DROP TABLE IF EXISTS `bidder_managers`;
CREATE TABLE `bidder_managers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  `icon` varchar(20) COLLATE utf8_unicode_ci,
  `url`longtext COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `bidder_managers` (`name`, `icon`, `url`) VALUES
('Person Information', 'fa fa-user', '/profile'),
('Cart', 'fa fa-shopping-cart', '/bidder/wishlist');


DROP TABLE IF EXISTS `seller_managers`;
CREATE TABLE `seller_managers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  `icon` varchar(20) COLLATE utf8_unicode_ci,
  `url`longtext COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `seller_managers` (`name`, `icon`, `url`) VALUES
('Product selling', 'fa fa-legal', '/seller/remaining'),
('Product Success', 'fa fa-check','/seller/end'),
('Post Product', 'fa fa-plus', '/seller/add');

DROP TABLE IF EXISTS `upgrade_requests`;
CREATE TABLE `upgrade_requests` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `bidder_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `upgrade_requests_bidder_id_foreign` (`bidder_id`),
  CONSTRAINT `upgrade_requests_bidder_id_foreign` FOREIGN KEY (`bidder_id`) REFERENCES `bidders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `wish_lists`;
CREATE TABLE `wish_lists` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `bidder_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `products_product_id_wish_list_foreign` (`product_id`),
  KEY `bidders_bidder_id_wish_list_foreign` (`bidder_id`),
  CONSTRAINT `products_product_id_wish_list_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `bidders_bidder_id_wish_list_foreign` FOREIGN KEY (`bidder_id`) REFERENCES `bidders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;






































