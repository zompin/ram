class App extends React.Component {
	constructor(props) {
		super(props);
		this.getAllCards = this.getAllCards.bind(this);
		this.getCardsForRepeat = this.getCardsForRepeat.bind(this);
		this.getCards = this.getCards.bind(this);
		this.interval = setInterval(this.getCards, 10000);
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
				show: false,
				message: ''
			},
			userName: ''
		};
	}

	getAllCards() {
		$.ajax({
			url: '/index.php',
			type: 'POST',
			data: {
				action: 'getAllCards'
			},
			success: data =>  {
				data = JSON.parse(data);
				this.setState({cards: data});
			}
		});
	}

	getCardsForRepeat() {
		$.ajax({
			url: '/index.php',
			type: 'POST',
			data: {
				action: 'getCardsForRepeat'
			},
			success: data => {
				data = JSON.parse(data);
				this.setState({cardsForRepeat: data});
			}
		});
	}

	getCards() {
		this.getAllCards();
		this.getCardsForRepeat();
		console.log('getCards')
	}

	getUserName() {
		$.ajax({
			url: '/index.php',
			method: 'POST',
			data: {
				action: 'getUserName'
			},
			success: data => {
				this.setState({userName: data});
			}
		});
	}

	render() {
		return (
			<div id="app">
				<Panel app = {this} />
				<AddForm app = {this} />
				<Repeat app = {this} />
				<Cards app = {this} />
				<Note app = {this} />
			</div>
		);
	}
};

class Panel extends React.Component {
	constructor(props) {
		super(props);
		this.showAddForm = this.showAddForm.bind(this);
		this.showRepeatForm = this.showRepeatForm.bind(this);
		this.state = {
			app: props.app
		};
	}

	showAddForm() {
		clearInterval(this.state.app.interval);
		this.state.app.setState({
			addForm: {
				show: true
			}
		});
	}

	showRepeatForm() {
		clearInterval(this.state.app.interval);
		this.state.app.setState({
			repeatForm: {
				show: true
			}
		});
	}

