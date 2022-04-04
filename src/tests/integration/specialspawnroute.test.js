const request = require('supertest');
const createServer = require('../../app');
const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const DatabaseService = require('../../services/DatabaseService');

jest.mock('axios');

let db;
let specialSpawnPoints;
let specialLocations;

const app = createServer();

beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    db = await connection.db('SpecialSpawnRoute-Animal-Game');
    app.locals.db = db;

    specialSpawnPoints = await db.collection('Special-Spawn-Points');
    specialSpawnPoints.createIndex({ coordinates: "2dsphere" });

    specialLocations = await db.collection('Special-Locations');
});

afterAll(async () => {
    await connection.close();
});

describe('GET - /api/special-spawner', () => {

    describe('Error Checking', () => {

        it('should return 400 when no parameters are part of the request', async () => {

            const response = await request(app).get("/api/special-spawner");

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when distance parameter is not part of the request', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when longitude parameter is not part of the request', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 100,
                                        latitude: 15
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when latitude parameter is not part of the request', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 100,
                                        longitude: 15,
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 422 when distance parameter is invalid', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 0,
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.status).toBe(422);
        })

        it('should return 422 when longitude parameter is invalid', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 100,
                                        longitude: -181,
                                        latitude: 15
                                    });

            expect(response.status).toBe(422);
        })

        it('should return 422 when latitude parameter is invalid', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 100,
                                        longitude: 15,
                                        latitude: -91
                                    });

            expect(response.status).toBe(422);
        })

        it('should have response type of "application/json" for invalid parameter', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 0,
                                        longitude: -181,
                                        latitude: -91
                                    });

            expect(response.type).toBe('application/json');
        })

        it('should return the correct error message when distance parameter is invalid', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 100001,
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.body.errors.length).toBe(1);

            const errorMessage = response.body.errors[0].msg;
            const expectedMessage = "Invalid Maximum Spawn Distance";

            expect(errorMessage).toBe(expectedMessage);
        })

        it('should return the correct error message when longitude parameter is invalid', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 100,
                                        longitude: 181,
                                        latitude: 15
                                    });

            expect(response.body.errors.length).toBe(1);

            const errorMessage = response.body.errors[0].msg;
            const expectedMessage = "Invalid Longitude";

            expect(errorMessage).toBe(expectedMessage);
        })

        it('should return the correct error message when latitude parameter is invalid', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 100,
                                        longitude: 15,
                                        latitude: 91
                                    });

            expect(response.body.errors.length).toBe(1);

            const errorMessage = response.body.errors[0].msg;
            const expectedMessage = "Invalid Latitude";

            expect(errorMessage).toBe(expectedMessage);
        })

        it('should return two error messages when distance & longitude parameters are invalid', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 0,
                                        longitude: -181,
                                        latitude: 15
                                    });

            expect(response.body.errors.length).toBe(2);

            const firstErrorMessage = response.body.errors[0].msg;
            const firstExpectedMessage = "Invalid Maximum Spawn Distance";

            expect(firstErrorMessage).toBe(firstExpectedMessage);

            const secondErrorMessage = response.body.errors[1].msg;
            const secondExpectedMessage = "Invalid Longitude";

            expect(secondErrorMessage).toBe(secondExpectedMessage);
        })

        it('should return two error messages when distance & latitude parameters are invalid', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 0,
                                        longitude: 15,
                                        latitude: -91
                                    });

            expect(response.body.errors.length).toBe(2);

            const firstErrorMessage = response.body.errors[0].msg;
            const firstExpectedMessage = "Invalid Maximum Spawn Distance";

            expect(firstErrorMessage).toBe(firstExpectedMessage);

            const secondErrorMessage = response.body.errors[1].msg;
            const secondExpectedMessage = "Invalid Latitude";

            expect(secondErrorMessage).toBe(secondExpectedMessage);
        })

        it('should return two error messages when longitude & latitude parameters are invalid', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 100,
                                        longitude: 181,
                                        latitude: 91
                                    });

            expect(response.body.errors.length).toBe(2);

            const firstErrorMessage = response.body.errors[0].msg;
            const firstExpectedMessage = "Invalid Longitude";

            expect(firstErrorMessage).toBe(firstExpectedMessage);

            const secondErrorMessage = response.body.errors[1].msg;
            const secondExpectedMessage = "Invalid Latitude";

            expect(secondErrorMessage).toBe(secondExpectedMessage);
        })

        it('should return three error messages when distance, longitude, & latitude parameters are invalid', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 10001,
                                        longitude: 181,
                                        latitude: 91
                                    });

            expect(response.body.errors.length).toBe(3);

            const firstErrorMessage = response.body.errors[0].msg;
            const firstExpectedMessage = "Invalid Maximum Spawn Distance";

            expect(firstErrorMessage).toBe(firstExpectedMessage);

            const secondErrorMessage = response.body.errors[1].msg;
            const secondExpectedMessage = "Invalid Longitude";

            expect(secondErrorMessage).toBe(secondExpectedMessage);

            const thirdErrorMessage = response.body.errors[2].msg;
            const thirdExpectedMessage = "Invalid Latitude";

            expect(thirdErrorMessage).toBe(thirdExpectedMessage);
        })

        it('should return GET error in response if any errors are thrown', async () => {

            jest.spyOn(DatabaseService, 'findNearbySpecialSpawns').mockRejectedValue();

            const validDistance = 100;
            const validLongitude = 15;
            const validLatitude = 15;

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: validDistance,
                                        longitude: validLongitude,
                                        latitude: validLatitude
                                    });

            expect(response.error.status).toBe(404);

            expect(response.error.text).toEqual(expect.stringContaining(
                "Cannot GET /api/special-spawner"
            ));

            jest.spyOn(DatabaseService, 'findNearbySpecialSpawns').mockRestore();
        })
    })

    describe('Valid Call', () => {

        beforeEach(async () => {
            await specialSpawnPoints.deleteMany();
        });

        it('should return 200 when all parameters are valid', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 100,
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.status).toBe(200);
        })

        it('should have response type of "application/json" for valid request', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 100,
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.type).toBe('application/json');
        })

        it('should return a spawn point if one is located near the query coordinates', async () => {

            const lakeAliceLongitude = -82.361197;
            const lakeAliceLatitude = 29.643082;
            const date = new Date();

            const specialSpawn = {
                "createdAt": date,
                "coordinates": [lakeAliceLongitude, lakeAliceLatitude],
                "animals": [
                    {
                        "common_name": "American alligator",
                        "scientific_name": "Alligator mississippiensis",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdGFsbGlnYXRvcg==",
                        "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                        "Description": "Test Alligator Description."
                    }
                ]
            };

            specialSpawnPoints.insertOne(specialSpawn);

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 10000,
                                        longitude: -82.3612,
                                        latitude: 29.6431
                                    });

            expect(response.body.special_spawners.length).toBe(1);

            const returnedSpawn = response.body.special_spawners[0];

            expect(returnedSpawn).toEqual(expect.objectContaining({
                "_id": expect.anything(),
                "createdAt": date.toISOString(),
                "coordinates": [lakeAliceLongitude, lakeAliceLatitude],
                "animals": [
                    {
                        "common_name": "American alligator",
                        "scientific_name": "Alligator mississippiensis",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdGFsbGlnYXRvcg==",
                        "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                        "Description": "Test Alligator Description."
                    }
                ]
            }));
        })

        it('should return multiple spawn points if more than one is located near the query coordinates', async () => {

            const firstLakeAliceLongitude = -82.361197;
            const firstLakeAliceLatitude = 29.643082;
            const firstDate = new Date();

            const firstSpecialSpawn = {
                "createdAt": firstDate,
                "coordinates": [firstLakeAliceLongitude, firstLakeAliceLatitude],
                "animals": [
                    {
                        "common_name": "American alligator",
                        "scientific_name": "Alligator mississippiensis",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdGFsbGlnYXRvcg==",
                        "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                        "Description": "Test Alligator Description."
                    }
                ]
            };

            const secondLakeAliceLongitude = -82.361212;
            const secondLakeAliceLatitude = 29.643088;
            const secondDate = new Date();

            const secondSpecialSpawn = {
                "createdAt": secondDate,
                "coordinates": [secondLakeAliceLongitude, secondLakeAliceLatitude],
                "animals": [
                    {
                        "common_name": "Alberta Gator",
                        "scientific_name": "Alligator albertas",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdGFsYmVydGFnYXRvcg==",
                        "Image_Link": "https://upload.wikimedia.org",
                        "Description": "Test Description Alberta Alligator."
                    }
                ]
            };

            specialSpawnPoints.insertOne(firstSpecialSpawn);
            specialSpawnPoints.insertOne(secondSpecialSpawn);

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 10000,
                                        longitude: -82.3612,
                                        latitude: 29.643084
                                    });

            expect(response.body.special_spawners.length).toBe(2);

            const firstReturnSpawn = response.body.special_spawners[0];

            expect(firstReturnSpawn).toEqual(expect.objectContaining({
                "_id": expect.anything(),
                "createdAt": firstDate.toISOString(),
                "coordinates": [firstLakeAliceLongitude, firstLakeAliceLatitude],
                "animals": [
                    {
                        "common_name": "American alligator",
                        "scientific_name": "Alligator mississippiensis",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdGFsbGlnYXRvcg==",
                        "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                        "Description": "Test Alligator Description."
                    }
                ]
            }));

            const secondReturnSpawn = response.body.special_spawners[1];

            expect(secondReturnSpawn).toEqual(expect.objectContaining({
                "_id": expect.anything(),
                "createdAt": secondDate.toISOString(),
                "coordinates": [secondLakeAliceLongitude, secondLakeAliceLatitude],
                "animals": [
                    {
                        "common_name": "Alberta Gator",
                        "scientific_name": "Alligator albertas",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdGFsYmVydGFnYXRvcg==",
                        "Image_Link": "https://upload.wikimedia.org",
                        "Description": "Test Description Alberta Alligator."
                    }
                ]
            }));
        })

        it('should return "Spawn Point Not Found" message if no spawn points are found near the query coordinates', async () => {

            const response = await request(app)
                                    .get("/api/special-spawner")
                                    .query({
                                        distance: 100,
                                        longitude: -80,
                                        latitude: 25
                                    });

            expect(response.status).toBe(200);
            expect(response.type).toBe('application/json');

            const returnedMessage = response.body.special_spawners;

            expect(returnedMessage).toBe("Special Spawn Point Not Found");
        })
    })                  
})

