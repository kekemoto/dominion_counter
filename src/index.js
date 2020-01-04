import React, { Fragment, useState, useEffect, useReducer } from 'react'
import ReactDOM from 'react-dom'
import { Map, List, Set, Range } from 'immutable'

function shuffleList(list){
	for(let i = list.size - 1; i > 0; i--){
		let r = Math.floor(Math.random() * (i + 1))
		let tmp = list.get(i)
		list = list.set(i, list.get(r))
		list = list.set(r, tmp)
	}

	return list
}

function comparator(a, b){
	if (a < b) { return -1 }
	if (a > b) { return 1 }
	return 0
}

function sortCard(collection){
	return collection.sort((a,b) => comparator(a.id, b.id))
}

class Card {
	constructor(id, name, type, params = {}) {
		this.id = id
		this.name = name
		this.type = type
		
		for(let key in params){
			this[key] = params[key]
		}
	}
}

const ALL_CARDS = Map([
	new Card(1, '金貨', 'money', {value: 3}),
	new Card(2, '銀貨', 'money', {value: 2}),
	new Card(3, '銅貨', 'money', {value: 1}),
	new Card(4, '属州', 'point', {value: 6}),
	new Card(5, '公領', 'point', {value: 3}),
	new Card(6, '屋敷', 'point', {value: 1}),
	new Card(7, '呪い', 'point', {value: -1}),
	new Card(8, '地下貯蔵庫', 'action'),
	new Card(9, '礼拝堂', 'action'),
	new Card(10, '堀', 'action'),
	new Card(11, '家臣', 'action'),
	new Card(12, '工房', 'action'),
	new Card(13, '商人', 'action'),
	new Card(14, '前駆者', 'action'),
	new Card(15, '村', 'action'),
	new Card(16, '改築', 'action'),
	new Card(17, '鍛冶屋', 'action'),
	new Card(18, '金貸し', 'action'),
	new Card(19, '玉座の間', 'action'),
	new Card(20, '密猟者', 'action'),
	new Card(21, '民兵', 'action'),
	new Card(22, '役人', 'action'),
	new Card(23, '庭園', 'action'),
	new Card(24, '市場', 'action'),
	new Card(25, '衛兵', 'action'),
	new Card(26, '議事堂', 'action'),
	new Card(27, '研究所', 'action'),
	new Card(28, '鉱山', 'action'),
	new Card(29, '祝祭', 'action'),
	new Card(30, '書庫', 'action'),
	new Card(31, '山賊', 'action'),
	new Card(32, '魔女', 'action'),
	new Card(33, '職人', 'action'),
].map(x => [x.id, x]))

const ACTION_CARDS = sortCard(ALL_CARDS.filter(x => x.type === 'action').toList())

const DEFAULT_FIELD_TYPE = Set(['point', 'money'])
const DEFAULT_FIELD_CARDS = ALL_CARDS.filter(x => DEFAULT_FIELD_TYPE.has(x.type)).toList()

function SetField({setPage, fieldAction}){
	const [cards, setCards] = useState(Map())

	function isSelect(card){
		return cards.has(card.id)
	}

	function select(card){
		setCards(cards.set(card.id, card))
	}

	function remove(card){
		setCards(cards.delete(card.id))
	}

	function toggle(card){
		isSelect(card) ? remove(card) : select(card)
	}

	function random(){
		setCards(Map(shuffleList(ACTION_CARDS).take(10).map(x => [x.id, x])))
	}

	function submit(){
		fieldAction({type: 'set', cards: cards.values()})
		setPage('deckView')
	}
	
	return <Fragment>
		<div className='field-title'>プレイするカードを選択</div>
		<div className='row'>{
			ACTION_CARDS.map(card => <div key={card.id} className={`field-card ${isSelect(card) && 'field-selected'}`} onClick={() => toggle(card)}>{card.name}</div>)
				.push(<div key={'random'} className={'field-card field-random'} onClick={random}>ランダム</div>)
		}</div>
		<div onClick={submit} className="field-submit">決定</div>
		</Fragment>
}

