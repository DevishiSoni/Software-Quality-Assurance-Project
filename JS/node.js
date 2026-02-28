const fs = require("fs");
const readline = require("readline");
const path = require("path");

// ---------------- Mode ----------------
const testMode = !process.stdin.isTTY;

// ---------------- Command line arguments ----------------
const accountsFile = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, "../currentAccounts.txt");
const transactionsFile = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.resolve(__dirname, "../transactions.txt");

console.log("Using accounts file:", accountsFile);

// ---------------- Input handling ----------------
let batchInput = [];
let batchLine = 0;

// Read stdin entirely at startup if not interactive
if (!process.stdin.isTTY) {
  batchInput = fs.readFileSync(0, "utf8")
    .split(/\r?\n/)
    .filter(l => l.trim() !== "");
}

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

// ---------------- Session & Data ----------------
const FrontEnd = { sessionType: "", currentUser: "", loggedIn: false };
const accounts = [];
const transactionLog = [];

// ---------------- Load accounts ----------------
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
      "✔ Current Bank Accounts loaded:",
      accounts.map(a => `${a.id} '${a.name}'`)
    );
  } catch (err) {
    console.log("Error loading bank accounts:", err.message);
  }
}

// ---------------- Transaction helpers ----------------
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
function addTransaction(code, name, accountNumber, amount, misc) {
  const line = formatTransaction(code, name, accountNumber, amount, misc);
  transactionLog.push(line);
}
function saveTransactions() {
  fs.writeFileSync(transactionsFile, transactionLog.join("\n"));
  console.log("✔ Transactions saved.");
}

// ---------------- Session ----------------
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

// ---------------- Banking operations ----------------
async function deposit() {
  if (!FrontEnd.loggedIn) return menu();
  let holder = FrontEnd.sessionType === "admin"
    ? await ask("Account holder name: ")
    : FrontEnd.currentUser;
  const id = await ask("Account ID: ");
  const amount = parseFloat(await ask("Amount: "));
  if (isNaN(amount) || amount <= 0) { console.log("Invalid amount."); return menu(); }
  const account = accounts.find(acc => acc.id === id && acc.name.trim().toLowerCase() === holder.trim().toLowerCase());
  if (!account) { console.log("Account not found."); return menu(); }
  account.balance += amount;
  addTransaction("04", holder, id, amount, "SP");
  console.log("Deposit successful.");
  menu();
}

async function withdrawal() {
  if (!FrontEnd.loggedIn) return menu();
  let holder = FrontEnd.sessionType === "admin"
    ? await ask("Account holder name: ")
    : FrontEnd.currentUser;
  const id = await ask("Account ID: ");
  const amount = parseFloat(await ask("Amount: "));
  if (isNaN(amount) || amount <= 0) { console.log("Invalid amount."); return menu(); }
  const account = accounts.find(acc => acc.id === id && acc.name.trim().toLowerCase() === holder.trim().toLowerCase());
  if (!account || account.balance < amount) { console.log("Invalid or insufficient funds."); return menu(); }
  account.balance -= amount;
  addTransaction("01", holder, id, amount, "SP");
  console.log("Withdrawal successful.");
  menu();
}

async function payBill() {
  if (!FrontEnd.loggedIn) return menu();
  let holder = FrontEnd.sessionType === "admin"
    ? await ask("Account holder name: ")
    : FrontEnd.currentUser;
  const id = await ask("Account ID: ");
  const company = await ask("Company (EC/CQ/FI): ");
  const amount = parseFloat(await ask("Amount: "));
  if (!["EC","CQ","FI"].includes(company)) return menu();
  if (isNaN(amount) || amount <=0) return menu();
  const account = accounts.find(acc => acc.id===id && acc.name.trim().toLowerCase()===holder.trim().toLowerCase());
  if (!account || account.balance < amount) return menu();
  account.balance -= amount;
  addTransaction("03", holder, id, amount, company);
  console.log("Bill paid.");
  menu();
}

async function createAccount() {
  if (FrontEnd.sessionType!=="admin") return menu();
  const id = await ask("Account ID: ");
  const name = await ask("Account Name: ");
  const balance = parseFloat(await ask("Balance: "));
  if (!id || !name || isNaN(balance)) return menu();
  if (accounts.some(acc=>acc.id===id)) { console.log("ID already exists."); return menu(); }
  accounts.push({ id, name, balance, plan:"SP", status:"A" });
  addTransaction("05", name, id, balance, "SP");
  console.log("Account created.");
  menu();
}

async function deleteAccount() {
  if (FrontEnd.sessionType!=="admin") return menu();
  const id = await ask("Account ID: ");
  const account = accounts.find(acc=>acc.id===id);
  if (!account) return menu();
  addTransaction("06", account.name, account.id, 0, "SP");
  accounts.splice(accounts.indexOf(account),1);
  console.log("Account deleted.");
  menu();
}

async function disableAccount() {
  if (FrontEnd.sessionType!=="admin") return menu();
  const id = await ask("Account ID: ");
  const account = accounts.find(acc=>acc.id===id);
  if (!account) return menu();
  account.status = "D";
  addTransaction("07", account.name, account.id, 0, "SP");
  console.log("Account disabled.");
  menu();
}

async function changePlan() {
  if (FrontEnd.sessionType!=="admin") return menu();
  let nameInput = await ask("Account holder name: ");
  let idInput = await ask("Account ID: ");
  nameInput = nameInput.trim().toLowerCase();
  idInput = idInput.padStart(5,"0");
  console.log("Looking for:", nameInput, idInput);
  console.log("Accounts loaded:", accounts.map(a=>`${a.id} '${a.name}'`));
  const account = accounts.find(acc=>acc.id===idInput && acc.name.trim().toLowerCase()===nameInput);
  if(!account){ console.log("Account not found."); return menu(); }
  account.plan = "NP";
  addTransaction("08", account.name, account.id, 0, "NP");
  console.log("Plan changed.");
  menu();
}

async function transfer() {
  if(!FrontEnd.loggedIn) return menu();
  let holder = FrontEnd.sessionType==="admin" ? await ask("Account holder name: ") : FrontEnd.currentUser;
  const fromID = await ask("FROM account ID: ");
  const toID = await ask("TO account ID: ");
  const amount = parseFloat(await ask("Amount: "));
  if (isNaN(amount) || amount<=0) return menu();
  const fromAcc = accounts.find(acc=>acc.id===fromID && acc.name.trim().toLowerCase()===holder.trim().toLowerCase());
  const toAcc = accounts.find(acc=>acc.id===toID);
  if(!fromAcc || !toAcc || fromAcc.balance<amount){ console.log("Transfer failed."); return menu(); }
  fromAcc.balance-=amount; toAcc.balance+=amount;
  addTransaction("02", holder, fromID, amount, toID);
  console.log("Transfer successful.");
  menu();
}

// ---------------- Logout ----------------
function logout() {
  addTransaction("00", FrontEnd.currentUser, 0, 0, "SP");
  saveBankAccountsFile();
  saveTransactions();
  console.log("Logged out.");
  // rl.close();
  process.exit(0);
}

// ---------------- Save accounts ----------------
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

// ---------------- Menu ----------------
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

// ---------------- Start ----------------
loadBankAccountsFile();
startSession();