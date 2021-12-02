const request = require('supertest');
const createServer = require('../../app');
const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');

jest.mock('axios');

let db;
let spawnPoints;

const app = createServer();

beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    db = await connection.db('SpawnRoute-Animal-Game');
    app.locals.db = db;

    spawnPoints = await db.collection('Spawn-Points');
    spawnPoints.createIndex({ coordinates: "2dsphere" });
});

afterAll(async () => {
    await connection.close();
});

describe('GET - /api/spawner', () => {

    describe('Error Checking', () => {

        it('should return 400 when no parameters are part of the request', async () => {

            const response = await request(app).get("/api/spawner");

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when distance parameter is not part of the request', async () => {

            const response = await request(app)
                                    .get("/api/spawner")
                                    .query({
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when longitude parameter is not part of the request', async () => {

            const response = await request(app)
                                    .get("/api/spawner")
                                    .query({
                                        distance: 100,
                                        latitude: 15
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when latitude parameter is not part of the request', async () => {

            const response = await request(app)
                                    .get("/api/spawner")
                                    .query({
                                        distance: 100,
                                        longitude: 15,
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 422 when distance parameter is invalid', async () => {

            const response = await request(app)
                                    .get("/api/spawner")
                                    .query({
                                        distance: 0,
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.status).toBe(422);
        })

        it('should return 422 when longitude parameter is invalid', async () => {

            const response = await request(app)
                                    .get("/api/spawner")
                                    .query({
                                        distance: 100,
                                        longitude: -181,
                                        latitude: 15
                                    });

            expect(response.status).toBe(422);
        })

        it('should return 422 when latitude parameter is invalid', async () => {

            const response = await request(app)
                                    .get("/api/spawner")
                                    .query({
                                        distance: 100,
                                        longitude: 15,
                                        latitude: -91
                                    });

            expect(response.status).toBe(422);
        })

        it('should have response type of "application/json" for invalid parameter', async () => {

            const response = await request(app)
                                    .get("/api/spawner")
                                    .query({
                                        distance: 0,
                                        longitude: -181,
                                        latitude: -91
                                    });

            expect(response.type).toBe('application/json');
        })

        it('should return the correct error message when distance parameter is invalid', async () => {

            const response = await request(app)
                                    .get("/api/spawner")
                                    .query({
                                        distance: 10001,
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
                                    .get("/api/spawner")
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
                                    .get("/api/spawner")
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
                                    .get("/api/spawner")
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
                                    .get("/api/spawner")
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
                                    .get("/api/spawner")
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
                                    .get("/api/spawner")
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
    })

    describe('Valid Call', () => {

        beforeEach(async () => {
            await spawnPoints.deleteMany();
        });

        it('should return 200 when all parameters are valid', async () => {

            const response = await request(app)
                                    .get("/api/spawner")
                                    .query({
                                        distance: 100,
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.status).toBe(200);
        })

        it('should have response type of "application/json" for valid request', async () => {

            const response = await request(app)
                                    .get("/api/spawner")
                                    .query({
                                        distance: 100,
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.type).toBe('application/json');
        })

        it('should return a spawn point if one is located near the query coordinates', async () => {

            const longitude = 15;
            const latitude = 15;
            const date = new Date();

            const spawn = {
                "createdAt": date,
                "coordinates": [longitude, latitude],
                "animals": [
                    {
                        "Common_Name": "Slaty-Legged Crake",
                        "Scientific_Name": "Rallina eurizonoides",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdGNyYWtl",
                        "Image_Link": "https://upload.wikimedia.org",
                        "Description": "Test Description Crake"
                    }
                ]
            };

            spawnPoints.insertOne(spawn);

            const response = await request(app)
                                    .get("/api/spawner")
                                    .query({
                                        distance: 10000,
                                        longitude: 14.999,
                                        latitude: 15
                                    });

            expect(response.body.spawners.length).toBe(1);

            const returnedSpawn = response.body.spawners[0];

            expect(returnedSpawn).toEqual(expect.objectContaining({
                "_id": expect.anything(),
                "createdAt": date.toISOString(),
                "coordinates": [longitude, latitude],
                "animals": [
                    {
                        "Common_Name": "Slaty-Legged Crake",
                        "Scientific_Name": "Rallina eurizonoides",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdGNyYWtl",
                        "Image_Link": "https://upload.wikimedia.org",
                        "Description": "Test Description Crake"
                    }
                ]
            }));
        })

        it('should return multiple spawn points if more than one is located near the query coordinates', async () => {

            const firstLongitude = 15;
            const firstLatitude = 15;
            const firstDate = new Date();

            const firstSpawn = {
                "createdAt": firstDate,
                "coordinates": [firstLongitude, firstLatitude],
                "animals": [
                    {
                        "Common_Name": "Slaty-Legged Crake",
                        "Scientific_Name": "Rallina eurizonoides",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdGNyYWtl",
                        "Image_Link": "https://upload.wikimedia.org",
                        "Description": "Test Description Crake"
                    }
                ]
            };

            const secondLongitude = 15.0001;
            const secondLatitude = 14.9999;
            const secondDate = new Date();

            const secondSpawn = {
                "createdAt": secondDate,
                "coordinates": [secondLongitude, secondLatitude],
                "animals": [
                    {
                        "Common_Name": "Dark Chanting-Goshawk",
                        "Scientific_Name": "Melierax metabates",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdGdvc2hhd2s=",
                        "Image_Link": "https://upload.wikimedia.org",
                        "Description": "Test Description Goshawk"
                    }
                ]
            };

            spawnPoints.insertOne(firstSpawn);
            spawnPoints.insertOne(secondSpawn);

            const response = await request(app)
                                    .get("/api/spawner")
                                    .query({
                                        distance: 10000,
                                        longitude: 14.99,
                                        latitude: 15
                                    });

            expect(response.body.spawners.length).toBe(2);

            const firstReturnSpawn = response.body.spawners[0];

            expect(firstReturnSpawn).toEqual(expect.objectContaining({
                "_id": expect.anything(),
                "createdAt": firstDate.toISOString(),
                "coordinates": [firstLongitude, firstLatitude],
                "animals": [
                    {
                        "Common_Name": "Slaty-Legged Crake",
                        "Scientific_Name": "Rallina eurizonoides",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdGNyYWtl",
                        "Image_Link": "https://upload.wikimedia.org",
                        "Description": "Test Description Crake"
                    }
                ]
            }));

            const secondReturnSpawn = response.body.spawners[1];

            expect(secondReturnSpawn).toEqual(expect.objectContaining({
                "_id": expect.anything(),
                "createdAt": secondDate.toISOString(),
                "coordinates": [secondLongitude, secondLatitude],
                "animals": [
                    {
                        "Common_Name": "Dark Chanting-Goshawk",
                        "Scientific_Name": "Melierax metabates",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdGdvc2hhd2s=",
                        "Image_Link": "https://upload.wikimedia.org",
                        "Description": "Test Description Goshawk"
                    }
                ]
            }));
        })

        it('should return "Spawn Point Not Found" message if no spawn points are found near the query coordinates', async () => {

            const response = await request(app)
                                    .get("/api/spawner")
                                    .query({
                                        distance: 100,
                                        longitude: 25,
                                        latitude: 25
                                    });

            expect(response.status).toBe(200);
            expect(response.type).toBe('application/json');

            const returnedMessage = response.body.spawners;

            expect(returnedMessage).toBe("Spawn Point Not Found");
        })
    })
})

describe('POST - /api/spawner', () => {

    describe('Error Checking', () => {

        it('should return 400 when no parameters are part of the request', async () => {

            const response = await request(app).post("/api/spawner");

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when longitude parameter is not part of the request', async () => {

            const response = await request(app)
                                    .post("/api/spawner")
                                    .send({
                                        latitude: 15
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when latitude parameter is not part of the request', async () => {

            const response = await request(app)
                                    .post("/api/spawner")
                                    .send({
                                        longitude: 15
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 422 when longitude parameter is invalid', async () => {

            const response = await request(app)
                                    .post("/api/spawner")
                                    .send({
                                        longitude: -181,
                                        latitude: 15
                                    });

            expect(response.status).toBe(422);
        })

        it('should return 422 when latitude parameter is invalid', async () => {

            const response = await request(app)
                                    .post("/api/spawner")
                                    .send({
                                        longitude: 15,
                                        latitude: -91
                                    });

            expect(response.status).toBe(422);
        })

        it('should return the correct error message when longitude parameter is invalid', async () => {

            const response = await request(app)
                                    .post("/api/spawner")
                                    .send({
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
                                    .post("/api/spawner")
                                    .send({
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
                                    .post("/api/spawner")
                                    .send({
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

        const longitude = 15;
        const latitude = 15;
        const radius = 20000;

        beforeAll(async () => {

            const mapOfLifeQuery =
                'https://api.mol.org/1.x/spatial/species/list?lang=en' +
                '&lat=' + latitude +
                '&lng=' + longitude +
                '&radius=' + radius;

            const mapOfLifeResult = 
			{
				data: [
					{
						"count": 1,
						"title": "Birds",
						"taxa": "birds",
						"species": [
							{
								"image_url": "googleusercontenturl",
								"sequenceid": 40,
								"_order": null,
								"family": "Anatidae",
								"tc_id": "0d380afe-d1cf-11e6-935f-cfb9f756185a",
								"redlist": "NT",
								"last_update": "2017-02-23T02:14:51.748568+00:00",
								"scientificname": "Aythya nyroca",
								"common": "Ferruginous Pochard",
								"family_common": "Ducks And Swans"
							}
						]
					},
					{
						"count": 1,
						"title": "Mammals",
						"taxa": "mammals",
						"species": [
							{
								"image_url": "googleusercontenturl",
								"sequenceid": 330,
								"_order": null,
								"family": "Muridae",
								"tc_id": "ed49b518-d1d3-11e6-9391-bf866dd1205e",
								"redlist": "LC",
								"last_update": "2017-12-12T15:27:18.00959+00:00",
								"scientificname": "Meriones crassus",
								"common": "Sundevall's Jird",
								"family_common": "True Mice, Rats And Relatives"
							}
						]
					}
				]
			};

            const duckWikiQuery =
                'https://en.wikipedia.org/w/api.php?action=query&format=json' +
                '&titles=' + 'Aythya%20nyroca' +
                '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url';

            const duckWikiResult =
            {
                "query": {
                    "pages": {
                        "307678": {
                            "pageid": 307678,
                            "ns": 0,
                            "title": "Ferruginous duck",
                            "thumbnail": {
                                "source": "FerruginousDuckImageLink",
                                "width": 100,
                                "height": 56
                            },
                            "pageimage": "Aythya_nyroca_at_Martin_Mere_1.jpg",
                            "extract": "Ferruginous duck description."
                        }
                    }
                }
            };

            const mouseWikiQuery =
                'https://en.wikipedia.org/w/api.php?action=query&format=json' +
                '&titles=' + 'Meriones%20crassus' +
                '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url';

            const mouseWikiResult =
            {
                "query": {
                    "pages": {
                        "12173625": {
                            "pageid": 12173625,
                            "ns": 0,
                            "title": "Sundevall's jird",
                            "thumbnail": {
                                "source": "Sundevall'sJirdImageLink",
                                "width": 100,
                                "height": 66
                            },
                            "pageimage": "Meriones_crassus.jpg",
                            "extract": "Sundevall's jird description."
                        }
                    }
                }
            }

            const duckImageLink = "FerruginousDuckImageLink";
            const mouseImageLink = "Sundevall'sJirdImageLink";
            const duckImageBuffer = Buffer.from('testduck');
            const mouseImageBuffer = Buffer.from('testmouse');

            axios.get.mockImplementation((queryUrl) => {
                switch (queryUrl) {
                    case mapOfLifeQuery:
                        return Promise.resolve(mapOfLifeResult);
                    case duckWikiQuery:
                        return Promise.resolve({ data: duckWikiResult });
                    case mouseWikiQuery:
                        return Promise.resolve({ data: mouseWikiResult });
                    case duckImageLink:
                        return Promise.resolve({
                            headers: {
                                "content-type": "image/jpeg",
                            },
                            data: duckImageBuffer
                        })
                    case mouseImageLink:
                        return Promise.resolve({
                            headers: {
                                "content-type": "image/jpeg",
                            },
                            data: mouseImageBuffer
                        })
                }
            })
        });

        beforeEach(async () => {
            await spawnPoints.deleteMany();
        });

        it('should return 200 when all parameters are valid', async () => {

            const response = await request(app)
                                    .post("/api/spawner")
                                    .send({
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.status).toBe(200);
        })

        it('should have response type of "application/json" for valid request', async () => {

            const response = await request(app)
                                    .post("/api/spawner")
                                    .send({
                                        longitude: 15,
                                        latitude: 15
                                    });

            expect(response.type).toBe('application/json');
        })

        it('should return a new spawn point if latitude and longitude parameters are valid', async () => {

            // ensure spawnPoints collection is empty before post request
            var findAllDocuments = await spawnPoints.find({}).toArray();
            expect(findAllDocuments.length).toBe(0);

            const response = await request(app)
                                    .post("/api/spawner")
                                    .send({
                                        longitude: 15,
                                        latitude: 15
                                    });

            const newSpawn = response.body.spawn_point;

            const dateStringRegex = /(.*)(\d\d):(\d\d):(\d\d)(.*)/;

            try{ // accounting for the two variations on object order
                expect(newSpawn).toEqual(expect.objectContaining({ 
                "_id": expect.anything(),
                "createdAt": expect.stringMatching(dateStringRegex),
                "coordinates": [longitude, latitude],
                "animals": [
                    {
                        "Common_Name": "Ferruginous Pochard",
                        "Scientific_Name": "Aythya nyroca",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdGR1Y2s=",
                        "Image_Link": "FerruginousDuckImageLink",
                        "Description": "Ferruginous duck description."
                    },
                    {
                        "Common_Name": "Sundevall's Jird",
                        "Scientific_Name": "Meriones crassus",
                        "Raw_Image": "data:image/jpeg;base64,dGVzdG1vdXNl",
                        "Image_Link": "Sundevall'sJirdImageLink",
                        "Description": "Sundevall's jird description."
                    }
                ]
            }));
            }catch{
                expect(newSpawn).toEqual(expect.objectContaining({
                    "_id": expect.anything(),
                    "createdAt": expect.stringMatching(dateStringRegex),
                    "coordinates": [longitude, latitude],
                    "animals": [
                        {
                            "Common_Name": "Sundevall's Jird",
                            "Scientific_Name": "Meriones crassus",
                            "Raw_Image": "data:image/jpeg;base64,dGVzdG1vdXNl",
                            "Image_Link": "Sundevall'sJirdImageLink",
                            "Description": "Sundevall's jird description."
                        },
                        {
                            "Common_Name": "Ferruginous Pochard",
                            "Scientific_Name": "Aythya nyroca",
                            "Raw_Image": "data:image/jpeg;base64,dGVzdGR1Y2s=",
                            "Image_Link": "FerruginousDuckImageLink",
                            "Description": "Ferruginous duck description."
                        }
                    ]
                }));
            }
        })
    })
})