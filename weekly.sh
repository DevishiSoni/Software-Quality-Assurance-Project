#!/bin/bash

echo "Starting Weekly Banking Simulation..."

# Day loop
for day in {1..7}
do
    echo "--------------------------------"
    echo "Running Day $day"
    echo "--------------------------------"

    # Copy the day's account file to current_accounts.txt
    cp accounts_day$day.txt current_accounts.txt

    # Run the daily script
    ./daily.sh

    # Save the output accounts for next day
    cp new_master_accounts.txt accounts_day$((day+1)).txt

    echo "Day $day completed."
done

echo "Weekly Banking Simulation Complete."