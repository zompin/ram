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
			<div>
				<Panel app = {this} />
				<AddForm app = {this} />
				<RepeatForm app = {this} />
				<Cards app = {this} />
			</div>
		);
	}
};

class Panel extends React.Component {
	constructor(props) {
		super(props);
		this.showAddForm = this.showAddForm.bind(this);
		this.showRepearForm = this.showRepearForm.bind(this);
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

	showRepearForm() {
		this.state.app.setState({
			repeatForm: {
				show: true
			}
		});
	}

	render() {
		return (
			<div id="panel">
				<button onClick= {this.showRepearForm} >Тренироваться</button>
				<button onClick= {this.showAddForm} >Добавить</button>
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
			style.display = 'block';
		} else {
			style.display = 'none'
		}

		return (
			<div style={style}>
				<form onSubmit={this.onAdd} >
					<button onClick={this.hideForm}>Закрыть</button>
					<textarea id="question" onChange={this.questionChange}></textarea>
					<textarea id="answer" onChange={this.answerChange}></textarea>
					<button type="submit">Добавить</button>
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
			<div>{cards}</div>
		);
	}
};

function Card(props) {
	return (
		<div key = {props.item.id}>
			<div>{props.item.question}</div>
			<div>{props.item.answer}</div>
			<div>{props.item.repeat}</div>
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
			style.display = 'block';
		} else {
			style.display = 'none';
		}

		return (
			<div style = {style} >
				<div>{question}</div>
				<RepeatFormMessage show = {this.state.showMessage} correct = {this.state.correct} answer = {this.state.correctAnswer} />
				<div>
					<input onChange = {this.answerChange} onKeyDown = {this.checkAnswer} />
				</div>
				<button onClick = {this.checkAnswer} >Проверить</button>
				<button onClick= {this.closeRepeatForm} >Закрыть</button>
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
			<div style = {style} >Верно</div>
		);
	} else {
		return (
			<div style = {style} >{props.answer}</div>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));