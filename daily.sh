#!/bin/bash

# Run frontend sessions
node JS/node.js currentAccounts.txt < session1_input.txt
mv transactions.txt session1.txt

node JS/node.js currentAccounts.txt < session2_input.txt
mv transactions.txt session2.txt

node JS/node.js currentAccounts.txt < session3_input.txt
mv transactions.txt session3.txt

echo "Frontend automated sessions complete."

# Ensure trailing new lines for merging
echo "" >> session1.txt
echo "" >> session2.txt
echo "" >> session3.txt

# Merge session files
cat session1.txt session2.txt session3.txt > merged_daily.txt

# Copy old master accounts to working directory
cp backEnd/StarterCode/old_master_accounts.txt .

# Run backend
python3 backEnd/StarterCode/main.py
echo "Backend automated processing complete."