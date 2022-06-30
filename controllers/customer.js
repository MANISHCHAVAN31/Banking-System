const { AllCustomers, AllBanks } = require("../database");
const JWTToken = require("../JWT");
const Account = require("../views/account");
const Bank = require("../views/bank");
const Customer = require("../views/customer");

const findCustomer = (username) => {
  let isCustomerPresent = false;
  let indexOfCustomer = -1;

  for (let i = 0; i < AllCustomers.length; i++) {
    if (username == AllCustomers[i].credentials.username) {
      isCustomerPresent = true;
      indexOfCustomer = i;
      break;
    }
  }

  return [isCustomerPresent, indexOfCustomer];
};

exports.login = async (req, res) => {
  let { username, password } = req.body;

  if (typeof username != "string") {
    res.status(401).send("invalid username");
    return;
  }

  if (typeof password != "string") {
    res.status(401).send("invalid password");
    return;
  }

  [isCustomerPresent, indexOfCustomer] = findCustomer(username);

  if (!isCustomerPresent) {
    res.status(400).send("user not found");
    return;
  }
  const user = AllCustomers[indexOfCustomer];
  const isValidPassword = user.credentials.comparePassword(password);

  if (!isValidPassword) {
    res.status(400).send("password is incorrect");
    return;
  }

  let jwtToken = new JWTToken(user.id, user.credentials.username);
  let loginToken = jwtToken.createToken();
  res.cookie("validUser", loginToken);

  AllCustomers.push(user);
  res.status(200).send(user);
};

exports.logout = (req, res) => {
  if (!JWTToken.validateToken(req, "validUser").isValid) {
    res.status(401).send("Login first to proceed");
    return;
  }

  res.clearCookie("validUser");
  res.status(200).send("User logged out successfully");
};

exports.getAllCustomers = (req, res) => {
  if (!JWTToken.validateToken(req, "validUser").isValid) {
    res.status(401).send("Login first to proceed");
    return;
  }

  res.status(200).send(AllCustomers);
};

exports.createCustomer = async (req, res) => {
  if (!JWTToken.validateToken(req, "validUser").isValid) {
    res.status(401).send("Login first to proceed");
    return;
  }

  let { firstName, lastName, username, password } = req.body;

  if (typeof firstName != "string") {
    res.status(401).send("invalid first name");
    return;
  }

  if (typeof lastName != "string") {
    res.status(401).send("invalid last name");
    return;
  }

  if (typeof username != "string") {
    res.status(401).send("invalid username");
    return;
  }

  if (typeof password != "string") {
    res.status(401).send("invalid password");
    return;
  }

  let newCustomer = new Customer(firstName, lastName, username, password);
  await newCustomer.credentials.hashPassword();

  AllCustomers.push(newCustomer);
  res.status(201).send(newCustomer);
};

//TODO: create factory function for create customer

const findBank = (bankAbbreviation) => {
  let isBankPresent = false;
  let indexOfBank = -1;

  for (let i = 0; i < AllBanks.length; i++) {
    if (AllBanks[i].abbreviation == bankAbbreviation) {
      isBankPresent = true;
      indexOfBank = i;
      break;
    }
  }

  return [isBankPresent, indexOfBank];
};

exports.createBank = (req, res) => {
  if (!JWTToken.validateToken(req, "validUser").isValid) {
    res.status(401).send("Login first to proceed");
    return;
  }

  let { fullName, abbreviation } = req.body;

  if (typeof fullName != "string") {
    res.status(401).send("invalid full name");
    return;
  }

  if (typeof abbreviation != "string") {
    res.status(401).send("invalid abbreviation");
    return;
  }

  let [isBankPresent, indexOfBank] = findBank(abbreviation);

  if (isBankPresent) {
    res.status(400).send("bank is already present");
    return;
  }

  let newBank = new Bank(fullName, abbreviation);
  AllBanks.push(newBank);
  res.status(200).send(newBank);
};

