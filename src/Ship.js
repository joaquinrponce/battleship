const ship_proto = {
  hit (spot) {
    this.targets[spot] = 'hit'
  },
  isSunk() {
    let sunk = true
    this.targets.forEach(spot => {
      if (spot === null) sunk = false
    })
    return sunk
  }
}

const createShip = function (length) {
  const targets = (new Array(length)).fill(null, 0)
  const props = { targets: targets, length: length }
  return Object.assign(Object.create(ship_proto), props)
}

module.exports = { createShip }
