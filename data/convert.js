const fs = require('fs')
const parse = require('csv-parse/lib/sync')

let data = fs.readFileSync('./data/cards.csv')

data = parse(data, {columns: true})

data = JSON.stringify(data)

data = `
import { List } from 'immutable'

export const CARDS = List(${data})
`

fs.writeFileSync('./data/cards.js', data)
