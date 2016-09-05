import React from 'react';
import ReactDOM from 'react-dom';
import { atom } from 'derivable';
import { reactive } from 'react-derivable';
import { fromJS, List } from 'immutable';
import './index.css';

function generateSquareMatrix(num, value) {
  var arr = [], row, col;
  for(row = 0; row < num; row++) {
    arr[row] = [];
    for(col = 0; col < num; col++) {
      arr[row][col] = value;
    }
  }

  return arr;
}

function randomWithinRange(min, range) {
  return min + Math.floor(Math.random() * range);
}

function populateExpectedMatrix(matrix) {
  var numSelected = 0,
      randRow = 0,
      randCol = 0;

  while(numSelected < 9) {
    randRow = randomWithinRange(0, matrix.length);
    randCol = randomWithinRange(0, matrix[0].length);

    if(!matrix[randRow][randCol]) {
      matrix[randRow][randCol] = true;
      numSelected += 1;
    }
  }

  return matrix;
}

/**
 * State.
 */

const expectedBoard = atom(new List());

const turnCount = atom(0);

const curBoard = atom(new List());

const gameOver = turnCount.is(9);

const playerWon = gameOver.and(curBoard.is(expectedBoard));

function resetInXSecs(ms) {
  setTimeout(function () {
    curBoard.set(fromJS(generateSquareMatrix(5, false)));
  }, ms);
}

function startGame() {
  expectedBoard.set(fromJS(populateExpectedMatrix(generateSquareMatrix(5, false))));
  curBoard.set(expectedBoard.get());
  resetInXSecs(5000);
}

startGame();

/**
 * Actions which operate on state.
 */

let selectTile = (row, col) => {
  if (gameOver.get()) return;
  curBoard.swap(value => value.setIn([row, col], true));
  turnCount.swap(value => value + 1);
};

let restartGame = () => {
  turnCount.set(0);
  startGame();
};

/**
 * Reactive component which reads from state and modifies it via actions.
 */

var Grid = React.createClass({
  handleClick: function (rowIdx, colIdx) {
    this.props.onTileClick(rowIdx, colIdx);
  },

  render: function () {
    return (
      <div className="recall-grid">
        {this.props.matrix.map(function (row, rowIdx) {
          return (
            <div key={rowIdx} className="recall-grid-row">
              {row.map(function (col, colIdx) {
                return (
                  <div key={colIdx} className={'recall-grid-tile ' + (col ? 'is-selected' : '')} onClick={this.handleClick.bind(this, rowIdx, colIdx)}></div>
                );
              }.bind(this))}
            </div>
          );
        }.bind(this))}
      </div>
    );
  }
});

var Recall = reactive(React.createClass({
  render: function () {
    return (
      <div className="recall">
        <div className={'recall-message recall-win-message ' + (!playerWon.get() ? 'is-hidden' : '')}>
          You win!
          <button className="recall-restart-btn" onClick={restartGame}>Do it again!</button>
        </div>
        <div className={'recall-message recall-win-message ' + (!gameOver.get() || playerWon.get() ? 'is-hidden' : '')}>
          Whomp... Sorry
          <button className="recall-restart-btn" onClick={restartGame}>Try again...</button>
        </div>
        <Grid matrix={curBoard.get()} onTileClick={selectTile} />
      </div>
    );
  }
}));

let App = props => (
  <div>
    <hgroup>
      <h1 className="logo">Recall</h1>
      <h2>Select the nine tiles you see to win!</h2>
    </hgroup>
    <Recall />
  </div>
);

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
