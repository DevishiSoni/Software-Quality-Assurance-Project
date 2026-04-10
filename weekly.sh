#!/bin/bash

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