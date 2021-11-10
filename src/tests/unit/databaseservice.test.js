const DatabaseService = require('../../services/DatabaseService');
const MongoClient = require('mongodb').MongoClient;

let connection;
let db;
let spawnPoints;
let specialSpawnPoints;
let specialLocations;

beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    db = await connection.db('Database-Animal-Game');

    spawnPoints = await db.collection('Spawn-Points');
    spawnPoints.createIndex({ coordinates: "2dsphere" });

    specialSpawnPoints = await db.collection('Special-Spawn-Points');
    specialSpawnPoints.createIndex({ coordinates: "2dsphere" });

    specialLocations = await db.collection('Special-Locations');
    specialLocations.createIndex({ region: "2dsphere" });
});

afterAll(async () => {
    await connection.close();
});

describe('findNearestSpawns', () => {

    beforeEach(async () => {
        spawnPoints.deleteMany();
    });

    it('should return a spawn if one is found near the coordinates', async () => {

        const spawn = {
            "createdAt": new Date(),
            "coordinates": [15, 15],
            "Animals": [
                {
                    "Common_Name": "Slaty-Legged Crake",
                    "Scientific_Name": "Rallina eurizonoides",
                    "Image_Link": "https://upload.wikimedia.org",
                    "Description": "Test Description Crake"
                }
            ]
        };

        await spawnPoints.insertOne(spawn);

        const maxSearchDistance = 50000;
        const searchCoords = [14.9, 15];

        const nearbySpawns = await DatabaseService.findNearestSpawns(db, maxSearchDistance, searchCoords);

        expect(nearbySpawns.length).toBe(1);

        const firstSpawn = nearbySpawns[0];

        expect(firstSpawn).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [15, 15],
            "Animals": [
                {
                    "Common_Name": "Slaty-Legged Crake",
                    "Scientific_Name": "Rallina eurizonoides",
                    "Image_Link": "https://upload.wikimedia.org",
                    "Description": "Test Description Crake"
                }
            ]
        }));
    })

    it('should return multiple spawns if more than one is found near the coordinates', async () => {

        const spawnOne = {
            "createdAt": new Date(),
            "coordinates": [14.9, 15],
            "Animals": [
                {
                    "Common_Name": "Slaty-Legged Crake",
                    "Scientific_Name": "Rallina eurizonoides",
                    "Image_Link": "https://upload.wikimedia.org",
                    "Description": "Test Description Crake"
                }
            ]
        };
        const spawnTwo = {
            "createdAt": new Date(),
            "coordinates": [15, 15.1],
            "Animals": [
                {
                    "Common_Name": "Dark Chanting-Goshawk",
                    "Scientific_Name": "Melierax metabates",
                    "Image_Link": "https://upload.wikimedia.org",
                    "Description": "Test Description Goshawk"
                }
            ]
        };

        await spawnPoints.insertOne(spawnOne);
        await spawnPoints.insertOne(spawnTwo);

        const maxSearchDistance = 100000;
        const searchCoords = [14.9, 15.1];

        const nearbySpawns = await DatabaseService.findNearestSpawns(db, maxSearchDistance, searchCoords);

        expect(nearbySpawns.length).toBe(2);

        const firstSpawn = nearbySpawns[0];

        expect(firstSpawn).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [15, 15.1],
            "Animals": [
                {
                    "Common_Name": "Dark Chanting-Goshawk",
                    "Scientific_Name": "Melierax metabates",
                    "Image_Link": "https://upload.wikimedia.org",
                    "Description": "Test Description Goshawk"
                }
            ]
        }));

        const secondSpawn = nearbySpawns[1];

        expect(secondSpawn).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [14.9, 15],
            "Animals": [
                {
                    "Common_Name": "Slaty-Legged Crake",
                    "Scientific_Name": "Rallina eurizonoides",
                    "Image_Link": "https://upload.wikimedia.org",
                    "Description": "Test Description Crake"
                }
            ]
        }));
    })

    it('should return an empty array if no spawns are found near the coordinates', async () => {

        const spawn = {
            "createdAt": new Date(),
            "coordinates": [15, 15],
            "Animals": [
                {
                    "Common_Name": "Slaty-Legged Crake",
                    "Scientific_Name": "Rallina eurizonoides",
                    "Image_Link": "https://upload.wikimedia.org",
                    "Description": "Test Description"
                }
            ]
        };

        await spawnPoints.insertOne(spawn);

        const maxSearchDistance = 100;
        const searchCoords = [180, 90];

        const nearbySpawns = await DatabaseService.findNearestSpawns(db, maxSearchDistance, searchCoords);

        expect(Array.isArray(nearbySpawns)).toBe(true);
        expect(nearbySpawns.length).toBe(0);
    })

    it('should throw an error if there is an error when trying to find a spawn', async () => {

        const maxDistance = 10;
        const coords = null;

        await expect(DatabaseService.findNearestSpawns(db, maxDistance, coords)).rejects.toThrow();
    })
})

