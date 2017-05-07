function isTouch() {
	return 'ontouchstart' in document.documentElement;
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.getCards 			= this.getCards.bind(this);
		this.showAddForm 		= this.showAddForm.bind(this);
		this.showRepeatForm 	= this.showRepeatForm.bind(this);
		this.getCards();
		this.getUserName();
		this.state = {
			addForm: {
				show: false
			},
			cards: [],
			cardsForRepeat: [],
			repeatForm: {
				show: false
			},
			note: {
				show: 		false,
				message: 	''
			},
			userName: ''
		};
	}

	getCards(recurse = true) {
		$.ajax({
			url: '/index.php',
			type: 'POST',
			data: {
				action: 'getCards',
			},
			success: data => {
				let unrepeatedCards = [];
				let cards 			= JSON.parse(data);

				if (cards) {
					cards.forEach(card => {
						if (card.unrepeated) {
							unrepeatedCards.push(card);
						}
					});
				}

				this.setState({
					cards: cards,
					cardsForRepeat: unrepeatedCards
				});

				if (recurse) {
					this.getCardsTimeout = setTimeout(() => this.getCards(true), 10000);
				}
			},
			error: () => {
				this.getCardsTimeout = setTimeout(() => this.getCards(true), 20000);
			}
		});
	}

	showAddForm() {
		this.setState({addForm: {show: true}});
	}

	showRepeatForm() {
		this.setState({repeatForm: {show: true}});
	}

	getUserName() {
		$.ajax({
			url: 	'/index.php',
			method: 'POST',
			data: 	{
				action: 'getUserName'
			},
			success: data => {
				this.setState({userName: data});
			}
		});
	}

	componentDidMount() {
		Mousetrap.bind(['alt+a'], this.showAddForm);
		Mousetrap.bind(['alt+r'], this.showRepeatForm);
	}

	componentWillUnmount() {
		Mousetrap.bind(['alt+a'], this.showAddForm);
		Mousetrap.bind(['alt+r'], this.showRepeatForm);
	}

	render() {
		return (
			<div id="app">
				<Panel 		app = {this} />
				<AddForm 	app = {this} />
				<Repeat 	app = {this} />
				<Cards 		app = {this} />
				<Note 		app = {this} />
			</div>
		);
	}
};

class Panel extends React.Component {
	constructor(props) {
		super(props);
		this.showAddForm 	= this.showAddForm.bind(this);
		this.showRepeatForm = this.showRepeatForm.bind(this);
		this.app 			= props.app;
	}

	showAddForm() {
		if (this.app.state.addForm.show) return;

		clearTimeout(this.app.getCardsTimeout);

		this.app.setState({
			addForm: {
				show: true
			}
		});
	}

	showRepeatForm() {
		if (this.app.state.repeatForm.show) return;

		clearTimeout(this.app.getCardsTimeout);

		this.app.setState({
			repeatForm: {
				show: true
			}
		});
	}

	render() {
		return (
			<div className="panel">
				<div className="panel__inner">
					<button className="button panel__button" onClick = {this.showRepeatForm} onTouchEnd = {this.showRepeatForm} >Тренироваться</button>
					<button className="button panel__button" onClick = {this.showAddForm} onTouchEnd = {this.showAddForm} >Добавить</button>
					<div className="panel__unrepeated">
						Слов для повтора: {this.app.state.cardsForRepeat.length}
					</div>
					<div className="user">
						<div className="user__name">{this.app.state.userName}</div>
						<a className="user__exit" href="/index.php?action=exit">Выйти</a>
					</div>
				</div>
			</div>
		);
	}
};

class AddForm extends React.Component {
	constructor(props) {
		super(props);
		this.questionChange 	= this.questionChange.bind(this);
		this.answerChange 		= this.answerChange.bind(this);
		this.onAdd 				= this.onAdd.bind(this);
		this.hideForm			= this.hideForm.bind(this);
		this.onEnter 			= this.onEnter.bind(this);
		this.onClick 			= this.onClick.bind(this);
		this.app 				= props.app;
		this.state = {
			answer: 	'',
			question: 	'',
		};
	}

	questionChange(e) {
		this.setState({question: e.target.value});
	}

	answerChange(e) {
		this.setState({answer: e.target.value});
	}

	onAdd(e) {
		var data = {
			action: 	'addCard',
			question: 	this.state.question,
			answer: 	this.state.answer
		};

		$.ajax({
			url: 		'/index.php',
			type: 		'POST',
			data: 		data,
			success: 	data => {
				console.log(data);
			}
		});

		if (e.nativeEvent.ctrlKey) {
			this.setState({
				answer: 	'',
				question: 	''
			});
			this.app.questionTextearea.focus();
		} else {
			this.hideForm(e);
		}

		e.preventDefault();
	}

