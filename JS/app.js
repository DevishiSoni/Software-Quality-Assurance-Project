window.onload = startSession;
let balance = 0;
let loggedIn = false; 
let transactionLog = [];


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
      // standard mode - uses logged in user
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
    transactionLog.push({
      type: "deposit",
      user: accountHolder,
      account: accountNumber,
      amount: amount
    });

    // Notify the user that the amount has been deposited, and that the funds cannot be used during this session
    alert("Deposit of $" + amount.toFixed(2) + " accepted.\nNote: Deposited funds not available this session.")
    console.log("Transaction saved: ", transactionLog);
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

  // Checks to see if the user is an admin - if yes prompted to enter the account holder name no limit on withdrawal
  if (FrontEnd.sessionType == "admin"){
    accountHolder = prompt("Enter account holder's name:");
    // cannot keep the account holder name as empty
    if(!accountHolder){
      alert("Account holder name cannot be empty.");
      return;
    }
  } else {
      // standard mode - uses logged in user
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
  transactionLog.push({
    type: "withdrawal",
    user: accountHolder,
    account: accountNumber,
    amount: amount
  });

  // Alerts the user of a successful transaction
  alert("Withdrawal successful. New balance: $" + balance.toFixed(2));
  console.log("Transaction saved:", transactionLog);

}

// PayBill Functionality - Standard & Priviledged Mode
function payBill(){
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
      // standard mode - uses logged in user
      accountHolder = FrontEnd.currentUser;
  }

  // Prompt to enter amount for withdrawal - standard and priviledged
  let accountNumber = prompt("Enter account number:");
  if (!accountNumber) {
    alert("Account number cannot be empty.");
    return;
  }
  // Prompt to enter company name
  let company = prompt("Enter company (EC, CQ, FI):");
  const validCompanies = ["EC", "CQ", "FI"];

  if (!validCompanies.includes(company)) {
    alert("Invalid company. Must be EC, CQ, or FI.");
    return;
  }

  // Prompt to enter amount to pay
  let amount = parseFloat(prompt("Enter amount to pay:"));
  
  // Checks for invalid inputs
  if (isNaN(amount) || amount <= 0) {
    alert("Invalid payment amount.");
    return;
  }

  // Standard mode limit
  if (FrontEnd.sessionType == "standard") {
    if (amount > 2000) {
      alert("Standard mode bill payment limit is $2000 per session.");
      return;
    }
  }

  // Checks to make sure accountHolder has a sufficient balance to pay the bill
  if (balance - amount < 0) {
    alert("Insufficient funds.");
    return;
  }

  balance -= amount;

  transactionLog.push({
    type: "paybill",
    user: accountHolder,
    account: accountNumber,
    company: company,
    amount: amount
  });

  alert("Bill paid successfully. New balance: $" + balance.toFixed(2));
  console.log("Transaction saved:", transactionLog);
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

