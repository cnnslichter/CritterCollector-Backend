const DatabaseService = require('../../services/DatabaseService');
const MongoClient = require('mongodb').MongoClient;

let connection;
let db;
let spawnPoints;
let specialSpawnPoints;
let specialLocations;
let playerProfiles;

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

    playerProfiles = await db.collection('Player-Profiles');
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
            "animals": [
                {
                    "Common_Name": "Slaty-Legged Crake",
                    "Scientific_Name": "Rallina eurizonoides",
                    "Image_Link": "https://upload.wikimedia.org",
                    "Description": "Test Description Crake"
                }
            ]
        };

        await spawnPoints.insertOne(spawn);

        const maxSearchDistance = 10000;
        const searchCoords = [14.9999, 15];

        const nearbySpawns = await DatabaseService.findNearestSpawns(db, maxSearchDistance, searchCoords);

        expect(nearbySpawns.length).toBe(1);

        const spawnPoint = nearbySpawns[0];

        expect(spawnPoint).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [15, 15],
            "animals": [
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
            "coordinates": [14.99999, 15],
            "animals": [
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
            "coordinates": [15, 15.00001],
            "animals": [
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

        const maxSearchDistance = 10000;
        const searchCoords = [15, 15];

        const nearbySpawns = await DatabaseService.findNearestSpawns(db, maxSearchDistance, searchCoords);

        expect(nearbySpawns.length).toBe(2);

        const firstSpawn = nearbySpawns[0];

        expect(firstSpawn).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [14.99999, 15],
            "animals": [
                {
                    "Common_Name": "Slaty-Legged Crake",
                    "Scientific_Name": "Rallina eurizonoides",
                    "Image_Link": "https://upload.wikimedia.org",
                    "Description": "Test Description Crake"
                }
            ]
        }));

        const secondSpawn = nearbySpawns[1];

        expect(secondSpawn).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [15, 15.00001],
            "animals": [
                {
                    "Common_Name": "Dark Chanting-Goshawk",
                    "Scientific_Name": "Melierax metabates",
                    "Image_Link": "https://upload.wikimedia.org",
                    "Description": "Test Description Goshawk"
                }
            ]
        }));
    })

    it('should return an empty array if no spawns are found near the coordinates', async () => {

        const spawn = {
            "createdAt": new Date(),
            "coordinates": [15, 15],
            "animals": [
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
            "animals": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis",
                    "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                    "Description": "Test Alligator Description."
                }
            ]
        };

        await specialSpawnPoints.insertOne(specialSpawn);

        const maxSearchDistance = 10000;
        const searchCoords = [-82.361196, 29.643083];

        const nearbySpecialSpawns = await DatabaseService.findNearbySpecialSpawns(db, maxSearchDistance, searchCoords);

        expect(nearbySpecialSpawns.length).toBe(1);

        const spawnPoint = nearbySpecialSpawns[0];

        expect(spawnPoint).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [lakeAliceLongitude, lakeAliceLatitude],
            "animals": [
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
            "animals": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis",
                    "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                    "Description": "Test Alligator Description."
                }
            ]
        };

        const secondLakeAliceLongitude = -82.361199;
        const secondLakeAliceLatitude = 29.643084;

        const specialSpawnTwo = {
            "createdAt": new Date(),
            "coordinates": [secondLakeAliceLongitude, secondLakeAliceLatitude],
            "animals": [
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

        const maxSearchDistance = 10000;
        const searchCoords = [-82.361198, 29.643083];

        const nearbySpecialSpawns = await DatabaseService.findNearbySpecialSpawns(db, maxSearchDistance, searchCoords);

        expect(nearbySpecialSpawns.length).toBe(2);

        const firstSpecialSpawn = nearbySpecialSpawns[0];

        expect(firstSpecialSpawn).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [secondLakeAliceLongitude, secondLakeAliceLatitude],
            "animals": [
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
            "animals": [
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
            "animals": [
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

        const centerOfLakeAliceCoords = [-82.361214, 29.643077];

        const nearbySpecialLocation = await DatabaseService.findSpecialLocation(db, centerOfLakeAliceCoords);

        expect(nearbySpecialLocation.length).toBe(1);

        const locationName = nearbySpecialLocation[0];

        expect(locationName).toEqual(expect.objectContaining({
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

describe('findAllAnimalsAtSpecialLocation', () => {

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
                },
                {
                    "Common_Name": "Albert Gator",
                    "Scientific_Name": "Alligator albertus"
                },
                {
                    "Common_Name": "Alberta Gator",
                    "Scientific_Name": "Alligator albertas"
                }
            ]
        };

        await specialLocations.insertOne(specialLocation);

        const locationName = "Lake Alice";

        const specialAnimals = await DatabaseService.findAllAnimalsAtSpecialLocation(db, locationName);

        expect(specialAnimals.length).toBe(3);

        const firstAnimal = specialAnimals[0];

        expect(firstAnimal).toEqual(expect.objectContaining({
            "Common_Name": "American alligator",
            "Scientific_Name": "Alligator mississippiensis"
        }));

        const secondAnimal = specialAnimals[1];

        expect(secondAnimal).toEqual(expect.objectContaining({
            "Common_Name": "Albert Gator",
            "Scientific_Name": "Alligator albertus"
        }));

        const thirdAnimal = specialAnimals[2];

        expect(thirdAnimal).toEqual(expect.objectContaining({
            "Common_Name": "Alberta Gator",
            "Scientific_Name": "Alligator albertas"
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
                },
                {
                    "Common_Name": "Albert Gator",
                    "Scientific_Name": "Alligator albertus"
                },
                {
                    "Common_Name": "Alberta Gator",
                    "Scientific_Name": "Alligator albertas"
                }
            ]
        };

        await specialLocations.insertOne(specialLocation);

        const locationName = "Lake Kanapaha";

        const specialAnimals = await DatabaseService.findAllAnimalsAtSpecialLocation(db, locationName);

        expect(Array.isArray(specialAnimals)).toBe(true);
        expect(specialAnimals.length).toBe(0);
    })
})

describe('findAnimalAtSpecialLocation', () => {

    beforeEach(async () => {
        specialLocations.deleteMany();
    });

    it('should return an array containing a single animal if that animal is found at a specified special location', async () => {

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
                },
                {
                    "Common_Name": "Albert Gator",
                    "Scientific_Name": "Alligator albertus"
                },
                {
                    "Common_Name": "Alberta Gator",
                    "Scientific_Name": "Alligator albertas"
                }
            ]
        };

        await specialLocations.insertOne(specialLocation);

        const locationName = "Lake Alice";
        const scientificName = "Alligator mississippiensis";

        const specialAnimal = await DatabaseService.findAnimalAtSpecialLocation(db, locationName, scientificName);

        expect(specialAnimal.length).toBe(1);

        const animal = specialAnimal[0];

        expect(animal).toEqual(expect.objectContaining({
            "Common_Name": "American alligator",
            "Scientific_Name": "Alligator mississippiensis"
        }));
    })

    it('should return an empty array if the animal is not found at the special location', async () => {

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
                },
                {
                    "Common_Name": "Albert Gator",
                    "Scientific_Name": "Alligator albertus"
                },
                {
                    "Common_Name": "Alberta Gator",
                    "Scientific_Name": "Alligator albertas"
                }
            ]
        };

        await specialLocations.insertOne(specialLocation);

        const locationName = "Lake Alice";
        const scientificName = "Randomnus Namus";

        const specialAnimal = await DatabaseService.findAnimalAtSpecialLocation(db, locationName, scientificName);

        expect(Array.isArray(specialAnimal)).toBe(true);
        expect(specialAnimal.length).toBe(0);
    })
})

