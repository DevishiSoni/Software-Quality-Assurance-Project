// ===== CONSOLE INPUT SETUP =====
const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

// ===== GLOBAL DATA =====
let balance = 0;
const transactionLog = [];

const FrontEnd = {
  sessionType: "",
  currentUser: "",
  loggedIn: false
};

const accounts = [];
const usedIds = [];
const disabledAccounts = [];

// ===== SESSION START =====
async function startSession() {
  let type = await ask("Enter session type (standard/admin): ");

  if (type !== "standard" && type !== "admin") {
    console.log("Invalid session type.");
    return startSession();
  }

  let name = await ask("Enter your name: ");

  if (!name) {
    console.log("Name cannot be empty.");
    return startSession();
  }

  FrontEnd.sessionType = type;
  FrontEnd.currentUser = name;
  FrontEnd.loggedIn = true;

  console.log(`\nLogged in. Welcome ${name} (${type})`);
  menu();
}

// ===== MENU (REPLACES BUTTONS) =====
async function menu() {
  console.log("\nChoose action:");
  console.log("1 - Deposit");
  console.log("2 - Withdraw");
  console.log("3 - Pay Bill");
  console.log("4 - Create Account (admin)");
  console.log("5 - Delete Account (admin)");
  console.log("6 - Disable Account (admin)");
  console.log("7 - Change Plan (admin)");
  console.log("8 - Logout");

  const choice = await ask("> ");

  if (choice === "1") await deposit();
  if (choice === "2") await withdrawal();
  if (choice === "3") await payBill();
  if (choice === "4") await createAccount();
  if (choice === "5") await deleteAccount();
  if (choice === "6") await disableAccount();
  if (choice === "7") await changePlan();
  if (choice === "8") return logout();

  menu();
}

// ===== DEPOSIT =====
async function deposit() {
  if (!FrontEnd.loggedIn) return;

  let accountHolder =
    FrontEnd.sessionType === "admin"
      ? await ask("Account holder name: ")
      : FrontEnd.currentUser;

  const accountNumber = await ask("Account number: ");
  const amount = parseFloat(await ask("Amount: "));

  if (isNaN(amount) || amount <= 0) return console.log("Invalid amount.");

  balance += amount;
  addTransaction("04", accountHolder, accountNumber, amount, "SP");

  console.log("Deposit successful.");
}

// ===== WITHDRAW =====
async function withdrawal() {
  let accountHolder =
    FrontEnd.sessionType === "admin"
      ? await ask("Account holder name: ")
      : FrontEnd.currentUser;

  const accountNumber = await ask("Account number: ");
  const amount = parseFloat(await ask("Amount: "));

  if (isNaN(amount) || amount <= 0) return console.log("Invalid amount.");

  if (FrontEnd.sessionType === "standard" && amount > 500)
    return console.log("Standard limit $500");

  if (balance - amount < 0) return console.log("Insufficient funds.");

  balance -= amount;
  addTransaction("01", accountHolder, accountNumber, amount, "SP");

  console.log("Withdrawal successful.");
}

// ===== PAY BILL =====
async function payBill() {
  let accountHolder =
    FrontEnd.sessionType === "admin"
      ? await ask("Account holder name: ")
      : FrontEnd.currentUser;

  const accountNumber = await ask("Account number: ");
  const company = await ask("Company (EC/CQ/FI): ");
  const amount = parseFloat(await ask("Amount: "));

  if (!["EC", "CQ", "FI"].includes(company))
    return console.log("Invalid company.");

  if (isNaN(amount) || amount <= 0) return console.log("Invalid amount.");

  if (FrontEnd.sessionType === "standard" && amount > 2000)
    return console.log("Standard limit $2000");

  balance -= amount;
  addTransaction("03", accountHolder, accountNumber, amount, company);

  console.log("Bill paid.");
}

// ===== CREATE ACCOUNT =====
async function createAccount() {
  if (FrontEnd.sessionType !== "admin") return console.log("Admins only.");

  const id = await ask("Account ID: ");
  const name = await ask("Account Name: ");
  const balance = parseFloat(await ask("Balance: "));

  if (!id || !name || isNaN(balance)) return console.log("Invalid input.");

  if (accounts.some(acc => acc.id === id)) return console.log("ID exists.");

  accounts.push({ id, name, balance, plan: "SP" });
  addTransaction("05", name, id, balance, "SP");

  console.log("Account created.");
}

// ===== DELETE ACCOUNT =====
async function deleteAccount() {
  if (FrontEnd.sessionType !== "admin") return console.log("Admins only.");

  const id = await ask("Account ID to delete: ");
  const index = accounts.findIndex(acc => acc.id === id);

  if (index === -1) return console.log("Account not found.");

  const acc = accounts.splice(index, 1)[0];
  addTransaction("06", acc.name, acc.id, 0, "SP");

  console.log("Account deleted.");
}

// ===== DISABLE ACCOUNT =====
async function disableAccount() {
  if (FrontEnd.sessionType !== "admin") return console.log("Admins only.");

  const id = await ask("Account ID to disable: ");
  const acc = accounts.find(a => a.id === id);

  if (!acc) return console.log("Account not found.");

  disabledAccounts.push(acc);
  addTransaction("07", acc.name, acc.id, 0, "SP");

  console.log("Account disabled.");
}

// ===== CHANGE PLAN =====
async function changePlan() {
  if (FrontEnd.sessionType !== "admin") return console.log("Admins only.");

  const name = await ask("Account holder name: ");
  const id = await ask("Account ID: ");

  const acc = accounts.find(
    a => a.id === id && a.name.toLowerCase() === name.toLowerCase()
  );

  if (!acc) return console.log("Account not found.");

  acc.plan = "NP";
  addTransaction("08", acc.name, acc.id, 0, "NP");

  console.log("Plan changed to NP.");
}

// ===== FORMAT TRANSACTIONS =====
function padText(text, length) {
  return text.padEnd(length, "_").substring(0, length);
}

function padNumber(num, length) {
  return String(num).padStart(length, "0");
}

function formatMoney(amount) {
  return padNumber(amount, 5) + ".00";
}

function formatTransaction(code, name, accountNumber, amount, misc) {
  return (
    code + "_" +
    padText(name || "", 20) + "_" +
    padNumber(accountNumber || 0, 5) + "_" +
    formatMoney(amount || 0) + "_" +
    padText(misc || "", 2)
  );
}

function addTransaction(code, name, accountNumber, amount, misc) {
  transactionLog.push(
    formatTransaction(code, name, accountNumber, amount, misc)
  );
}

// ===== LOGOUT =====
function logout() {
  addTransaction("00", FrontEnd.currentUser, 0, 0, "SP");

  fs.writeFileSync("transactions.txt", transactionLog.join("\n"));

  console.log("\nSession ended. Transactions saved to transactions.txt");
  rl.close();
}

// ===== START PROGRAM =====
startSession();
