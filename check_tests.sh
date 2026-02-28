#!/bin/bash

echo "Checking test results..."

for input in inputs/*.txt
do
    # Get base name of input file
    name=$(basename "$input" .txt)

    # Output file in outputs folder
    output_file="outputs/${name}.out"

    # Expected file in expected folder, replace 'Input' with 'Output'
    expected_file="expected/${name/Input/Output}.txt"

    echo ""
    echo "Checking test $name"

    # Check if files exist
    if [[ ! -f "$output_file" ]]; then
        echo "Output file $output_file missing!"
        continue
    fi

    if [[ ! -f "$expected_file" ]]; then
        echo "Expected file $expected_file missing!"
        continue
    fi

    # Compare output with expected
    if diff -q "$output_file" "$expected_file" > /dev/null; then
        echo "PASS"
    else
        echo "FAIL"
        diff "$output_file" "$expected_file"
    fi
done

echo ""
echo "Done checking."