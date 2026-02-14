// Default settings
window.onload = startSession;
let balance = 0;
let loggedIn = false; 
const transactionLog = [];

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

  //If admin, display create, disable and delete button
  if (type === "admin"){
    createBtn.style.display = "inline-block";
    deleteBtn.style.display = "inline-block";
    disableBtn.style.display = "inline-block";
}
}
function updateUI() {
  const statusText = document.getElementById("status");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const depositBtn = document.getElementById("depositBtn");

  // If you logged in, show the message with your name
  if (FrontEnd.loggedIn) {
    statusText.textContent =
      "Logged In Welcome " + FrontEnd.currentUser;

    // Show logout and deposit, but not login if already logged in
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    depositBtn.style.display = "inline-block";

    // If not logged in
  } else {
    statusText.textContent = "Logged Out";

    // Styling
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

    // Notify the user that the amount has been deposited, and that the funds cannot be used during this session
    alert("Deposit of $" + amount.toFixed(2) + " accepted.\nNote: Deposited funds not available this session.")
    console.log("Transaction saved: ", transactionLog);
    // Saving the transaction 
    addTransaction("04", accountHolder, accountNumber, amount, "SP")
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

  // Alerts the user of a successful transaction
  alert("Withdrawal successful. New balance: $" + balance.toFixed(2));
  console.log("Transaction saved:", transactionLog);

    // saves the transaction
  addTransaction("01", accountHolder, accountNumber, amount, "SP")

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


  alert("Bill paid successfully. New balance: $" + balance.toFixed(2));
  console.log("Transaction saved:", transactionLog);
  // saves the transaction
  addTransaction("03", accountHolder, accountNumber, amount, "SP")
}


// Login function
function login(){
    // Change the flag to true
    loggedIn = true;

    // Get the name
    let name = getName();
    
    // Hide login if already logged in and show logout button
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";

    // Show status
    document.getElementById("status").textContent = "Logged in as " + name;
    console.log("User logged in");
}

// Logout function
function logout() {
  addTransaction("00", FrontEnd.currentUser, 0, 0, "SP");
  saveTransactions(); // save to file after each transaction

  // Back to default when logged out
  FrontEnd.sessionType = "";
  FrontEnd.currentUser = "";
  FrontEnd.loggedIn = false;

  location.reload(); // restart login 
}

document.getElementById("logoutBtn").addEventListener("click", logout);

// Get client name
function getName(){

    let name = document.getElementById("Username").value;

    // If name is empty, give message
    if (name === ""){
        alert("Please enter a correct name!");
        
    }
    // Display name
    alert("Welcome " + name);
    console.log(name);
    return name;
}

// Variables
const accounts= [];
const usedIds = [];
const disabledAccounts = [];

// create, delete and disable buttons and the container
const createBtn = document.getElementById("createBtn");
const formContainer = document.getElementById("createContainer");
const deleteBtn = document.getElementById("deleteBtn");
const disableBtn = document.getElementById("disableBtn");


// What happens when you press the create button
createBtn.addEventListener("click", function(){
  formContainer.innerHTML = "";

  // accountId information
  const accountIdInput = document.createElement("input");
  accountIdInput.type = "text";
  accountIdInput.placeholder = "Account ID";

  // accountNameInput information
  const accountNameInput = document.createElement("input");
  accountNameInput.type = "text";
  accountNameInput.placeholder = "Account Name";

  // accountBalance information
  const accountBalance = document.createElement("input");
  accountBalance.type = "text";
  accountBalance.placeholder = "Account Balance";

  // submitButton information
  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit";

  // What happens when the submit button is clicked
  submitButton.addEventListener("click", function(){
    // Trim the inputs
    const id = accountIdInput.value.trim();
    const name = accountNameInput.value.trim();
    const balance = parseFloat(accountBalance.value.trim());

    //Make sure it's not empty
    if (!id || !name || isNaN(balance)){
      alert("No fields can be left empty.");
      return;
    }

    //Make sure it's unique
    if(accounts.some(acc => acc.id === id)){
      alert("ID already exists");
      return;
    }

    //Make sure the ID is only used once in that session
    if(usedIds.includes(id)){
      alert("ID cannot be used again within this transaction");
      return;
    }

    //Make sure that accountId < 20
    if(id.length > 20){
      alert("Account ID is too long, must be less than 20");
      return;
    }

    //Make sure that accountBalance < 99999.99
    if(balance > 99999.99){
      alert("Account balance is too big, must be under $99999.99");
      return;
    }

    // Add the account to the account list
    accounts.push({id,name,balance,plan: "SP"});
    // Transaction for account creation
    addTransaction("05", name, id, balance, "SP");

    //Add that Id to the used list so it can only be used once during that session
    usedIds.push(id);
    // Show the alert
    alert(`Account Created!\nID: ${id}\nName: ${name}\nBalance: ${balance.toFixed(2)}`);

    
    formContainer.innerHTML = "";
  })


  formContainer.appendChild(accountIdInput);
  formContainer.appendChild(document.createElement("br"));
  formContainer.appendChild(accountNameInput);
  formContainer.appendChild(document.createElement("br"));
  formContainer.appendChild(accountBalance);
  formContainer.appendChild(document.createElement("br"));
  formContainer.appendChild(submitButton);
});

// Function to change the account plan
function changePlan() {

  // Admin only
  if (!FrontEnd.loggedIn || FrontEnd.sessionType !== "admin") {
    alert("Access denied. Admins only.");
    return;
  }

  // Get inputs
  const name = prompt("Enter account holder name:");
  const accId = prompt("Enter account number (ID):");

  // Make sure not empty
  if (!name || !accId) {
    alert("Inputs cannot be empty.");
    return;
  }

  // Find account (same style as delete/disable)
  const account = accounts.find(acc =>
    acc.id === accId.trim() &&
    acc.name.toLowerCase() === name.trim().toLowerCase()
  );

  // If the account doesn't exist
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

    // Show the alert and add log to console
    alert(`Plan changed to NP for account ${account.id}`);
    console.log("Transaction Log:", transactionLog);

    // Else show a message
  } else {
    alert("Account already has Non-Student Plan.");
  }
  console.log("Transaction Log:", transactionLog);
}

