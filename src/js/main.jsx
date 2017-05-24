function isTouch() {
	return 'onTouchEnd' in document.documentElement;
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.getCards 			= this.getCards.bind(this);
		this.showAddForm 		= this.showAddForm.bind(this);
		this.showRepeatForm 	= this.showRepeatForm.bind(this);
		this.appBlur 			= this.appBlur.bind(this);
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
			userName: '',
			logs: []
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
		if (this.state.addForm.show) return;

		clearTimeout(this.getCardsTimeout);

		this.setState({
			addForm: {
				show: true
			}
		});
	}

	showRepeatForm() {
		if (this.state.repeatForm.show) return;

		clearTimeout(this.getCardsTimeout);
		setTimeout(() => {
			if (this.repeatInput) this.repeatInput.focus();
		}, 500);

		this.setState({
			repeatForm: {
				show: true
			}
		});
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

	appBlur(e) {
		let eve = {
			type: e.type,
			target: e.target
		};

		this.state.logs.push(eve);
		this.setState({logs: this.state.logs});
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
			<div id="app" onBlur = {this.appBlur} >
				<Panel 	app = {this} />
				<Add 	app = {this} />
				<Repeat app = {this} />
				<Cards 	app = {this} />
				<Note 	app = {this} />
				<Log 	logs = {this.state.logs} />
			</div>
		);
	}
};

class Panel extends React.Component {
	constructor(props) {
		super(props);
		this.app = props.app;
	}

	render() {
		return (
			<div className = "panel">
				<div className = "panel__inner">
					<PanelRepeatButton handler = {this.app.showRepeatForm} />
					<PanelAddButton    handler = {this.app.showAddForm} />
					<div className = "panel__unrepeated">
						Слов для повтора: {this.app.state.cardsForRepeat.length}
					</div>
					<div className = "user">
						<div className = "user__name">{this.app.state.userName}</div>
						<a   className = "user__exit" href="/index.php?action=exit">Выйти</a>
					</div>
				</div>
			</div>
		);
	}
};

function PanelRepeatButton(props) {
	if (isTouch()) {
		return (
			<button
				className  = "button panel__button"
				onTouchEnd = {props.handler}
			>Тренироваться</button>
		);
	} else {
		return (
			<button
				className  = "button panel__button"
				onClick    = {props.handler}
			>Тренироваться</button>
		);
	}
}

function PanelAddButton(props) {
	if (isTouch()) {
		return (
			<button
				className  = "button panel__button"
				onTouchEnd = {props.handler}
			>Добавить</button>
		);
	} else {
		return (
			<button
				className  = "button panel__button"
				onClick    = {props.handler}
			>Добавить</button>
		);
	}
}

class Add extends React.Component {
	constructor(props) {
		super(props);
		this.questionChange 	= this.questionChange.bind(this);
		this.answerChange 		= this.answerChange.bind(this);
		this.onAdd 				= this.onAdd.bind(this);
		this.hideForm			= this.hideForm.bind(this);
		this.onEnter 			= this.onEnter.bind(this);
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
	}

	onEnter(e) {
		if (e.keyCode == 10 || e.keyCode == 13) {
			this.onAdd(e);
		}
	}

	hideForm(e) {
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
			style.display 			 = 'none';
			this.app.questionFocused = false;
		}

		return (
			<div style = {style} className = "add-form">
				<AddCloseDiv handler = {this.hideForm} />
				<form className = "add-form__form">
					<AddCloseButton handler = {this.hideForm} />
					<textarea 
						className 	= "textarea add-form__textarea" 
						id 			= "question" 
						onChange 	= {this.questionChange} 
						onKeyDown 	= {this.onEnter} 
						placeholder = "Вопрос"
						value 		= {this.state.question}
						ref 		= {textarea => this.app.questionTextearea = textarea}
					></textarea>
					<textarea 
						className 	= "textarea add-form__textarea" 
						id 			= "answer" 
						onChange 	= {this.answerChange} 
						onKeyDown 	= {this.onEnter} 
						placeholder = "Ответ"
						value 		= {this.state.answer}
					></textarea>
					<AddAddButton handler = {this.onAdd} />
				</form>
			</div>
		);
	}
};

function AddCloseDiv(props) {
	if (isTouch()) {
		return (
			<div
				className  = "add-form__close-div"
				onTouchEnd = {props.handler}
			/>
		);
	} else {
		return (
			<div
				className  = "add-form__close-div"
				onClick    = {props.handler}
			/>
		);
	}
}

function AddCloseButton(props) {
	if (isTouch()) {
		return (
			<button
				className  = "button add-form__button add-form__button_close"
				onTouchEnd = {props.handler}
			>&times;</button>
		);
	} else {
		return (
			<button
				className  = "button add-form__button add-form__button_close"
				onClick    = {props.handler}
			>&times;</button>
		);
	}
}

function AddAddButton(props) {
	if (isTouch()) {
		return (
			<button 
				className  = "button add-form__button add-form__button_add"
				onTouchEnd = {props.handler}
			>Добавить</button>
		);
	} else {
		return (
			<button 
				className  = "button add-form__button add-form__button_add"
				onClick    = {props.handler}
			>Добавить</button>
		);
	}
}

