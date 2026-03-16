// This document details all of the application utilities and functions when used as a command line application.

const fs = require("fs");
const readline = require("readline");
const path = require("path");

// Mode
const testMode = !process.stdin.isTTY;

// Command line arguments
const accountsFile = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, "../currentAccounts.txt");
const transactionsFile = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.resolve(__dirname, "../transactions.txt");


// Input handling
let batchInput = [];
let batchLine = 0;

// Read stdin entirely at startup if not interactive
if (!process.stdin.isTTY) {
  batchInput = fs.readFileSync(0, "utf8")
    .split(/\r?\n/)
    .filter(l => l.trim() !== "");
}

// Used when input is asked for
async function ask(promptText) {
  if (process.stdin.isTTY) {
    if (!global.rl) {
      global.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    }
    return new Promise(resolve => global.rl.question(promptText, resolve));
  } else {
    if (batchLine < batchInput.length) {
      const line = batchInput[batchLine++].trim();
      console.log(promptText + line); // echo in batch mode
      return line;
    } else {
      console.log("No more batch input, exiting...");
      process.exit(0);
    }
  }
}

// Session and Data information
const FrontEnd = { sessionType: "", currentUser: "", loggedIn: false };
const accounts = [];
const transactionLog = [];

// Load the accounts
function loadBankAccountsFile() {
  try {
    if (!fs.existsSync(accountsFile)) {
      console.log(`No ${accountsFile} found — starting empty.`);
      return;
    }
    const file = fs.readFileSync(accountsFile, "utf8");
    const lines = file.split("\n").filter(l => l.trim() !== "");
    for (const line of lines) {
      if (line.includes("END_OF_FILE")) break;
      const parts = line.split("_");
      accounts.push({
        id: parts[0].padStart(5, "0"),
        name: parts[1].trim(),
        status: parts[2],
        balance: parseInt(parts[3]) / 100, // cents → dollars
        plan: "SP"
      });
    }
    console.log(
      "✔ Current Bank Accounts loaded");
  } catch (err) {
    console.log("Error loading bank accounts:", err.message);
  }
}

// Transaction helpers

// Pad any text
function padText(text, length) {
  return text.padEnd(length, "_").substring(0, length);
}

// Pad any numbers
function padNumber(num, length) {
  return String(num).padStart(length, "0");
}

// Format the money inputs
function formatMoney(amount) {
  return padNumber(amount, 5) + ".00";
}

// Pad the ID correctly
function normalizeID(id) {
  return String(id).trim().padStart(5, "0");
}

// Format the transaction correctly
function formatTransaction(code, name, accountNumber, amount, misc) {
  return (
    code +
    "_" +
    padText(name || "", 20) +
    "_" +
    padNumber(accountNumber || 0, 5) +
    "_" +
    formatMoney(amount || 0) +
    "_" +
    padText(misc || "", 2)
  );
}

// Add a transaction in correct format
function addTransaction(code, name, accountNumber, amount, misc) {
  const line = formatTransaction(code, name, accountNumber, amount, misc);
  transactionLog.push(line);
}

// Save a transaction
function saveTransactions() {
  fs.writeFileSync(transactionsFile, transactionLog.join("\n"));
  console.log("✔ Transactions saved.");
}

// Login, requires session type and name
async function startSession() {
  let type = await ask("Session type (standard/admin): ");
  if (type !== "standard" && type !== "admin") {
    console.log("Invalid session type.");
    return startSession();
  }
  let name = await ask("Enter your name: ");
  if (!name) return startSession();
  FrontEnd.sessionType = type;
  FrontEnd.currentUser = name;
  FrontEnd.loggedIn = true;
  console.log(`\nLogged in as ${name} (${type})`);
  menu();
}

// Withdrawal, requires name, ID and amount
async function deposit() {

  // Ask holder first if admin 
  let holder;
  if (FrontEnd.sessionType === "admin") {
    holder = await ask("Account holder name: ");
  } else {
    holder = FrontEnd.currentUser;
  }

  const id = normalizeID(await ask("Account ID: "));
  const amount = parseFloat(await ask("Amount: "));

  if (isNaN(amount) || amount <= 0) {
    console.log("Invalid amount.");
    return menu();
  }

  const account = accounts.find(
    acc =>
      acc.id === id &&
      acc.name.trim().toLowerCase() === holder.trim().toLowerCase()
  );

  // Must exist for holder to deposit
  if (!account) {
    console.log("Account not found.");
    return menu();
  }

  // Cannot deposit to disabled account
  if (account.status !== "A") {
    console.log("Cannot deposit money to a disabled account!");
    return menu();
  }

  addTransaction("04", holder, id, amount, account.plan);

  console.log("Deposit successful (funds available next session).");
  menu();
}

