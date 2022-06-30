const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const {
  login,
  logout,
  getAllCustomers,
  createCustomer,
  createBank,
  getAllBanks,
  createAccount,
  depositBalance,
  withdrawalBalance,
  accountTransfer,
  selfAccountTransfer,
  getAllAccounts,
} = require("./controllers/customer");
const { AllCustomers } = require("./database");
const Customer = require("./views/customer");

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());

//api
app.post("/login", login);
app.get("/logout", logout);
app.get("/getallcustomers", getAllCustomers);
app.post("/createcustomer", createCustomer);

app.post("/createbank", createBank);
app.get("/getallbanks", getAllBanks);

app.post("/createaccount", createAccount);
app.post("/depositbalance", depositBalance);
app.post("/withdrawalamount", withdrawalBalance);
app.post("/accounttransfer", accountTransfer);
app.post("/selfaccounttransfer", selfAccountTransfer);
app.get("/getallaccounts", getAllAccounts);

app.listen(9000, () => {
  console.log(`Server is running on port 9000`);

  const adminUser = new Customer("manish", "chavan", "manish", "manish123");
  AllCustomers.push(adminUser);
});
