# CritterCollector-Backend
This is the JavaScript backend for the Critter Collector Android app.

To run, make sure you have Node.js installed. Run "npm install" in the root directory (CritterCollector-Backend/). This will download the necessary modules in a new directory titled node_modules.

Ensure the port number is correct. The default port is 8666, and can be set in src/config.json.

Additionally, the server requires a valid configuration variable for MongoDB connectivity. This variable (DB_URI) is read from a file ".env" in the root directory, which is a text file that is not included in the repository, and must therefore be manually created.

The .env file needs to include "DB_URI=mongodb+srv://", followed by a pair of credentials and a link to the database. If this information has not been given to you, you may need to manually set up database access. In MongoDB Atlas, the database URL can be found by clicking on "Connect" for the specific cluster when looking at the Database Deployments panel. User credentials can be set in Security>Database Access. 

Run "npm test" to run the Jest validation suite.

Run "npm start" to start the server.