class Cards extends React.Component {
	constructor(props) {
		super(props);
		this.removeCard = this.removeCard.bind(this);
		this.resetCard 	= this.resetCard.bind(this);
		this.app 		= props.app;
	}

	removeCard(e) {
		let id = e.target.parentNode.parentNode.getAttribute('data-id')

		$.ajax({
			url: 	'/index.php',
			type: 	'POST',
			data: 	{
				action: 'removeCard',
				id: 	id
			},
			success: data => {
				console.log(data)
				this.app.getCards(false);
			}
		});
	}

	resetCard(e) {
		let id = e.target.parentNode.parentNode.getAttribute('data-id')

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
				<div className = "cards">Нет карт</div>
			);
		}

		cards = cards.map(card => {
			return <Card item = {card} delete = {this.removeCard} reset = {this.resetCard} />
		});

		return (
			<div className = "cards">{cards}</div>
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
		<div key = {props.item.id} className = "card" data-id = {props.item.id} >
			<div className = "card__question">{props.item.question}</div>
			<div className = "card__answer">{props.item.answer}</div>
			<div className = "card__progress">
				<div className = "card__progress-scale" style = {style} ></div>
			</div>
			<div className = "card__control">
				<CardReset  handler = {props.reset} />
				<CardDelete handler = {props.delete} />
			</div>
		</div>
	);
}

function CardReset(props) {
	if (isTouch()) {
		return (
			<button
				className    = "card__button"
				onTouchEnd   = {props.handler} 
			>Учить снова</button>
		);
	} else {
		return (
			<button 
				className  = "card__button"
				onClick    = {props.handler}
			>Учить снова</button>
		);
	}
}

function CardDelete(props) {
	if (isTouch()) {
		return (
			<button
				className    = "card__button"
				onTouchEnd   = {props.handler}
			>&times;</button>
		);
	} else {
		return (
			<button
				className  = "card__button"
				onClick    = {props.handler}
			>&times;</button>
		);
	}
}

class Repeat extends React.Component {
	constructor(props) {
		super(props);
		this.answerChange 		= this.answerChange.bind(this);
		this.closeRepeatForm 	= this.closeRepeatForm.bind(this);
		this.checkAnswer 		= this.checkAnswer.bind(this);
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

		if (type == 'click' || type == 'touchstart' || (type == 'keydown' && (e.keyCode == 10 || e.keyCode == 13))) {
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

		setTimeout(() => {
			if (this.repeatInput) this.repeatInput.focus();
		}, 500);

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
			<div style = {formStyle} className = "repeat-form">
				<RepeatCloseDiv handler = {this.closeRepeatForm} />
				<RepeatForm 
					repeat    = {this} 
					question  = {question} 
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
			<div className = "repeat-form__inner">
				<div className = "repeat-form__question">{props.question}</div>
				<RepeatFormMessage 
					show    = {repeat.state.showMessage} 
					correct = {repeat.state.correct} 
					answer  = {repeat.state.correctAnswer} 
				/>
				<input 
					onChange  = {repeat.answerChange} 
					onKeyDown = {repeat.checkAnswer} 
					className = "repeat-form__input" 
					value     = {repeat.state.answer}
					ref       = {input => props.repeat.app.repeatInput = input}
				/>
				<RepeatAnswerButton handler = {repeat.checkAnswer} checked = {repeat.state.checked} />
				<RepeatCloseButton  handler = {repeat.closeRepeatForm} />
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
			<div
				style     = {style}
				className = "repeat-form__message repeat-form__message_right"
			>Верно</div>
		);
	} else {
		return (
			<div
				style     = {style}
				className = "repeat-form__message repeat-form__message_wrong"
			>Правильный ответ: {props.answer}</div>
		);
	}
}

function RepeatCloseDiv(props) {
	if (isTouch()) {
		return (
			<div 
				className    = "repeat-form__close-div"
				onTouchEnd   = {props.handler} 
			/>
		);
	} else {
		return (
			<div 
				className = "repeat-form__close-div"
				onClick   = {props.handler}
			/>
		);
	}
}

function RepeatAnswerButton(props) {
	if (isTouch()) {
		return (
			<button 
				onTouchEnd   = {props.handler}
				className    = "button repeat-form__button repeat-form__button_check"
			>{props.checked ? 'Далее': 'Проверить'}</button>
		);
	} else {
		return (
			<button 
				onClick    = {props.handler}
				className  = "button repeat-form__button repeat-form__button_check"
			>{props.checked ? 'Далее': 'Проверить'}</button>
		);
	}
}

function RepeatCloseButton(props) {
	if (isTouch()) {
		return (
			<button 
				onTouchEnd = {props.handler}
				className  = "button repeat-form__button repeat-form__button_close"
			>&times;</button>
		);
	} else {
		return (
			<button 
				onClick    = {props.handler}
				className  = "button repeat-form__button repeat-form__button_close"
			>&times;</button>
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

function Log(props) {
	let logs = props.logs.map(log => <div className = "log__item">
		type: {log.type} {log.target.localName}{log.target.className ? '.' : ''}{log.target.className.split(' ').join('')}
	</div>);

	if (location.hash == '#debug' && logs.length) {
		return (
			<div className = "log" ref = {log => {
				if (log) log.scrollTop = log.scrollTopMax;
				console.log(log.innerHeight)
			}} >{logs}</div>
		);
	} else {
		return (
			<div />
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));