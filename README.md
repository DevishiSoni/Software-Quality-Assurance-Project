# Software-Quality-Assurance-Project
This repository is for our software quality assurance semester long project where we will be working on developing a working banking software!

## Please note: 
**Our prototype is written in HTML/CSS/JavaScript, and we are using Node.js (https://nodejs.org/en/download) to run it as a console application.**

**To run it as a console:**
1. Copy the GitHub link and clone in VS code
2. Open the project and further open the JS folder
3. From there run a command line (we used Windows Powershell) and type ‘node node.js’
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



