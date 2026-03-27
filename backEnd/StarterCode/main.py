"""
Backend Banking System Processor

Reads:
- Old Master Bank Accounts File
- Merged Transaction File

Produces:
- New Master Bank Accounts File
- New Current Bank Accounts File
"""

from read_old_accounts import read_old_bank_accounts
from transaction_processor import process_transactions
from write_new_accounts import write_new_accounts


# File constants
OLD_MASTER_FILE = "old_master_accounts.txt"
TRANSACTION_FILE = "merged_transactions.txt"
NEW_MASTER_FILE = "new_master_accounts.txt"
CURRENT_FILE = "current_accounts.txt"


def main():
    try:
        print("Reading old master accounts...")
        accounts = read_old_bank_accounts(OLD_MASTER_FILE)

        print("Processing transactions...")
        accounts = process_transactions(accounts, TRANSACTION_FILE)

        print("Writing new current accounts file...")
        write_new_accounts(accounts, CURRENT_FILE,True)

        print("Writing new master accounts file...")
        write_new_accounts(accounts, NEW_MASTER_FILE,False)

        print("Backend processing complete.")

    except FileNotFoundError as e:
        print(f"ERROR: Fatal error - File not found: {e.filename}")
    except Exception as e:
        print(f"ERROR: Fatal error - {str(e)}")


if __name__ == "__main__":
    main()