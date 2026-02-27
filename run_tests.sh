#!/bin/bash

# Into inputs directory
cd inputs

# Loop through the files in inputs to test
for i in *.txt; do
    name=$(basename "$i" .txt)

    echo "Running test $name"

    # This runs the program and saves the outputs into the outputs directory
    node ../JS/app.js ../currentAccounts.txt ../outputs/$name.atf < "$i" > ../outputs/$name.out

done

echo "All tests done"