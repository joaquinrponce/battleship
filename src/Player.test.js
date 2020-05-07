const Player = require('./Player')

const computerPlayer = Player.create('Computer', {ai: true})

test('creates a player with a name and a board object', () => {
  const newPlayer = Player.create('Foobar')
  expect(newPlayer.name).toBe('Foobar')
  expect(newPlayer.board).not.toBe(undefined)
})

test('AI player makes a random legal move', () => {
  expect(computerPlayer.randomMove()).toBeInstanceOf(Array)
})