const Gameboard = require('./Gameboard')

const player_proto = {
  randomMove() {
    if (!this.computer) return
    let coords = []
    coords.push(Math.floor(Math.random() * 10))
    coords.push(Math.floor(Math.random() * 10))
    return coords
  }
}

const create = function (name, options = {ai: false}) {
  const props = {board: Gameboard.createBoard(), name: name, computer: options.ai}
  return Object.assign(Object.create(player_proto), props)
}

module.exports = { create }