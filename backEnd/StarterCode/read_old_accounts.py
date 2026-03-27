"""
This file is responsible for reading the old master bank accounts file
and converting its contents into an in-memory data structure (dictionary).

"""
def read_old_bank_accounts(filename):
    accounts = {}

    with open(filename, "r") as file:
        for line in file:
            line = line.strip()

            account_number = line[0:5]
            name = line[6:26].strip("_")
            status = line[27]
            balance = float(line[29:37])
            transactions = int(line[38:42])
            plan = line[43:45]

            accounts[account_number] = {
                "name": name,
                "status": status,
                "balance": balance,
                "transactions": transactions,
                "plan": plan
            }

    return accounts