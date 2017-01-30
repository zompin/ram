<?php
	include $_SERVER['DOCUMENT_ROOT'] . '/core/config.php';

	define(SECONDS_PER_MINUTE, 	60);
	define(SECONDS_PER_HOUR, 	3600);
	define(SECONDS_PER_DAY, 	86400);
	define(SECONDS_PER_MONTH, 	2592000);

	function serverError() {
		echo json_encode(array('error' => 'server_error'));
	}

	function addCard() {
		global $db;
		$mysqli 	= new mysqli($db['host'], $db['user'], $db['pass'], $db['name']);
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

	function getAllCards() {
		global $db;
		$mysqli = new mysqli($db['host'], $db['user'], $db['pass'], $db['name']);
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
		global $db;
		$mysqli = new mysqli($db['host'], $db['user'], $db['pass'], $db['name']);
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
		global $db;
		$id 	= $_POST['id'] * 1;
		$repeat = $_POST['repeat'] * 1;
		$user 	= $_SESSION['user']['id'] * 1;
		$mysqli = new mysqli($db['host'], $db['user'], $db['pass'], $db['name']);

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
		global $db;
		$id 	= $_POST['id'] * 1;
		$user 	= $_SESSION['user']['id'] * 1;
		$mysqli = new mysqli($db['host'], $db['user'], $db['pass'], $db['name']);

		if (mysqli_connect_errno()) {
			serverError();
		} else {
			$mysqli->set_charset('utf8');
			$query = "DELETE FROM `cards` WHERE `id` = $id AND user = $user;";
			echo $mysqli->query($query);
		}
	}

	function login() {
		global $db;
		$login 		= $_POST['login'];
		$password 	= $_POST['password'];
		$mysqli 	= new mysqli($db['host'], $db['user'], $db['pass'], $db['name']);
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
?>