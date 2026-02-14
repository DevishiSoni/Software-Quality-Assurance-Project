window.onload = startSession;
let balance = 0;
let loggedIn = false; 
const transactionLog = [];

// Fake bank accounts database





const FrontEnd = {
  sessionType: "",
  currentUser: "",
  loggedIn: false
};

function startSession() {
  // Ask for session type
  let type = prompt("Enter session type (standard or admin):");

  // Validate input
  if (type !== "standard" && type !== "admin") {
    alert("Invalid session type. Please enter standard or admin.");
    return startSession(); // ask again
  }

  // Ask for name
  let name = prompt("Enter your name:");

  if (!name) {
    alert("Name cannot be empty.");
    return startSession();
  }

  // Save to FrontEnd object
  FrontEnd.sessionType = type;
  FrontEnd.currentUser = name;
  FrontEnd.loggedIn = true;

  updateUI();

  //if admin, display create and delete button
  if (type === "admin"){
    createButton.style.display = "inline-block";
    deleteButton.style.display = "inline-block";
    disableButton.style.display = "inline-block";
}
}
function updateUI() {
  const statusText = document.getElementById("status");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const depositBtn = document.getElementById("depositBtn");

  if (FrontEnd.loggedIn) {
    statusText.textContent =
      "Logged In Welcome " + FrontEnd.currentUser;

    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    depositBtn.style.display = "inline-block";

  } else {
    statusText.textContent = "Logged Out";

    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    depositBtn.style.display = "none";
  }
}

// Deposit Functionality - Standard & Priviledged Mode
function deposit(){
    console.log("Deposit function started.")
    
    // Checks to make sure that the user is logged in - cannot deposit money without logging in
    if (!FrontEnd.loggedIn){
      alert("You must be logged in to deposit!");
      return;
    }

    let accountHolder;

    // Checks to see if the user is an admin - if yes prompted to enter the account holder name
    if (FrontEnd.sessionType == "admin"){
      accountHolder = prompt("Enter account holder's name:");
      // cannot keep the account holder name as empty
      if(!accountHolder){
        alert("Account holder name cannot be empty.");
        return;
      }
    } else {
      // standard mode - used logged in user
      accountHolder = FrontEnd.currentUser;
    }

    // Prompt for both standard and priviledged mode
    let accountNumber = prompt("Enter account number: ");
    let amount = parseFloat(prompt("Enter amount to deposit: "));

    if(isNaN(amount) || amount <= 0){
      alert("Invalid deposit amount.");
      return;
    }

    balance += amount

    // Saving the transaction in an array for later
    transactions.push({
      type: "deposit",
      user: accountHolder,
      account: accountNumber,
      amount: amount
    });

    // Notify the user that the amount has been deposited, and that the funds cannot be used during this session
    alert("Deposit of $" + amount.toFixed(2) + " accepted.\nNote: Deposited funds not available this session.")
    console.log("Transaction saved: ", transactions);
}

// Withdrawal Functionality - Standard & Admin Mode
function withdrawal(){
  console.log("Withdrawal function started.")
  // Checks to see if the user is an admin - if yes pronpted to enter the account holder name
  if(!FrontEnd.loggedIn){
    alert("You must be logged in to withdraw");
    return;
  }

  let accountHolder;

      // Checks to see if the user is an admin - if yes prompted to enter the account holder name
  if (FrontEnd.sessionType == "admin"){
    accountHolder = prompt("Enter account holder's name:");
    // cannot keep the account holder name as empty
    if(!accountHolder){
      alert("Account holder name cannot be empty.");
      return;
    }
  } else {
      // standard mode - used logged in user
      accountHolder = FrontEnd.currentUser;
  }

  // Prompt to enter amount for withdrawal - standard and priviledged
  let accountNumber = prompt("Enter account number:");
  if (!accountNumber) {
    alert("Account number cannot be empty.");
    return;
  }

  let amount = parseFloat(prompt("Enter amount to withdraw:"));

  // checks for invalid input
  if (isNaN(amount) || amount <= 0) {
    alert("Invalid withdrawal amount.");
    return;
  }

  // Standard mode limit
  if (FrontEnd.sessionType == "standard") {
    if (amount > 500) {
      alert("Standard mode withdrawal limit is $500 per session.");
      return;
    }
  }

  // checks to make sure that there is enough balance to withdraw
  if (balance - amount < 0) {
    alert("Insufficient funds.");
    return;
  }

  balance -= amount;

  // saves the transaction
  transactions.push({
    type: "withdrawal",
    user: accountHolder,
    account: accountNumber,
    amount: amount
  });

  // Alerts the user of a successful transaction
  alert("Withdrawal successful. New balance: $" + balance.toFixed(2));
  console.log("Transaction saved:", transactions);

}


