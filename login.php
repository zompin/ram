<?php
	include $_SERVER['DOCUMENT_ROOT'] . '/core/main.php';
	session_start();

	if ($_SERVER['REQUEST_METHOD'] == 'POST') {

		$user = login();

		if ($user) {
			$_SESSION['logged'] = true;
			$_SESSION['user'] = $user;
		}
	}

	if ($_SESSION['logged']) {
		header('location: /');
	}
?><!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<title>Авторизация</title>
	<style>
		html {
			height: 100%;
		}

		body {
			margin: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 100%;
		}

		.input {
			display: block;
			margin-bottom: 10px;
		}
	</style>
</head>
<body>
	<form method="POST">
		<input type="text" placeholder="Логин" name="login" class="input">
		<input type="password" placeholder="Пароль" name="password" class="input">
		<button type="submit">Войти</button>
	</form>
</body>
</html>