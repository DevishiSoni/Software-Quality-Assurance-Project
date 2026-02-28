#!/bin/bash

# Get the folder where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

INPUT_DIR="$SCRIPT_DIR/inputs"
OUTPUT_DIR="$SCRIPT_DIR/outputs"
JS_FILE="$SCRIPT_DIR/JS/node.js"
ACCOUNTS_FILE="$SCRIPT_DIR/currentAccounts.txt"

# Clear the outputs directory
rm -rf "$OUTPUT_DIR"/*
echo "Cleared outputs directory."

# Make sure outputs folder exists
mkdir -p "$OUTPUT_DIR"

# Check if there are any input files
shopt -s nullglob
input_files=("$INPUT_DIR"/*.txt)
if [ ${#input_files[@]} -eq 0 ]; then
    echo "No input files found in $INPUT_DIR. Exiting."
    exit 1
fi

# Loop through all input files
for inputFile in "${input_files[@]}"; do
    name=$(basename "$inputFile" .txt)
    echo "Running test $name"
    
    # Run Node program
    node "$JS_FILE" "$ACCOUNTS_FILE" "$OUTPUT_DIR/$name.atf" < "$inputFile" > "$OUTPUT_DIR/$name.out" 2>&1
    
    echo "  Test $name completed"
done

echo "All tests completed!"