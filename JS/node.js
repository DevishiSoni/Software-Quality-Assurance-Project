const fs = require("fs");
const readline = require("readline");

// ---------- INPUT ----------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

// ---------- FRONTEND SESSION ----------
const FrontEnd = {
  sessionType: "",
  currentUser: "",
  loggedIn: false
};

// ---------- DATA ----------
const accounts = [];
const usedIds = [];
const disabledAccounts = [];
const transactionLog = [];

// ---------- AUTO LOAD CURRENT BANK FILE ----------
function loadBankAccountsFile() {
  try {
    if (!fs.existsSync("currentAccounts.txt")) {
      console.log("No currentAccounts.txt found — starting empty.");
      return;
    }

    const file = fs.readFileSync("currentAccounts.txt", "utf8");
    const lines = file.split("\n").filter(l => l.trim() !== "");

    for (const line of lines) {
      if (line.includes("END_OF_FILE")) break;

      const parts = line.split("_");

      accounts.push({
        id: parts[0].replace(/^0+/, ""),
        name: parts[1].trim(),
        status: parts[2],
        balance: parseInt(parts[3]) / 100,
        plan: "SP"
      });
    }

    console.log("✔ Current Bank Accounts loaded.");
  } catch (err) {
    console.log("Error loading bank accounts:", err.message);
  }
}

// ---------- TRANSACTION FORMAT ----------
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
  const line = formatTransaction(code, name, accountNumber, amount, misc);
  transactionLog.push(line);
}

function saveTransactions() {
  fs.writeFileSync("transactions.txt", transactionLog.join("\n"));
  console.log("✔ Transactions saved.");
}

// ---------- LOGIN ----------
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

// ---------- DEPOSIT ----------
async function deposit() {
  if (!FrontEnd.loggedIn) return menu();

  let holder =
    FrontEnd.sessionType === "admin"
      ? await ask("Account holder name: ")
      : FrontEnd.currentUser;

  const id = await ask("Account ID: ");
  const amount = parseFloat(await ask("Amount: "));

  if (isNaN(amount) || amount <= 0) {
    console.log("Invalid amount.");
    return menu();
  }

  const account = accounts.find(acc => acc.id === id && acc.name === holder);
  if (!account) {
    console.log("Account not found.");
    return menu();
  }

  account.balance += amount;
  addTransaction("04", holder, id, amount, "SP");

  console.log("Deposit successful.");
  menu();
}

// ---------- WITHDRAW ----------
async function withdrawal() {
  if (!FrontEnd.loggedIn) return menu();

  let holder =
    FrontEnd.sessionType === "admin"
      ? await ask("Account holder name: ")
      : FrontEnd.currentUser;

  const id = await ask("Account ID: ");
  const amount = parseFloat(await ask("Amount: "));

  if (isNaN(amount) || amount <= 0) return menu();

  if (FrontEnd.sessionType === "standard" && amount > 500) {
    console.log("Standard limit $500.");
    return menu();
  }

  const account = accounts.find(acc => acc.id === id && acc.name === holder);
  if (!account || account.balance < amount) {
    console.log("Invalid or insufficient funds.");
    return menu();
  }

  account.balance -= amount;
  addTransaction("01", holder, id, amount, "SP");

  console.log("Withdrawal successful.");
  menu();
}

// ---------- PAY BILL ----------
async function payBill() {
  if (!FrontEnd.loggedIn) return menu();

  let holder =
    FrontEnd.sessionType === "admin"
      ? await ask("Account holder name: ")
      : FrontEnd.currentUser;

  const id = await ask("Account ID: ");
  const company = await ask("Company (EC/CQ/FI): ");
  const amount = parseFloat(await ask("Amount: "));

  if (!["EC", "CQ", "FI"].includes(company)) return menu();
  if (isNaN(amount) || amount <= 0) return menu();

  if (FrontEnd.sessionType === "standard" && amount > 2000) {
    console.log("Standard limit $2000.");
    return menu();
  }

  const account = accounts.find(acc => acc.id === id && acc.name === holder);
  if (!account || account.balance < amount) return menu();

  account.balance -= amount;
  addTransaction("03", holder, id, amount, company);

  console.log("Bill paid.");
  menu();
}

