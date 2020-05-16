const Ship = require('./Ship')

const boardProto = {
  containsCoords (marks, coords) {
    return marks.some(mark => {
      return mark[0] === coords[0] && mark[1] === coords[1]
    })
  },
  receiveAttack (coords) {
    if (this.containsCoords(this.marks, coords)) {
      return 'Cannot attack the same target more than once'
    } else if (coords.length < 2 || isNaN(coords[0]) || isNaN(coords[1])) {
      return 'invalid input'
    } else {
      this.marks.push(coords)
    }
    if (this.shipAt(coords)) {
      this.shipAt(coords).hit(this.shipPart(coords))
      return true
    }
    return false
  },
  placeShip (shipName, coords, orientation) {
    let shipWasPlaced = false
    let shipIsPlaceable = true
    const ship = this.ships[shipName]
    const coordsToPlace = []
    if (this.placedShips.includes(shipName)) return 'Ship has already been placed'
    if (coords[1] - (ship.length - 1) < 0 && orientation === 'vertical') return 'Ship must be placed within the 10 by 10 grid'
    if (10 - coords[0] < ship.length && orientation === 'horizontal') return 'Ship must be placed within the 10 by 10 grid'
    if (this.positions[coords] !== undefined) return 'A ship is already in that spot'
    for (let i = 0; i < ship.length; i++) {
      let coordsName = []
      if (orientation === 'vertical') {
        coordsName = [parseInt(coords[0]), parseInt(coords[1]) - i]
      } else {
        coordsName = [parseInt(coords[0]) + i, parseInt(coords[1])]
      }
      if (this.positions[coordsName] !== undefined) {
        shipIsPlaceable = false
      }
      coordsToPlace.push(coordsName)
    }
    if (shipIsPlaceable) {
      coordsToPlace.forEach(coordSet => {
        if (orientation === 'vertical') {
          this.positions[coordSet] = { ship: ship, part: [coordsToPlace.indexOf(coordSet)] }
          this.placedShips.push(shipName)
          shipWasPlaced = true
        } else {
          this.positions[coordSet] = { ship: ship, part: [coordsToPlace.indexOf(coordSet)] }
          this.placedShips.push(shipName)
          shipWasPlaced = true
        }
      })
    }
    return shipWasPlaced
  },
  shipAt (coords) {
    if (this.positions[coords] === undefined) return
    return this.positions[coords].ship
  },
  shipPart (coords) {
    return this.positions[coords].part
  },
  areAllShipsSunk () {
    let sunk = true
    for (const ship in this.ships) {
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
  const props = { ships: ships, marks: [], positions: [], placedShips: [] }
  return Object.assign(Object.create(boardProto), props)
}

module.exports = { createBoard }
