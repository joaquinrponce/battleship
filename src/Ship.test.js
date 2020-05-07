const Ship = require('./Ship')

let testShip;

beforeEach(() => {
  testShip = Ship.createShip(5)
})

test('creates a ship with targets and length properties', () => {
  expect(testShip).toMatchObject({targets: [null, null, null, null, null], length: 5})
})

test('hits a single target in the ship', () => {
  testShip.hit(3)
  expect(testShip.targets[3]).toBe('hit')
})

test('returns true when sunk', () => {
  testShip.hit(0)
  testShip.hit(1)
  testShip.hit(2)
  testShip.hit(3)
  testShip.hit(4)
  expect(testShip.isSunk()).toBe(true)
})

test('returns false when not sunk', () => {
  testShip.hit(1)
  testShip.hit(2)
  testShip.hit(4)
  testShip.hit(5)
  expect(testShip.isSunk()).toBe(false)
})