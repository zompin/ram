CREATE TABLE IF NOT EXISTS users (
	id INT UNSIGNED AUTO_INCREMENT,
	login VARCHAR (40),
	password VARCHAR (40),
	PRIMARY KEY (id),
	UNIQUE KEY (login)
);

CREATE TABLE IF NOT EXISTS cards (
	id INT UNSIGNED AUTO_INCREMENT,
	question TEXT (1000),
	answer TEXT (1000),
	last_update VARCHAR (10),
	`repeat` TINYINT DEFAULT 0,
	user INT UNSIGNED,
	category INT UNSIGNED,
	PRIMARY KEY (id),
	FOREIGN KEY (user) REFERENCES users (id) ON DELETE CASCADE,
	FOREIGN KEY (category) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
	id INT UNSIGNED AUTO_INCREMENT,
	name VARCHAR (255),
	type TINYINT,
	user INT UNSIGNED,
	PRIMARY KEY (id),
	FOREIGN KEY (user) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dictionary (
	id INT UNSIGNED AUTO_INCREMENT,
	question TEXT (1000),
	answer TEXT (1000),
	category INT UNSIGNED,
	PRIMARY KEY (id),
	FOREIGN KEY (category) REFERENCES categories (id) ON DELETE CASCADE
);