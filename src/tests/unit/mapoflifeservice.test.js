const MapOfLifeService = require('../../services/MapOfLifeService');
const config = require('../../config.json');
const axios = require('axios');

jest.mock('axios');

beforeEach(() => {
    jest.resetModules();
});

describe('getAnimals', () => {

    it('should return an array of JSON objects when valid data is returned from MOL API call', async () => {

        const axiosRequestAnimalData = 
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

        axios.get.mockResolvedValue(axiosRequestAnimalData);

        const result = await MapOfLifeService.getAnimals(25, 25);

        expect(result.length).toBe(2);

        const birdsObject = result[0];

        expect(birdsObject).toEqual(expect.objectContaining({
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
        }));

        const mammalsObject = result[1];

        expect(mammalsObject).toEqual(expect.objectContaining({
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
        }));
    })

    it('should throw an exception if an error is returned from MOL API call', async () => {

        const errorData = [
            {
                "code": 404,
                "error": "Server error"
            }
        ];

        axios.get.mockResolvedValue(errorData);

        await expect(MapOfLifeService.getAnimals(-5000, 25)).rejects.toThrow(new Error("Problem with MOL API Call"));
    })
})

jest.mock('../../config.json', () => ({
    "EXCLUDED_TYPES": [ "plants", "butterflies" ]
}));

describe('filterAnimalTypes', () => {

    it('should return an array with no excluded animal types if excluded animal type is passed in', () => {

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
            },
            {
                "count": 1,
                "title": "Butterflies",
                "taxa": "butterflies",
                "species": [
                    {
                        "image_url": "googleusercontenturl",
                        "sequenceid": 2,
                        "_order": null,
                        "family": "Hesperiidae",
                        "tc_id": "da80a373-d1ca-11e6-933c-4b53b2ab2fdc",
                        "redlist": null,
                        "last_update": "2017-02-14T20:25:38.897569+00:00",
                        "scientificname": "Nastra lherminier",
                        "common": "Swarthy Skipper",
                        "family_common": "Skippers"
                    }
                ]
            }
        ];

        const filteredAnimals = MapOfLifeService.filterAnimalTypes(animalData);

        expect(filteredAnimals.length).toBe(1);

        const firstAnimal = filteredAnimals[0];

        expect(firstAnimal).toEqual(expect.objectContaining({
            Common_Name: 'Ferruginous Pochard',
            Scientific_Name: 'Aythya nyroca'
        }));
    })

    it('should return array of same size if no excluded animal types are passed in', () => {

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
        ];

        const filteredAnimals = MapOfLifeService.filterAnimalTypes(animalData);

        expect(filteredAnimals.length).toBe(2);

        const firstAnimal = filteredAnimals[0];

        expect(firstAnimal).toEqual(expect.objectContaining({
            Common_Name: 'Ferruginous Pochard',
            Scientific_Name: 'Aythya nyroca'
        }));

        const secondAnimal = filteredAnimals[1];

        expect(secondAnimal).toEqual(expect.objectContaining({
            Common_Name: 'Sundevall\'s Jird',
            Scientific_Name: 'Meriones crassus'
        }));
    })
})

describe('dataIsValid', () => {

    it('should return true if no error is in the data received from MOL API', () => {

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

        const validData = MapOfLifeService.dataIsValid(animalData);

        expect(validData).toBe(true);
    })

    it('should return false if an error is in the data received from MOL API', () => {

        const errorData = [
            {
                "code": 404,
                "error": "Server error"
            }
        ];

        const validData = MapOfLifeService.dataIsValid(errorData);

        expect(validData).toBe(false);
    })
})