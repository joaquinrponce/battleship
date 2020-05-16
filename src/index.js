import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Gameboard from './Gameboard.js'
import PropTypes from 'prop-types'

class Square extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (e) {
    if (!this.props.clickable) return
    if (this.props.changeOrientation !== null) {
      this.props.changeOrientation(e)
    } else {
      this.props.sendAttack(this.props.coords)
    }
  }

  render () {
    return (
      <div className={this.props.className} data-coords={this.props.coords} onClick={this.handleClick}></div>
    )
  }
}

Square.propTypes = {
  clickable: PropTypes.bool,
  changeOrientation: PropTypes.func,
  sendAttack: PropTypes.func,
  coords: PropTypes.array,
  className: PropTypes.string
}

class EnemyBoard extends React.Component {
  constructor (props) {
    super(props)
    this.state = { hits: [], misses: [] }
  }

  makeSquare (coords) {
    let className = 'square empty'
    let clickable = true
    if (arrayContainsCoords(this.props.hits, coords)) {
      className = 'square empty hit'
      clickable = false
    } else if (arrayContainsCoords(this.props.misses, coords)) {
      className = 'square empty clicked'
      clickable = false
    }
    return <Square className={className} key={coords} clickable={clickable} test={true} x={coords[0]} y={coords[1]} coords={coords} sendAttack={this.props.sendAttack} changeOrientation={null}/>
  }

  render () {
    const squares = []
    for (let i = 9; i >= 0; i--) {
      for (let j = 0; j <= 9; j++) {
        squares.push(this.makeSquare([j, i]))
      }
    }
    return (
      <div className='board enemy' onDragOver={this.allowDrop} onDrop={this.dropHandler}>{squares}</div>
    )
  }
}

EnemyBoard.propTypes = {
  hits: PropTypes.array,
  misses: PropTypes.array,
  sendAttack: PropTypes.func
}

class Board extends React.Component {
  constructor (props) {
    super(props)
    this.dropHandler = this.dropHandler.bind(this)
    this.changeShipOrientation = this.changeShipOrientation.bind(this)
  }

  makeSquare (coords) {
    let className = 'square empty'
    let changeOrientation = null
    let clickable = false
    if (arrayContainsCoords(this.props.hits, coords)) {
      className += ' hit'
    } else if (arrayContainsCoords(this.props.misses, coords)) {
      className += ' clicked'
    }
    if (arrayContainsCoords(this.props.shipSpaces, coords)) {
      className += ' occupied'
      changeOrientation = this.changeShipOrientation
      clickable = true
    }
    return <Square className={className} key={coords} clickable={clickable} test={true} x={coords[0]} y={coords[1]} coords={coords} sendAttack={this.props.sendAttack} changeOrientation={changeOrientation}/>
  }

  allowDrop (e) {
    e.preventDefault()
  }

  dropHandler (e) {
    const length = e.dataTransfer.getData('length')
    const name = e.dataTransfer.getData('name')
    const sourceCoords = e.target.dataset.coords
    const coords = [parseInt(sourceCoords[0]), parseInt(sourceCoords[2])]
    if (this.hasEnoughSpace(coords, length, 'vertical') && !arrayContainsCoords(this.props.shipSpaces, coords)) {
      const placedShips = JSON.parse(JSON.stringify(this.props.ships))
      placedShips.push({ name: name, coords: coords, length: length, orientation: 'vertical' })
      this.props.updateShips(placedShips)
    }
  }

  findAdjacentNodes (coords) {
    let adjacentNodes = []
    const x = parseInt(coords[0])
    const y = parseInt(coords[1])
    adjacentNodes = adjacentNodes.concat([[x + 1, y + 1]])
    adjacentNodes = adjacentNodes.concat([[x - 1, y - 1]])
    adjacentNodes = adjacentNodes.concat([[x, y + 1]])
    adjacentNodes = adjacentNodes.concat([[x, y - 1]])
    adjacentNodes = adjacentNodes.concat([[x - 1, y + 1]])
    adjacentNodes = adjacentNodes.concat([[x + 1, y - 1]])
    adjacentNodes = adjacentNodes.concat([[x - 1, y]])
    adjacentNodes = adjacentNodes.concat([[x + 1, y]])
    return adjacentNodes
  }

  hasEnoughSpace (coords, length, orientation = 'horizontal') {
    let enoughSpace = true
    const adjacentNodes = this.findAdjacentNodes(coords)
    const x = coords[0]
    const y = coords[1]
    adjacentNodes.forEach(node => {
      if (node === null) return
      if (arrayContainsCoords(this.props.shipSpaces, node) && (node[0] !== coords[0] && node[1] !== coords[1])) {
        enoughSpace = false
      }
    })
    for (let i = 1; i < length; i++) {
      let node
      if (orientation === 'horizontal') {
        if (x + i > 9) {
          enoughSpace = false
          break
        }
        node = [x + i, y]
      } else {
        if (y - i < 0) {
          enoughSpace = false
          break
        }
        node = [x, y - i]
      }
      if (arrayContainsCoords(this.props.shipSpaces, node)) {
        enoughSpace = false
        break
      }
    }
    return enoughSpace
  }

