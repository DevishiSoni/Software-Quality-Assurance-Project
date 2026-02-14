window.onload = startSession;
let balance = 0;
let loggedIn = false; 
const transactionLog = [];

// Fake bank accounts database
const accounts = [
  { name: "Matt", accountNumber: "12345", plan: "SP" },
  { name: "Alex", accountNumber: "67890", plan: "SP" }
];




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

    // Checks to see if the user is an admin - if yes pronpted to enter the account holder name
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

const accounts = [];
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

    accounts.push({id,name,balance});
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

function changePlan(){
    if (FrontEnd.sessionType !== "admin" || !FrontEnd.loggedIn) {
        alert("Access denied. Admins only.");
        return;
    }
    let name = prompt("Enter account holder name:").trim();
let accNum = prompt("Enter account number:").trim();

let account = accounts.find(acc =>
  acc.name.toLowerCase() === name.toLowerCase() &&
  acc.accountNumber === accNum
);


    if (!account) {
        alert("Account not found. or details incorrect.");
        return;
    }

    if (account.plan === "SP"){
        account.plan = "NP";
    }
    else{
      alert("Account already has Non-Student Plan.");
      return; 
    }
    //add transaction to log
    addTransaction("08", name, accNum, 0, "NP");
    
  alert(`Plan changed to NP for account ${accNum} by ${name}`);
  
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