describe('POST - /api/special-spawner', () => {

    describe('Error Checking', () => {

        it('should return 400 when no parameters are part of the request', async () => {

            const response = await request(app).post("/api/special-spawner");

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when location parameter is not part of the request', async () => {

            const response = await request(app)
                                    .post("/api/special-spawner")
                                    .send({
                                        latitude: 15,
                                        longitude: 15
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when longitude parameter is not part of the request', async () => {

            const response = await request(app)
                                    .post("/api/special-spawner")
                                    .send({
                                        location: "Test Location Name",
                                        latitude: 15
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when latitude parameter is not part of the request', async () => {

            const response = await request(app)
                                    .post("/api/special-spawner")
                                    .send({
                                        location: "Test Location Name",
                                        longitude: 15
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 422 when longitude parameter is invalid', async () => {

            const response = await request(app)
                                    .post("/api/special-spawner")
                                    .send({
                                        location: "Test Location Name",
                                        longitude: -181,
                                        latitude: 15
                                    });

            expect(response.status).toBe(422);
        })

        it('should return 422 when latitude parameter is invalid', async () => {

            const response = await request(app)
                                    .post("/api/special-spawner")
                                    .send({
                                        location: "Test Location Name",
                                        longitude: 15,
                                        latitude: -91
                                    });

            expect(response.status).toBe(422);
        })

        it('should have response type of "application/json" for invalid parameter', async () => {

            const response = await request(app)
                                    .post("/api/special-spawner")
                                    .send({
                                        location: "Test Location Name",
                                        longitude: -181,
                                        latitude: -91
                                    });

            expect(response.type).toBe('application/json');
        })

        it('should return the correct error message when longitude parameter is invalid', async () => {

            const response = await request(app)
                                    .post("/api/special-spawner")
                                    .send({
                                        location: "Test Location Name",
                                        longitude: 181,
                                        latitude: 15
                                    });

            expect(response.body.errors.length).toBe(1);

            const errorMessage = response.body.errors[0].msg;
            const expectedMessage = "Invalid Longitude";

            expect(errorMessage).toBe(expectedMessage);
        })

        it('should return the correct error message when latitude parameter is invalid', async () => {

            const response = await request(app)
                                    .post("/api/special-spawner")
                                    .send({
                                        location: "Test Location Name",
                                        longitude: 15,
                                        latitude: 91
                                    });

            expect(response.body.errors.length).toBe(1);

            const errorMessage = response.body.errors[0].msg;
            const expectedMessage = "Invalid Latitude";

            expect(errorMessage).toBe(expectedMessage);
        })

        it('should return two error messages when longitude & latitude parameters are invalid', async () => {

            const response = await request(app)
                                    .post("/api/special-spawner")
                                    .send({
                                        location: "Test Location Name",
                                        longitude: 181,
                                        latitude: 91
                                    });

            expect(response.body.errors.length).toBe(2);

            const firstErrorMessage = response.body.errors[0].msg;
            const firstExpectedMessage = "Invalid Longitude";

            expect(firstErrorMessage).toBe(firstExpectedMessage);

            const secondErrorMessage = response.body.errors[1].msg;
            const secondExpectedMessage = "Invalid Latitude";

            expect(secondErrorMessage).toBe(secondExpectedMessage);
        })

        it('should return POST error in response if any errors are thrown', async () => {

            jest.spyOn(DatabaseService, 'insertNewSpecialSpawn').mockRejectedValue();

            const validName = "Valid Location Name";
            const validLongitude = 15;
            const validLatitude = 15;

            const response = await request(app)
                                    .post("/api/special-spawner")
                                    .send({
                                        location: validName,
                                        longitude: validLongitude,
                                        latitude: validLatitude
                                    });

            expect(response.error.status).toBe(404);

            expect(response.error.text).toEqual(expect.stringContaining(
                "Cannot POST /api/special-spawner"
            ));

            jest.spyOn(DatabaseService, 'insertNewSpecialSpawn').mockRestore();
        })
    })

    describe('Valid Call', () => {

        beforeAll(async () => {

            const gatorWikiQuery =
                'https://en.wikipedia.org/w/api.php?action=query&format=json' +
                '&titles=' + 'Alligator%20mississippiensis' +
                '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100';

            const gatorWikiResult =
            {
                "query": {
                    "pages": {
                        "484824": {
                            "pageid": 484824,
                            "ns": 0,
                            "title": "American alligator",
                            "thumbnail": {
                                "source": "AmericanAlligatorImageLink",
                                "width": 75,
                                "height": 100
                            },
                            "pageimage": "American_Alligator.jpg",
                            "extract": "American alligator description."
                        }
                    }
                }
            };

            const squirrelWikiQuery =
                'https://en.wikipedia.org/w/api.php?action=query&format=json' +
                '&titles=' + 'Sciurus%20carolinensis' +
                '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100';

            const squirrelWikiResult =
            {
                "query": {
                    "pages": {
                        "408169": {
                            "pageid": 408169,
                            "ns": 0,
                            "title": "Eastern gray squirrel",
                            "thumbnail": {
                                "source": "EasternGraySquirrelImageLink",
                                "width": 100,
                                "height": 83
                            },
                            "pageimage": "Eastern_Grey_Squirrel.jpg",
                            "extract": "Eastern Gray Squirrel description."
                        }
                    }
                }
            };

            const gatorImageLink = "AmericanAlligatorImageLink";
            const squirrelImageLink = "EasternGraySquirrelImageLink";
            const gatorImageBuffer = Buffer.from('testalligator');
            const squirrelImageBuffer = Buffer.from('testsquirrel');

            axios.get.mockImplementation((queryUrl) => {
                switch (queryUrl) {
                    case gatorWikiQuery:
                        return Promise.resolve({ data: gatorWikiResult });
                    case squirrelWikiQuery:
                        return Promise.resolve({ data: squirrelWikiResult });
                    case gatorImageLink:
                        return Promise.resolve({
                            headers: {
                                "content-type": "image/jpeg",
                            },
                            data: gatorImageBuffer
                        })
                    case squirrelImageLink:
                        return Promise.resolve({
                            headers: {
                                "content-type": "image/jpeg",
                            },
                            data: squirrelImageBuffer
                        })
                }
            })

            const specialLocation = {
                "name": "Lake Alice",
                "region": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [-82.36264, 29.642178],
                            [-82.361363, 29.64215],
                            [-82.359609, 29.644696],
                            [-82.363434, 29.642313],
                            [-82.36264, 29.642178]
                        ]
                    ]
                },
                "animals": [
                    {
                        "common_name": "American alligator",
                        "scientific_name": "Alligator mississippiensis"
                    },
                    {
                        "common_name": "Eastern gray squirrel",
                        "scientific_name": "Sciurus carolinensis"
                    }
                ]
            };

            specialLocations.insertOne(specialLocation);
        });

        beforeEach(async () => {
            await specialSpawnPoints.deleteMany();
        });

        it('should return 200 when all parameters are valid', async () => {

            const response = await request(app)
                                    .post("/api/special-spawner")
                                    .send({
                                        location: "Test Location Name",
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.status).toBe(200);
        })

        it('should have response type of "application/json" for valid request', async () => {

            const response = await request(app)
                                    .post("/api/special-spawner")
                                    .send({
                                        location: "Test Location Name",
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.type).toBe('application/json');
        })

        it('should return a new special spawn point if latitude and longitude parameters are valid', async () => {

            const lakeAliceLongitude = -82.361197;
            const lakeAliceLatitude = 29.643082;

            // ensure specialSpawnPoints collection is empty before post request
            var findAllDocuments = await specialSpawnPoints.find({}).toArray();
            expect(findAllDocuments.length).toBe(0);

            // ensure random always has same seed so the order of returned Animals array does not change
            jest.spyOn(global.Math, 'random').mockReturnValue(0.4514661562021821);

            const response = await request(app)
                                    .post("/api/special-spawner")
                                    .send({
                                        location: "Lake Alice",
                                        longitude: lakeAliceLongitude,
                                        latitude: lakeAliceLatitude
                                    });

            const newSpawn = response.body.special_spawn_point;

            const dateStringRegex = /(.*)(\d\d):(\d\d):(\d\d)(.*)/;

            expect(newSpawn).toEqual(expect.objectContaining({
                "_id": expect.anything(),
                "createdAt": expect.stringMatching(dateStringRegex),
                "coordinates": [lakeAliceLongitude, lakeAliceLatitude],
                "animals": [
                    {
                        "common_name": "American alligator",
                        "scientific_name": "Alligator mississippiensis"
                    },
                    {
                        "common_name": "Eastern gray squirrel",
                        "scientific_name": "Sciurus carolinensis"
                    }
                ]
            }));

            jest.spyOn(global.Math, 'random').mockRestore();
        })
    })
})