// Helper function: adds underscores when necessary
function padText(text, length) {
  return text.padEnd(length, "_").substring(0, length);
}

// Helper function: Adds zeros when necessary
function padNumber(num, length) {
  return String(num).padStart(length, "0");
}

// Helper function: Must be exactly 8 characters total
function formatMoney(amount) {
  return padNumber(amount, 5) + ".00"; // 5 digits + ".00" = 8
}

// Helper function: format the transaction as needed
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
//Helper function: Add transaction to log
function addTransaction(code, name, accountNumber, amount, misc) {
  const line = formatTransaction(code, name, accountNumber, amount, misc);
  transactionLog.push(line);

  
}

// TEST FORMATTER
const testLine = formatTransaction("08", "Tester", 23, 110, "NP");

console.log(testLine);
console.log("Length:", testLine.length);

// Function to save transactions to a text file
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

// What happens when the delete button is clicked
deleteBtn.addEventListener("click", function(){
  // If account list is empty
  if(accounts.length === 0){
    alert("No accounts in database");
    return;
  }

  //Ask user for ID
  const idToDelete = prompt("Enter account ID to delete:");

  // If the input is empty
  if(!idToDelete){
    alert("Enter an Id");
    return;
  }

  // Find that index in the accounts list
  const accountIndex = accounts.findIndex(acc => acc.id === idToDelete);
  
  // If not found
  if(accountIndex === -1){
    alert("Account ID not found");
    return;
  }

  // Ask name to verify the ID
  const nameVerify = prompt("Enter account name holder:");

  // If empty
  if(!nameVerify){
    alert("Enter a name");
    return;
  }

  // Find the account
  const account = accounts[accountIndex];

  // If account name doesn't match ID
  if(account.name !== nameVerify.trim()){
    alert("Holder name does not match ID");
    return;
  }

  // If all is successful, delete
  const deletedAccount = accounts.splice(accountIndex, 1)[0];
  // Transaction code 06 = delete
  addTransaction("06", deletedAccount.name, deletedAccount.id, 0, "SP");

  // Track the ID and remove from the usedIds list
  const usedIndex = usedIds.indexOf(idToDelete);
  // If ID found in the list
  if(usedIndex !== -1){
    usedIds.splice(usedIndex, 1);
  }
  // Show alert for completion
  alert(`Account deleted.\nID: ${deletedAccount.id}\nName: ${deletedAccount.name}\nBalance: ${deletedAccount.balance.toFixed(2)}`);
})

// What happens when the disable button is clicked
disableBtn.addEventListener("click", function(){
  // If list is empty
  if(accounts.length === 0){
    alert("No accounts in database");
    return;
  }

  // Ask for ID
  const idToDisable = prompt("Enter account ID to disable:");

  // If empty
  if(!idToDisable){
    alert("Enter an Id");
    return;
  }

  // Find account
  const accountIndex = accounts.findIndex(acc => acc.id === idToDisable);
  
  // If account not found
  if(accountIndex === -1){
    alert("Account ID not found");
    return;
  }

  // Ask name to verify
  const nameVerify = prompt("Enter account name holder:");
  // If name is empty
  if(!nameVerify){
    alert("Enter a name");
    return;
  }

  // Find account with that name and ID
  const disableAccount = accounts[accountIndex];
  // If they don't match
  if(disableAccount.name !== nameVerify.trim()){
    alert("Holder name does not match ID");
    return;
  }

  // If the ID is ffound in the list
  const usedIndex = usedIds.indexOf(idToDisable);
  if(usedIndex !== -1){
    usedIds.splice(usedIndex, 1);
    disabledAccounts.push(disableAccount);
  }

  // Alert about completion
  alert(`Account disabled.\nID: ${disableAccount.id}\nName: ${disableAccount.name}\nBalance: ${disableAccount.balance.toFixed(2)}`);
  // Log to transaction file
  addTransaction("07", disableAccount.name, disableAccount.id, 0, "SP");

});