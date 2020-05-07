const Gameboard = require('./Gameboard')

let testBoard

beforeEach(() => {
  testBoard = Gameboard.createBoard()
  testBoard.placeShip('destroyer', [3, 5], 'vertical')
  testBoard.placeShip('submarine', [7, 2], 'horizontal')
})

test('board contains one of each ship', () => {
  expect(testBoard.ships.destroyer).toStrictEqual({targets: [null, null], length: 2})
  expect(testBoard.ships.submarine).toStrictEqual({targets: [null, null, null], length: 3})
  expect(testBoard.ships.cruiser).toStrictEqual({targets: [null, null, null], length: 3})
  expect(testBoard.ships.battleship).toStrictEqual({targets: [null, null, null, null], length: 4})
  expect(testBoard.ships.carrier).toStrictEqual({targets: [null, null, null, null, null], length: 5})
})

test('correctly identifies vertical ship at coordinates', () => {
  expect(testBoard.shipAt([3, 5])).toStrictEqual(testBoard.ships.destroyer)
  expect(testBoard.shipAt([3, 6])).toStrictEqual(testBoard.ships.destroyer)
})

test('correctly identifies horizontal ship at coordinates', () => {
  expect(testBoard.shipAt([7, 2])).toStrictEqual(testBoard.ships.submarine)
  expect(testBoard.shipAt([8, 2])).toStrictEqual(testBoard.ships.submarine)
  expect(testBoard.shipAt([9, 2])).toStrictEqual(testBoard.ships.submarine)
})

test('receives an attack with coords and marks ship hit on spot', () => {
  testBoard.receiveAttack([3, 5])
  expect(testBoard.ships.destroyer.targets[0]).toBe('hit')
})

test('does not allow to place a ship vertically beyond max range', () => {
  expect(testBoard.placeShip('carrier', [0, 6], 'vertical')).toBe('Ship must be placed within the 10 by 10 grid')
})

test('does not allow to place a ship horizontally beyond max range', () => {
  expect(testBoard.placeShip('carrier', [6, 0], 'horizontal')).toBe('Ship must be placed within the 10 by 10 grid')
})

test('does not allow to replace a ship', () => {
  expect(testBoard.placeShip('submarine', [1, 5], 'horizontal')).toBe('Ship has already been placed')
})

test('does not allow to place a ship on top of other ships', () => {
  expect(testBoard.placeShip('battleship', [3, 5], 'horizontal')).toBe('A ship is already in that spot')
})

test('saves attacked spot and returns illegal move when attacking a spot twice', () => {
  testBoard.receiveAttack([3, 5])
  expect(testBoard.marks).toContainEqual([3, 5])
  expect(testBoard.receiveAttack([3, 5])).toBe('Cannot attack the same target more than once')
})

test('returns true when all ships are sunk', () => {
  for (let shipName in testBoard.ships) {
    let ship = testBoard.ships[shipName]
    for (let i = 0; i < ship.length; i++) {
      ship.hit(i)
    }
  }
  expect(testBoard.areAllShipsSunk()).toBe(true)
})

test('returns false when not all ships are sunk', () => {
  expect(testBoard.areAllShipsSunk()).toBe(false)
})