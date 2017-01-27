<?php
	include $_SERVER['DOCUMENT_ROOT'] . '/core/config.php';

	function action($action) {
		switch ($action) {
			case 'addCard':
				addCard();
			break;
			case 'getCards':
				getCards();
			break;
		}
	}
?>