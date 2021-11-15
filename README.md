# CritterCollector-Backend
This is the JavaScript backend for the Critter Collector Android app.

To run, make sure you have Node.js installed. Run "npm install" in CritterCollector-Backend directory. This will download the necessary modules in a new directory node_modules.

Ensure the port number is correct. The default port is 8666, and can be set in CritterCollector-Backend/src/config.json.

Additionally, the server requires a valid config var for MongoDB connectivity. This must be set in CritterCollector-Backend/.env, which is a text file that you must create. The key that needs to be set is DB_URI.

Finally, run "npm start" in CritterCollector-Backend/ directory to start the server.
