import {round} from 'mathjs'

import {DRAW_SIZE, EXP_DIGIT} from './common'

onmessage = function(e){
	let elements = []
	e.data.forEach(cardSize => {
		const [card, size] = cardSize
		const value = card.type === 'money' ? card.value : 0
		
		for(let i = 0; i < size; i++){
			elements.push(value)
		}
	})

	let result = exp(elements, DRAW_SIZE)
	result = round(result, EXP_DIGIT)

	postMessage(result)
}

function exp(elements, size) {
	const patterns = comb(elements, size)

	const pattern_size = patterns.length

	let group = new Map()
	for (let pattern of patterns) {
		const value = sum(pattern)

		let count = group.get(value) || 0

		group.set(value, count + 1)
	}

	let exp = 0
	for (let k of group.keys()) {
		exp += k * group.get(k) / pattern_size
	}
	return exp
}

function sum(arr) {
	let total = 0
	for (let i of arr) {
		total += i
	}
	return total
}

function comb(arr, size) {
	let ans = [];
	if (arr.length < size) {
		return []
	}
	if (size === 1) {
		for (let i = 0; i < arr.length; i++) {
			ans[i] = [arr[i]];
		}
	} else {
		for (let i = 0; i < arr.length - size + 1; i++) {
			let row = comb(arr.slice(i + 1), size - 1);
			for (let j = 0; j < row.length; j++) {
				ans.push([arr[i]].concat(row[j]));
			}
		}
	}
	return ans;
}