describe('findNearbySpecialSpawns', () => {

    beforeEach(async () => {
        specialSpawnPoints.deleteMany();
    });

    it('should return a special spawn point if one is found near the coordinates', async () => {

        const lakeAliceLongitude = -82.361197;
        const lakeAliceLatitude = 29.643082;

        const specialSpawn = {
            "createdAt": new Date(),
            "coordinates": [lakeAliceLongitude, lakeAliceLatitude],
            "Animals": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis",
                    "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                    "Description": "Test Alligator Description."
                }
            ]
        };

        await specialSpawnPoints.insertOne(specialSpawn);

        const maxSearchDistance = 500000000;
        const searchCoords = [-82.361212, 29.643088];

        const nearbySpecialSpawns = await DatabaseService.findNearbySpecialSpawns(db, maxSearchDistance, searchCoords);

        expect(nearbySpecialSpawns.length).toBe(1);

        const firstSpawn = nearbySpecialSpawns[0];

        expect(firstSpawn).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [lakeAliceLongitude, lakeAliceLatitude],
            "Animals": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis",
                    "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                    "Description": "Test Alligator Description."
                }
            ]
        }));
    })

    it('should return multiple special spawn points if more than one is found near the coordinates', async () => {

        const lakeAliceLongitude = -82.361197;
        const lakeAliceLatitude = 29.643082;

        const specialSpawnOne = {
            "createdAt": new Date(),
            "coordinates": [lakeAliceLongitude, lakeAliceLatitude],
            "Animals": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis",
                    "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                    "Description": "Test Alligator Description."
                }
            ]
        };

        const secondLakeAliceLongitude = -82.361212;
        const secondLakeAliceLatitude = 29.643088;

        const specialSpawnTwo = {
            "createdAt": new Date(),
            "coordinates": [secondLakeAliceLongitude, secondLakeAliceLatitude],
            "Animals": [
                {
                    "Common_Name": "Albert Gator",
                    "Scientific_Name": "Alligator albertus",
                    "Image_Link": "https://upload.wikimedia.org",
                    "Description": "Test Description Albert Alligator."
                }
            ]
        };

        await specialSpawnPoints.insertOne(specialSpawnOne);
        await specialSpawnPoints.insertOne(specialSpawnTwo);

        const maxSearchDistance = 1000000;
        const searchCoords = [-82.361216, 29.643146];

        const nearbySpecialSpawns = await DatabaseService.findNearbySpecialSpawns(db, maxSearchDistance, searchCoords);

        expect(nearbySpecialSpawns.length).toBe(2);

        const firstSpecialSpawn = nearbySpecialSpawns[0];

        expect(firstSpecialSpawn).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [secondLakeAliceLongitude, secondLakeAliceLatitude],
            "Animals": [
                {
                    "Common_Name": "Albert Gator",
                    "Scientific_Name": "Alligator albertus",
                    "Image_Link": "https://upload.wikimedia.org",
                    "Description": "Test Description Albert Alligator."
                }
            ]
        }));

        const secondSpecialSpawn = nearbySpecialSpawns[1];

        expect(secondSpecialSpawn).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [lakeAliceLongitude, lakeAliceLatitude],
            "Animals": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis",
                    "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                    "Description": "Test Alligator Description."
                }
            ]
        }));
    })

    it('should return an empty array if no spawns are found near the coordinates', async () => {

        const lakeAliceLongitude = -82.361197;
        const lakeAliceLatitude = 29.643082;

        const specialSpawn = {
            "createdAt": new Date(),
            "coordinates": [lakeAliceLongitude, lakeAliceLatitude],
            "Animals": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis",
                    "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                    "Description": "Test Alligator Description."
                }
            ]
        };

        await specialSpawnPoints.insertOne(specialSpawn);

        const maxSearchDistance = 100;
        const searchCoords = [180, 90];

        const nearbySpecialSpawns = await DatabaseService.findNearbySpecialSpawns(db, maxSearchDistance, searchCoords);

        expect(Array.isArray(nearbySpecialSpawns)).toBe(true);
        expect(nearbySpecialSpawns.length).toBe(0);
    })

    it('should throw an error if there is an error when trying to find a special spawn', async () => {

        const maxDistance = 10;
        const coords = null;

        await expect(DatabaseService.findNearbySpecialSpawns(db, maxDistance, coords)).rejects.toThrow();
    })
})

