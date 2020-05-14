import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Gameboard from './Gameboard.js'

class Square extends React.Component {
  render () {
    return (
      <div className='square empty' data-coords={this.props.coords} onClick={this.props.handleClick}></div>
    )
  }
}

class EnemyBoard extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {
    if (e.target.classList.contains('clicked') || e.target.classList.contains('hit')) return
    if ( this.props.turn === 'player') {
    const coords = e.target.dataset.coords
    const sanitizedCoords = [coords[0], coords[2]]
    if (this.props.board.receiveAttack(sanitizedCoords) === true) {
      e.target.classList.add('hit')
      this.props.hitNotifier('player', this.props.board)
    } else {
      e.target.classList.add('clicked')
      this.props.hitNotifier('computer', this.props.board)
      }
    }
  }

  makeSquare(coords) {
    return <Square key={coords} coords={coords} handleClick={this.handleClick}/>
  }

  render () {
    let squares = []
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

class Board extends React.Component {
  constructor(props) {
    super(props)
    this.state = {ships: this.props.ships}
    this.dropHandler = this.dropHandler.bind(this)
    this.changeShipOrientation = this.changeShipOrientation.bind(this)
  }

  makeSquare(coords) {
    return <Square key={coords} coords={coords}/>
  }

  allowDrop(e){
    e.preventDefault();
  }

  dropHandler(e) {
    const length = e.dataTransfer.getData('length')
    const name = e.dataTransfer.getData('name')
    const coords = e.target.dataset.coords
    const targetSpace = document.querySelector(`[data-coords='${coords[0]},${coords[2]}']`)
    if ( this.hasEnoughSpace(coords, length, 'vertical') && targetSpace.classList.contains('empty')) {
      const placedShips = JSON.parse(JSON.stringify(this.props.ships))
      placedShips.push({name: name, coords: coords, length: length, orientation: 'vertical'})
      this.props.updateShips(placedShips)
      document.getElementById(name).draggable = false
      document.getElementById(name).style.opacity = 0
    }
  }

  findAdjacentNodes(coords) {
    let adjacentNodes = []
    const x = parseInt(coords[0])
    const y = parseInt(coords[2])
    adjacentNodes.push(document.querySelector(`[data-coords='${x+1},${y+1}']`))
    adjacentNodes.push(document.querySelector(`[data-coords='${x-1},${y-1}']`))
    adjacentNodes.push(document.querySelector(`[data-coords='${x},${y+1}']`))
    adjacentNodes.push(document.querySelector(`[data-coords='${x},${y-1}']`))
    adjacentNodes.push(document.querySelector(`[data-coords='${x-1},${y+1}']`))
    adjacentNodes.push(document.querySelector(`[data-coords='${x+1},${y-1}']`))
    adjacentNodes.push(document.querySelector(`[data-coords='${x-1},${y}']`))
    adjacentNodes.push(document.querySelector(`[data-coords='${x+1},${y}']`))
    return adjacentNodes
    }
  
  hasEnoughSpace(coords, length, orientation = 'horizontal') {
    let enoughSpace = true
    let adjacentNodes = this.findAdjacentNodes(coords)
    const x = parseInt(coords[0])
    const y = parseInt(coords[2])
    const parentNode = document.querySelector(`[data-coords='${x},${y}']`)
    adjacentNodes.forEach (node => {
      if (node === null) return
      if ((!node.classList.contains('empty') && node.classList[1] !== parentNode.classList[1])) {
        enoughSpace = false
      }
    })
    for (let i = 0; i < length; i++){
      let node; 
      node = document.querySelector(`[data-coords='${x},${y-i}']`)
      if (orientation === 'horizontal') {
      node = document.querySelector(`[data-coords='${x+i},${y}']`)
      }
      if (node === null || (node !== parentNode && !node.classList.contains('empty'))) {
        enoughSpace = false
        break
      }
    }
    return enoughSpace
    }
  
  removeOldShipSpaces(name) {
    const nodes = document.querySelectorAll(`.${name}`)
      nodes.forEach(node => {
        node.classList.remove(`${name}`)
        node.classList.add('empty')
      })
  
    }
  
  placeAllShips () {
    this.props.ships.forEach(ship => {
      this.placeShip(ship.name, ship.length, ship.coords, ship.orientation)
    })
  }
  
  componentDidUpdate (prevProps, prevState) {
    if (prevProps.ships !== this.props.ships) {
    this.props.ships.forEach(ship => {
      this.placeShip(ship.name, ship.length, ship.coords, ship.orientation)
    })
  }
  }

  changeShipOrientation(e) {
    const coords = e.target.dataset.coords
    const length = e.target.dataset.length
    const name = e.target.dataset.name
    if (this.hasEnoughSpace(coords, length)) {
      const placedShips = this.props.ships
      const ship = placedShips.find(ship => {
        return ship.name === name
       })
      const newShips = placedShips.filter(shippy => shippy !== ship)
      this.removeOldShipSpaces(name)
       newShips.push({name: name, length: length, coords: coords, orientation: 'horizontal'})
      this.props.updateShips(newShips)
    }
  }

  placeShip(name, length, coords, orientation) {
    for (let i = 0; i < length; i++) {
      let x;
      let y;
       if (orientation === 'vertical') {
       x = parseInt(coords[0])
       y = parseInt(coords[2]) - i
       } else {
          x = parseInt(coords[0]) + i
          y = parseInt(coords[2])
        }
        const node = document.querySelector(`[data-coords='${x},${y}']`)
        node.classList.add(`${name}`)
        node.classList.remove('empty')
        if (i === 0) {
          node.dataset.length = length
          node.dataset.orientation = orientation
          node.dataset.name = name
          node.addEventListener('click', this.changeShipOrientation)
        }
      }
    }

  componentDidMount() {
    this.placeAllShips()
  }

  render () {
    let squares = []
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

class Ship extends React.Component {
  drag(e) {
    e.dataTransfer.setData("length", e.target.dataset.size);
    e.dataTransfer.setData("name", e.target.id);
  }
  renderSquares(i) {
    let squares = []
    for (let j = 0; j < i; j++) {
      squares.push(<Square key={j}/>)
    }
    return squares
  }
  render () {
    return (
      <div className='ship' id={this.props.name} data-size={this.props.size} draggable='true' onDragStart={this.drag}>
        {this.renderSquares(this.props.size)}
      </div>
    )
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {ships: [], gameStart: false}
    this.startGame = this.startGame.bind(this)
    this.updateShips = this.updateShips.bind(this)
    this.hitNotifier = this.hitNotifier.bind(this)
    this.checkForVictory = this.checkForVictory.bind(this)
  }

  renderBoard(callback) {
    if (callback) {
      return <Board updateShips={callback} ships={this.state.ships}/>
    } else {
    return <Board ships={this.state.ships} placeShips={this.placeAllShips} />
    }
  }

  renderShips() {
    let shipRows = []
    shipRows.push(
      <Ship key='destroyer' name='destroyer' size={2}/>
    )
    shipRows.push(
      <Ship key='submarine' name='submarine' size={3}/>
    )
    shipRows.push(
      <Ship key='cruiser' name='cruiser' size={3}/>
    )
    shipRows.push(
      <Ship key='battleship' name='battleship' size={4}/>
    )
    shipRows.push(
      <Ship key='carrier' name='carrier' size={5}/>
    )
    return shipRows

  }

  makeRandomCoords() {
    const coords = []
    coords[0] = Math.floor(Math.random() * 10)
    coords[1] = Math.floor(Math.random() * 10)
    return coords
  }

  makeRandomOrientation() {
    if (Math.floor(Math.random() * 11) < 5) {
      return 'horizontal'
    } else {
      return 'vertical'
    }
  }

  makeComputerBoard() {
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

  startGame() {
    if (this.state.ships.length !== 5) {
      alert('You must place all your ships first!')
      return
    }
    const playerBoard = Gameboard.createBoard()
    this.state.ships.forEach( ship => {
      let saneCoords = [ship.coords[0], ship.coords[2]]
      if (playerBoard.placeShip(ship.name, saneCoords, ship.orientation) !== true) {
        console.log(ship.name, saneCoords, ship.orientation)
        console.log(playerBoard.placeShip(ship.name, saneCoords, ship.orientation))
      }
    })
    const computerBoard = this.makeComputerBoard()
    this.setState({ships: this.state.ships, playerBoard: playerBoard, gameStart: true, computerBoard: computerBoard, turn: 'player', computerAttempts: []})
  }

  updateShips(ships) {
      this.setState({ships: ships, gameStart: this.state.gameStart})
  }

  containsAttempt(attempts, coords) {
    return attempts.some(attempt => {
      if (attempt === undefined || attempt === null) return false
      return attempt[0] === coords[0] && attempt[1] === coords[1]
    })
  }

  computerTurn() {
    let coords = this.makeRandomCoords()
    console.log(coords, this.state.computerAttempts)
    while (this.containsAttempt(this.state.computerAttempts, coords)) {
      console.log('redoing coords')
      console.log(coords)
      coords = this.makeRandomCoords()
    }
    if (this.state.playerBoard.receiveAttack(coords) === true) {
      const cell = document.querySelector(`[data-coords='${coords[0]},${coords[1]}']`)
      cell.classList.add('hit')
      this.hitNotifier('computer', this.state.computerBoard, coords)
    } else {
    const cell = document.querySelector(`[data-coords='${coords[0]},${coords[1]}']`)
    cell.classList.add('clicked')
    this.hitNotifier('player', this.state.computerBoard, coords)
    }
  }

  checkForVictory() {
    if (this.state.computerBoard.areAllShipsSunk()) {
      alert('you won')
    }
  }

  componentDidMount

  hitNotifier(turn, enemyBoard, coords = false) {
    const newState = JSON.parse(JSON.stringify(this.state))
    newState.playerBoard = this.state.playerBoard
    newState.computerBoard = enemyBoard
    newState.turn = turn
    if (coords) {
      newState.computerAttempts.push(coords)
    }
    if (turn === 'computer') {
    setTimeout(() => {this.setState(newState, this.computerTurn)}, 500)
    } else {
      this.setState(newState)
    }
  }

  render () {
    return (
      <div className='container-main'>
      <div className='header'>Place your ships!</div>
      <div className='container-board'>
      { this.state.gameStart === false && <div className='playerBoard'>{this.renderBoard(this.updateShips)}</div> }
      { this.state.gameStart === true && <div className='playerBoard'>{this.renderBoard()}</div> }
      { this.state.gameStart === true && <div className='enemyBoard'><EnemyBoard board={this.state.computerBoard} test={'test'} hitNotifier={this.hitNotifier} turn={this.state.turn} checkForVictory={this.checkForVictory}/></div> }
      { this.state.gameStart === false && <div className='placeShips'>{ this.renderShips() }</div> }
      </div>
      <button type='button' onClick={this.startGame}>Start Game</button>
      </div>
    )
  }

}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
)

/* game helpers */



