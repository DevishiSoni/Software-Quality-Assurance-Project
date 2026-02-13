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

  if (type === "admin"){
    button.style.display = "inline-block";
}
}
function updateUI() {
  const statusText = document.getElementById("status");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (FrontEnd.loggedIn) {
    statusText.textContent =
      "Logged In Welcome " + FrontEnd.currentUser;

    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";

  } else {
    statusText.textContent = "Logged Out";

    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}


function deposit(amount){
    balance += amount;
    console.log("new balance", balance);
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

const button = document.getElementById("create");
const formContainer = document.getElementById("createContainer");

button.addEventListener("click", function(){
  createContainer.innerHTML = "";

  const accountIdInput = document.createElement("input");
  accountIdInput.type = "text";
  accountIdInput.placeholder = "Account ID";
  accountIdInput.id = "accountId";

  const accountNameInput = document.createElement("input");
  accountNameInput.type = "text";
  accountNameInput.placeholder = "Account Name";
  accountNameInput.id = "accountName";

  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.addEventListener("click", function(){
    const id = accountIdInput.value;
    const name = accountNameInput.value;
    alert(`Account Created!\nID: ${id}\nName: ${name}`);

    createContainer.innerHTML = "";
  })

  createContainer.appendChild(accountIdInput);
  createContainer.appendChild(document.createElement("br"));
  createContainer.appendChild(accountNameInput);
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

    transactionLog.push({
        action: "Change Plan",
      name: name,
    accountNumber: accNum,
    newPlan: "NP",
    perfomedBy: FrontEnd.currentUser,
  });
  alert(`Plan changed to NP for account ${accNum} by ${name}`);
  
  console.log("Transaction Log:", transactionLog);

}