// Withdrawal, requires name and ID
async function withdrawal() {
  const id = normalizeID(await ask("Account ID: "));
  const amount = parseFloat(await ask("Amount: "));

  if (isNaN(amount) || amount <= 0) {
    console.log("Invalid amount.");
    return menu();
  }

  // Determine account holder
  let holder;
  if (FrontEnd.sessionType === "admin") {
    holder = await ask("Account holder name: ");
  } else {
    holder = FrontEnd.currentUser;
  }

  // Find matching account
  const account = accounts.find(
    acc =>
      acc.id === id &&
      acc.name.trim().toLowerCase() === holder.trim().toLowerCase()
  );

  if (!account) {
    console.log("Invalid account for logged-in user.");
    return menu();
  }

 if (account.status !== "A") {
    console.log("Cannot withdraw with a disabled account!");
    return menu();
  }
  // Standard mode session limit
  if (FrontEnd.sessionType === "standard" && amount > 500) {
    console.log("Maximum withdrawal in standard mode is $500.00 per session.");
    return menu();
  }

  // Ensure balance does not go below zero
  if (account.balance - amount < 0) {
    console.log("Insufficient funds.");
    return menu();
  }


  // Only record transaction
  addTransaction("01", holder, id, amount, account.plan);

  console.log("Withdrawal successful.");
  menu();
}

// Pay bill, requires name, ID, company and amount
async function payBill() {
  const id = normalizeID(await ask("Account ID: "));
  const companyInput = await ask(
    "Company (EC - Bright Light Electric, CQ - Credit Card Company Q, FI - Fast Internet): "
  );
  const amount = parseFloat(await ask("Amount: "));

  if (isNaN(amount) || amount <= 0) {
    console.log("Invalid amount.");
    return menu();
  }

  // Determine account holder
  let holder;
  if (FrontEnd.sessionType === "admin") {
    holder = await ask("Account holder name: ");
  } else {
    holder = FrontEnd.currentUser;
  }

  // Validate company
  const validCompanies = ["EC", "CQ", "FI"];
  const company = companyInput.trim().toUpperCase();

  if (!validCompanies.includes(company)) {
    console.log("Invalid company. Must be EC, CQ, or FI.");
    return menu();
  }

  // Find account belonging to holder
  const account = accounts.find(
    acc =>
      acc.id === id &&
      acc.name.trim().toLowerCase() === holder.trim().toLowerCase()
  );

  if (!account) {
    console.log("Invalid account for logged-in user.");
    return menu();
  }

 if (account.status !== "A") {
    console.log("Cannot pay bill from a disabled account.");
    return menu();
  }
  // Standard session max limit
  if (FrontEnd.sessionType === "standard" && amount > 2000) {
    console.log("Maximum bill payment in standard mode is $2000.00 per session.");
    return menu();
  }

  // Ensure account will not go negative
  if (account.balance - amount < 0) {
    console.log("Insufficient funds.");
    return menu();
  }

  // Record transaction (03 is pay bill code)
  addTransaction("03", holder, id, amount, company);

  console.log("Bill paid.");
  menu();
}
 
// Create account, requires admin, account name, ID and balance
async function createAccount() {
  if (FrontEnd.sessionType!=="admin"){
    console.log("Not available for standard users.");
    return menu();
  }
  const id = normalizeID(await ask("Account ID: "));
  const name = await ask("Account Name: ");
  const balance = parseFloat(await ask("Balance: "));
  if (!id || !name || isNaN(balance)){
    console.log("Account invalid.")
    return menu();
  }

  if (balance > 99999.99){
    console.log("Balance cannot exceed $99999.99.");
    return menu();
  }
  if (accounts.some(acc=>acc.id===id)) { console.log("ID already exists."); return menu(); }
  accounts.push({ id, name, balance, plan:"SP", status:"A" });
  addTransaction("05", name, id, balance, "SP");
  console.log("Account created.");
  menu();
}

// Delete account, requires admin and account ID
async function deleteAccount() {
  if (FrontEnd.sessionType!=="admin"){
    console.log("Not available for standard users.");
    return menu();
  }
  const id = normalizeID(await ask("Account ID: "));
  const account = accounts.find(acc=>acc.id===id);
  if (!account){
    console.log("Account not found.");
    return menu();
  }
  addTransaction("06", account.name, account.id, 0, account.plan);
  accounts.splice(accounts.indexOf(account),1);
  console.log("Account deleted.");
  menu();
}

