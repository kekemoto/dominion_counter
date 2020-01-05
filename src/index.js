import React, { Fragment, useState, useEffect, useReducer } from 'react'
import ReactDOM from 'react-dom'
import { Map, List, Set, Range } from 'immutable'

import { CARDS } from '../data/cards.js'

// Common

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
	return collection.sortBy(x => x.sortOrder)
}

function findCardName(name){
	return CARDS.find(x => x.name === name)
}

const ACTION_CARDS = sortCard(CARDS.filter(x => x.type === 'action').toList())

const DEFAULT_FIELD_TYPE = Set(['point', 'money'])
const DEFAULT_FIELD_CARDS = CARDS.filter(x => DEFAULT_FIELD_TYPE.has(x.type)).toList()

// Common
// Field

function FieldPage({setPage, fieldAction}){
	const [cards, setCards] = useState(Set())

	function isSelect(card){
		return cards.has(card)
	}

	function add(card){
		setCards(cards.add(card))
	}

	function remove(card){
		setCards(cards.delete(card))
	}

	function toggle(card){
		isSelect(card) ? remove(card) : add(card)
	}

	function random(){
		setCards(shuffleList(ACTION_CARDS).take(10).toSet())
	}

	function submit(){
		fieldAction({type: 'set', cards: cards.values()})
		setPage('DeckPage')
	}
	
	return <Fragment>
		<div className='field-title'>プレイするカードを選択</div>
		<div className='row'>{
			ACTION_CARDS.map(card => <div key={card.name} className={`field-card ${isSelect(card) && 'field-selected'}`} onClick={() => toggle(card)}>{card.name}</div>)
				.push(<div key={'random'} className={'field-card field-random'} onClick={random}>ランダム</div>)
		}</div>
		<div onClick={submit} className="field-submit">決定</div>
		</Fragment>
}

// Field
// Deck

function DeckModeAdd({setPage, field, deckAction}){
	function submit(card){
		deckAction({type: 'add', card})
		setPage('DeckPage')
	}

	const fieldCards = field.concat(DEFAULT_FIELD_CARDS)

	return <Fragment>
		<div className='add-card-title'>デッキに追加するカード</div>
		{fieldCards.map(x => <div key={x.name} onClick={() => submit(x)} className='add-card-card'>{x.name}</div>)}
		<section onClick={() => setPage('DeckPage')} className="section pure-button">戻る</section>
	</Fragment>
}

function deckSize(deck){
 return deck.reduce((total, size) => total + size)
}

function DeckView({deck, onClickCard}){
	return <div className='row'>
		{deck.map((size, card) => 
			<div key={card.name} onClick={event => onClickCard(card, event)} className='column card-view'>
				<div className='card-view-name'>{card.name}</div>
				<div className='card-view-meta'>
					<div>{size}枚：</div>
					<div>{Math.round(size * 1000 / deckSize(deck)) / 10}％</div>
				</div>
			</div>
		).toList()}
	</div>
}

function DeckViewMode({setPage, deck, resetGame}){
	const totalPoint = deck.filter((_, card) => card.type === 'point').reduce((total, size, card) => total + (card.value * size), 0)

	return <Fragment>
		<div className='deck-footer row'>
			<div onClick={() => setPage('DeckModeAdd')} className='pure-button deck-cell'>追加</div>
			<div onClick={() => setPage('DeckModeRemove')} className='pure-button deck-cell'>削除</div>
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
			<DeckView deck={deck}/>
		</section>
	</Fragment>
}

function DeckPage(props){
	return <DeckViewMode {...props} />
}

function DeckModeRemove({setPage, deck, deckAction}){
	return <Fragment>
		<section className='section'>削除するカードを選択</section>
		<section className='section'>
			<DeckView deck={deck} onClickCard={card => deckAction({type: 'remove', card})} />
		</section>
		<section onClick={() => setPage('DeckPage')} className="section pure-button">戻る</section>
	</Fragment>
}

// Deck
// App

function deckInit(){
	return Map([[findCardName('銅貨'), 7], [findCardName('屋敷'), 3]])
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

const initPage = 'FieldPage'

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
		FieldPage: <FieldPage setPage={setPage} fieldAction={fieldAction}/>,
		DeckPage: <DeckPage setPage={setPage} deck={deck} resetGame={resetGame}/>,
		DeckModeAdd: <DeckModeAdd setPage={setPage} field={field} deckAction={deckAction}/>,
		DeckModeRemove: <DeckModeRemove setPage={setPage} deck={deck} deckAction={deckAction}/>,
	}

	return PAGES[page]
}

ReactDOM.render(<App />, document.getElementById("app"))
