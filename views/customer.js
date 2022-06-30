const { v4 } = require("uuid");
const Credentials = require("../views/credentials");

class Customer {
  constructor(firstName, lastName, username, password) {
    this.id = v4();
    this.firstName = firstName;
    this.lastName = lastName;
    this.totalBalance = 0;
    this.accounts = [];

    this.credentials = new Credentials(username, password);
  }

  updateTotalBalance() {
    this.totalBalance = 0;
    for (let i in this.accounts) {
      this.totalBalance += this.accounts[i].balance;
    }

    return this.totalBalance;
  }

  findAccount(bankAbbreviation) {
    let isAccountPresent = false;
    let indexOfAccount = -1;

    for (let i = 0; i < this.accounts.length; i++) {
      if (bankAbbreviation == this.accounts[i].bank.abbreviation) {
        isAccountPresent = true;
        indexOfAccount = i;
        break;
      }
    }

    return [isAccountPresent, indexOfAccount];
  }

  updateTotalBalance() {
    this.totalBalance = 0;

    for (let i = 0; i < this.accounts.length; i++) {
      this.totalBalance += this.accounts[i].balance;
    }
    return this.totalBalance;
  }

  displayBalance() {
    for (let i in this.accounts) {
      this.accounts.displayBalance();
    }

    this.updateTotalBalance();
    return;
  }
}

module.exports = Customer;
