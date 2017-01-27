<?php
	include $_SERVER['DOCUMENT_ROOT'] . '/core/main.php';
	include $_SERVER['DOCUMENT_ROOT'] . '/core/action.php';
	session_start();

	if (!$_SESSION['logged']) {
		header('location: /login.php');
	}

	if ($_SERVER['REQUEST_METHOD'] == 'POST') {
		switch ($_POST['action']) {
			case 'addCard':
				addCard();
			break;
			case 'getAllCards':
				getAllCards();
			break;
			case 'getCardsForRepeat':
				getCardsForRepeat();
			break;
			case 'repeatCard':
				repeatCard();
			break;
		}

		exit();
	}
?><!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<title>Карты</title>
	<link rel="stylesheet" href="/dist/css/style.css">
</head>
<body>
	<div id="app"></div>
	<script src="/dist/js/libs/jquery/dist/jquery.min.js"></script>
	<script src="/dist/js/libs/react/react.min.js"></script>
	<script src="/dist/js/libs/react/react-dom.min.js"></script>
	<script src="/dist/js/main.js"></script>
</body>
</html>