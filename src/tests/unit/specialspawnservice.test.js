const SpecialSpawnService = require('../../services/SpecialSpawnService');
const DatabaseService = require('../../services/DatabaseService');
const WikipediaService = require('../../services/WikipediaService');

jest.mock('../../services/DatabaseService');
jest.mock('../../services/WikipediaService');

beforeEach(() => {
    jest.resetModules();
});

describe('getNearbySpecialSpawners', () => {

    it('should return array with length greater than zero if special spawn is located', async () => {

        const lakeAliceLongitude = -82.361197;
        const lakeAliceLatitude = 29.643082;

        const specialSpawn = [{
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
        }];

        jest.spyOn(DatabaseService, 'findNearbySpecialSpawns').mockReturnValue(specialSpawn);

        const fakeDB = null;
        const maxSearchDistance = 1000;
        const nearbySpawns = await SpecialSpawnService.getNearbySpecialSpawners(fakeDB, maxSearchDistance, lakeAliceLongitude, lakeAliceLatitude);

        expect(DatabaseService.findNearbySpecialSpawns).toHaveBeenCalled();
        expect(nearbySpawns.length).toBe(1);

        const firstSpawn = nearbySpawns[0];

        expect(firstSpawn).toEqual(expect.objectContaining({
            createdAt: expect.any(Date),
            coordinates: [lakeAliceLongitude, lakeAliceLatitude],
            Animals: [
                {
                    Common_Name: "American alligator",
                    Scientific_Name: "Alligator mississippiensis",
                    Image_Link: "https://upload.wikimedia.org/AlligatorImage",
                    Description: "Test Alligator Description."
                }
            ]
        }));
    })

    it('should return array with length equal to zero if special spawn is not located', async () => {

        jest.spyOn(DatabaseService, 'findNearbySpecialSpawns').mockReturnValue([]);

        const fakeDB = null;
        const maxSearchDistance = 100;
        const longitude = 150;
        const latitude = 40;
        const nearbySpawns = await SpecialSpawnService.getNearbySpecialSpawners(fakeDB, maxSearchDistance, longitude, latitude);

        expect(DatabaseService.findNearbySpecialSpawns).toHaveBeenCalled();
        expect(Array.isArray(nearbySpawns)).toBe(true);
        expect(nearbySpawns.length).toBe(0);
    })
})

describe('createSpecialSpawn', () => {

    it('should return a new special spawn if given location name, longitude, and latitude', async () => {

        const specialAnimals = [
            {
                "Scientific_Name": "Alligator mississippiensis",
                "Common_Name": "American alligator"
            },
            {
                "Scientific_Name": "Sciurus carolinensis",
                "Common_Name": "Eastern gray squirrel"
            }
        ];

        jest.spyOn(DatabaseService, 'getAnimalsFromSpecialLocation').mockReturnValue(specialAnimals);

        const animalsWithWiki = [
            {
                "Common_Name": "American alligator",
                "Scientific_Name": "Alligator mississippiensis",
                "Image_Link": "https://upload.wikimedia.org/AlligatorImage",
                "Description": "Test Alligator Description."
            },
            {
                "Common_Name": "Eastern gray squirrel",
                "Scientific_Name": "Sciurus carolinensis",
                "Image_Link": "https://upload.wikimedia.org/SquirrelImage",
                "Description": "Test Squirrel Description."
            }
        ];

        jest.spyOn(WikipediaService, 'getAnimalsWiki').mockReturnValue(animalsWithWiki);

        const fakeDB = null;
        const location = "Lake Alice";
        const lakeAliceLongitude = -82.361197;
        const lakeAliceLatitude = 29.643082;

        const newSpawn = await SpecialSpawnService.createSpecialSpawn(fakeDB, location, lakeAliceLongitude, lakeAliceLatitude);

        expect(DatabaseService.getAnimalsFromSpecialLocation).toHaveBeenCalled();
        expect(WikipediaService.getAnimalsWiki).toHaveBeenCalled();

        expect(newSpawn).toEqual(expect.objectContaining({
            createdAt: expect.any(Date),
            coordinates: [-82.361197, 29.643082],
            Animals: [
                {
                    Common_Name: "American alligator",
                    Scientific_Name: "Alligator mississippiensis",
                    Image_Link: "https://upload.wikimedia.org/AlligatorImage",
                    Description: "Test Alligator Description."
                },
                {
                    Common_Name: "Eastern gray squirrel",
                    Scientific_Name: "Sciurus carolinensis",
                    Image_Link: "https://upload.wikimedia.org/SquirrelImage",
                    Description: "Test Squirrel Description."
                }
            ]
        }));
    })
})

