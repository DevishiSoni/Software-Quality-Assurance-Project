"""
Backend Banking System Processor

Reads:
- Old Master Bank Accounts File
- Merged Transaction File

Produces:
- New Master Bank Accounts File
- New Current Bank Accounts File
"""

from read import read_old_bank_accounts
from transaction_processor import process_transactions
from write import write_new_current_accounts


def main():

    old_master = "old_master_accounts.txt"
    merged_transactions = "merged_transactions.txt"

    accounts = read_old_bank_accounts(old_master)

    accounts = process_transactions(accounts, merged_transactions)

    write_new_current_accounts(accounts, "current_accounts.txt")


if __name__ == "__main__":
    main()