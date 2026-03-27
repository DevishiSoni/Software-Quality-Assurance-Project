"""
Unit tests for the read_old_bank_accounts function.

This file tests the functionality of reading a fixed-width formatted
master bank accounts file and converting it into an in-memory dictionary.

The tests ensure correct parsing of account fields (account number, name,
status, balance, transaction count, and plan) under different scenarios,
including empty files and multiple records. Statement coverage is achieved
by testing cases where the loop executes zero, one, two, and multiple times.
"""

import unittest
import os
import sys

sys.path.append(os.path.dirname(__file__))

from backEnd.StarterCode.read_old_accounts import read_old_bank_accounts


def format_account_line(acc_num, name, status, balance, transactions, plan):
    """
    Helper function to generate a properly formatted fixed-width account record.

    This ensures that each field is aligned correctly according to the
    required file format, preventing formatting-related errors during testing.
    Returns:
        str: A formatted account line matching the required file structure
    """

    name_field = name.ljust(20, '_')   # exactly 20 chars
    balance_field = f"{balance:08.2f}" # exactly 8 chars
    transactions_field = f"{transactions:04d}"  # 4 digits

    return f"{acc_num}_{name_field}_{status}_{balance_field}_{transactions_field}_{plan}\n"

class TestReadOldBankAccounts(unittest.TestCase):

    def test_single_account(self):
        """
        Test case where the file contains exactly one account.
        Ensures the loop executes once and all fields are parsed correctly.
        """

        filename = "test_accounts.txt"

        with open(filename, "w") as f:
            f.write(format_account_line("00001", "John_Doe", "A", 100.00, 1, "SP"))

        result = read_old_bank_accounts(filename)

        self.assertIn("00001", result)
        self.assertEqual(result["00001"]["name"], "John_Doe")
        self.assertEqual(result["00001"]["status"], "A")
        self.assertEqual(result["00001"]["balance"], 100.00)
        self.assertEqual(result["00001"]["transactions"], 1)
        self.assertEqual(result["00001"]["plan"], "SP")


    def test_two_accounts(self):
        """
        Test case where the file contains exactly two accounts.
        Ensures the loop executes twice and both records are processed.
        """

        filename = "test_accounts.txt"

        with open(filename, "w") as f:
            f.write(format_account_line("00001", "John_Doe", "A", 100.00, 1, "SP"))
            f.write(format_account_line("00002", "Jane_Smith", "A", 500.00, 2, "NP"))

        result = read_old_bank_accounts(filename)

        # exactly 2 accounts loaded
        self.assertEqual(len(result), 2)

        # check both exist
        self.assertIn("00001", result)
        self.assertIn("00002", result)



    def test_multiple_accounts(self):
        """
        Test case for multiple accounts (more than one).
        Confirms correct parsing of later entries in the file.
        """

        filename = "test_accounts.txt"

        with open(filename, "w") as f:
            f.write(format_account_line("00001", "John_Doe", "A", 100.00, 1, "SP"))
            f.write(format_account_line("00002", "Jane_Smith", "A", 500.00, 2, "NP"))
            f.write(format_account_line("00003", "Devi_Soni", "A", 550.00, 1, "NP"))
            f.write(format_account_line("00004", "Michelle_Adams", "A", 600.00, 2, "NP"))



        result = read_old_bank_accounts(filename)

        self.assertEqual(len(result), 4)
        self.assertIn("00002", result)
        self.assertEqual(result["00002"]["name"], "Jane_Smith")


    def test_empty_file(self):
        """
        Test case where the input file is empty.
        Ensures the loop does not execute and an empty dictionary is returned.
        """

        filename = "test_accounts.txt"

        with open(filename, "w") as f:
            f.write("")

        result = read_old_bank_accounts(filename)

        self.assertEqual(result, {})



if __name__ == '__main__':
    unittest.main()