describe('findPlayerProfile', () => {

    beforeEach(async () => {
        playerProfiles.deleteMany();
    });

    it('should return a username if the player profile is found', async () => {

        const userProfile = {
            "user_name": "TestNewUser",
            "user_email": "random@email.com",
            "collection": []
        }

        await playerProfiles.insertOne(userProfile);

        const username = "TestNewUser";

        const playerProfile = await DatabaseService.findPlayerProfile(db, username);

        expect(playerProfile.length).toBe(1);

        const playerName = playerProfile[0];

        expect(playerName).toEqual(expect.objectContaining({
            "user_name": "TestNewUser"
        }));
    })

    it('should return an empty array if the username is not found', async () => {

        const userProfile = {
            "user_name": "TestNewUser",
            "user_email": "random@email.com",
            "collection": []
        }

        await playerProfiles.insertOne(userProfile);

        const username = "RandomUsername";

        const playerProfile = await DatabaseService.findPlayerProfile(db, username);

        expect(Array.isArray(playerProfile)).toBe(true);
        expect(playerProfile.length).toBe(0);
    })
})

describe('findAnimalInProfile', () => {

    beforeEach(async () => {
        playerProfiles.deleteMany();
    });

    it('should return an animal if that animal is found in the player\'s profile', async () => {

        const userProfile = {
            "user_name": "TestNewUser",
            "user_email": "random@email.com",
            "collection": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis"
                },
                {
                    "Common_Name": 'Ferruginous Pochard',
                    "Scientific_Name": 'Aythya nyroca'
                }
            ]
        }

        await playerProfiles.insertOne(userProfile);

        const username = "TestNewUser";
        const commonName = "Ferruginous Pochard";
        const scienceName = "Aythya nyroca";

        const animalFromProfile = await DatabaseService.findAnimalInProfile(db, username, commonName, scienceName);

        expect(animalFromProfile.length).toBe(1);

        const animal = animalFromProfile[0];

        expect(animal).toEqual(expect.objectContaining({
            "Common_Name": "Ferruginous Pochard",
            "Scientific_Name": "Aythya nyroca"
        }));
    })

    it('should return an empty array if the animal is not found in the player\'s profile', async () => {

        const userProfile = {
            "user_name": "TestNewUser",
            "user_email": "random@email.com",
            "collection": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis"
                },
                {
                    "Common_Name": 'Ferruginous Pochard',
                    "Scientific_Name": 'Aythya nyroca'
                }
            ]
        }

        await playerProfiles.insertOne(userProfile);

        const username = "TestNewUser";
        const commonName = "A Bird";
        const scienceName = "Birb";

        const animalFromProfile = await DatabaseService.findAnimalInProfile(db, username, commonName, scienceName);

        expect(Array.isArray(animalFromProfile)).toBe(true);
        expect(animalFromProfile.length).toBe(0);
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
            animals: [
                {
                    "Common_Name": "Ferruginous Pochard",
                    "Scientific_Name": "Aythya nyroca",
                    "Image_Link": "https://upload.wikimedia.org/TestDuckImageLink",
                    "Description": "Test Duck Description"
                }
            ]
        }

        const insertedSpawn = await DatabaseService.insertNewSpawn(db, newSpawn);

        expect(insertedSpawn).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [25, 25],
            "animals": [
                {
                    "Common_Name": "Ferruginous Pochard",
                    "Scientific_Name": "Aythya nyroca",
                    "Image_Link": "https://upload.wikimedia.org/TestDuckImageLink",
                    "Description": "Test Duck Description"
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
            animals: [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis",
                    "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                    "Description": "Test Alligator Description."
                }
            ]
        }

        const insertedSpecialSpawn = await DatabaseService.insertNewSpecialSpawn(db, newSpecialSpawn);

        expect(insertedSpecialSpawn).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "createdAt": expect.any(Date),
            "coordinates": [lakeAliceLongitude, lakeAliceLatitude],
            "animals": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis",
                    "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                    "Description": "Test Alligator Description."
                }
            ]
        }));

        const spawnID = insertedSpecialSpawn["_id"];

        const returnedSpecialSpawn = await specialSpawnPoints.findOne({ _id: spawnID });
        expect(returnedSpecialSpawn).toEqual(insertedSpecialSpawn);
    })
})

