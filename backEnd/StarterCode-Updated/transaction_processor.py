from print_error import log_constraint_error


def process_transactions(accounts, transaction_file):

    with open(transaction_file, "r") as file:

        for line in file:

            code = line[0:2]

            if code == "00":
                break

            try:
                apply_transaction(accounts, line)
            except Exception as e:
                log_constraint_error(str(e), "Transaction Processing")

    return accounts


def apply_transaction(accounts, line):

    code = line[0:2]
    account_number = line[23:28].strip()
    amount = float(line[29:37])

    account = next((a for a in accounts if a["account_number"] == account_number), None)

    if account is None:
        raise Exception("Account not found")

    if code == "01":  # withdrawal
        new_balance = account["balance"] - amount

        if new_balance < 0:
            log_constraint_error("Negative balance prevented", "Withdrawal")
            return

        account["balance"] = new_balance

    elif code == "04":  # deposit
        account["balance"] += amount

    account["total_transactions"] += 1

    apply_transaction_fee(account)

def apply_transaction_fee(account):

    if account["plan"] == "SP":
        fee = 0.05
    else:
        fee = 0.10

    if account["balance"] - fee < 0:
        log_constraint_error("Transaction fee would cause negative balance", "Fee")
        return

    account["balance"] -= fee