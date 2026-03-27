def write_new_accounts(accounts, file_path, add_eof=False):
    """
    Writes all accounts in underscore format (42 chars per line)
    :param accounts: dict of accounts
    :param file_path: file to write
    :param add_eof: if True, write EOF marker at the end (for current accounts)
    """
    with open(file_path, "w") as file:
        for acc_num, acc in accounts.items():
            line = (
                f"{acc_num}_"
                f"{acc['name'].replace(' ', '_').ljust(20, '_')}"
                f"{acc['status']}_"
                f"{format(acc['balance'], '08.2f')}"
                f"{str(acc['transactions']).zfill(4)}_"
                f"{acc['plan']}"
            )

            if len(line) == 43:
                print("Line length OK, Proceeding...")
            else:
                print(f"ERROR: Output line not 43 chars ({len(line)}): {line}")

            file.write(line + "\n")

        if add_eof:
            # EOF marker for current accounts only
            file.write("00000_END_OF_FILE________A_00000.00_0000_NP\n")
        else:
            print("EOF not detected, Proceeding...")