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

		if (mysqli_connect_errno()) {
			serverError();
		} else {
			$mysqli->set_charset('utf8');
			$query = "";
			$res = $mysqli->query($query);
		}

		if ($res) {
			while ($card = $mysqli->fetch_assoc()) {
				array_push($cards, $card);
			}

			echo json_encode($cards);
		} else {
			serverError();
		}
	}
?>