exports.getAllBanks = (req, res) => {
  if (!JWTToken.validateToken(req, "validUser").isValid) {
    res.status(401).send("Login first to proceed");
    return;
  }

  res.status(200).send(AllBanks);
};

exports.createAccount = (req, res) => {
  if (!JWTToken.validateToken(req, "validUser").isValid) {
    res.status(401).send("Login first to proceed");
    return;
  }

  // finding bank
  let { bankAbbreviation } = req.body;

  if (typeof bankAbbreviation != "string") {
    res.status(401).send("Invalid Bank abbreviation");
    return;
  }

  let [isBankPresent, indexOfBank] = findBank(bankAbbreviation);

  if (!isBankPresent) {
    res.status(401).send("This bank is not found");
    return;
  }

  let bank = AllBanks[indexOfBank];

  // finding customer
  let username = JWTToken.validateToken(req, "validUser").username;
  let [isCustomerPresent, indexOfCustomer] = findCustomer(username);

  let customer = AllCustomers[indexOfCustomer];

  let [isAccountPresent, indexOfAccount] =
    customer.findAccount(bankAbbreviation);

  if (isAccountPresent) {
    res.status(400).send("Account in this bank is aleardy present");
    return;
  }

  let newAccount = new Account(bank.fullName, bank.abbreviation);

  customer.accounts.push(newAccount);
  customer.updateTotalBalance();
  res.status(200).send(customer.accounts);
};

exports.depositBalance = (req, res) => {
  if (!JWTToken.validateToken(req, "validUser").isValid) {
    res.status(401).send("Login first to proceed");
    return;
  }

  let { amount, receivingAccountAbbreviation } = req.body;

  if (typeof amount != "number") {
    res.status(401).send("Invalid amount");
    return;
  }

  if (typeof receivingAccountAbbreviation != "string") {
    res.status(401).send("Invalid receiving bank abbreviation");
    return;
  }

  let username = JWTToken.validateToken(req, "validUser").username;
  let [isCustomerPresent, indexOfCustomer] = findCustomer(username);
  let customer = AllCustomers[indexOfCustomer];

  let [isAccountPresent, indexOfAccount] = customer.findAccount(
    receivingAccountAbbreviation
  );

  if (!isAccountPresent) {
    res.status(400).send("Account with this abbreviation not present");
    return;
  }

  customer.accounts[indexOfAccount].balance += amount;
  customer.updateTotalBalance();
  res.status(200).send("Amount is deposited successfully");
};

exports.withdrawalBalance = (req, res) => {
  if (!JWTToken.validateToken(req, "validUser").isValid) {
    res.status(401).send("Login first to proceed");
    return;
  }

  let { amount, abbreviation } = req.body;

  if (typeof amount != "number") {
    res.status(401).send("Invalid amount");
    return;
  }

  if (typeof abbreviation != "string") {
    res.status(401).send("Invalid abbreviation");
    return;
  }

  let username = JWTToken.validateToken(req, "validUser").username;
  let [isCustomerPresent, indexOfCustomer] = findCustomer(username);
  let customer = AllCustomers[indexOfCustomer];

  let [isAccountPresent, indexOfAccount] = customer.findAccount(abbreviation);

  if (!isAccountPresent) {
    res.status(400).send("Account is not present with this abbreviation");
    return;
  }

  if (!customer.accounts[indexOfAccount].isSufficientBalance(amount)) {
    res.status(400).send("In sufficient balance in account");
    return;
  }

  customer.accounts[indexOfAccount].balance -= amount;
  customer.updateTotalBalance();
  res.status(200).send("Amount deducted successfully");
};

