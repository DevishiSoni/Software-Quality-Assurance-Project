window.onload = startSession;
let balance = 0;
let loggedIn = false; 
let transactions = [];


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

const createButton = document.getElementById("create");
const formContainer = document.getElementById("createContainer");
const deleteButton = document.getElementById("delete");

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
});



