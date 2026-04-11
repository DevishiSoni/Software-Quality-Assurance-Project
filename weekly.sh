#!/bin/bash
# ------------------------------------------------------------
# weekly.sh
#
# This script simulates a full week (7 days) of banking system
# operation by repeatedly running the daily.sh script.
#
# It performs the following steps:
# 1. Iterates through each day directory (e.g., day1, day2, ..., day7)
#    inside the "sessions" folder.
# 2. Calls the daily.sh script for each day, passing the corresponding
#    session directory as input.
# 3. Ensures that the output from one day is used as the input
#    (current accounts file) for the next day.
# 4. Stops execution if any daily run fails.
#
# This simulates continuous system operation across multiple days.
#
# Usage:
#   ./weekly.sh
# ------------------------------------------------------------

SESSIONS_DIR="sessions"

echo "Starting weekly process..."

for day_path in $(ls -d $SESSIONS_DIR/day* | sort -V)
do
    echo "======================================"
    echo "WEEKLY STEP: Processing $day_path"
    echo "======================================"

    # Call the daily script and pass the current day folder as an argument
    ./daily.sh "$day_path"

    # Optional: Check if the daily script failed
    if [ $? -ne 0 ]; then
        echo "Weekly process stopped due to error in $day_path"
        exit 1
    fi
done

echo "Weekly process complete."