describe('insertNewSpecialLocation', () => {

    beforeEach(async () => {
        specialLocations.deleteMany();
    });

    it('should insert a new special location into the database and return it', async () => {

        const locationName = "Lake Alice";

        const coordinates = [
            [
                [-82.36264, 29.642178],
                [-82.361363, 29.64215],
                [-82.359609, 29.644696],
                [-82.363434, 29.642313],
                [-82.36264, 29.642178]
            ]
        ];

        const animals = [
            {
                "Common_Name": "American alligator",
                "Scientific_Name": "Alligator mississippiensis"
            },
            {
                "Common_Name": "Albert Gator",
                "Scientific_Name": "Alligator albertus"
            },
            {
                "Common_Name": "Alberta Gator",
                "Scientific_Name": "Alligator albertas"
            }
        ];

        const insertedSpecialLocation = await DatabaseService.insertNewSpecialLocation(db, locationName, coordinates, animals);

        expect(insertedSpecialLocation).toEqual(expect.objectContaining({
            "_id": expect.anything(),
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
                },
                {
                    "Common_Name": "Albert Gator",
                    "Scientific_Name": "Alligator albertus"
                },
                {
                    "Common_Name": "Alberta Gator",
                    "Scientific_Name": "Alligator albertas"
                }
            ]
        }));

        const locationID = insertedSpecialLocation["_id"];

        const returnedSpecialLocation = await specialLocations.findOne({ _id: locationID });
        expect(returnedSpecialLocation).toEqual(insertedSpecialLocation);
    })
})

