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
			$query = "INSERT INTO cards SET question='$question', answer='$answer', last_update='$lastUpdate';";
			$res = $mysqli->query($query);

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
		$cards = array();
		$res = false;

		if ($mysqli->connect_errno) {
			serverError();
		} else {
			$mysqli->set_charset('utf8');
			$query = "SELECT * FROM cards ORDER BY `repeat`;";
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
				(SELECT * FROM `cards` WHERE `repeat` = 0)
				UNION
				(SELECT * FROM `cards` WHERE `repeat` = 1 AND last_update > $now - $m20)
				UNION
				(SELECT * FROM `cards` WHERE `repeat` = 2 AND last_update > $now - $h8)
				UNION
				(SELECT * FROM `cards` WHERE `repeat` = 3 AND last_update > $now - $d1)
				UNION
				(SELECT * FROM `cards` WHERE `repeat` = 4 AND last_update > $now - $w2)
				UNION
				(SELECT * FROM `cards` WHERE `repeat` = 5 AND last_update > $now - $m2)
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
		$id = $_POST['id'] * 1;
		$repeat = $_POST['repeat'] * 1;
		$success = $_POST['success'];
		$last_update = $_POST['last_update'] * 1;

		global $db;
		$mysqli = new mysqli($db['host'], $db['user'], $db['pass'], $db['name']);

		if (mysqli_connect_errno()) {
			serverError();
		} else {
			$mysqli->set_charset('utf8');

			if ($success) {
				$now = time();
				$repeat++;
				$query = "UPDATE `cards` SET `repeat` = '$repeat', `last_update` = $now WHERE id = $id;";
			} else {
				$query = "UPDATE `cards` SET `last_update` = '$last_update';";
			}
			
			echo $mysqli->query($query);
		}
	}
?>