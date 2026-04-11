#!/bin/bash
# ------------------------------------------------------------
# daily.sh
#
# This script simulates one full day of banking system operation.
#
# It performs the following steps:
# 1. Runs the Front End for multiple transaction sessions using
#    input files (session*_input.txt) .
# 2. Saves each session’s transaction output into separate files.
# 3. Merges all session output files into a single merged daily
#    transaction file.
# 4. Runs the Back End using the merged transaction file to update
#    the master and current bank account files.
#
# The script ensures that each session is processed in order,
# and that all outputs are correctly generated before proceeding.
#
# Usage:
#   ./daily.sh [target_directory]
#
# If no directory is provided, the current directory is used.
# ------------------------------------------------------------

TARGET_DIR=${1:-"."}

echo "Starting daily process for $TARGET_DIR..."

# Clean old outputs
rm -f "$TARGET_DIR"/session*_output.txt "$TARGET_DIR"/merged_daily.txt

# Ensure current accounts file exists
if [ ! -f currentAccounts.txt ]; then
    echo "Initializing current accounts file..."
    cp backEnd/StarterCode/old_master_accounts.txt currentAccounts.txt
fi

# Run all session inputs automatically
shopt -s nullglob
i=1
for session in "$TARGET_DIR"/session*_input.txt
do
    echo "Running frontend for $session..."
    
    # Run node, saving output into the day's folder
    node JS/node.js currentAccounts.txt "$TARGET_DIR/session${i}_output.txt" < "$session"

    if [ ! -s "$TARGET_DIR/session${i}_output.txt" ]; then
        echo "Error: Output not created in $TARGET_DIR!"
        exit 1
    fi

    echo "" >> "$TARGET_DIR/session${i}_output.txt"
    ((i++))
done

echo "Frontend sessions complete for $TARGET_DIR."

# Merge all sessions
cat "$TARGET_DIR"/session*_output.txt > "$TARGET_DIR"/merged_daily.txt
echo "Merged transaction file created in $TARGET_DIR."

# Run backend with explicit input/output
echo "Running backend..."
cp currentAccounts.txt backEnd/StarterCode/old_master_accounts.txt
 
python backEnd/StarterCode/main.py

echo "Daily process for $TARGET_DIR complete."