// ---------- CREATE ACCOUNT ----------
async function createAccount() {
  if (FrontEnd.sessionType !== "admin") return menu();

  const id = await ask("Account ID: ");
  const name = await ask("Account Name: ");
  const balance = parseFloat(await ask("Balance: "));

  if (!id || !name || isNaN(balance)) return menu();
  if (accounts.some(acc => acc.id === id)) return menu();

  accounts.push({ id, name, balance, plan: "SP" });
  usedIds.push(id);

  addTransaction("05", name, id, balance, "SP");

  console.log("Account created.");
  menu();
}

// ---------- DELETE ----------
async function deleteAccount() {
  if (FrontEnd.sessionType !== "admin") return menu();

  const id = await ask("Account ID: ");
  const account = accounts.find(acc => acc.id === id);

  if (!account) return menu();

  addTransaction("06", account.name, account.id, 0, "SP");
  accounts.splice(accounts.indexOf(account), 1);

  console.log("Account deleted.");
  menu();
}

// ---------- DISABLE ----------
async function disableAccount() {
  if (FrontEnd.sessionType !== "admin") return menu();

  const id = await ask("Account ID: ");
  const account = accounts.find(acc => acc.id === id);

  if (!account) return menu();

  disabledAccounts.push(account);
  addTransaction("07", account.name, account.id, 0, "SP");

  console.log("Account disabled.");
  menu();
}

// ---------- CHANGE PLAN ----------
async function changePlan() {
  if (FrontEnd.sessionType !== "admin") return menu();

  const name = await ask("Account holder name: ");
  const id = await ask("Account ID: ");

  const account = accounts.find(
    acc => acc.id === id && acc.name.toLowerCase() === name.toLowerCase()
  );

  if (!account) return menu();

  account.plan = "NP";
  addTransaction("08", account.name, account.id, 0, "NP");

  console.log("Plan changed.");
  menu();
}

// ---------- TRANSFER ----------
async function transfer() {
  if (!FrontEnd.loggedIn) return menu();

  let holder =
    FrontEnd.sessionType === "admin"
      ? await ask("Account holder name: ")
      : FrontEnd.currentUser;

  const fromID = await ask("FROM account ID: ");
  const toID = await ask("TO account ID: ");
  const amount = parseFloat(await ask("Amount: "));

  if (isNaN(amount) || amount <= 0) return menu();

  if (FrontEnd.sessionType === "standard" && amount > 1000) {
    console.log("Standard limit $1000.");
    return menu();
  }

  const fromAccount = accounts.find(
    acc => acc.id === fromID && acc.name.toLowerCase() === holder.toLowerCase()
  );

  const toAccount = accounts.find(acc => acc.id === toID);

  if (!fromAccount || !toAccount) return menu();
  if (fromAccount.balance < amount) return menu();

  fromAccount.balance -= amount;
  toAccount.balance += amount;

  addTransaction("02", holder, fromID, amount, toID);

  console.log("Transfer successful.");
  menu();
}

// ---------- LOGOUT ----------
function logout() {
  addTransaction("00", FrontEnd.currentUser, 0, 0, "SP");
  saveBankAccountsFile();
  saveTransactions();
  console.log("Logged out.");
  rl.close();
}



// SAVE CURRENT BANK ACCOUNTS FILE
function saveBankAccountsFile() {
  let fileContent = "";

  for (const acc of accounts) {
    // account number → 5 digits
    const id = String(acc.id).padStart(5, "0").substring(0, 5);

    // name → 20 characters (spaces padded)
    const name = String(acc.name).padEnd(20, " ").substring(0, 20);

    // status → default Active
    const status = acc.status || "A";

    // balance → convert to cents → 8 digits
    const cents = Math.round(acc.balance * 100);
    const balance = String(cents).padStart(8, "0");

    const record = `${id}_${name}_${status}_${balance}`;
    fileContent += record + "\n";
  }

  // required END_OF_FILE record
  fileContent += "00000_END_OF_FILE___________A_00000000\n";

  fs.writeFileSync("currentAccounts.txt", fileContent);

  console.log("✔ Current Bank Accounts file updated.");
}


// ---------- MENU ----------
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

  switch (choice) {
    case "1": return deposit();
    case "2": return withdrawal();
    case "3": return payBill();
    case "4": return createAccount();
    case "5": return deleteAccount();
    case "6": return disableAccount();
    case "7": return changePlan();
    case "8": return logout();
    case "9": return transfer();
    default:
      console.log("Invalid choice.");
      return menu();
  }
}

// ---------- START ----------
loadBankAccountsFile();
startSession();
