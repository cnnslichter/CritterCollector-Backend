const request = require('supertest');
const createServer = require('../../app');
const MongoClient = require('mongodb').MongoClient;

let db;
let specialLocations;

const app = createServer();

beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    db = await connection.db('LocationRoute-Animal-Game');
    app.locals.db = db;

    specialLocations = await db.collection('Special-Locations');
    specialLocations.createIndex({ region: "2dsphere" });
});

afterAll(async () => {
    await connection.close();
});

describe('GET - /api/location', () => {

    describe('Error Checking', () => {

        it('should return 400 when no parameters are part of the request', async () => {

            const response = await request(app).get("/api/location");

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when longitude parameter is not part of the request', async () => {

            const response = await request(app)
                                    .get("/api/location")
                                    .query({
                                        latitude: 15
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when latitude parameter is not part of the request', async () => {

            const response = await request(app)
                                    .get("/api/location")
                                    .query({
                                        longitude: 15
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 422 when longitude parameter is invalid', async () => {

            const response = await request(app)
                                    .get("/api/location")
                                    .query({
                                        longitude: -181,
                                        latitude: 15
                                    });

            expect(response.status).toBe(422);
        })

        it('should return 422 when latitude parameter is invalid', async () => {

            const response = await request(app)
                                    .get("/api/location")
                                    .query({
                                        longitude: 15,
                                        latitude: -91
                                    });

            expect(response.status).toBe(422);
        })

        it('should have response type of "application/json" for invalid parameter', async () => {

            const response = await request(app)
                                    .get("/api/location")
                                    .query({
                                        longitude: -181,
                                        latitude: -91
                                    });

            expect(response.type).toBe('application/json');
        })

        it('should return the correct error message when longitude parameter is invalid', async () => {

            const response = await request(app)
                                    .get("/api/location")
                                    .query({
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
                                    .get("/api/location")
                                    .query({
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
                                    .get("/api/location")
                                    .query({
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
    })

    describe('Valid Call', () => {

        beforeEach(async () => {
            specialLocations.deleteMany();
        });

        it('should return 200 when all parameters are valid', async () => {

            const response = await request(app)
                                    .get("/api/location")
                                    .query({
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.status).toBe(200);
        })

        it('should have response type of "application/json" for valid request', async () => {

            const response = await request(app)
                                    .get("/api/location")
                                    .query({
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.type).toBe('application/json');
        })

        it('should return the name of a special location if one is located near the query coordinates', async () => {

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
                        "Common_Name": "American alligator",
                        "Scientific_Name": "Alligator mississippiensis"
                    }
                ]
            };

            specialLocations.insertOne(specialLocation);

            const centerOfLakeAliceLong = -82.361403;
            const centerOfLakeAliceLat = 29.643040;

            const response = await request(app)
                                    .get("/api/location")
                                    .query({
                                        longitude: centerOfLakeAliceLong,
                                        latitude: centerOfLakeAliceLat
                                    });

            const locationName = response.body.special_location;

            expect(typeof locationName).toBe("string");

            expect(locationName).toBe("Lake Alice");
        })

        it('should return location name of inner most location if player inside multiple special locations', async () => {

            // This location is the outer polygon surrounding Lake Alice
            const firstSpecialLocation = {
                "name": "Lake Alice",
                "region": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [-82.36264, 29.642178],
                            [-82.362586, 29.641199],
                            [-82.361771, 29.641394],
                            [-82.361503, 29.640882],
                            [-82.360569, 29.641133],
                            [-82.361363, 29.64215],
                            [-82.3594, 29.64242],
                            [-82.359121, 29.642924],
                            [-82.359502, 29.643782],
                            [-82.359899, 29.643801],
                            [-82.359609, 29.644696],
                            [-82.360607, 29.644826],
                            [-82.362678, 29.64339],
                            [-82.363289, 29.643288],
                            [-82.363434, 29.642313],
                            [-82.36264, 29.642178]
                        ]
                    ]
                },
                "animals": [
                    {
                        "Common_Name": "American alligator",
                        "Scientific_Name": "Alligator mississippiensis"
                    }
                ]
            };

            // This location is the inner polygon in the center of Lake Alice
            const secondSpecialLocation = {
                "name": "Center of Lake Alice",
                "region": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [-82.361306, 29.643455],
                            [-82.360871, 29.643166],
                            [-82.361311, 29.642882],
                            [-82.361751, 29.643134],
                            [-82.361306, 29.643455]
                        ]
                    ]
                },
                "animals": [
                    {
                        "Common_Name": "Nessie",
                        "Scientific_Name": "Uilebheist Loch Nis"
                    }
                ]
            };

            specialLocations.insertOne(firstSpecialLocation);
            specialLocations.insertOne(secondSpecialLocation);

            // These coordinates are in the very center of Lake Alice, so it is within both location's polygons
            const centerOfLakeAliceLong = -82.361220;
            const centerOfLakeAliceLat = 29.643125;

            const firstResponse = await request(app)
                                         .get("/api/location")
                                         .query({
                                             longitude: centerOfLakeAliceLong,
                                             latitude: centerOfLakeAliceLat
                                         });


            const firstLocationName = firstResponse.body.special_location;

            expect(typeof firstLocationName).toBe("string");

            expect(firstLocationName).toBe("Center of Lake Alice");

            // These coordinates are near the boundary of the exterior Lake Alice polygon, so not within the
            // second special location's polygon
            const boundaryLong = -82.363028;
            const boundaryLat = 29.642775;

            const secondResponse = await request(app)
                                          .get("/api/location")
                                          .query({
                                              longitude: boundaryLong,
                                              latitude: boundaryLat
                                          });

            const secondLocationName = secondResponse.body.special_location;

            expect(typeof secondLocationName).toBe("string");

            expect(secondLocationName).toBe("Lake Alice");
        })

        it('should return "Special Location Not Found" message if no special location is found near the query coordinates', async () => {

            const response = await request(app)
                                    .get("/api/location")
                                    .query({
                                        longitude: 25,
                                        latitude: 25
                                    });

            expect(response.status).toBe(200);
            expect(response.type).toBe('application/json');

            const returnedMessage = response.body.special_location;

            expect(returnedMessage).toBe("Special Location Not Found");
        })
    })
})

describe('POST - /api/location', () => {

    describe('Error Checking', () => {

        it('should return 400 when no parameters are part of the request', async () => {

            const response = await request(app).post("/api/location");

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when location parameter is not part of the request', async () => {

            const response = await request(app)
                                    .post("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        animals: [
                                            {
                                                Common_Name: "TestCommonName",
                                                Scientific_Name: "TestScienceName"
                                            }
                                        ],
                                        coordinates: [
                                            [
                                                [15, 15]
                                            ]
                                        ]
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when coordinates parameter is not part of the request', async () => {

            const response = await request(app)
                                    .post("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: "LocationName",
                                        animals: [
                                            {
                                                Common_Name: "TestCommonName",
                                                Scientific_Name: "TestScienceName"
                                            }
                                        ]
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when animals parameter is not part of the request', async () => {

            const response = await request(app)
                                    .post("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: "LocationName",
                                        coordinates: [
                                            [
                                                [15, 15]
                                            ]
                                        ]
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 422 when coordinates parameter is invalid', async () => {

            const response = await request(app)
                                    .post("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: "LocationName",
                                        coordinates: [],
                                        animals: [
                                            {
                                                Common_Name: "TestCommonName",
                                                Scientific_Name: "TestScienceName"
                                            }
                                        ]
                                    });

            expect(response.status).toBe(422);
        })

        it('should return 422 when animals parameter is invalid', async () => {

            const response = await request(app)
                                    .post("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: "LocationName",
                                        coordinates: [
                                            [
                                                [15, 15]
                                            ]
                                        ],
                                        animals: []
                                    });

            expect(response.status).toBe(422);
        })

        it('should have response type of "application/json" for invalid parameter', async () => {

            const response = await request(app)
                                    .post("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: "LocationName",
                                        coordinates: [],
                                        animals: []
                                    });

            expect(response.type).toBe('application/json');
        })

        it('should return the correct error message when coordinates parameter is invalid', async () => {

            const response = await request(app)
                                    .post("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: "LocationName",
                                        coordinates: [
                                            [
                                                [1, 2, 3, 4]
                                            ]
                                        ],
                                        animals: [
                                            {
                                                Common_Name: "TestCommonName",
                                                Scientific_Name: "TestScienceName"
                                            }
                                        ]
                                    });

            expect(response.body.errors.length).toBe(1);

            const errorMessage = response.body.errors[0].msg;
            const expectedMessage = "Invalid Coordinate Array";

            expect(errorMessage).toBe(expectedMessage);
        })

        it('should return the correct error message when animals parameter is invalid', async () => {

            const response = await request(app)
                                    .post("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: "LocationName",
                                        coordinates: [
                                            [
                                                [15, 15],
                                                [20, 20],
                                                [25, 25],
                                                [15, 15]
                                            ]
                                        ],
                                        animals: [
                                            {}
                                        ]
                                    });

            expect(response.body.errors.length).toBe(1);

            const errorMessage = response.body.errors[0].msg;
            const expectedMessage = "Invalid Animal Array";

            expect(errorMessage).toBe(expectedMessage);
        })

        it('should return two error messages when coordinates & animals parameters are invalid', async () => {

            const response = await request(app)
                                    .post("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: "LocationName",
                                        coordinates: [
                                            [
                                                [-181, -91]
                                            ]
                                        ],
                                        animals: [
                                            {
                                                Invalid_Name: "No Name"
                                            }
                                        ]
                                    });

            expect(response.body.errors.length).toBe(2);

            const firstErrorMessage = response.body.errors[0].msg;
            const firstExpectedMessage = "Invalid Coordinate Array";

            expect(firstErrorMessage).toBe(firstExpectedMessage);

            const secondErrorMessage = response.body.errors[1].msg;
            const secondExpectedMessage = "Invalid Animal Array";

            expect(secondErrorMessage).toBe(secondExpectedMessage);
        })
    })

    describe('Valid Call', () => {

        beforeEach(async () => {
            specialLocations.deleteMany();
        });

        it('should return 200 when all parameters are valid', async () => {

            const response = await request(app)
                                    .post("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: "LocationName",
                                        coordinates: [
                                            [
                                                [15, 15],
                                                [20, 20],
                                                [25, 25],
                                                [15, 15]
                                            ]
                                        ],
                                        animals: [
                                            {
                                                Common_Name: "TestCommonName",
                                                Scientific_Name: "TestScienceName"
                                            }
                                        ]
                                    });

            expect(response.status).toBe(200);
        })

        it('should have response type of "application/json" for valid request', async () => {

            const response = await request(app)
                                    .post("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: "LocationName",
                                        coordinates: [
                                            [
                                                [15, 15],
                                                [20, 20],
                                                [25, 25],
                                                [15, 15]
                                            ]
                                        ],
                                        animals: [
                                            {
                                                Common_Name: "TestCommonName",
                                                Scientific_Name: "TestScienceName"
                                            }
                                        ]
                                    });

            expect(response.type).toBe('application/json');
        })

        it('should return a new special location if coordinates and animals parameters are valid', async () => {

            const response = await request(app)
                                    .post("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: "LocationName",
                                        coordinates: [
                                            [
                                                [15, 15],
                                                [20, 20],
                                                [25, 25],
                                                [15, 15]
                                            ]
                                        ],
                                        animals: [
                                            {
                                                "Common_Name": "TestCommonName",
                                                "Scientific_Name": "TestScienceName"
                                            },
                                            {
                                                "Common_Name": "TestSecondName",
                                                "Scientific_Name": "TestSecondScienceName"
                                            }
                                        ]
                                    });

            const newLocation = response.body.new_location;

            expect(newLocation).toEqual(expect.objectContaining({
                "_id": expect.anything(),
                "region": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [15, 15],
                            [20, 20],
                            [25, 25],
                            [15, 15]
                        ]
                    ]
                },
                "animals": [
                    {
                        "Common_Name": "TestCommonName",
                        "Scientific_Name": "TestScienceName"
                    },
                    {
                        "Common_Name": "TestSecondName",
                        "Scientific_Name": "TestSecondScienceName"
                    }
                ]              
            }));
        })
    })
})