	onEnter(e) {
		if (e.keyCode == 10 || e.keyCode == 13) {
			this.onAdd(e);
		}
	}

	hideForm(e) {
		if (isTouch() && e.type == 'click') return;

		this.setState({
			question: 	'',
			answer: 	''
		});
		this.app.setState({
			addForm: {
				show: false
			}
		});

		this.app.getCards();

		e.preventDefault();
	}

	onClick(e) {
		if (isTouch()) {
			e.preventDefault();
		}
	}

	render() {
		var style = {};

		if (this.app.state.addForm.show) {
			style.display = 'flex';
			setTimeout(() => {
				if (!this.app.questionFocused) {
				 	this.app.questionTextearea.focus();
				 	this.app.questionFocused = true;
				}
			}, 1);
		} else {
			style.display 				= 'none';
			this.app.questionFocused 	= false;
		}

		return (
			<div style = {style} className="add-form">
				<div className="add-form__close-div" onClick = {this.hideForm} onTouchEnd = {this.hideForm} />
				<form onSubmit = {this.onAdd} className="add-form__form">
					<button 
						className="button add-form__button add-form__button_close" 
						onClick = {this.hideForm}
						onTouchEnd = {this.hideForm}
					>&times;</button>
					<textarea 
						className="textarea add-form__textarea" 
						id="question" 
						onChange = {this.questionChange} 
						onKeyDown = {this.onEnter} 
						placeholder="Вопрос"
						value = {this.state.question}
						ref = {textarea => this.app.questionTextearea = textarea}
					></textarea>
					<textarea 
						className="textarea add-form__textarea" 
						id="answer" 
						onChange = {this.answerChange} 
						onKeyDown = {this.onEnter} 
						placeholder="Ответ"
						value = {this.state.answer}
					></textarea>
					<button 
						className="button add-form__button add-form__button_add" 
						type="submit" 
						onTouchEnd = {this.onAdd} 
						onClick = {this.onClick}
					>Добавить</button>
				</form>
			</div>
		);
	}
};

class Cards extends React.Component {
	constructor(props) {
		super(props);
		this.removeCard = this.removeCard.bind(this);
		this.resetCard 	= this.resetCard.bind(this);
		this.app 		= props.app;
	}

	removeCard(e) {
		let id = e.target.parentNode.parentNode.getAttribute('data-id')

		if (isTouch() && e.type == 'click') return;

		$.ajax({
			url: 	'/index.php',
			type: 	'POST',
			data: 	{
				action: 	'removeCard',
				id: 		id
			},
			success: data => {
				console.log(data)
				this.app.getCards(false);
			}
		});
	}

	resetCard(e) {
		let id = e.target.parentNode.parentNode.getAttribute('data-id')

		if (isTouch() && e.type == 'click') return;

		$.ajax({
			url: 	'/index.php',
			type: 	'POST',
			data: 	{
				action: 'resetCard',
				id: 	id
			},
			success: data => {
				console.log(data)
				this.app.getCards(false);
			}
		});
	}

	render() {
		var cards = this.app.state.cards;

		if (cards.length == 0) {
			return (
				<div className="cards">Нет карт</div>
			);
		}

		cards = cards.map(card => {
			return <Card item = {card} delete = {this.removeCard} reset = {this.resetCard} />
		});

		return (
			<div className="cards">{cards}</div>
		);
	}
};

function Card(props) {
	var progress 	= props.item.repeat;
	var width 		= (100 / 6) * progress;
	var style 		= {
		width: width + '%'
	}

	return (
		<div key = {props.item.id} className="card" data-id = {props.item.id} >
			<div className="card__question">{props.item.question}</div>
			<div className="card__answer">{props.item.answer}</div>
			<div className="card__progress">
				<div className="card__progress-scale" style = {style} ></div>
			</div>
			<div className="card__control">
				<button 
					className="card__button" 
					onClick = {props.reset} 
					onTouchEnd = {props.reset} 
				>Учить снова</button>
				<button 
					className="card__button" 
					onClick = {props.delete} 
					onTouchEnd = {props.delete} 
				>&times;</button>
			</div>
		</div>
	);
}

class Repeat extends React.Component {
	constructor(props) {
		super(props);
		this.answerChange 		= this.answerChange.bind(this);
		this.closeRepeatForm 	= this.closeRepeatForm.bind(this);
		this.checkAnswer 		= this.checkAnswer.bind(this);
		this.innerClick 		= this.innerClick.bind(this);
		this.app 				= props.app;
		this.state = {
			answer: 		'',
			showMessage: 	false,
			correct: 		false,
			correctAnswer: 	'',
			cheked: 		false
		}
	}

	answerChange(e) {
		this.setState({answer: e.target.value});
	}