	render() {
		return (
			<div className="panel">
				<div className="panel__inner">
					<button className="button panel__button" onClick= {this.showRepeatForm} >Тренироваться</button>
					<button className="button panel__button" onClick= {this.showAddForm} >Добавить</button>
					<div className="panel__unrepeated">
						Слов для повтора: {this.state.app.state.cardsForRepeat.length}
					</div>
					<div className="user">
						<div className="user__name">{this.state.app.state.userName}</div>
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
		this.questionChange = this.questionChange.bind(this);
		this.answerChange 	= this.answerChange.bind(this);
		this.onAdd 			= this.onAdd.bind(this);
		this.hideForm		= this.hideForm.bind(this);
		this.onEnter 		= this.onEnter.bind(this);
		this.questionFocus 	= this.questionFocus.bind(this);
		this.state = {
			answer: '',
			question: '',
			app: props.app
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
			action: 'addCard',
			question: this.state.question,
			answer: this.state.answer
		};

		$.ajax({
			url: '/index.php',
			type: 'POST',
			data: data,
			success: data => {
				console.log(data);
			}
		});

		if (e.nativeEvent.ctrlKey) {
			this.setState({
				answer: '',
				question: ''
			});
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
		this.setState({
			question: '',
			answer: ''
		});
		this.state.app.setState({
			addForm: {
				show: false
			}
		});

		this.state.app.getCards();
		this.state.app.interval = setInterval(this.state.app.getCards, 10000);

		e.preventDefault();
	}

	questionFocus() {
		this.questionEl.focus();
	}

	render() {
		var style = {};

		if (this.state.app.state.addForm.show) {
			style.display = 'flex';
			clearInterval(this.state.app.interval);
		} else {
			style.display = 'none';
		}

		return (
			<div style = {style} className="add-form">
				<div className="add-form__close-div" onClick = {this.hideForm} />
				<form onSubmit = {this.onAdd} className="add-form__form">
					<button 
						className="button add-form__button add-form__button_close" 
						onClick = {this.hideForm} 
					>&times;</button>
					<textarea 
						className="textarea add-form__textarea" 
						id="question" 
						onChange = {this.questionChange} 
						onKeyDown = {this.onEnter} 
						placeholder="Вопрос"
						value = {this.state.question}
						ref = {el => {this.questionEl = el;}}
					></textarea>
					<textarea 
						className="textarea add-form__textarea" 
						id="answer" 
						onChange = {this.answerChange} 
						onKeyDown = {this.onEnter} 
						placeholder="Ответ"
						value = {this.state.answer}
					></textarea>
					<button className="button add-form__button add-form__button_add" type="submit">Добавить</button>
				</form>
			</div>
		);
	}
};

class Cards extends React.Component {
	constructor(props) {
		super(props);
		this.removeCard = this.removeCard.bind(this);
		this.resetCard = this.resetCard.bind(this);
		this.state = {
			app: props.app
		};
	}

	removeCard(id) {
		return () => {
			$.ajax({
				url: '/index.php',
				type: 'POST',
				data: {
					action: 'removeCard',
					id: id
				},
				success: data => {
					console.log(data)
					this.state.app.getCards();
				}
			});
		}
	}

	resetCard(id) {
		return () => {
			$.ajax({
				url: '/index.php',
				type: 'POST',
				data: {
					action: 'resetCard',
					id: id
				},
				success: data => {
					console.log(data)
					this.state.app.getCards();
				}
			});
		}
	}

	render() {
		var cards = this.state.app.state.cards;

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
	var progress = props.item.repeat;
	var width = (100 / 6) * progress;
	var style = {
		width: width + '%'
	}

	return (
		<div key = {props.item.id} className="card">
			<div className="card__question">{props.item.question}</div>
			<div className="card__answer">{props.item.answer}</div>
			<div className="card__progress">
				<div className="card__progress-scale" style = {style} ></div>
			</div>
			<div className="card__control">
				<button className="card__button" onClick = {props.reset(props.item.id)} >Учить снова</button>
				<button className="card__button" onClick = {props.delete(props.item.id)} >&times;</button>
			</div>
		</div>
	);
}

class Repeat extends React.Component {
	constructor(props) {
		super(props);
		this.answerChange = this.answerChange.bind(this);
		this.closeRepeatForm = this.closeRepeatForm.bind(this);
		this.checkAnswer = this.checkAnswer.bind(this);
		this.state = {
			app: props.app,
			answer: '',
			showMessage: false,
			correct: false,
			correctAnswer: '',
			cheked: false
		}
	}

	answerChange(e) {
		this.setState({answer: e.target.value});
	}

	closeRepeatForm() {
		this.state.app.setState({
			repeatForm: {
				show: false
			}
		});
		
		this.setState({
			checked: false,
			showMessage: false
		});

		this.state.app.getCards();
		this.state.app.interval = setInterval(this.state.app.getCards, 10000);
	}

	checkAnswer(e) {
		var type = e.type;
		var cards = this.state.app.state.cardsForRepeat; 
		var card = cards[0];
		var question = card.question;
		var answer = card.answer;

		answer = answer.replace(/\s*,\s*/g, ',').toLowerCase();
		answer = answer.split(',');

		if (type == 'click' || (type == 'keydown' && (e.keyCode == 10 || e.keyCode == 13))) {
			if (this.state.checked) {

				if (!card) {
					this.closeRepeatForm();
				}

				cards.shift();

				this.state.app.setState({
					cardsForRepeat: cards
				});
				
				this.setState({
					checked: false,
					showMessage: false,
					answer: ''
				});

				$.ajax({
					url: '/index.php',
					type: 'POST',
					data: {
						action: 'repeatCard',
						id: card.id,
						repeat: card.repeat,
						last_update: card.last_update
					},
					success: data => {
						//this.state.app.getCards();
					}
				});

				return;
			}

			if (answer.indexOf(this.state.answer.toLowerCase()) != -1 ) {
				this.setState({
					correct: true,
					showMessage: true,
					checked: true
				});
			} else {
				this.setState({
					correct: false,
					showMessage: true,
					correctAnswer: card.answer
				});
			}
		}

	}

	render() {
		var formStyle = {};
		var question = '';
		var cards = this.state.app.state.cardsForRepeat;

		if (cards.length > 0) {
			question = cards[0].question;
		}

		if (this.state.app.state.repeatForm.show) {
			formStyle.display = 'flex';
		} else {
			formStyle.display = 'none';
		}

		return (
			<div style = {formStyle} className="repeat-form">
				<div className="repeat-form__close-div" onClick = {this.closeRepeatForm} ></div>
				<RepeatForm repeat = {this} question = {question} haveCards = {cards.length > 0}/>
			</div>
		);
	}
};

function RepeatForm(props) {
	var repeat = props.repeat;

	if (props.haveCards) {
		return (
			<div className="repeat-form__inner">
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
				/>
				<button 
					onClick = {repeat.checkAnswer} 
					className="button repeat-form__button repeat-form__button_check"
				>Проверить</button>
				<button 
					onClick= {repeat.closeRepeatForm} 
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
		this.state = {
			app: props.app,
		}
	}

	showNote() {
		this.state.app.setState({
			note: {
				show: true
			}
		});

		/*var timer = setTimeout(() => {
			this.state.app.setState({
				note: {
					show: true
				}
			});
		}, 4000);*/
	}

	render() {
		var style = {};
		//this.showNote();

		if (this.state.app.state.note.show) {
			style.display = 'block';
		} else {
			style.display = 'none';
		}

		return (
			<div className="note" style = {style} >{this.state.app.state.note.message}</div>
		);
	}
};

ReactDOM.render(<App />, document.getElementById('app'));