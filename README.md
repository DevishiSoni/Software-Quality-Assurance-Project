# Software-Quality-Assurance-Project
This repository is for our software quality assurance semester long project where we will be working on developing a working banking software!

## Please note: 
**Our prototype is written in HTML/CSS/JavaScript, and we are using Node.js (https://nodejs.org/en/download) to run it as a console application.**

**To run it as a console:**
1. Copy the GitHub link and clone in VS code
2. Open the project 
3. From there run a command line (we used Windows Powershell) and type ‘node JS/node.js currentAccounts.txt transactions.txt’
4. The session will be started.

**To Run & Check Tests (on macOS):**
1. In the terminal make sure you are in the directory where the project file is located (Software-Quality-Assurance-Project)
2. Then type in the following commands to run the tests:
  * sed -i '' $'s/\r$//' run_tests.sh
  * chmod +x run_tests.sh -> do this only if it says permission denied
  * ./run_tests.sh
3. Next type in the following commands to check the tests for PASS or FAIL:
  * sed -i '' $'s/\r$//' check_tests.sh
  * chmod +x check_tests.sh -> do this only if it says permission denied
  * ./check_tests.sh

**To Run & Check Tests (on windows):**
1. Go into the project file in your files, open it and right click and click on 'open git bash here'
2. run the command chmod +x run_tests.sh 
  * ./run_tests.sh
3. Next type in the following commands to check the tests for PASS or FAIL:
  * chmod +x check_tests.sh -> do this only if it says permission denied
  * ./check_tests.sh


