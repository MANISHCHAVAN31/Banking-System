const { v4 } = require("uuid");
const Bank = require("../views/bank");

class Account {
  constructor(fullName, abbreviation) {
    this.id = v4();
    this.bank = new Bank(fullName, abbreviation);
    this.balance = 1000;
  }

  displayBalance() {
    return `${this.bank.abbriviation} : ${this.balance}`;
  }

  isSufficientBalance(amount) {
    return this.balance > amount;
  }
}

module.exports = Account;