describe('findSpecialLocation', () => {

    beforeEach(async () => {
        specialLocations.deleteMany();
    });

    it('should return the name of a special location if one is found near the coordinates', async () => {

        const specialLocation = {
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
                    "Scientific_Name": "Alligator mississippiensis",
                    "Common_Name": "American alligator"
                }
            ]
        };

        await specialLocations.insertOne(specialLocation);

        const centerOfLakeAliceCoords = [-82.361214, 29.643077];

        const nearbySpecialLocation = await DatabaseService.findSpecialLocation(db, centerOfLakeAliceCoords);

        expect(nearbySpecialLocation.length).toBe(1);

        const firstLocation = nearbySpecialLocation[0];

        expect(firstLocation).toEqual(expect.objectContaining({
            "name": "Lake Alice"
        }));
    })

    it('should return an empty array if no special location is found near the coordinates', async () => {

        const specialLocation = {
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
                    "Scientific_Name": "Alligator mississippiensis",
                    "Common_Name": "American alligator"
                }
            ]
        };

        await specialLocations.insertOne(specialLocation);

        const centerOfSpurrierFieldCoords = [-82.348593, 29.649897];

        const nearbySpecialLocation = await DatabaseService.findSpecialLocation(db, centerOfSpurrierFieldCoords);

        expect(Array.isArray(nearbySpecialLocation)).toBe(true);
        expect(nearbySpecialLocation.length).toBe(0);
    })

    it('should throw an error if there is an error when trying to find a special location', async () => {

        const coords = null;

        await expect(DatabaseService.findSpecialLocation(db, coords)).rejects.toThrow();
    })
})