describe('insertSpecialAnimal', () => {

    beforeEach(async () => {
        specialLocations.deleteMany();
    });

    it('should insert a new special animal into a specified special location and indicate if update is successful', async () => {

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

        const locationName = "Lake Alice";
        const commonName = "Albert Gator";
        const scienceName = "Alligator albertus";

        const insertResponse = await DatabaseService.insertSpecialAnimal(db, locationName, commonName, scienceName);

        expect(insertResponse.matchedCount).toBe(1);
        expect(insertResponse.modifiedCount).toBe(1);

        const updatedLocation = await specialLocations.find({ name: locationName }).toArray();

        const location = updatedLocation[0];

        expect(location).toEqual(expect.objectContaining({
            "_id": expect.anything(),
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
                },
                {
                    "Common_Name": "Albert Gator",
                    "Scientific_Name": "Alligator albertus"
                }
            ]
        }));
    })

    it('should return response indicating failure if special location update not performed', async () => {

        const locationName = "Some Random Place";
        const commonName = "Albert Gator";
        const scienceName = "Alligator albertus";

        const insertResponse = await DatabaseService.insertSpecialAnimal(db, locationName, commonName, scienceName);

        expect(insertResponse.matchedCount).toBe(0);
        expect(insertResponse.modifiedCount).toBe(0);
    })
})

describe('insertNewPlayer', () => {

    beforeEach(async () => {
        playerProfiles.deleteMany();
    });

    it('should insert a new player profile and return that profile', async () => {

        const username = "TestUser";
        const email = "random@email.com";

        const insertedProfile = await DatabaseService.insertNewPlayer(db, username, email);

        expect(insertedProfile).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "user_name": "TestUser",
            "user_email": "random@email.com",
            "collection": []
        }));

        const profileID = insertedProfile["_id"];

        const returnedProfile = await playerProfiles.findOne({ _id: profileID });
        expect(returnedProfile).toEqual(insertedProfile);
    })
})

describe('insertAnimalInProfile', () => {

    beforeEach(async () => {
        playerProfiles.deleteMany();
    });

    it('should add a new animal to the player\'s profile and indicate if update is successful', async () => {

        const username = "Admin";
        const email = "admin@crittercollector.com";

        const newProfile = {
            "user_name": username,
            "user_email": email,
            "collection": []
        }

        await playerProfiles.insertOne(newProfile);

        const commonName = "American alligator";
        const scienceName = "Alligator mississippiensis";

        const insertResponse = await DatabaseService.insertAnimalInProfile(db, username, commonName, scienceName);

        expect(insertResponse.matchedCount).toBe(1);
        expect(insertResponse.modifiedCount).toBe(1);

        const updatedProfile = await playerProfiles.find({ user_name: username }).toArray();

        const profile = updatedProfile[0];

        expect(profile).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "user_name": username,
            "user_email": email,
            "collection": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis",
                    "count": 1
                }
            ]
        }));
    })

    it('should return response indicating failure if player profile update not performed', async () => {

        const username = "Admin";
        const commonName = "Frog";
        const scienceName = "Mini scule";

        const insertResponse = await DatabaseService.insertAnimalInProfile(db, username, commonName, scienceName);

        expect(insertResponse.matchedCount).toBe(0);
        expect(insertResponse.modifiedCount).toBe(0);
    })
})

