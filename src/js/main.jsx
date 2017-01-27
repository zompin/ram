class App extends React.Component {
	constructor(props) {
		super(props);
		this.getAllCards = this.getAllCards.bind(this);
		this.getCardsForRepeat = this.getCardsForRepeat.bind(this);
		this.getAllCards();
		this.getCardsForRepeat();
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
			}
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
				console.log(data, 'req')
				this.setState({cardsForRepeat: data});
			}
		});
	}

	render() {
		return (
			<div id="app">
				<Panel app = {this} />
				<AddForm app = {this} />
				<RepeatForm app = {this} />
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
		this.state.app.setState({
			addForm: {
				show: true
			}
		});
	}

	showRepeatForm() {
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
		this.onEnter = this.onEnter.bind(this);
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
				console.log(data)
			}
		});

		e.preventDefault();
	}

	onEnter(e) {
		console.log(12121)
		if (e.keyCode == 10 || e.keyCode == 13) {
			this.onAdd(e);
		}
	}

	hideForm(e) {
		this.state.app.setState({
			addForm: {
				show: false
			}
		});

		e.preventDefault();
	}

	render() {
		var style = {};

		if (this.state.app.state.addForm.show) {
			style.display = 'flex';
		} else {
			style.display = 'none'
		}

		return (
			<div style = {style} className="add-form">
				<div className="add-form__close-div" onClick = {this.hideForm} />
				<form onSubmit = {this.onAdd} className="add-form__form">
					<button className="button add-form__button add-form__button_close" onClick = {this.hideForm} >&times;</button>
					<textarea className="textarea add-form__textarea" id="question" onChang = {this.questionChange} onKeyDown = {this.onEnter} ></textarea>
					<textarea className="textarea add-form__textarea" id="answer" onChange = {this.answerChange} onKeyDown = {this.onEnter} ></textarea>
					<button className="button add-form__button add-form__button_add" type="submit">Добавить</button>
				</form>
			</div>
		);
	}
};

class Cards extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			app: props.app
		};
	}

	render() {
		var cards = this.state.app.state.cards;

		if (cards.length == 0) {
			return (
				<div>Нет карт</div>
			);
		}

		cards = cards.map(card => {
			return <Card item = {card} />
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
		</div>
	);
}

class RepeatForm extends React.Component {
	constructor(props) {
		super(props);
		this.answerChange = this.answerChange.bind(this);
		this.closeRepeatForm = this.closeRepeatForm.bind(this);
		this.checkAnswer = this.checkAnswer.bind(this);
		this.state = {
			app: props.app,
			answer: '',
			showMessage: false,
			indexRepeatCard: 0,
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
			showMessage: false,
			indexRepeatCard: 0
		});
	}

	checkAnswer(e) {
		var type = e.type;
		var index = this.state.indexRepeatCard;
		var question = this.state.app.state.cardsForRepeat[index].question;
		var answer = this.state.app.state.cardsForRepeat[index].answer;
		var data = {
			url: '/index.php',
			action: 'repeatCard'
		};

		if (type == 'click' || (type == 'keydown' && (e.keyCode == 10 || e.keyCode == 13))) {
			if (this.state.checked) {
				index++;

				if (index >= this.state.app.state.cardsForRepeat.length) {
					this.closeRepeatForm();
					return;
				}

				this.setState({
					checked: false,
					indexRepeatCard: index,
					showMessage: false
				});
			}

			if (answer.toLowerCase() == this.state.answer.toLowerCase()) {
				this.setState({
					correct: true,
					showMessage: true,
					checked: true
				});
			} else {
				this.setState({
					correct: false,
					showMessage: true,
					correctAnswer: answer
				});
			}
		}

	}

	render() {
		var style = {};
		var index = this.state.indexRepeatCard;
		var question = '';
		var cards = this.state.app.state.cardsForRepeat;

		console.log(cards, index)

		if (cards.length > 0) {
			question = cards[index].question;
		}


		if (this.state.app.state.repeatForm.show) {
			style.display = 'flex';
		} else {
			style.display = 'none';
		}

		return (
			<div style = {style} className="repeat-form">
				<div className="repeat-form__close-div" onClick = {this.closeRepeatForm} ></div>
				<div className="repeat-form__inner">
					<div className="repeat-form__question">{question}</div>
					<RepeatFormMessage show = {this.state.showMessage} correct = {this.state.correct} answer = {this.state.correctAnswer} />
					<input onChange = {this.answerChange} onKeyDown = {this.checkAnswer} className="repeat-form__input"/>
					<button onClick = {this.checkAnswer} className="button repeat-form__button repeat-form__button_check">Проверить</button>
					<button onClick= {this.closeRepeatForm} className="button repeat-form__button repeat-form__button_close">&times;</button>
				</div>
			</div>
		);
	}
};

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