describe('getAnimalsFromSpecialLocation', () => {

    beforeEach(async () => {
        specialLocations.deleteMany();
    });

    it('should return an array of animals from special location if the name is found in the database', async () => {

        const specialLocation = {
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
                    "Scientific_Name": "Alligator mississippiensis",
                    "Common_Name": "American alligator"
                },
                {
                    "Scientific_Name": "Alligator albertus",
                    "Common_Name": "Albert Gator"
                },
                {
                    "Scientific_Name": "Alligator albertas",
                    "Common_Name": "Alberta Gator"
                }
            ]
        };

        await specialLocations.insertOne(specialLocation);

        const locationName = "Lake Alice";

        const specialAnimals = await DatabaseService.getAnimalsFromSpecialLocation(db, locationName);

        expect(specialAnimals.length).toBe(3);

        const firstAnimal = specialAnimals[0];

        expect(firstAnimal).toEqual(expect.objectContaining({
            "Scientific_Name": "Alligator mississippiensis",
            "Common_Name": "American alligator"
        }));

        const secondAnimal = specialAnimals[1];

        expect(secondAnimal).toEqual(expect.objectContaining({
            "Scientific_Name": "Alligator albertus",
            "Common_Name": "Albert Gator"
        }));

        const thirdAnimal = specialAnimals[2];

        expect(thirdAnimal).toEqual(expect.objectContaining({
            "Scientific_Name": "Alligator albertas",
            "Common_Name": "Alberta Gator"
        }));
    })

    it('should return an empty array if the name is not found in the database', async () => {

        const specialLocation = {
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
                    "Scientific_Name": "Alligator mississippiensis",
                    "Common_Name": "American alligator"
                },
                {
                    "Scientific_Name": "Alligator albertus",
                    "Common_Name": "Albert Gator"
                },
                {
                    "Scientific_Name": "Alligator albertas",
                    "Common_Name": "Alberta Gator"
                }
            ]
        };

        await specialLocations.insertOne(specialLocation);

        const locationName = "Lake Kanapaha";

        const specialAnimals = await DatabaseService.getAnimalsFromSpecialLocation(db, locationName);

        expect(Array.isArray(specialAnimals)).toBe(true);
        expect(specialAnimals.length).toBe(0);
    })
})

describe('insertNewSpawn', () => {

    beforeEach(async () => {
        spawnPoints.deleteMany();
    });

    it('should insert a new spawn into the database and return it', async () => {

        const newSpawn = {
            createdAt: new Date(),
            coordinates: [25, 25],
            Animals: [
                {
                    Common_Name: 'Ferruginous Pochard',
                    Scientific_Name: 'Aythya nyroca',
                    Image_Link: 'https://upload.wikimedia.org/TestDuckImageLink',
                    Description: 'Test Duck Description'
                }
            ]
        }

        const insertedSpawn = await DatabaseService.insertNewSpawn(db, newSpawn);

        expect(insertedSpawn).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [25, 25],
            "Animals": [
                {
                    Common_Name: 'Ferruginous Pochard',
                    Scientific_Name: 'Aythya nyroca',
                    Image_Link: 'https://upload.wikimedia.org/TestDuckImageLink',
                    Description: 'Test Duck Description'
                }
            ]
        }));

        const spawnID = insertedSpawn["_id"];

        const returnedSpawn = await spawnPoints.findOne({ _id: spawnID });
        expect(returnedSpawn).toEqual(insertedSpawn);
    })
})

describe('insertNewSpecialSpawn', () => {

    beforeEach(async () => {
        specialSpawnPoints.deleteMany();
    });

    it('should insert a new special spawn into the database and return it', async () => {

        const lakeAliceLongitude = -82.361197;
        const lakeAliceLatitude = 29.643082;

        const newSpecialSpawn = {
            createdAt: new Date(),
            coordinates: [lakeAliceLongitude, lakeAliceLatitude],
            Animals: [
                {
                    Common_Name: "American alligator",
                    Scientific_Name: "Alligator mississippiensis",
                    Image_Link: "https://upload.wikimedia.org/AlligatorImage",
                    Description: "Test Alligator Description."
                }
            ]
        }

        const insertedSpecialSpawn = await DatabaseService.insertNewSpecialSpawn(db, newSpecialSpawn);

        expect(insertedSpecialSpawn).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [lakeAliceLongitude, lakeAliceLatitude],
            "Animals": [
                {
                    Common_Name: "American alligator",
                    Scientific_Name: "Alligator mississippiensis",
                    Image_Link: "https://upload.wikimedia.org/AlligatorImage",
                    Description: "Test Alligator Description."
                }
            ]
        }));

        const spawnID = insertedSpecialSpawn["_id"];

        const returnedSpecialSpawn = await specialSpawnPoints.findOne({ _id: spawnID });
        expect(returnedSpecialSpawn).toEqual(insertedSpecialSpawn);
    })
})