describe('selectSpecialAnimals', () => {

    it('should return an array with the same size and contents if there are less than 10 animals', () => {

        const specialAnimals = [
            {
                "Scientific_Name": "Alligator mississippiensis",
                "Common_Name": "American alligator"
            },
            {
                "Scientific_Name": "Sciurus carolinensis",
                "Common_Name": "Eastern gray squirrel"
            }
        ];

        const selectedAnimals = SpecialSpawnService.selectSpecialAnimals(specialAnimals);

        expect(selectedAnimals.length).toBe(specialAnimals.length);

        // checks actual array (specialAnimals) contains expected array (selectedAnimals) as a subset
        expect(specialAnimals).toEqual(expect.arrayContaining(selectedAnimals));
        // to ensure expected array doesn't have extra elements, also check that expected array contains actual array
        expect(selectedAnimals).toEqual(expect.arrayContaining(specialAnimals));
    })

    it('should return an array with 10 random animals if there are more than 10 animals', () => {

        const specialAnimals = [
            {
                "Scientific_Name": "Alligator mississippiensis",
                "Common_Name": "American alligator"
            },
            {
                "Scientific_Name": "Sciurus carolinensis",
                "Common_Name": "Eastern gray squirrel"
            },
            {
                "Scientific_Name": "Rallina eurizonoides",
                "Common_Name": "Slaty-Legged Crake"
            },
            {
                "Scientific_Name": "Aythya nyroca",
                "Common_Name": "Ferruginous Pochard"
            },
            {
                "Scientific_Name": "Melierax metabates",
                "Common_Name": "Dark Chanting-Goshawk"
            },
            {
                "Scientific_Name": "Meriones crassus",
                "Common_Name": "Sundevall's Jird"
            },
            {
                "Scientific_Name": "Nastra lherminier",
                "Common_Name": "Swarthy Skipper"
            },
            {
                "Scientific_Name": "Canis familiaris",
                "Common_Name": "Domestic Dog"
            },
            {
                "Scientific_Name": "Felis catus",
                "Common_Name": "Domestic Cat"
            },
            {
                "Scientific_Name": "Ambystoma mexicanum",
                "Common_Name": "Axolotl"
            },
            {
                "Scientific_Name": "Chinchilla chinchilla",
                "Common_Name": "Short-tailed Chinchilla"
            }
        ];

        jest.spyOn(global.Math, 'random').mockReturnValue(0.4514661562021821);

        const selectedAnimals = SpecialSpawnService.selectSpecialAnimals(specialAnimals);

        // ensure expected array (selectedAnimals) has 10 animals and they are a subset of original array
        expect(selectedAnimals.length).toBe(10);
        expect(specialAnimals).toEqual(expect.arrayContaining(selectedAnimals));

        // given the seed for random, ensure animals in expected array are randomized
        expect(selectedAnimals[0]).toEqual(expect.objectContaining(specialAnimals[4]));
        expect(selectedAnimals[1]).toEqual(expect.objectContaining(specialAnimals[5]));
        expect(selectedAnimals[2]).toEqual(expect.objectContaining(specialAnimals[6]));
        expect(selectedAnimals[3]).toEqual(expect.objectContaining(specialAnimals[3]));
        expect(selectedAnimals[4]).toEqual(expect.objectContaining(specialAnimals[7]));
        expect(selectedAnimals[5]).toEqual(expect.objectContaining(specialAnimals[2]));
        expect(selectedAnimals[6]).toEqual(expect.objectContaining(specialAnimals[8]));
        expect(selectedAnimals[7]).toEqual(expect.objectContaining(specialAnimals[1]));
        expect(selectedAnimals[8]).toEqual(expect.objectContaining(specialAnimals[9]));
        expect(selectedAnimals[9]).toEqual(expect.objectContaining(specialAnimals[0]));

        jest.spyOn(global.Math, 'random').mockRestore();
    })
})