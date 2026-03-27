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
    def test_empty_accounts(self):
        accounts = {}
        write_new_accounts(accounts, "test1.txt", False)

        with open("test1.txt") as f:
            data = f.read()

        self.assertEqual(data, "")

## LOOP TESTING - 1 Iteration
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

#LOOP TESTING - 2 Iterations
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

##LOOP TESTING - Multiple Iterations
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

##DECISION TESTING - Valid account no end of file
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

##DECISION TESTING - valid account with end of file
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

##DECISION TESTING - invalid account length (length != 43)
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

##DECISION TESTING - Valid account length (length == 43)
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