describe('DELETE - /api/location', () => {

    describe('Error Checking', () => {

        it('should return 400 when location parameter is not part of the request', async () => {

            const response = await request(app)
                                    .delete("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({});

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 422 when location is not removed', async () => {

            const locationName = "Lake Kanapaha";

            const response = await request(app)
                                    .delete("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: locationName
                                    });

            expect(response.status).toBe(422);
        })

        it('should indicate the special location not removed when remove is not successful', async () => {

            const locationName = "Lake Kanapaha";

            const response = await request(app)
                                    .delete("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: locationName
                                    });

            const removeMessage = response.body.location_removed;

            expect(removeMessage).toEqual(expect.stringContaining(
                "Special location not removed successfully"
            ))
        })
    })

    describe('Valid Call', () => {

        beforeEach(async () => {
            await specialLocations.deleteMany();

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
                        "Common_Name": "American alligator",
                        "Scientific_Name": "Alligator mississippiensis"
                    }
                ]
            };

            await specialLocations.insertOne(specialLocation);
        });

        it('should return 200 when valid location is removed', async () => {

            const locationName = "Lake Alice";

            const response = await request(app)
                                    .delete("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: locationName
                                     });

            expect(response.status).toBe(200);
        })

        it('should indicate the special location is removed when remove is successful', async () => {

            const locationName = "Lake Alice";

            const response = await request(app)
                                    .delete("/api/location")
                                    .set('Content-Type', 'application/json')
                                    .send({
                                        location: locationName
                                    });

            const removeMessage = response.body.location_removed;

            expect(removeMessage).toEqual(expect.stringContaining(
                "Special location removed successfully"
            ))
        })
    })
})