	closeRepeatForm(e) {
		if (isTouch() && e.type == 'click') {
			this.input && this.input.focus();
			return;
		}

		this.app.setState({
			repeatForm: {
				show: false
			}
		});
		
		this.setState({
			checked: 		false,
			showMessage: 	false
		});

		this.app.getCards();
	}

	checkAnswer(e) {
		var type 		= e.type;
		var cards 		= this.app.state.cardsForRepeat; 
		var card 		= cards[0];
		var question 	= card.question;
		var answer 		= card.answer;

		answer = answer.replace(/\s*,\s*/g, ',').toLowerCase();
		answer = answer.split(',');

		if (this.input) this.input.focus();
		if (isTouch() && type == 'click') return;
		if (type == 'click' || type == 'touchend' || (type == 'keydown' && (e.keyCode == 10 || e.keyCode == 13))) {
			if (this.state.checked) {

				if (!card) {
					this.closeRepeatForm();
				}

				cards.shift();

				this.app.setState({
					cardsForRepeat: cards
				});
				
				this.setState({
					checked: 		false,
					showMessage: 	false,
					answer: 		''
				});

				$.ajax({
					url: '/index.php',
					type: 'POST',
					data: {
						action: 		'repeatCard',
						id: 			card.id,
						repeat: 		card.repeat,
						last_update: 	card.last_update
					},
					success: data => {
						//this.app.getCards();
					}
				});

				return;
			}

			if (answer.indexOf(this.state.answer.toLowerCase()) != -1 ) {
				this.setState({
					correct: 		true,
					showMessage: 	true,
					checked: 		true
				});
			} else {
				this.setState({
					correct: 		false,
					showMessage: 	true,
					correctAnswer: 	card.answer
				});
			}
		}

	}

	innerClick(e) {
		if (isTouch() && e.type == 'click') {
			this.input && this.input.focus();
		}
	}

	render() {
		var formStyle 	= {};
		var question 	= '';
		var cards 		= this.app.state.cardsForRepeat;

		if (cards.length > 0) {
			question = cards[0].question;
		}

		if (this.app.state.repeatForm.show) {
			formStyle.display = 'flex';
		} else {
			formStyle.display = 'none';
		}

		return (
			<div style = {formStyle} className="repeat-form">
				<div 
					className="repeat-form__close-div" 
					onClick = {this.closeRepeatForm} 
					onTouchEnd = {this.closeRepeatForm} 
				></div>
				<RepeatForm 
					repeat = {this} 
					question = {question} 
					haveCards = {cards.length > 0}
				/>
			</div>
		);
	}
};

function RepeatForm(props) {
	var repeat = props.repeat;

	if (props.haveCards) {
		return (
			<div className="repeat-form__inner" onClick = {repeat.innerClick} >
				<div className="repeat-form__question">{props.question}</div>
				<RepeatFormMessage 
					show = {repeat.state.showMessage} 
					correct = {repeat.state.correct} 
					answer = {repeat.state.correctAnswer} 
				/>
				<input 
					onChange = {repeat.answerChange} 
					onKeyDown = {repeat.checkAnswer} 
					className="repeat-form__input" 
					value = {repeat.state.answer}
					ref = {input => {
						props.repeat.input = input;
						if (input) input.focus();
					}}
				/>
				<button 
					onClick = {repeat.checkAnswer} 
					onTouchEnd = {repeat.checkAnswer} 
					className="button repeat-form__button repeat-form__button_check"
				>{repeat.state.checked ? 'Далее': 'Проверить'}</button>
				<button 
					onClick = {repeat.closeRepeatForm}
					onTouchEnd = {repeat.closeRepeatForm}
					className="button repeat-form__button repeat-form__button_close"
				>&times;</button>
			</div>
		);
	} else {
		return (
			<div className="repeat-form__inner">Нет слов для повтора</div>
		);
	}
}

function RepeatFormMessage(props) {
	var style = {};

	if (props.show) {
		style.display = 'block';
	} else {
		style.display = 'none';
	}

	if (props.correct) {
		return (
			<div style = {style} className="repeat-form__message repeat-form__message_right">Верно</div>
		);
	} else {
		return (
			<div style = {style} className="repeat-form__message repeat-form__message_wrong">Правильный ответ: {props.answer}</div>
		);
	}
}

class Note extends React.Component {
	constructor(props) {
		super(props);
		this.app = props.app
	}

	showNote() {
		this.app.setState({
			note: {
				show: true
			}
		});

		/*var timer = setTimeout(() => {
			this.app.setState({
				note: {
					show: true
				}
			});
		}, 4000);*/
	}

	render() {
		var style = {};
		//this.showNote();

		if (this.app.state.note.show) {
			style.display = 'block';
		} else {
			style.display = 'none';
		}

		return (
			<div className="note" style = {style} >{this.app.state.note.message}</div>
		);
	}
};

ReactDOM.render(<App />, document.getElementById('app'));