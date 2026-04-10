#!/bin/bash

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