describe('updatePlayerAnimalCount', () => {

    beforeEach(async () => {
        playerProfiles.deleteMany();
    });

    it('should increment an animal\'s count in the player\'s profile and indicate if update is successful', async () => {

        const username = "RandomPlayer";
        const email = "random@email.com";

        const newProfile = {
            "user_name": username,
            "user_email": email,
            "collection": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis",
                    "count": 1
                }
            ]
        }

        await playerProfiles.insertOne(newProfile);

        const animal = {
            "Common_Name": "American alligator",
            "Scientific_Name": "Alligator mississippiensis",
        }

        const insertResponse = await DatabaseService.updatePlayerAnimalCount(db, username, animal);

        expect(insertResponse.matchedCount).toBe(1);
        expect(insertResponse.modifiedCount).toBe(1);

        const updatedProfile = await playerProfiles.find({ user_name: username }).toArray();

        const profile = updatedProfile[0];

        expect(profile).toEqual(expect.objectContaining({
            "_id": expect.anything(),
            "user_name": username,
            "user_email": email,
            "collection": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis",
                    "count": 2
                }
            ]
        }));
    })

    it('should return response indicating failure if player profile update not performed', async () => {

        const username = "Admin";
        const animal = {
            "Common_Name": "Frog",
            "Scientific_Name": "Mini scule",
        }

        const insertResponse = await DatabaseService.updatePlayerAnimalCount(db, username, animal);

        expect(insertResponse.matchedCount).toBe(0);
        expect(insertResponse.modifiedCount).toBe(0);
    })
})

describe('removeSpecialLocation', () => {

    beforeEach(async () => {
        specialLocations.deleteMany();
    });

    it('should remove a special location from the database and indicate the removal was successful', async () => {

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

        const locationName = "Lake Alice";

        const deleteResponse = await DatabaseService.removeSpecialLocation(db, locationName);

        expect(deleteResponse.deletedCount).toBe(1);
    })

    it('should return response indicating failure if special location is not removed', async () => {

        const locationName = "Lake Kanapaha";

        const deleteResponse = await DatabaseService.removeSpecialLocation(db, locationName);

        expect(deleteResponse.deletedCount).toBe(0);
    })
})

describe('removeSpecialAnimal', () => {

    beforeEach(async () => {
        specialLocations.deleteMany();
    });

    it('should remove an animal from a specified special location and indicate the removal was successful', async () => {

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

        const locationName = "Lake Alice";
        const scienceName = "Alligator mississippiensis";

        const removeResponse = await DatabaseService.removeSpecialAnimal(db, locationName, scienceName);

        expect(removeResponse.matchedCount).toBe(1);
        expect(removeResponse.modifiedCount).toBe(1);

        const updatedLocation = await specialLocations.find({ name: locationName }).toArray();

        const location = updatedLocation[0];

        expect(location).toEqual(expect.objectContaining({
            "_id": expect.anything(),
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
            "animals": []
        }));
    })

    it('should return response indicating failure if animal is not removed', async () => {

        const locationName = "Lake Kanapaha";
        const scienceName = "Alligator mississippiensis";

        const removeResponse = await DatabaseService.removeSpecialAnimal(db, locationName, scienceName);

        expect(removeResponse.matchedCount).toBe(0);
        expect(removeResponse.modifiedCount).toBe(0);
    })
})

describe('removePlayerProfile', () => {

    beforeEach(async () => {
        playerProfiles.deleteMany();
    });

    it('should remove a player\'s profile and indicate the removal was successful', async () => {

        const username = "RandomPlayer";
        const email = "random@email.com";

        const newProfile = {
            "user_name": username,
            "user_email": email,
            "collection": [
                {
                    "Common_Name": "American alligator",
                    "Scientific_Name": "Alligator mississippiensis",
                    "count": 1
                }
            ]
        }

        await playerProfiles.insertOne(newProfile);

        const removeResponse = await DatabaseService.removePlayerProfile(db, username);

        expect(removeResponse.deletedCount).toBe(1);
    })

    it('should return response indicating failure if player profile is not removed', async () => {

        const username = "SomeRandomPlayer";

        const removeResponse = await DatabaseService.removePlayerProfile(db, username);

        expect(removeResponse.deletedCount).toBe(0);
    })
})