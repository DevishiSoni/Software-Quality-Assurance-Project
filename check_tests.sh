#!/bin/bash
# This file is meant to verify that both the output files(.out and .atf) match the expected output files(.txt and .atf).


echo "Checking test results..."

INPUT_DIR="inputs"
OUTPUT_DIR="outputs"
EXPECTED_DIR="expected"

for input in "$INPUT_DIR"/*.txt; do
    name=$(basename "$input" .txt)

    # Output file
    output_file="$OUTPUT_DIR/${name}.out"

    # Expected file: replace 'Input' with 'Output' in the base name
    expected_name="${name/Input/Output}"
    expected_file="$EXPECTED_DIR/${expected_name}.txt"

    # .atf files
    actual_atf="$OUTPUT_DIR/${name}.atf"
    expected_atf="$EXPECTED_DIR/${expected_name}.atf"

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

    # Compare files (normalize line endings)
    diff -w <(tr -d '\r' < "$output_file") <(tr -d '\r' < "$expected_file") > /dev/null
    if [[ $? -eq 0 ]]; then
        echo "PASS"
    else
        echo "FAIL"
        diff -u <(tr -d '\r' < "$output_file") <(tr -d '\r' < "$expected_file")

    fi
    
    # Check if .atf files exist
    if [[ ! -f "$actual_atf" ]]; then
        echo "Output file $actual_atf missing!"
        continue
    fi
    
    # Compare files (normalize line endings)
    if [[ ! -f "$expected_atf" ]]; then
        echo "Expected file $expected_atf missing!"
        continue
    fi

    # Verify that the outputs match
    diff -w <(tr -d '\r' < "$actual_atf") <(tr -d '\r' < "$expected_atf") > /dev/null
    if [[ $? -eq 0 ]]; then
        echo "PASS"
    else
        echo "FAIL"
        diff -u <(tr -d '\r' < "$actual_atf") <(tr -d '\r' < "$expected_atf")
    fi 
done

echo ""
echo "Done checking."