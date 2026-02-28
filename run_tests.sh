#!/bin/bash

# Get the folder where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

INPUT_DIR="$SCRIPT_DIR/inputs"
OUTPUT_DIR="$SCRIPT_DIR/outputs"
JS_FILE="$SCRIPT_DIR/JS/node.js"   # <-- your program
ACCOUNTS_FILE="$SCRIPT_DIR/currentAccounts.txt"

#clear the directories
rm -rf "$OUTPUT_DIR"./*
echo "Cleared outputs directory."
# Make sure outputs folder exists
mkdir -p "$OUTPUT_DIR"

# Loop through all .txt files in inputs
for inputFile in "$INPUT_DIR"/*.txt; do
    name=$(basename "$inputFile" .txt)
    echo "Running test $name"

    # Run Node program, feed input file, save terminal output
    node "$JS_FILE" "$ACCOUNTS_FILE" "$OUTPUT_DIR/$name.atf" < "$inputFile" > "$OUTPUT_DIR/$name.out"
done

echo "All tests completed!"