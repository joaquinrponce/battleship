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
  handleClick(e) {
    e.target.style.background = 'red'
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
      <div className='board' onDragOver={this.allowDrop} onDrop={this.dropHandler}>{squares}</div>
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
      const placedShips = this.state.ships
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
        console.log(node)
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
    this.state.ships.forEach(ship => {
      this.placeShip(ship.name, ship.length, ship.coords, ship.orientation)
    })
    console.log(this.state.ships)
  }
  
  componentDidUpdate () {
    this.state.ships.forEach(ship => {
      this.placeShip(ship.name, ship.length, ship.coords, ship.orientation)
    })
    console.log(this.state.ships)
  }

  changeShipOrientation(e) {
    const coords = e.target.dataset.coords
    const length = e.target.dataset.length
    const name = e.target.dataset.name
    if (this.hasEnoughSpace(coords, length)) {
      const placedShips = this.state.ships
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
  startGame() {
    this.setState({gameStart: true})
  }


  updateShips(ships) {
      const newState = {ships: ships, gameStart: this.state.gameStart}
      this.setState(newState)
  }

  render () {
    return (
      <div className='container-main'>
      <div className='header'>Place your ships!</div>
      <div className='container-board'>
      { this.state.gameStart === false && <div className='playerBoard'>{this.renderBoard(this.updateShips)}</div> }
      { this.state.gameStart === true && <div className='playerBoard'>{this.renderBoard()}</div> }
      { this.state.gameStart === true && <div className='enemyBoard'><EnemyBoard /></div> }
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