function login(){
    loggedIn = true;
    
    let name = getName();
    
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";


    document.getElementById("status").textContent = "Logged in as " + name;
    console.log("User logged in");
}

function logout() {
  FrontEnd.sessionType = "";
  FrontEnd.currentUser = "";
  FrontEnd.loggedIn = false;

  location.reload(); // restart login 
}

document.getElementById("logoutBtn").addEventListener("click", logout);


function getName(){

    let name = document.getElementById("Username").value;

    if (name === ""){
        alert("Please enter a correct name!");
        
    }
    alert("Welcome " + name);
    console.log(name);
    return name;
}

const accounts= [];
const usedIds = [];
const disabledAccounts = [];

const createButton = document.getElementById("createBtn");
const formContainer = document.getElementById("createContainer");
const deleteButton = document.getElementById("deleteBtn");
const disableButton = document.getElementById("disableBtn");

createButton.addEventListener("click", function(){
  formContainer.innerHTML = "";

  const accountIdInput = document.createElement("input");
  accountIdInput.type = "text";
  accountIdInput.placeholder = "Account ID";

  const accountNameInput = document.createElement("input");
  accountNameInput.type = "text";
  accountNameInput.placeholder = "Account Name";

  const accountBalance = document.createElement("input");
  accountBalance.type = "text";
  accountBalance.placeholder = "Account Balance";

  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit";

  submitButton.addEventListener("click", function(){
    const id = accountIdInput.value.trim();
    const name = accountNameInput.value.trim();
    const balance = parseFloat(accountBalance.value.trim());

    //No empty
    if (!id || !name || isNaN(balance)){
      alert("No fields can be left empty.");
      return;
    }

    //make sure unique
    if(accounts.some(acc => acc.id === id)){
      alert("ID already exists");
      return;
    }

    //Make sure only used once
    if(usedIds.includes(id)){
      alert("ID cannot be used again within this transaction");
      return;
    }

    //Make sure id < 20
    if(id.length > 20){
      alert("Account ID is too long, must be less than 20");
      return;
    }

    //Make suree balance < 99999.99
    if(balance > 99999.99){
      alert("Account balance is too big, must be under $99999.99");
      return;
    }

    accounts.push({id,name,balance,plan: "SP"});
    usedIds.push(id);
    alert(`Account Created!\nID: ${id}\nName: ${name}\nBalance: ${balance.toFixed(2)}`);

    
    createContainer.innerHTML = "";
  })

  createContainer.appendChild(accountIdInput);
  createContainer.appendChild(document.createElement("br"));
  createContainer.appendChild(accountNameInput);
  createContainer.appendChild(document.createElement("br"));
  createContainer.appendChild(accountBalance);
  createContainer.appendChild(document.createElement("br"));
  createContainer.appendChild(submitButton);
});

function changePlan() {

  // Admin only
  if (!FrontEnd.loggedIn || FrontEnd.sessionType !== "admin") {
    alert("Access denied. Admins only.");
    return;
  }

  // Get inputs
  const name = prompt("Enter account holder name:");
  const accId = prompt("Enter account number (ID):");

  if (!name || !accId) {
    alert("Inputs cannot be empty.");
    return;
  }

  // Find account (same style as delete/disable)
  const account = accounts.find(acc =>
    acc.id === accId.trim() &&
    acc.name.toLowerCase() === name.trim().toLowerCase()
  );

  if (!account) {
    alert("Account not found or details incorrect.");
    return;
  }

  // Ensure plan exists (safety for old accounts)
  if (!account.plan) {
    account.plan = "SP";
  }

  // Change SP → NP
  if (account.plan === "SP") {
    account.plan = "NP";

    // Save transaction
    addTransaction("08", account.name, account.id, 0, "NP");

    alert(`Plan changed to NP for account ${account.id}`);
    console.log("Transaction Log:", transactionLog);

  } else {
    alert("Account already has Non-Student Plan.");
  }
  console.log("Transaction Log:", transactionLog);
}


