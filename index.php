<?php
	include $_SERVER['DOCUMENT_ROOT'] . '/core/main.php';
	session_start();

	if (!$_SESSION['logged']) {
		header('location: /login.php');
	}

	if ($_SERVER['REQUEST_METHOD'] == 'POST') {
		switch ($_POST['action']) {
			case 'addCard':
				addCard();
			break;
			case 'resetCard':
				resetCard();
			break;
			case 'getCards':
				getCards();
			break;
			case 'repeatCard':
				repeatCard();
			break;
			case 'removeCard':
				removeCard();
			break;
			case 'getUserName':
				getUserName();
			break;
		}

		exit();
	}

	if ($_SERVER['REQUEST_METHOD'] == 'GET') {
		if (isset($_GET['action'])) {
			if ($_GET['action'] == 'exit') {
				session_destroy();
				header('location: /login.php');
			}
		}
	}
?><!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<title>Карты</title>
	<link rel="stylesheet" href="/dist/css/style.css">
</head>
<body>
	<div id="app"></div>
	<script src="/dist/js/libs/jquery/dist/jquery.min.js"></script>
	<script src="/dist/js/libs/react/react.min.js"></script>
	<script src="/dist/js/libs/react/react-dom.min.js"></script>
	<script src="/dist/js/libs/mousetrap/mousetrap.min.js"></script>
	<script src="/dist/js/main.js"></script>
</body>
</html>