const Ship = require('./Ship')

const board_proto = {
  containsCoords(marks, coords) {
  return marks.some(mark => {
    return mark[0] === coords[0] && mark[1] === coords[1]
  })
  },
  receiveAttack(coords) {
    if (this.containsCoords(this.marks, coords)) {
      return 'Cannot attack the same target more than once'
    } else if ( coords.length < 2 || isNaN(coords[0]) || isNaN(coords[1]) ) {
      return 'invalid input'
    } else {
    this.marks.push(coords)
    }
    if ( this.shipAt(coords) ) {
      this.shipAt(coords).hit(this.shipPart(coords))
      return true
    }
    return false
  },
  placeShip(shipName, coords, orientation) {
    let shipWasPlaced = false;
    if (this.placedShips.includes(shipName)) return 'Ship has already been placed'
    if (this.positions[coords] !== undefined) return 'A ship is already in that spot'
    const ship = this.ships[shipName]
    for (let i = 0; i < ship.length; i++) {
      if (orientation === 'vertical') {
        if ( coords[1] - ship.length < 0 ) return 'Ship must be placed within the 10 by 10 grid'
        let coordsName = [parseInt(coords[0]), parseInt(coords[1]) - i]
        this.positions[coordsName] = { ship: ship, part: [i]}
        this.placedShips.push(shipName)
        shipWasPlaced = true;
      } else {
        if ( coords[0] - ship.length < 0 ) return 'Ship must be placed within the 10 by 10 grid'
        let coordsName = [parseInt(coords[0]) + i, parseInt(coords[1])]
        this.positions[coordsName] = { ship: ship, part: [i]}
        this.placedShips.push(shipName)
        shipWasPlaced = true
      }
    }
    return shipWasPlaced
  },
  shipAt(coords) {
    if (this.positions[coords] === undefined) return
    return this.positions[coords].ship
  },
  shipPart(coords) {
    return this.positions[coords].part
  },
  areAllShipsSunk() {
  let sunk = true
    for (let ship in this.ships) {
      if (!this.ships[ship].isSunk()) {
        sunk = false
        break
      }
    }
  return sunk
  }
}

const createBoard = function () {
  const ships = {}
  ships.destroyer = Ship.createShip(2)
  ships.submarine = Ship.createShip(3)
  ships.cruiser = Ship.createShip(3)
  ships.battleship = Ship.createShip(4)
  ships.carrier = Ship.createShip(5)
  const props = {ships: ships, marks: [], positions: [], placedShips: []}
  return Object.assign(Object.create(board_proto), props)
}

module.exports = { createBoard }