function padText(text, length) {
  return text.padEnd(length, "_").substring(0, length);
}

function padNumber(num, length) {
  return String(num).padStart(length, "0");
}

// Must be exactly 8 chars total
function formatMoney(amount) {
  return padNumber(amount, 5) + ".00"; // 5 digits + ".00" = 8
}
function formatTransaction(code, name, accountNumber, amount, misc) {
  const line =
    code + "_" +
    padText(name || "", 20) + "_" +
    padNumber(accountNumber || 0, 5) + "_" +
    formatMoney(amount || 0) + "_" +
    padText(misc || "", 2);

  // Safety check 
  if (line.length !== 41) {
    console.error("Line is not 41 characters:", line.length, line);
  }

  return line;
}
//helper function to add transaction to log
function addTransaction(code, name, accountNumber, amount, misc) {
  const line = formatTransaction(code, name, accountNumber, amount, misc);
  transactionLog.push(line);

  saveTransactions(); // save to file after each transaction
}

// TEST FORMATTER
const testLine = formatTransaction("08", "Tester", 23, 110, "NP");

console.log(testLine);
console.log("Length:", testLine.length);

//function to save transactions to a text file
function saveTransactions() {
  const fileContent = transactionLog.join("\n");

  const blob = new Blob([fileContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.txt";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

deleteButton.addEventListener("click", function(){
  if(accounts.length === 0){
    alert("No accounts in database");
    return;
  }

  const idToDelete = prompt("Enter account ID to delete:");

  if(!idToDelete){
    alert("Enter an Id");
    return;
  }

  const accountIndex = accounts.findIndex(acc => acc.id === idToDelete);
  
  if(accountIndex === -1){
    alert("Account ID not found");
    return;
  }

  const nameVerify = prompt("Enter account name holder:");
  if(!nameVerify){
    alert("Enter a name");
    return;
  }

  const account = accounts[accountIndex];
  if(account.name !== nameVerify.trim()){
    alert("Holder name does not match ID");
    return;
  }

  const deletedAccount = accounts.splice(accountIndex, 1)[0];

  const usedIndex = usedIds.indexOf(idToDelete);
  if(usedIndex !== -1){
    usedIds.splice(usedIndex, 1);
  }

  alert(`Account deleted.\nID: ${deletedAccount.id}\nName: ${deletedAccount.name}\nBalance: ${deletedAccount.balance.toFixed(2)}`);
})

disableButton.addEventListener("click", function(){
  if(accounts.length === 0){
    alert("No accounts in database");
    return;
  }

  const idToDisable = prompt("Enter account ID to disable:");

  if(!idToDisable){
    alert("Enter an Id");
    return;
  }

  const accountIndex = accounts.findIndex(acc => acc.id === idToDisable);
  
  if(accountIndex === -1){
    alert("Account ID not found");
    return;
  }

  const nameVerify = prompt("Enter account name holder:");
  if(!nameVerify){
    alert("Enter a name");
    return;
  }

  const disableAccount = accounts[accountIndex];
  if(disableAccount.name !== nameVerify.trim()){
    alert("Holder name does not match ID");
    return;
  }
  const usedIndex = usedIds.indexOf(idToDisable);
  if(usedIndex !== -1){
    usedIds.splice(usedIndex, 1);
    disabledAccounts.push(disableAccount);
  }
  alert(`Account disabled.\nID: ${disableAccount.id}\nName: ${disableAccount.name}\nBalance: ${disableAccount.balance.toFixed(2)}`);
});