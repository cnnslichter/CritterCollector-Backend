const SpecialSpawnService = require('../../services/SpecialSpawnService');
const SpawnService = require('../../services/SpawnService');
const DatabaseService = require('../../services/DatabaseService');
const WikipediaService = require('../../services/WikipediaService');

jest.mock('../../services/SpawnService');
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
            "animals": [
                {
                    "common_name": "American alligator",
                    "scientific_name": "Alligator mississippiensis"
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
            animals: [
                {
                    common_name: "American alligator",
                    scientific_name: "Alligator mississippiensis"
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

    beforeAll(async () => {

        const specialAnimals = [
            {
                "common_name": "American alligator",
                "scientific_name": "Alligator mississippiensis"
            },
            {
                "common_name": "Eastern gray squirrel",
                "scientific_name": "Sciurus carolinensis"
            }
        ];

        jest.spyOn(DatabaseService, 'findAllAnimalsAtSpecialLocation').mockReturnValue(specialAnimals);

        const selectedAnimals = [
            {
                "common_name": "American alligator",
                "scientific_name": "Alligator mississippiensis"
            },
            {
                "common_name": "Eastern gray squirrel",
                "scientific_name": "Sciurus carolinensis"
            }
        ];

        jest.spyOn(SpawnService, 'selectAnimals').mockReturnValue(selectedAnimals);

        const animalsWithWiki = [
            {
                "common_name": "American alligator",
                "scientific_name": "Alligator mississippiensis"
            },
            {
                "common_name": "Eastern gray squirrel",
                "scientific_name": "Sciurus carolinensis"
            }
        ];

        jest.spyOn(WikipediaService, 'filterAnimalsWithWiki').mockReturnValue(animalsWithWiki);
    })

    it('should return a new special spawn if given location name, longitude, and latitude', async () => {

        const fakeDB = null;
        const location = "Lake Alice";
        const lakeAliceLongitude = -82.361197;
        const lakeAliceLatitude = 29.643082;

        const newSpawn = await SpecialSpawnService.createSpecialSpawn(fakeDB, location, lakeAliceLongitude, lakeAliceLatitude);

        expect(DatabaseService.findAllAnimalsAtSpecialLocation).toHaveBeenCalled();
        expect(SpawnService.selectAnimals).toHaveBeenCalled();
        expect(WikipediaService.filterAnimalsWithWiki).toHaveBeenCalled();

        expect(newSpawn).toEqual(expect.objectContaining({
            createdAt: expect.any(Date),
            coordinates: [lakeAliceLongitude, lakeAliceLatitude],
            animals: [
                {
                    common_name: "American alligator",
                    scientific_name: "Alligator mississippiensis"
                },
                {
                    common_name: "Eastern gray squirrel",
                    scientific_name: "Sciurus carolinensis"
                }
            ]
        }));
    })
})