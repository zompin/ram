CREATE TABLE IF NOT EXISTS cards (
	id INT UNSIGNED AUTO_INCREMENT,
	question TEXT(1000),
	answer TEXT(1000),
	last_update varchar(10),
	`repeat` TINYINT DEFAULT 0,
	PRIMARY KEY (id)
);