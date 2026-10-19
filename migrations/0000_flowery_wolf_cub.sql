CREATE TABLE `product_interest` (
	`day` text NOT NULL,
	`product` text NOT NULL,
	`event` text NOT NULL,
	`visit` text NOT NULL,
	PRIMARY KEY(`day`, `product`, `event`, `visit`)
);