function AddCard({setPage, field, deckAction}){
	function submit(card){
		deckAction({type: 'add', card})
		setPage('deckView')
	}

	const fieldCards = field.concat(DEFAULT_FIELD_CARDS)

	return <Fragment>
		<div className='add-card-title'>デッキに追加するカード</div>
		{fieldCards.map(x => <div key={x.id} onClick={() => submit(x)} className='add-card-card'>{x.name}</div>)}
		<section onClick={() => setPage('deckView')} className="section pure-button">戻る</section>
	</Fragment>
}

function deckSize(deck){
 return deck.reduce((total, size) => total + size)
}

function DeckCardList({deck, onClickCard}){
	return deck.map((size, card) => 
		<div key={card.id} onClick={event => onClickCard(card, event)} className='row'>
			<div>{card.name}：</div>
			<div>{size}枚：</div>
			<div>{Math.round(size * 1000 / deckSize(deck)) / 10}％</div>
		</div>
	).toList()
}

function DeckView({setPage, deck, resetGame}){
	const totalPoint = deck.filter((_, card) => card.type === 'point').reduce((total, size, card) => total + (card.value * size), 0)

	return <Fragment>
		<div className='deck-footer row'>
			<div onClick={() => setPage('addCard')} className='pure-button deck-cell'>追加</div>
			<div onClick={() => setPage('removeCard')} className='pure-button deck-cell'>削除</div>
			<div onClick={resetGame} className='pure-button deck-cell'>リセット</div>
		</div>

		<section className='deck-section'>
			<div className='row'>
				<div>総数：</div>
				<div>{deckSize(deck)}</div>
			</div>
			<div className='row'>
				<div>得点：</div>
				<div>{totalPoint}</div>
			</div>
		</section>

		<section className='deck-section'>
			<DeckCardList deck={deck}/>
		</section>
	</Fragment>
}

function RemoveCard({setPage, deck, deckAction}){
	return <Fragment>
		<section className='section'>削除するカードを選択</section>
		<section className='section'>
			<DeckCardList deck={deck} onClickCard={card => deckAction({type: 'remove', card})} />
		</section>
		<section onClick={() => setPage('deckView')} className="section pure-button">戻る</section>
	</Fragment>
}

function deckInit(){
	return Map([[ALL_CARDS.get(3), 7], [ALL_CARDS.get(6), 3]])
}

function deckReducer(state, action){
	let size = null
	switch (action.type) {
		case 'add':
			size = state.get(action.card)
			if(size){
				return state.set(action.card, size + 1)
			} else {
				return state.set(action.card, 1)
			}
		case 'remove':
			size = state.get(action.card) || 0
			if(size <= 1){
				return state.delete(action.card)
			} else {
				return state.set(action.card, size - 1)
			}
		case 'reset':
			return deckInit()
		default:
			throw new Error(action.type)
	}
}

function fieldReducer(state, action){
	switch (action.type) {
		case 'set':
			return sortCard(List(action.cards))
		case 'reset':
			return List()
		default:
			throw new Error(action.type)
	}
}

const initPage = 'setField'

function App(){
	const [deck, deckAction] = useReducer(deckReducer, null, deckInit)

	const [field, fieldAction] = useReducer(fieldReducer, List())

	const [page, setPage] = useState(initPage)

	function resetGame(){
		deckAction({type: 'reset'})
		fieldAction({type: 'reset'})
		setPage(initPage)
	}

	const PAGES = {
		setField: <SetField setPage={setPage} fieldAction={fieldAction}/>,
		deckView: <DeckView setPage={setPage} deck={deck} resetGame={resetGame}/>,
		addCard: <AddCard setPage={setPage} field={field} deckAction={deckAction}/>,
		removeCard: <RemoveCard setPage={setPage} deck={deck} deckAction={deckAction}/>,
	}

	return PAGES[page]
}

ReactDOM.render(<App />, document.getElementById("app"))
