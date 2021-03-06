const request = require('supertest');
const createServer = require('../../app');
const MongoClient = require('mongodb').MongoClient;
const DatabaseService = require('../../services/DatabaseService');

let db;
let specialLocations;

const app = createServer();

beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    db = await connection.db('AnimalRoute-Animal-Game');
    app.locals.db = db;

    specialLocations = await db.collection('Special-Locations');
});

afterAll(async () => {
    await connection.close();
});

describe('POST - /api/animal', () => {

    describe('Error Checking', () => {

        beforeEach(async () => {
            await specialLocations.deleteMany();
        });

        it('should return 400 when no parameters are part of the request', async () => {

            const response = await request(app).post("/api/animal");

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when location parameter is not part of the request', async () => {

            const response = await request(app)
                                    .post("/api/animal")
                                    .send({
                                        common_animal: "CommonName",
                                        scientific_animal: "ScientificName"
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when scientific_animal parameter is not part of the request', async () => {

            const response = await request(app)
                                    .post("/api/animal")
                                    .send({
                                        location: "LocationName",
                                        common_animal: "CommonName"
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when common_animal parameter is not part of the request', async () => {

            const response = await request(app)
                                    .post("/api/animal")
                                    .send({
                                        location: "LocationName",
                                        scientific_animal: "ScientificName"
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 409 when an animal already exists in a special location', async () => {

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

            await specialLocations.insertOne(specialLocation);

            const locationName = "Lake Alice";
            const commonName = "American alligator";
            const scientificName = "Alligator mississippiensis";

            const response = await request(app)
                                    .post("/api/animal")
                                    .send({
                                        location: locationName,
                                        common_animal: commonName,
                                        scientific_animal: scientificName
                                    });

            expect(response.status).toBe(409);
        })

        it('should return 422 when parameters are valid but animal is not added successfully', async () => {

            const locationName = "Lake Kanapaha";
            const commonName = "American penguin";
            const scientificName = "Aptenodytes forsteri";

            const response = await request(app)
                                    .post("/api/animal")
                                    .send({
                                        location: locationName,
                                        common_animal: commonName,
                                        scientific_animal: scientificName
                                    });

            expect(response.status).toBe(422);
        })

        it('should indicate the animal already exists at location when trying to add duplicate animal', async () => {

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

            await specialLocations.insertOne(specialLocation);

            const locationName = "Lake Alice";
            const commonName = "American alligator";
            const scientificName = "Alligator mississippiensis";

            const response = await request(app)
                                    .post("/api/animal")
                                    .send({
                                        location: locationName,
                                        common_animal: commonName,
                                        scientific_animal: scientificName
                                    });

            const insertMessage = response.body.add_animal;

            expect(insertMessage).toEqual(expect.stringContaining(
                "Animal already exists at this location"
            ))
        })

        it('should indicate animal not added when parameters are valid but insert is not successful', async () => {

            const locationName = "Lake Kanapaha";
            const commonName = "American penguin";
            const scientificName = "Aptenodytes forsteri";

            const response = await request(app)
                                    .post("/api/animal")
                                    .send({
                                        location: locationName,
                                        common_animal: commonName,
                                        scientific_animal: scientificName
                                    });

            const insertMessage = response.body.add_animal;

            expect(insertMessage).toEqual(expect.stringContaining(
                "Animal not added successfully"
            ))
        })

        it('should return POST error in response if any errors are thrown', async () => {

            jest.spyOn(DatabaseService, 'findAnimalAtSpecialLocation').mockRejectedValue();

            const locationName = "Valid Location";
            const commonName = "Valid Common Name";
            const scientificName = "Valid Scientific Name";

            const response = await request(app)
                                    .post("/api/animal")
                                    .send({
                                        location: locationName,
                                        common_animal: commonName,
                                        scientific_animal: scientificName
                                    });

            expect(response.error.status).toBe(404);

            expect(response.error.text).toEqual(expect.stringContaining(
                "Cannot POST /api/animal"
            ));

            jest.spyOn(DatabaseService, 'findAnimalAtSpecialLocation').mockRestore();
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
                        "common_name": "Eastern gray squirrel",
                        "scientific_name": "Sciurus carolinensis"
                    }
                ]
            };

            await specialLocations.insertOne(specialLocation);
        });

        it('should return 200 when all parameters are valid and animal added successfully', async () => {

            const locationName = "Lake Alice";
            const commonName = "American alligator";
            const scientificName = "Alligator mississippiensis";

            const response = await request(app)
                                    .post("/api/animal")
                                    .send({
                                        location: locationName,
                                        common_animal: commonName,
                                        scientific_animal: scientificName
                                    });

            expect(response.status).toBe(200);
        })

        it('should have response type of "application/json" for valid request', async () => {

            const response = await request(app)
                                    .post("/api/animal")
                                    .send({
                                        location: "LocationName",
                                        common_animal: "CommonName",
                                        scientific_animal: "ScientificName"
                                    });

            expect(response.type).toBe('application/json');
        })

        it('should indicate the animal is added when insert is successful', async () => {

            const locationName = "Lake Alice";
            const commonName = "American alligator";
            const scientificName = "Alligator mississippiensis";

            const response = await request(app)
                                    .post("/api/animal")
                                    .send({
                                        location: locationName,
                                        common_animal: commonName,
                                        scientific_animal: scientificName
                                    });

            const insertMessage = response.body.add_animal;

            expect(insertMessage).toEqual(expect.stringContaining(
                "Animal added successfully"
            ))
        })

    })
})

describe('DELETE - /api/animal', () => {

    describe('Error Checking', () => {

        beforeEach(async () => {
            await specialLocations.deleteMany();
        });

        it('should return 400 when no parameters are part of the request', async () => {

            const response = await request(app).delete("/api/animal");

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when location parameter is not part of the request', async () => {

            const response = await request(app)
                                    .delete("/api/animal")
                                    .send({
                                        scientific_animal: "ScientificName"
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when scientific_animal parameter is not part of the request', async () => {

            const response = await request(app)
                                    .delete("/api/animal")
                                    .send({
                                        location: "LocationName"
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 409 when an animal does not exist in a special location', async () => {

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

            await specialLocations.insertOne(specialLocation);

            const locationName = "Lake Alice";
            const scientificName = "Hirundo rustica";

            const response = await request(app)
                                    .delete("/api/animal")
                                    .send({
                                        location: locationName,
                                        scientific_animal: scientificName
                                    });

            expect(response.status).toBe(409);
        })

        it('should indicate the animal does not exist at a location when trying to remove an animal', async () => {

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

            await specialLocations.insertOne(specialLocation);

            const locationName = "Lake Alice";
            const scientificName = "Hirundo rustica";

            const response = await request(app)
                                    .delete("/api/animal")
                                    .send({
                                        location: locationName,
                                        scientific_animal: scientificName
                                    });

            const deleteMessage = response.body.remove_animal;

            expect(deleteMessage).toEqual(expect.stringContaining(
                "Animal does not exist at special location"
            ))
        })

        it('should indicate the animal not removed if animal exists but removal from database is not successful', async () => {

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
                    }
                ]
            };

            await specialLocations.insertOne(specialLocation);

            // modifiedCount from MongoDB response will be 0 if removal is not successful
            jest.spyOn(DatabaseService, 'removeSpecialAnimal').mockReturnValue({
                "modifiedCount": 0
            });

            const locationName = "Lake Alice";
            const scientificName = "Alligator mississippiensis";

            const response = await request(app)
                                    .delete("/api/animal")
                                    .send({
                                        location: locationName,
                                        scientific_animal: scientificName
                                    });

            const deleteMessage = response.body.remove_animal;

            expect(deleteMessage).toEqual(expect.stringContaining(
                "Animal not removed successfully"
            ))

            jest.spyOn(DatabaseService, 'removeSpecialAnimal').mockRestore();
        })

        it('should return DELETE error in response if any errors are thrown', async () => {

            jest.spyOn(DatabaseService, 'findAnimalAtSpecialLocation').mockRejectedValue();

            const locationName = "Valid Location";
            const scientificName = "Valid Scientific Name";

            const response = await request(app)
                                    .delete("/api/animal")
                                    .send({
                                        location: locationName,
                                        scientific_animal: scientificName
                                    });

            expect(response.error.status).toBe(404);

            expect(response.error.text).toEqual(expect.stringContaining(
                "Cannot DELETE /api/animal"
            ));

            jest.spyOn(DatabaseService, 'findAnimalAtSpecialLocation').mockRestore();
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
                        "common_name": "American alligator",
                        "scientific_name": "Alligator mississippiensis"
                    },
                    {
                        "common_name": "Eastern gray squirrel",
                        "scientific_name": "Sciurus carolinensis"
                    }
                ]
            };

            await specialLocations.insertOne(specialLocation);
        });

        it('should return 200 when all parameters are valid and animal removed successfully', async () => {

            const locationName = "Lake Alice";
            const scientificName = "Alligator mississippiensis";

            const response = await request(app)
                                    .delete("/api/animal")
                                    .send({
                                        location: locationName,
                                        scientific_animal: scientificName
                                    });

            expect(response.status).toBe(200);
        })

        it('should have response type of "application/json" for valid request', async () => {

            const response = await request(app)
                                    .delete("/api/animal")
                                    .send({
                                        location: "LocationName",
                                        scientific_animal: "ScientificName"
                                    });

            expect(response.type).toBe('application/json');
        })

        it('should indicate the animal is added when insert is successful', async () => {

            const locationName = "Lake Alice";
            const scientificName = "Alligator mississippiensis";

            const response = await request(app)
                                    .delete("/api/animal")
                                    .send({
                                        location: locationName,
                                        scientific_animal: scientificName
                                    });

            const deleteMessage = response.body.remove_animal;

            expect(deleteMessage).toEqual(expect.stringContaining(
                "Animal removed successfully"
            ))
        })
    })
})