<?php
	include $_SERVER['DOCUMENT_ROOT'] . '/core/main.php';
	session_start();

	if ($_SESSION['logged']) {
		header('location: /');
	}

	if ($_SERVER['REQUEST_METHOD'] == 'POST') {
		$login = $_POST['login'];
		$password = $_POST['password'];

		if ($login == 'root' && $password == '00000') {
			$_SESSION['logged'] = true;
		}
	}
?><!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<title>Авторизация</title>
	<style>
		form {
			display: flex;
			justify-content: center;
			align-content: center;
		}
	</style>
</head>
<body>
	<form method="POST">
		<input type="text" placeholder="Логин" name="login">
		<input type="password" placeholder="Пароль" name="password">
		<button type="submit">Войти</button>
	</form>
</body>
</html>