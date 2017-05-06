<?php
	include $_SERVER['DOCUMENT_ROOT'] . '/config.php';

	define(SECONDS_PER_MINUTE, 	60);
	define(SECONDS_PER_HOUR, 	3600);
	define(SECONDS_PER_DAY, 	86400);
	define(SECONDS_PER_MONTH, 	2592000);
	define(USER_CATEGORY, 		0);
	define(DICTIONARY_CATEGORY, 1);

	function serverError() {
		echo json_encode(array('error' => 'server_error'));
	}

	function mysqlLink() {
		global $db;
		return new mysqli($db['host'], $db['user'], $db['pass'], $db['name']);
	}

	function addCard() {
		$mysqli 	= mysqlLink();
		$question 	= $_POST['question'];
		$answer 	= $_POST['answer'];

		if (mysqli_connect_errno()) {
			serverError();
		} else {
			$mysqli->set_charset('utf8');
			$question 	= $mysqli->real_escape_string($question);
			$answer 	= $mysqli->real_escape_string($answer);
			$lastUpdate	= time();
			$user 		= $_SESSION['user']['id'] * 1;
			$query 		= "INSERT INTO cards SET question='$question', answer='$answer', last_update='$lastUpdate', user=$user;";
			$res 		= $mysqli->query($query);

			if ($res) {
				echo json_encode(true);
			} else {
				serverError();
			}
		}
	}

	function resetCard() {
		$mysqli 	= mysqlLink();
		$id 		= $_POST['id'] * 1;

		if (mysqli_connect_errno()) {
			serverError();
		} else {
			$mysqli->set_charset('utf8');
			$user = $_SESSION['user']['id'] * 1;
			$query = "UPDATE `cards` SET `repeat` = 0 WHERE `id` = $id AND `user` = $user LIMIT 1;";
			$res = $mysqli->query($query);

			if ($res) {
				echo json_encode(true);
			} else {
				serverError();
			}
		}
	}

	function getAllCards() {
		$mysqli = mysqlLink();
		$cards 	= array();
		$res 	= false;
		$user 	= $_SESSION['user']['id'] * 1;

		if ($mysqli->connect_errno) {
			serverError();
		} else {
			$mysqli->set_charset('utf8');
			$query = "SELECT `id`, `question`, `answer`, `repeat` FROM cards WHERE user=$user ORDER BY `repeat`;";
			$res = $mysqli->query($query);
		}

		if ($res) {
			while ($card = $res->fetch_assoc()) {
				array_push($cards, $card);
			}

			echo json_encode($cards);
		} else {
			serverError();
			echo $mysqli->error;
		}
	}

	function getCardsForRepeat() {
		$mysqli = mysqlLink();
		$cards 	= array();
		$res 	= false;
		$now	= time();
		$user 	= $_SESSION['user']['id'] * 1;

		if (mysqli_connect_errno()) {
			serverError();
		} else {
			$mysqli->set_charset('utf8');
			$m20 	= SECONDS_PER_MINUTE * 20;
			$h8		= SECONDS_PER_HOUR * 8;
			$d1		= SECONDS_PER_DAY;
			$w2 	= SECONDS_PER_DAY * 14;
			$m2 	= SECONDS_PER_MONTH * 2;
			$query 	= "
				(SELECT `id`, `question`, `answer`, `repeat` FROM `cards` WHERE `repeat` = 0 AND user = $user)
				UNION
				(SELECT `id`, `question`, `answer`, `repeat` FROM `cards` WHERE `repeat` = 1 AND last_update < $now - $m20 AND user = $user)
				UNION
				(SELECT `id`, `question`, `answer`, `repeat` FROM `cards` WHERE `repeat` = 2 AND last_update < $now - $h8 AND user = $user)
				UNION
				(SELECT `id`, question, `answer`, `repeat` FROM `cards` WHERE `repeat` = 3 AND last_update < $now - $d1 AND user = $user)
				UNION
				(SELECT `id`, `question`, `answer`, `repeat` FROM `cards` WHERE `repeat` = 4 AND last_update < $now - $w2 AND user = $user)
				UNION
				(SELECT `id`, `question`, `answer`, `repeat` FROM `cards` WHERE `repeat` = 5 AND last_update < $now - $m2 AND user = $user)
			;";
			$res = $mysqli->query($query);
		}

		if ($res) {
			while ($card = $res->fetch_assoc()) {
				array_push($cards, $card);
			}

			echo json_encode($cards);
		} else {
			serverError();
		}
	}

	function repeatCard() {
		$id 	= $_POST['id'] * 1;
		$repeat = $_POST['repeat'] * 1;
		$user 	= $_SESSION['user']['id'] * 1;
		$mysqli = mysqlLink();

		if (mysqli_connect_errno()) {
			serverError();
		} else {
			$mysqli->set_charset('utf8');

			$now = time();
			$repeat++;
			$query = "UPDATE `cards` SET `repeat` = '$repeat', `last_update` = '$now' WHERE id = $id AND user = $user;";
			
			echo $mysqli->query($query);
		}
	}

	function removeCard() {
		$id 	= $_POST['id'] * 1;
		$user 	= $_SESSION['user']['id'] * 1;
		$mysqli = mysqlLink();

		if (mysqli_connect_errno()) {
			serverError();
		} else {
			$mysqli->set_charset('utf8');
			$query = "DELETE FROM `cards` WHERE `id` = $id AND user = $user;";
			echo $mysqli->query($query);
		}
	}

	function login() {
		$login 		= $_POST['login'];
		$password 	= $_POST['password'];
		$mysqli 	= mysqlLink();
		$res 		= false;

		if (mysqli_connect_errno()) {
			return $res;
		} else {
			$mysqli->set_charset('utf8');
			$login 		= $mysqli->real_escape_string($login);
			$password 	= $mysqli->real_escape_string($password);
			$query 		= "SELECT * FROM `users` WHERE login = '$login' AND password = '$password';";

			$res = $mysqli->query($query);
		}

		if ($res) {
			return $res->fetch_assoc();
		} else {
			return $res;
		}
	}

	function getUserName() {
		echo $_SESSION['user']['login'];
	}

	function createCategory() {
		$mysqli 	= mysqlLink();
		$category 	= $_POST['category'];
		$type 		= $_POST['type'] * 1;
		$user 		= $_SESSION['user']['id'] * 1;
		$res 		= false;

		if (mysqli_connect_errno()) {
			return false;
		} else {
			$mysqli->set_charset('utf8');
			$name 	= $mysqli->real_escape_string($name);
			$query 	= "INSERT INTO categories SET `name` = '$name', `type` = '$type', `user` = '$user';";

			$res 	= $mysqli->query($query);
		}

		echo !!$res;
	}

	function removeCategory() {
		$mysqli = mysqlLink();
		$id 	= $_POST['id'] * 1;

		if (mysqli_connect_errno()) {
			return false;
		} else {
			$mysqli->set_charset('utf8');
			$query = "DELETE FROM categories WHERE `id` = '$id';";

			$res = $mysqli->query($query);
		}

		echo !!$res;
	}

	function updateCategory() {
		$mysqli = mysqlLink();
		$id 	= $_POST['id'] * 1;
		$name 	= $_POST['name'];

		if (mysqli_connect_errno()) {
			return false;
		} else {
			$mysqli->set_charset('utf8');
			$name = $mysqli->real_escape_string($name);
			$query = "UPDATE categories SET `name` = '$name' WHERE `id` = '$id';";

			$res = $mysqli->query($query);
		}

		echo !!$res;
	}

	function getCategory($id) {
		$mysqli = mysqlLink();
		$user 	= $_SESSION['user']['id'] * 1;

		if (mysqli_connect_errno()) {
			return false;
		} else {
			$mysqli->set_charset('utf8');
			$query 	= "SELECT * FROM categories WHERE `id` = '$id' AND `user` = '$user' LIMIT 1;";
			$res 	= $mysqli->query($query);
		}

		if ($res) {
			$category = $res->fetch_assoc();
		} else {
			$category = false;
		}

		return $category;
	}

	function getUsersCategories() {
		$mysqli 	= mysqlLink();
		$user 		= $_SESSION['user']['id'] * 1;
		$categories = array();

		if (mysqli_connect_errno()) {
			return false;
		} else {
			$mysqli->set_charset('utf8');
			$query 	= "SELECT * FROM categories WHERE `user` = '$user'";
			$res 	= $mysqli->query($query);
		}

		if ($res) {
			while ($category = $res->fetch_assoc()) {
				array_push($categories, $category);
			}
		} else {
			$categories = false;
		}

		return $categories;
	}

	function getDictionaryCategories() {
		$mysqli 	= mysqlLink();
		$categories = array();
		$type 		= DICTIONARY_CATEGORY;

		if (mysqli_connect_errno()) {
			return false;
		} else {
			$mysqli->set_charset('utf8');
			$query 	= "SELECT * FROM categories WHERE `type` = '$type';";
			$res 	= $mysqli->query($query);
		}

		if ($res) {
			while ($category = $res->fetch_assoc()) {
				array_push($categories, $category);
			}
		} else {
			$categories = false;
		}

		return $categoires;
	}
?>