  changeShipOrientation (e) {
    const sourceCoords = e.target.dataset.coords
    const coords = [parseInt(sourceCoords[0]), parseInt(sourceCoords[2])]
    let targetShip = null
    this.props.ships.forEach(ship => {
      if (ship.coords[0] === coords[0] && ship.coords[1] === coords[1]) {
        targetShip = ship
      }
    })
    if (targetShip === null) return
    const length = targetShip.length
    const name = targetShip.name
    if (this.hasEnoughSpace(coords, length, 'horizontal')) {
      const placedShips = this.props.ships
      const newShips = placedShips.filter(ship => ship !== targetShip)
      newShips.push({ name: name, length: length, coords: coords, orientation: 'horizontal' })
      this.props.updateShips(newShips)
    }
  }

  render () {
    const squares = []
    for (let i = 9; i >= 0; i--) {
      for (let j = 0; j <= 9; j++) {
        squares.push(this.makeSquare([j, i]))
      }
    }
    return (
      <div className='board' onDragOver={this.allowDrop} onDrop={this.dropHandler}>{squares}</div>
    )
  }
}

Board.propTypes = {
  ships: PropTypes.array,
  shipSpaces: PropTypes.array,
  hits: PropTypes.array,
  misses: PropTypes.array,
  sendAttack: PropTypes.func,
  updateShips: PropTypes.func
}

class Ship extends React.Component {
  drag (e) {
    e.dataTransfer.setData('length', e.target.dataset.size)
    e.dataTransfer.setData('name', e.target.id)
  }

  renderSquares (i) {
    const squares = []
    for (let j = 0; j < i; j++) {
      squares.push(<Square className='square empty' key={j}/>)
    }
    return squares
  }

  render () {
    let className = 'ship'
    if (this.props.hidden) className += ' hidden'
    return (
      <div className={className} id={this.props.name} data-size={this.props.size} draggable='true' onDragStart={this.drag}>
        {this.renderSquares(this.props.size)}
      </div>
    )
  }
}

Ship.propTypes = {
  hidden: PropTypes.bool,
  size: PropTypes.number,
  name: PropTypes.string
}

class Game extends React.Component {
  constructor (props) {
    super(props)
    this.state = { ships: [], playerBoard: null, gameStart: false, computerBoard: null, turn: 'player', computerAttempts: [], enemyHits: [], enemyMisses: [], playerHits: [], playerMisses: [], shipSpaces: [] }
    this.startGame = this.startGame.bind(this)
    this.updateShips = this.updateShips.bind(this)
    this.hitNotifier = this.hitNotifier.bind(this)
    this.checkForVictory = this.checkForVictory.bind(this)
    this.sendAttack = this.sendAttack.bind(this)
  }

  renderShips () {
    const shipRows = []
    const placedShipNames = []
    const shipsToPlace = [
      { name: 'destroyer', size: 2 },
      { name: 'submarine', size: 3 },
      { name: 'cruiser', size: 3 },
      { name: 'battleship', size: 4 },
      { name: 'carrier', size: 5 }
    ]
    this.state.ships.forEach(ship =>
      placedShipNames.push(ship.name))

    shipsToPlace.forEach(ship => {
      if (placedShipNames.includes(ship.name)) {
        shipRows.push(<Ship key={ship.name} name={ship.name} size={ship.size} hidden={true}/>)
      } else {
        shipRows.push(<Ship key={ship.name} name={ship.name} size={ship.size}/>)
      }
    })
    return shipRows
  }

  makeRandomCoords () {
    const coords = []
    coords[0] = Math.floor(Math.random() * 10)
    coords[1] = Math.floor(Math.random() * 10)
    return coords
  }

  makeRandomOrientation () {
    if (Math.floor(Math.random() * 11) < 5) {
      return 'horizontal'
    } else {
      return 'vertical'
    }
  }

  makeComputerBoard () {
    const names = ['destroyer', 'submarine', 'cruiser', 'battleship', 'carrier']
    const computerBoard = Gameboard.createBoard()
    names.forEach(name => {
      let shipIsNotPlaced = true
      while (shipIsNotPlaced) {
        if (computerBoard.placeShip(name, this.makeRandomCoords(), this.makeRandomOrientation()) === true) {
          shipIsNotPlaced = false
        }
      }
    })
    return computerBoard
  }

