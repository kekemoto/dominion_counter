import React, { Fragment, useState, useEffect, useReducer } from 'react'
import ReactDOM from 'react-dom'
import { Map, List, Set, Range } from 'immutable'
import { combinations, round } from 'mathjs'

import { CARDS } from '../data/cards.js'
import { shuffleList, findCardName, ACTION_CARDS, DEFAULT_FIELD_CARDS, DRAW_SIZE } from './util.js'

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

function deckSize(deck){
 return deck.reduce((total, size) => total + size)
}

function deckPoint(deck){
	return deck.filter((_, card) => card.type === 'point').reduce((total, size, card) => total + (card.value * size), 0)
}

function drawRate(totalSize, includeSize, drawSize){
	const excludeSize = totalSize - includeSize
	const rate = 1 - (combinations(excludeSize, Math.min(excludeSize, drawSize)) / combinations(totalSize, drawSize))
	return round(rate * 100, 1)
}

function drawCardRate(card, deck){
	return drawRate(deckSize(deck), deck.get(card) ?? 0, DRAW_SIZE)
}

function DeckCards({cards, deck, onClickCard = new Function}){
	return <div className='row'>
		{cards.map(card => {
			const cardSize = deck.get(card) ?? 0

			return <div key={card.name} onClick={event => onClickCard(card, event)} className='column card-view'>
				<div className='card-view-info'>{card.name}</div>
				<div className='card-view-info'>
					<div>{cardSize}枚：{drawCardRate(card, deck)}％</div>
				</div>
			</div>
		})}
	</div>
}

function DeckView({deck, onClickCard = new Function}){
	const cards = List(deck.keys()).sortBy(x => x.sortOrder)

	return <DeckCards cards={cards} deck={deck} onClickCard={onClickCard} />
}

function DeckMetaView({deck}){
	return <Fragment>
		<div>総数：{deckSize(deck)}</div>
		<div>得点：{deckPoint(deck)}</div>
	</Fragment>
}

function DeckViewMode({setPage, deck, resetGame}){
	return <Fragment>
		<div className='deck-footer row'>
			<div onClick={() => setPage('DeckModeAdd')} className='pure-button deck-cell'>追加</div>
			<div onClick={() => setPage('DeckModeRemove')} className='pure-button deck-cell'>削除</div>
			<div onClick={resetGame} className='pure-button deck-cell'>リセット</div>
		</div>

		<section className='deck-section'>
			<DeckMetaView deck={deck} />
		</section>

		<section className='deck-section'>
			<DeckView deck={deck}/>
		</section>
	</Fragment>
}

function DeckModeAdd({setPage, field, deck, deckAction}){
	const fieldCards = field.concat(DEFAULT_FIELD_CARDS).sortBy(x => x.sortOrder)

	return <Fragment>
		<div className='add-card-title'>追加するカードを選択</div>
		<DeckCards cards={fieldCards} deck={deck} onClickCard={card => deckAction({type: 'add', card})} />
		<section onClick={() => setPage('DeckPage')} className="section pure-button">戻る</section>
	</Fragment>
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

function DeckPage(props){
	return <DeckViewMode {...props} />
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
			return List(action.cards).sortBy(x => x.sortOrder)
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
		DeckModeAdd: <DeckModeAdd setPage={setPage} field={field} deck={deck} deckAction={deckAction}/>,
		DeckModeRemove: <DeckModeRemove setPage={setPage} deck={deck} deckAction={deckAction}/>,
	}

	return PAGES[page]
}

ReactDOM.render(<App />, document.getElementById("app"))
