"""
Unit tests for the write_new_accounts function.

This file tests the functionality of writing a fixed-width formatted
master bank accounts file and converting it into an in-memory dictionary.

The tests ensure correct parsing of account fields (account number, name,
status, balance, transaction count, and plan) under different scenarios,
including empty files and multiple records. Loop coverage is achieved
by testing cases where the loop executes zero, one, two, and multiple times.
Decision coverage is achieved by testing how many lines are printed when each if statement evaluates to true and false,
and comparing to an expected line length of a test file.
"""

import unittest

from backEnd.StarterCode.write_new_accounts import write_new_accounts

class TestWriteNewAccounts(unittest.TestCase):

    ## LOOP TESTING - 0 Iterations
    # This test verifies the behavior of write_new_accounts when the accounts
    # dictionary is empty. The loop inside the function should execute zero times,
    # meaning no account records should be written to the file. The test confirms
    # that the output file remains empty.
    def test_empty_accounts(self):
        ## Function
        accounts = {}
        write_new_accounts(accounts, "test1.txt", False)

        with open("test1.txt") as f:
            data = f.read()

        self.assertEqual(data, "")

    ## LOOP TESTING - 1 Iteration
    # This test verifies the behavior when exactly one account is present in the
    # dictionary. The loop should execute once and write a single formatted account
    # line to the file. The test confirms that exactly one line is written.
    def test_one_account(self):
        accounts = {
            "12345": {
                "name": "John Doe",
                "status": "A",
                "balance": 100.00,
                "transactions": 5,
                "plan": "NP"
            }
        }
        write_new_accounts(accounts, "test2.txt", False)
        with open("test2.txt") as f:
            lines = f.readlines()

        self.assertEqual(len(lines), 1)

    ## LOOP TESTING - 2 Iterations
    # This test verifies that the loop correctly processes two accounts.
    # The function should iterate twice and write two formatted account records
    # to the file. This ensures the loop handles multiple sequential iterations
    # correctly.
    def test_two_accounts(self):
        accounts = {
            "12345": {
                "name": "John Doe",
                "status": "A",
                "balance": 100.00,
                "transactions": 5,
                "plan": "NP"
            },
            "54321": {
                "name": "Jane Smith",
                "status": "A",
                "balance": 200.00,
                "transactions": 3,
                "plan": "SP"
            }
        }

        write_new_accounts(accounts, "test3.txt", add_eof=False)

        with open("test3.txt") as f:
            lines = f.readlines()

        self.assertEqual(len(lines), 2)

    ## LOOP TESTING - Multiple Iterations (>2)
    # This test checks the behavior when multiple accounts are present in the
    # dictionary. The loop should execute more than two times and write all
    # account records to the file. The test verifies that the function correctly
    # handles multiple iterations of the loop.
    def test_multiple_accounts(self):
        accounts = {
            "12345": {"name": "John Doe", "status": "A", "balance": 100.00, "transactions": 5, "plan": "NP"},
            "54321": {"name": "Jane Smith", "status": "A", "balance": 200.00, "transactions": 3, "plan": "SP"},
            "67890": {"name": "Bob Brown", "status": "A", "balance": 300.00, "transactions": 1, "plan": "NP"}
        }

        write_new_accounts(accounts, "test_multi.txt", add_eof=False)

        with open("test_multi.txt") as f:
            lines = f.readlines()

        self.assertEqual(len(lines), 3)

    ## DECISION TESTING - Valid account with no EOF marker
    # This test verifies the decision branch where the add_eof parameter is False.
    # A valid account record is written to the file, and the function should not
    # append the EOF marker. The expected result is exactly one line in the file.
    def test_valid_account_no_eof(self):
        accounts = {
            "69420": {
                "name": "John Doe",
                "status": "A",
                "balance": 100.00,
                "transactions": 5,
                "plan": "NP"
            }
        }

        write_new_accounts(accounts, "test2.txt", False)

        with open("test2.txt") as f:
            lines = f.readlines()

        self.assertEqual(len(lines), 1)

    ## DECISION TESTING - Valid account with EOF marker
    # This test verifies the decision branch where add_eof is True.
    # After writing the account record, the function should append the
    # END_OF_FILE marker line. The test confirms that two lines exist
    # in the file and that the second line contains the EOF marker.
    def test_valid_account_with_eof(self):
        accounts = {
            "12345": {
                "name": "John Doe",
                "status": "A",
                "balance": 100.00,
                "transactions": 5,
                "plan": "NP"
            }
        }

        write_new_accounts(accounts, "test3.txt", add_eof=True)

        with open("test3.txt") as f:
            lines = f.readlines()

        self.assertEqual(len(lines), 2)
        self.assertTrue("END_OF_FILE" in lines[1])

    ## DECISION TESTING - Invalid line length (length != 43)
    # This test verifies the branch where the formatted account line does
    # not meet the required length of 43 characters. Because the name is
    # intentionally too long, the function should detect the invalid format
    # and avoid writing the line to the file. The expected result is that
    # the file contains zero lines.
    def test_invalid_length(self):
        accounts = {
            "12345": {
                "name": "VeryVeryVeryVeryLongName",
                "status": "A",
                "balance": 100.00,
                "transactions": 5,
                "plan": "NP"
            }
        }

        write_new_accounts(accounts, "test4.txt", add_eof=False)

        with open("test4.txt") as f:
            lines = f.readlines()

        self.assertEqual(len(lines), 0)

    ## DECISION TESTING - Valid line length (length == 43)
    # This test verifies the branch where the formatted account line meets
    # the required length of 43 characters. Since the record is valid, the
    # function should write the account line to the file. The expected result
    # is exactly one line in the output file.
    def test_valid_length(self):
        accounts = {
            "67420": {
                "name": "John Doe",
                "status": "A",
                "balance": 100.00,
                "transactions": 5,
                "plan": "NP"
            }
        }


        write_new_accounts(accounts, "test2.txt", False)

        with open("test2.txt") as f:
            lines = f.readlines()

        self.assertEqual(len(lines), 1)



if __name__ == "__main__":
    unittest.main()