// Disable account, requires admin and account ID
async function disableAccount() {
  if (FrontEnd.sessionType!=="admin"){
    console.log("Not available for standard users.");
    return menu();
  }
  const id = normalizeID(await ask("Account ID: "));
  const account = accounts.find(acc=>acc.id===id);
  if (!account){
    console.log("Account not found.");
    return menu();
  }
  account.status = "D";
  addTransaction("07", account.name, account.id, 0, account.plan);
  console.log("Account disabled.");
  menu();
}

// Change plan, requires admin, account name and ID
async function changePlan() {
  if (FrontEnd.sessionType!=="admin"){
    console.log("Not available for standard users.");
    return menu();
  }
  let nameInput = await ask("Account holder name: ");
  let idInput = await ask("Account ID: ");
  nameInput = nameInput.trim().toLowerCase();
  idInput = idInput.padStart(5,"0");
  const account = accounts.find(acc=>acc.id===idInput && acc.name.trim().toLowerCase()===nameInput);
  if(!account){ console.log("Account not found."); return menu(); }
  account.plan = "NP";
  addTransaction("08", account.name, account.id, 0, account.plan);
  console.log("Plan changed.");
  menu();
}

// Transfer, requires account name, from ID, to ID and amount
async function transfer() {
  const fromID = normalizeID(await ask("FROM account ID: "));
  const toID = normalizeID(await ask("TO account ID: "));
  const amount = parseFloat(await ask("Amount: "));

  if (isNaN(amount) || amount <= 0) {
    console.log("Invalid amount.");
    return menu();
  }

  // Determine account holder
  let holder;
  if (FrontEnd.sessionType === "admin") {
    holder = await ask("Account holder name: ");
  } else {
    holder = FrontEnd.currentUser;
  }

  // Find FROM account (must belong to holder)
  const fromAccount = accounts.find(
    acc =>
      acc.id === fromID &&
      acc.name.trim().toLowerCase() === holder.trim().toLowerCase()
  );

// Find TO account (must exist in system)
  const toAccount = accounts.find(acc => acc.id === toID);

  if (!fromAccount) {
    console.log("Invalid FROM account for logged-in user.");
    return menu();
  }

if(fromAccount.status != "A"){
    console.log("Cannot transfer from a disabled account.");
    return menu();
  }
  if (toAccount.status !== "A") {
    console.log("Cannot transfer to a disabled account.");
    return menu();
  }
  

  if (!toAccount) {
    console.log("TO account does not exist.");
    return menu();
  }

  // Standard mode transfer limit
  if (FrontEnd.sessionType === "standard" && amount > 1000) {
    console.log("Maximum transfer in standard mode is $1000.00 per session.");
    return menu();
  }

  // Ensure FROM account won't go negative
  if (fromAccount.balance - amount < 0) {
    console.log("Insufficient funds.");
    return menu();
  }



  // Record transaction
  addTransaction("02", holder, fromID, amount, toID);

  console.log("Transfer successful.");
  menu();
}

// Logout
// Uses account name to find account ID, if account not found uses default logout
function logout() {
  if (!FrontEnd.loggedIn) return;

  const account = accounts.find(
    acc => 
      acc.name.trim().toLowerCase() === FrontEnd.currentUser.trim().toLowerCase()
  );

  if (account) {
    addTransaction("00", FrontEnd.currentUser, account.id, 0, account.plan);
    saveBankAccountsFile();
    saveTransactions();
    console.log("Logged out.");
    if(global.rl) global.rl.close();
  }
  else{
    console.log("ID not found, logging out as default.");
    addTransaction("00", FrontEnd.currentUser, 0, 0, "SP");
    saveBankAccountsFile();
    saveTransactions();
    console.log("Logged out.");
    if(global.rl) global.rl.close();
  }
}

// Save accounts
function saveBankAccountsFile() {
  let fileContent = "";
  for(const acc of accounts){
    const id = String(acc.id).padStart(5,"0").substring(0,5);
    const name = String(acc.name).padEnd(20," ").substring(0,20);
    const status = acc.status || "A";
    const cents = Math.round(acc.balance*100);
    const balance = String(cents).padStart(8,"0");
    fileContent+=`${id}_${name}_${status}_${balance}\n`;
  }
  fileContent+="00000_END_OF_FILE___________A_00000000\n";
  fs.writeFileSync(accountsFile,fileContent);
  console.log("✔ Current Bank Accounts file updated.");
}

// Display menu
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
  console.log("9 - Transfer");

  const choice = await ask("Choice: ");
  switch(choice){
    case "1": return deposit();
    case "2": return withdrawal();
    case "3": return payBill();
    case "4": return createAccount();
    case "5": return deleteAccount();
    case "6": return disableAccount();
    case "7": return changePlan();
    case "8": return logout();
    case "9": return transfer();
    default: console.log("Invalid choice."); return menu();
  }
}

// To begin the session
loadBankAccountsFile();
startSession();