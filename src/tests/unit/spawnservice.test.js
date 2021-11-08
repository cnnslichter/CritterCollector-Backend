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
            "Animals": [
                {
                    "Common_Name": "Slaty-Legged Crake",
                    "Scientific_Name": "Rallina eurizonoides",
                    "Image_Link": "https://upload.wikimedia.org",
                    "Description": "Test Description"
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
            Animals: [
                {
                    Common_Name: 'Slaty-Legged Crake',
                    Scientific_Name: 'Rallina eurizonoides',
                    Image_Link: 'https://upload.wikimedia.org',
                    Description: 'Test Description'
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

    it('should return a new spawn location if given longitude and latitude', async () => {

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
                "Scientific_Name": "Aythya nyroca",
                "Common_Name": "Ferruginous Pochard"
            }
        ];

        jest.spyOn(MapOfLifeService, 'filterAnimalTypes').mockReturnValue(filteredAnimals);

        const animalWithWiki = [
            {
                "Common_Name": "Ferruginous Pochard",
                "Scientific_Name": "Aythya nyroca",
                "Image_Link": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Aythya_nyroca_at_Martin_Mere_1.jpg/100px-Aythya_nyroca_at_Martin_Mere_1.jpg",
                "Description": "The ferruginous duck, also ferruginous pochard, common white- eye or white - eyed pochard(Aythya nyroca) is a medium - sized diving duck from Eurosiberia.The scientific name is derived from Greek  aithuia an unidentified seabird mentioned by authors including Hesychius and Aristotle, and nyrok, the Russian name for a duck."
            }
        ];

        jest.spyOn(WikipediaService, 'getAnimalsWiki').mockReturnValue(animalWithWiki);

        const newSpawn = await SpawnService.createSpawn(25, 25);

        expect(MapOfLifeService.getAnimals).toHaveBeenCalled();
        expect(MapOfLifeService.filterAnimalTypes).toHaveBeenCalled();
        expect(WikipediaService.getAnimalsWiki).toHaveBeenCalled();

        expect(newSpawn).toEqual(expect.objectContaining({
            createdAt: expect.any(Date),
            coordinates: [25, 25],
            Animals: [
                {
                    Common_Name: 'Ferruginous Pochard',
                    Scientific_Name: 'Aythya nyroca',
                    Image_Link: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Aythya_nyroca_at_Martin_Mere_1.jpg/100px-Aythya_nyroca_at_Martin_Mere_1.jpg',
                    Description: 'The ferruginous duck, also ferruginous pochard, common white- eye or white - eyed pochard(Aythya nyroca) is a medium - sized diving duck from Eurosiberia.The scientific name is derived from Greek  aithuia an unidentified seabird mentioned by authors including Hesychius and Aristotle, and nyrok, the Russian name for a duck.'
                }
            ]
        }));
    })
})

describe('selectAnimals', () => {

    it('should return the first 10 items from an array that has more than 10 items', () => {
        const arrayWithFifteenNumbers = [...Array(15).keys()];

        const smallerArray = SpawnService.selectAnimals(arrayWithFifteenNumbers);

        expect(smallerArray.length).toBe(10);
    })

    it('should return the same array from an array that has 10 or fewer items', () => {
        const arrayWithEightNumbers = [...Array(8).keys()];

        const smallerArray = SpawnService.selectAnimals(arrayWithEightNumbers);

        expect(smallerArray.length).toBe(8);
        expect(smallerArray).toEqual(expect.arrayContaining(arrayWithEightNumbers));
    })
})
