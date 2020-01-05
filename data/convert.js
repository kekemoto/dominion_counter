const fs = require('fs')
const parse = require('csv-parse/lib/sync')

let data = fs.readFileSync('./data/cards.csv')

data = parse(data, {columns: true})

// cast
let tmp = null
for(c of data){
	c.value = Number(c.value)

	tmp = toBool(c.defaultField);
	(tmp === undefined) && castError(c, 'defaultField')
	c.defaultField = tmp

	tmp = Number(c.sortOrder)
	Number.isNaN(tmp) && castError(c, 'sortOrder')
	c.sortOrder = tmp

	c.cost = Number(c.cost)
	Number.isNaN(tmp) && castError(c, 'cost')
	c.cost = tmp
}

data = JSON.stringify(data)

data = `
import { List } from 'immutable'

export const CARDS = List(${data})
`

fs.writeFileSync('./data/cards.js', data)


function toBool(string){
	if(/true|True|TRUE/.test(string)){
		return true
	} else if (/false|False|FALSE/.test(string)) {
		return false
	} else {
		return undefined
	}
}

function castError(card, key){
	throw new Error(`型変換できません。 ${key}:${card[key]} name:${card.name}`)
}