exports.accountTransfer = (req, res) => {
  if (!JWTToken.validateToken(req, "validUser").isValid) {
    res.status(401).send("Login first to proceed");
    return;
  }

  let {
    debitAccountAbbreviation,
    creditAccountAbbreviation,
    receivingCustomerUsername,
    amount,
  } = req.body;

  if (typeof debitAccountAbbreviation != "string") {
    res.status(401).send("Invalid debit account abbreviation");
    return;
  }

  if (typeof creditAccountAbbreviation != "string") {
    res.status(401).send("Invalid credit account abbreviation");
    return;
  }

  // it will be username of customer
  if (typeof receivingCustomerUsername != "string") {
    res.status(401).send("Invalid receiving customer");
    return;
  }

  if (typeof amount != "number") {
    res.status(401).send("Invalid amount");
    return;
  }

  let username = JWTToken.validateToken(req, "validUser").username;
  let [isCustomerPresent, indexOfCustomer] = findCustomer(username);

  // current customer
  let customer = AllCustomers[indexOfCustomer];

  let [isReceivingCustomerPresent, indexOfReceivingCustomer] = findCustomer(
    receivingCustomerUsername
  );

  if (!isReceivingCustomerPresent) {
    res.status(400).send("Receiving customer not found");
    return;
  }

  // receiver customer
  let receivingAccount = AllCustomers[indexOfReceivingCustomer];

  let [isDebitAccountPresent, indexOfDebitAccount] = customer.findAccount(
    debitAccountAbbreviation
  );

  if (!isDebitAccountPresent) {
    res.status(400).send("Debit account is not present with this abbreviation");
    return;
  }

  let [isCreditAccountPresent, indexOfCreditAccount] =
    receivingAccount.findAccount(creditAccountAbbreviation);

  if (!isCreditAccountPresent) {
    res
      .status(400)
      .send("Credit account is not present with this abbreviation");
    return;
  }

  if (!customer.accounts[indexOfDebitAccount].isSufficientBalance(amount)) {
    res.status(400).send("In sufficient balance in debit account");
    return;
  }

  customer.accounts[indexOfDebitAccount].balance -= amount;
  receivingAccount.accounts[indexOfCreditAccount].balance += amount;

  customer.updateTotalBalance();
  receivingAccount.updateTotalBalance();

  res.status(200).send("Amount transferred successfully");
};

exports.selfAccountTransfer = (req, res) => {
  if (!JWTToken.validateToken(req, "validUser").isValid) {
    res.status(401).send("Login first to proceed");
    return;
  }

  let { debitAccountAbbreviation, creditAccountAbbreviation, amount } =
    req.body;

  if (typeof debitAccountAbbreviation != "string") {
    res.status(401).send("Invalid debit account abbreviation");
    return;
  }

  if (typeof creditAccountAbbreviation != "string") {
    res.status(401).send("Invalid credit account abbreviation");
    return;
  }

  if (typeof amount != "number") {
    res.status(401).send("Invalid amount");
    return;
  }

  let username = JWTToken.validateToken(req, "validUser").username;
  let [isCustomerPresent, indexOfCustomer] = findCustomer(username);

  // current customer
  let customer = AllCustomers[indexOfCustomer];

  let [isDebitAccountPresent, indexOfDebitAccount] = customer.findAccount(
    debitAccountAbbreviation
  );

  if (!isDebitAccountPresent) {
    res.status(400).send("Debit account is not present");
    return;
  }

  let [isCreditAccountPresent, indexOfCreditAccount] = customer.findAccount(
    creditAccountAbbreviation
  );

  if (!isCreditAccountPresent) {
    res.status(400).send("Credit account is not present");
    return;
  }

  customer.accounts[indexOfDebitAccount].balance -= amount;
  customer.accounts[indexOfCreditAccount].balance += amount;

  customer.updateTotalBalance();

  res.status(200).send("Self transfer performed successfully");
};

exports.getAllAccounts = (req, res) => {
  if (!JWTToken.validateToken(req, "validUser").isValid) {
    res.status(401).send("Login first to proceed");
    return;
  }

  let username = JWTToken.validateToken(req, "validUser").username;
  let [isCustomerPresent, indexOfCustomer] = findCustomer(username);

  // current customer
  let customer = AllCustomers[indexOfCustomer];
  res.status(200).send(customer.accounts);
};
