# CritterCollector-Backend
This is the JavaScript backend for the Critter Collector Android app.

## Getting Started

Before starting the server, make sure you have Node.js installed. 

Run ```npm install``` in the root directory (CritterCollector-Backend/). This will download the necessary modules in a new directory titled node_modules.

Ensure the port number is correct. The default port is 8666, and can be set in src/config.json.

Additionally, the server requires a valid configuration variable for MongoDB connectivity. This variable (DB_URI) is read from one of the following: 
- src/config.json
- ".env" file
- environment variables passed in when the server is started

The ".env" file and updates to the config.json file are not checked into source control. You will need to manually add the URI to config.json or create a ".env" file in the root directory.

The URI string in either file will look similar to "DB_URI=mongodb+srv://", followed by a pair of credentials and a link to the database. If this information has not been given to you, you may need to manually set up database access. In MongoDB Atlas, the database URL can be found by clicking on "Connect" for the specific cluster when looking at the Database Deployments panel. User credentials can be set in Security>Database Access.

Run ```npm start``` to start the server.

## Documentation

Documentation was created for this API using Swagger UI Express and Swagger JSDoc.

You can view this documentation either:
- On your local environment - http://localhost:8666/api/docs/
- On the server - https://crittercollector.herokuapp.com/api/docs/

On the docs page, you can also use the "Try it out" button to interact with the API endpoints.

## Testing

### Test Suites

Test suites were created using Jest and Supertest. 

The test suites will be run each time a pull request is made and the results will be displayed in a comment. If any tests fail or if the code coverage for the pull request is below 85%, the pull request check will fail.

To manually run the test suites in your local environment, use the following commands:

- Run ```npm test``` to run the entire Jest validation suite.
- Run ```npm test -- --coverage``` to run all tests and see a code coverage report.
- Run ```npm test <name of test file>``` to run a specific test file.
- Run ```npm test <name of test file> -- -t "name of test"``` to run a specific test in a test file.

### Postman

Additionally, a Postman collection was created for testing the API endpoints.

It can be found at:
- src/docs/postman/Animal Game.postman_collection

You can import this collection into Postman to view what requests should look like. It can also be used to test your local environment or the Heroku server.