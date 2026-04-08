"""
This file handles all transaction-related logic for the Back End.

Main Functions:
- process_transactions(): processes all transactions in the file
- apply_transaction(): applies a single transaction
- parse_transaction(): extracts transaction details from a line

"""
from print_error import log_constraint_error


def parse_transaction(line):
    line = line.strip()

    return {
        "code": line[0:2],
        "name": line[3:23].strip("_"),
        "account": line[24:29].strip("_"),
        "amount": float(line[29:38].strip("_")),
        "misc": line[39:41]
    }


def process_transactions(accounts, transaction_file):

    with open(transaction_file, "r") as file:

        for line in file:
            tx = parse_transaction(line)

            if tx["code"] == "00":
                break

            apply_transaction(accounts, line)

    return accounts


def apply_transaction(accounts, line):
    tx = parse_transaction(line)

    code = tx["code"]
    account_number = tx["account"]
    amount = tx["amount"]

    account = accounts.get(account_number)

    if account is None:
        log_constraint_error(f"Account {account_number} not found", line)
        return

    success = False

    if code == "01":  # withdrawal
        success = handle_withdrawal(account, amount, line)

    elif code == "04":  # deposit
        success = handle_deposit(account, amount)

    # add more transactions later here

    if success:
        account["transactions"] += 1
        apply_transaction_fee(account, line)


def handle_withdrawal(account, amount, line):
    if account["balance"] - amount < 0:
        log_constraint_error("Negative balance prevented", line)
        return False

    account["balance"] -= amount
    return True


def handle_deposit(account, amount):
    account["balance"] += amount
    return True


def apply_transaction_fee(account, line):
    fee = 0.05 if account["plan"] == "SP" else 0.10

    if account["balance"] - fee < 0:
        log_constraint_error("Fee would cause negative balance", line)
        return

    account["balance"] -= fee