  startGame () {
    if (this.state.gameStart) {
      this.setState({ ships: [], playerBoard: null, gameStart: false, computerBoard: null, turn: 'player', computerAttempts: [], enemyHits: [], enemyMisses: [], playerHits: [], playerMisses: [], shipSpaces: [] })
      return
    }
    if (this.state.ships.length !== 5) {
      alert('You must place all your ships first!')
      return
    }
    const playerBoard = Gameboard.createBoard()
    this.state.ships.forEach(ship => {
      if (playerBoard.placeShip(ship.name, ship.coords, ship.orientation) !== true) {
        console.log(ship.name, ship.coords, ship.orientation)
        console.log(playerBoard.placeShip(ship.name, ship.coords, ship.orientation))
      }
    })
    const computerBoard = this.makeComputerBoard()
    this.setState({ ships: this.state.ships, playerBoard: playerBoard, gameStart: true, computerBoard: computerBoard, turn: 'player', computerAttempts: [], enemyHits: [], enemyMisses: [], playerHits: [], playerMisses: [], shipSpaces: this.state.shipSpaces })
  }

  makeShipSpaces (ship) {
    const shipSpaces = []
    for (let i = 0; i < ship.length; i++) {
      let x
      let y
      if (ship.orientation === 'vertical') {
        x = ship.coords[0]
        y = ship.coords[1] - i
      } else {
        x = ship.coords[0] + i
        y = ship.coords[1]
      }
      shipSpaces.push([x, y])
    }
    return shipSpaces
  }

  updateShips (ships) {
    let shipSpaces = []
    ships.forEach(ship => {
      shipSpaces = shipSpaces.concat(this.makeShipSpaces(ship))
    })
    this.setState({ ships: ships, gameStart: this.state.gameStart, shipSpaces: shipSpaces })
  }

  computerTurn () {
    let coords = this.makeRandomCoords()
    while (arrayContainsCoords(this.state.computerAttempts, coords)) {
      coords = this.makeRandomCoords()
    }
    if (this.state.playerBoard.receiveAttack(coords) === true) {
      this.hitNotifier('computer', 'computer', coords)
    } else {
      this.hitNotifier('computer', 'player', coords)
    }
  }

  sendAttack (coords) {
    if (this.state.turn === 'player') {
      if (this.state.computerBoard.receiveAttack(coords) === true) {
        this.hitNotifier('player', 'player', coords)
      } else {
        this.hitNotifier('player', 'computer', coords)
      }
    }
  }

  hitNotifier (origin, turn, coords) {
    const newState = JSON.parse(JSON.stringify(this.state))
    newState.playerBoard = this.state.playerBoard
    newState.computerBoard = this.state.computerBoard
    newState.turn = turn
    if (origin === 'computer') {
      newState.computerAttempts.push(coords)
      if (turn === 'computer') {
        newState.playerHits.push(coords)
      } else {
        newState.playerMisses.push(coords)
      }
    }
    if (origin === 'player' && turn === 'player') {
      newState.enemyHits.push(coords)
    } else if (origin === 'player' && turn === 'computer') {
      newState.enemyMisses.push(coords)
    }
    if (turn === 'computer') {
      this.setState(newState, this.computerTurn)
    } else {
      this.setState(newState)
    }
  }

  checkForVictory () {
    if (this.state.computerBoard.areAllShipsSunk()) {
      alert('you won')
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState !== this.state && this.state.gameStart === true) {
      this.checkForVictory()
    }
  }

  render () {
    const message = this.state.gameStart ? 'Fight!' : 'Place your ships!'
    const buttonText = this.state.gameStart ? 'Reset' : 'Start'
    return (
      <div className='container-main'>
        <div className='header'>{ message }</div>
        <div className='container-board'>
          <div className='playerBoard'><Board hits={this.state.playerHits} misses={this.state.playerMisses} updateShips={this.updateShips} ships={this.state.ships} shipSpaces={this.state.shipSpaces}/></div>
          { this.state.gameStart === true && <div className='enemyBoard'><EnemyBoard board={this.state.computerBoard} test={'test'} hitNotifier={this.hitNotifier} turn={this.state.turn} hits={this.state.enemyHits} misses={this.state.enemyMisses} sendAttack={this.sendAttack}/></div> }
          { this.state.gameStart === false && <div className='placeShips'>{ this.renderShips() }</div> }
        </div>
        <button type='button' onClick={this.startGame}>{buttonText}</button>
      </div>
    )
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
)

/* helper function for finding coords in arrays */

function arrayContainsCoords (array, coords) {
  return array.some(array => {
    if (array === undefined || array === null) return false
    return array[0] === coords[0] && array[1] === coords[1]
  })
}
