class App extends React.Component {
	constructor(props) {
		super(props);
		this.updateAllCards = this.updateAllCards.bind(this);
		this.getCardsForRepeat = this.getCardsForRepeat.bind(this);
		this.state = {
			showAddForm: false,
			addForm: {
				show: false
			},
			cards: [],
			cardsForRepeat: [],
			indexRepeatCard: 0
			/*cards: [{
				id: 1,
				question: 'a',
				answer: 'b'
			}, {
				id: 2,
				question: 'b',
				answer: 'a'
			}]*/
		};
		this.updateAllCards();
		this.getCardsForRepeat();
	}

	updateAllCards() {
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

	render() {
		return (
			<div>
				<Panel app = {this} />
				<AddForm app = {this} />
				<Cards app = {this} />
			</div>
		);
	}
};

class Panel extends React.Component {
	constructor(props) {
		super(props);
		this.showAddForm = this.showAddForm.bind(this);
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

	render() {
		return (
			<div id="panel">
				<button>Тренироваться</button>
				<button onClick={this.showAddForm}>Добавить</button>
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

	hideForm() {
		this.state.app.setState({
			addForm: {
				show: false
			}
		});
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
		this.checkAnswer = this.checkAnswer.bind(this);
		this.state = {
			app: props.app,
			answer: ''
		}
	}

	answerChange(e) {
		this.setState({answer: e.target.value});
	}

	checkAnswer(e) {
		if (e.keyCode == 10 || e.keyCode == 13) {
			var index = this.state.app.state.indexRepeatCard;
			var answer = this.state.app.state.cardsForRepeat[index];

			if (answer == this.state.answer) {

			}
		}
	}

	render() {
		return (
			<div>
				<div>Вопрос</div>
				<div></div>
				<div>
					<input onChange = {this.answerChange} onKeyDown = {this.checkAnswer} />
				</div>
				<button>Проверить</button>
				<button>Далее</button>
			</div>
		);
	}
};

function RepeatFormMessage(props) {
	
}

ReactDOM.render(<App />, document.getElementById('app'));