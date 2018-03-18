import React, { Component } from 'react'
import VirtLottoContract from '../build/contracts/VirtLotto.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedNumber: 0,
      betAmmount: 0,
      currentTotalPrize: 0,
      betAmmountInputState: false,
      betButtonState: false,
      storageValue: 0,
      mainContract: null,
      accounts: null,
      winners: null,
      winNumber: 0,
      web3: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
    const contract = require('truffle-contract')
    const virtLotto = contract(VirtLottoContract)
    virtLotto.setProvider(this.state.web3.currentProvider)

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      virtLotto.deployed().then((instance) => {
        this.setState({
          mainContract: instance,
          accounts: accounts
        })
      }).then((result) => {
        this.updateCurrentTotalPrize()
      })
    })
  }

  selectNumber(value) {
    this.setState({ selectedNumber: value })
  }

  doBet() {
    // Validate input value
    if (this.state.selectedNumber === 0) {
      alert("Please pick a number");
      return;
    };
    if (isFloat(parseFloat(this.refs.betAmmount.value))) {
      this.setState({
        betAmmount: parseFloat(this.refs.betAmmount.value)
      })
    } else if (isInt(parseInt(this.refs.betAmmount.value))) {
      this.setState({
        betAmmount: parseInt(this.refs.betAmmount.value)
      })
    } else {
      alert("Please input numeric bet ammount")
    }
    this.contractPickNumber()
    this.updateCurrentTotalPrize()
    this.checkResult()
    // this.setState({
    //   betAmmountInputState: true,
    //   betButtonState: true
    // })
  }

  updateCurrentTotalPrize() {
    this.state.mainContract.getCurrentTotalBet.call().then((result) => {
      this.setState({
        currentTotalPrize: parseFloat(result.c[0]) / 10000
      })
    })
  }

  contractPickNumber(){
    // Pick random account to do bet, ignore account balance
    let bettor = this.state.accounts[Math.floor(Math.random()*this.state.accounts.length)];
    let betAmmount = this.state.web3.toWei(this.state.betAmmount, 'ether')
    this.state.mainContract.pickNumer(this.state.selectedNumber, {
      from: bettor,
      value: betAmmount,
      gas: 4000000
    })
  }

  setBetAmmount(event){
    this.setState({
      betAmmount: this.refs.betAmmount.value
    });
  }

  checkResult(){
    this.state.mainContract.getWinner.call().then((result) => {
      console.log(result)
      let htmlStr = ""
      if (result.length > 0){
        for (var i = 0; i < result.length; i++) {
          htmlStr = htmlStr + result[i] +" | "
        }
        this.setState({
          winners: htmlStr
        })
      }
    })
    this.state.mainContract.winNumber.call().then((result) => {
      if (result.hasOwnProperty("c")){
        this.setState({
          winNumber: result.c[0]
        })
      }
    })
    if (this.state.winNumber) {
      this.state.mainContract.resetResult.call()
      console.log("resetResult called")
    }
  }

  clearForm() {
    this.state.mainContract.resetResult.call().then((result) => {
      this.setState({
        selectedNumber: 0,
        betAmmount: 0,
        currentTotalPrize: 0,
        betAmmountInputState: false,
        betButtonState: false,
        winners: null,
        winNumber: 0,
      })
    })
    console.log("clearForm called")
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Virtual Lotto</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Pick a number</h1>
              <div>Selected Number: {this.state.selectedNumber}</div>
              <div>Total Prize: {this.state.currentTotalPrize}</div>
              <div>Win number: {this.state.winNumber}</div>
              <div>Winner: {this.state.winners}</div>
              <button className="pure-button-primary" onClick={ () => this.selectNumber(1) }>1</button>
              <button className="pure-button-primary" onClick={ () => this.selectNumber(2) }>2</button>
              <button className="pure-button-primary" onClick={ () => this.selectNumber(3) }>3</button>
              <button className="pure-button-primary" onClick={ () => this.selectNumber(4) }>4</button>
              <button className="pure-button-primary" onClick={ () => this.selectNumber(5) }>5</button>
              <button className="pure-button-primary" onClick={ () => this.selectNumber(6) }>6</button>
              <button className="pure-button-primary" onClick={ () => this.selectNumber(7) }>7</button>
              <button className="pure-button-primary" onClick={ () => this.selectNumber(8) }>8</button>
              <button className="pure-button-primary" onClick={ () => this.selectNumber(9) }>9</button>
              <button className="pure-button-primary" onClick={ () => this.selectNumber(10) }>10</button>
              <div>Input bet ammount:
                <input
                  type="text"
                  onChange={ () => this.setBetAmmount() }
                  disabled={(this.state.betAmmountInputState)? "disabled" : ""}
                  ref="betAmmount"
                  id="betAmmount" />
              </div>
              <button
                className="pure-button-primary"
                onClick={ () => this.doBet() }
                disabled={(this.state.betButtonState)? "disabled" : ""}
              >Bet</button>
              <button
                className="pure-button-primary"
                onClick={ () => this.clearForm() }
              >Clear</button>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

function isFloat(n){
  return Number(n) === n && n % 1 !== 0;
}

function isInt(n){
  return Number(n) === n && n % 1 === 0;
}

export default App
