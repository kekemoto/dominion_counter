import { CARDS } from '../data/cards.js'

export function shuffleList(list){
	for(let i = list.size - 1; i > 0; i--){
		let r = Math.floor(Math.random() * (i + 1))
		let tmp = list.get(i)
		list = list.set(i, list.get(r))
		list = list.set(r, tmp)
	}

	return list
}

export function comparator(a, b){
	if (a < b) { return -1 }
	if (a > b) { return 1 }
	return 0
}

export function findCardName(name){
	return CARDS.find(x => x.name === name)
}

export const ACTION_CARDS = CARDS.filter(x => x.type === 'action')

export const DEFAULT_FIELD_CARDS = CARDS.filter(x => x.defaultField)
