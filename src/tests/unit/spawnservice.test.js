const SpawnService = require('../../services/SpawnService');
const DatabaseService = require('../../services/DatabaseService');
const MapOfLifeService = require('../../services/MapOfLifeService');
const WikipediaService = require('../../services/WikipediaService');

jest.mock('../../services/DatabaseService');
jest.mock('../../services/MapOfLifeService');
jest.mock('../../services/WikipediaService');

beforeEach(() => {
    jest.resetModules();
});

describe('getSpawnList', () => {

    it('should return array with length greater than zero if spawn is located', async () => {

        const spawn = [{
            "createdAt": new Date(),
            "coordinates": [15, 15],
            "animals": [
                {
                    "common_name": "Slaty-Legged Crake",
                    "scientific_name": "Rallina eurizonoides"
                }
            ]
        }];

        jest.spyOn(DatabaseService, 'findNearestSpawns').mockReturnValue(spawn);

        const fakeDB = null;
        const spawnList = await SpawnService.getSpawnList(fakeDB, 10, 70, 25);

        expect(DatabaseService.findNearestSpawns).toHaveBeenCalled();
        expect(spawnList.length).toBe(1);

        const firstSpawn = spawnList[0];

        expect(firstSpawn).toEqual(expect.objectContaining({
            createdAt: expect.any(Date),
            coordinates: [15, 15],
            animals: [
                {
                    common_name: 'Slaty-Legged Crake',
                    scientific_name: 'Rallina eurizonoides'
                }
            ]
        }));
    })

    it('should return array with length equal to zero if spawn is not located', async () => {

        jest.spyOn(DatabaseService, 'findNearestSpawns').mockReturnValue([]);

        const fakeDB = null;
        const spawnList = await SpawnService.getSpawnList(fakeDB, 10, 90, 35);

        expect(DatabaseService.findNearestSpawns).toHaveBeenCalled();
        expect(spawnList.length).toBe(0);
    })
})

describe('createSpawn', () => {

    beforeAll(async () => {

        const animalData = [
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
            }
        ];

        jest.spyOn(MapOfLifeService, 'getAnimals').mockReturnValue(animalData);

        const filteredAnimals = [
            {
                "common_name": "Ferruginous Pochard",
                "scientific_name": "Aythya nyroca"
            }
        ];

        jest.spyOn(MapOfLifeService, 'filterAnimalTypes').mockReturnValue(filteredAnimals);

        const animalWithWiki = [
            {
                "common_name": "Ferruginous Pochard",
                "scientific_name": "Aythya nyroca"
            }
        ];

        jest.spyOn(WikipediaService, 'filterAnimalsWithWiki').mockReturnValue(animalWithWiki);
    })

    it('should return a new spawn location if given longitude and latitude', async () => {

        const newSpawn = await SpawnService.createSpawn(25, 25);

        expect(MapOfLifeService.getAnimals).toHaveBeenCalled();
        expect(MapOfLifeService.filterAnimalTypes).toHaveBeenCalled();
        expect(WikipediaService.filterAnimalsWithWiki).toHaveBeenCalled();

        expect(newSpawn).toEqual(expect.objectContaining({
            createdAt: expect.any(Date),
            coordinates: [25, 25],
            animals: [
                {
                    common_name: 'Ferruginous Pochard',
                    scientific_name: 'Aythya nyroca'
                }
            ]
        }));
    })
})

describe('selectAnimals', () => {

    it('should return an array with random order but same size and contents if there are less than 10 animals', () => {

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

        const selectedAnimals = SpawnService.selectAnimals(specialAnimals);

        expect(selectedAnimals.length).toBe(specialAnimals.length);

        // checks actual array (specialAnimals) contains expected array (selectedAnimals) as a subset
        expect(specialAnimals).toEqual(expect.arrayContaining(selectedAnimals));
        // to ensure expected array doesn't have extra elements, also check that expected array contains actual array
        expect(selectedAnimals).toEqual(expect.arrayContaining(specialAnimals));
    })

    it('should return an array with 10 random animals if there are more than 10 animals', () => {

        const specialAnimals = [
            {
                "common_name": "American alligator",
                "scientific_name": "Alligator mississippiensis"
            },
            {
                "common_name": "Eastern gray squirrel",
                "scientific_name": "Sciurus carolinensis"
            },
            {
                "common_name": "Slaty-Legged Crake",
                "scientific_name": "Rallina eurizonoides"
            },
            {
                "common_name": "Ferruginous Pochard",
                "scientific_name": "Aythya nyroca"
            },
            {
                "common_name": "Dark Chanting-Goshawk",
                "scientific_name": "Melierax metabates"
            },
            {
                "common_name": "Sundevall's Jird",
                "scientific_name": "Meriones crassus"
            },
            {
                "common_name": "Swarthy Skipper",
                "scientific_name": "Nastra lherminier"
            },
            {
                "common_name": "Domestic Dog",
                "scientific_name": "Canis familiaris"
            },
            {
                "common_name": "Domestic Cat",
                "scientific_name": "Felis catus"
            },
            {
                "common_name": "Axolotl",
                "scientific_name": "Ambystoma mexicanum"
            },
            {
                "common_name": "Short-tailed Chinchilla",
                "scientific_name": "Chinchilla chinchilla"
            }
        ];

        // set seed for random so same array order is returned each time
        jest.spyOn(global.Math, 'random').mockReturnValue(0.4514661562021821);

        const selectedAnimals = SpawnService.selectAnimals(specialAnimals);

        const maxAnimalListLength = 10;

        // ensure expected array (selectedAnimals) has 10 animals and they are a subset of original array
        expect(selectedAnimals.length).toBe(maxAnimalListLength);
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
