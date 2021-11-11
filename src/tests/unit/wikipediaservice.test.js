const WikipediaService = require('../../services/WikipediaService');
const axios = require('axios');

jest.mock('axios');

describe('getAnimalsWiki', () => {

    it('should return array with each animal having common & scientific name, image link, and description', async () => {

        const firstQuery = 
            'https://en.wikipedia.org/w/api.php?action=query&format=json' +
            '&titles=' + 'Aythya%20nyroca' +
            '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url';

        const secondQuery =
            'https://en.wikipedia.org/w/api.php?action=query&format=json' +
            '&titles=' + 'Meriones%20crassus' +
            '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url';

        const firstResult =
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

        const secondResult =
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
        };

        axios.mockImplementation((queryUrl) => {
            switch (queryUrl) {
                case firstQuery:
                    return Promise.resolve({ data: firstResult });
                case secondQuery:
                    return Promise.resolve({ data: secondResult });
            }
        })

        const animalArray = [
            {
                "Scientific_Name": "Aythya nyroca",
                "Common_Name": "Ferruginous Pochard"
            },
            {
                "Scientific_Name": "Meriones crassus",
                "Common_Name": "Sundevall's Jird"
            }
        ];

        const animalsWithWiki = await WikipediaService.getAnimalsWiki(animalArray);

        expect(animalsWithWiki.length).toBe(2);

        const firstAnimal = animalsWithWiki[0];

        expect(firstAnimal).toEqual(expect.objectContaining({
            "Common_Name": "Ferruginous Pochard",
            "Scientific_Name": "Aythya nyroca",
            "Image_Link": "FerruginousDuckImageLink",
            "Description": "Ferruginous duck description."
        }));

        const secondAnimal = animalsWithWiki[1];

        expect(secondAnimal).toEqual(expect.objectContaining({
            "Common_Name": "Sundevall's Jird",
            "Scientific_Name": "Meriones crassus",
            "Image_Link": "Sundevall'sJirdImageLink",
            "Description": "Sundevall's jird description."
        }));
    })

    it('should return array that only contains animals found on Wikipedia', async () => {

        const firstQuery =
            'https://en.wikipedia.org/w/api.php?action=query&format=json' +
            '&titles=' + 'Aythya%20nyroca' +
            '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url';

        const secondQuery =
            'https://en.wikipedia.org/w/api.php?action=query&format=json' +
            '&titles=' + 'FAKE%20ANIMAL' +
            '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url';

        const firstResult =
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

        const secondResult =
        {
            "query": {
                "pages": {
                    "-1": {
                        "ns": 0,
                        "title": "FAKE ANIMAL",
                        "missing": ""
                    }
                }
            }
        
        };

        axios.mockImplementation((queryUrl) => {
            switch (queryUrl) {
                case firstQuery:
                    return Promise.resolve({ data: firstResult });
                case secondQuery:
                    return Promise.resolve({ data: secondResult });
            }
        })

        const animalArray = [
            {
                "Scientific_Name": "Aythya nyroca",
                "Common_Name": "Ferruginous Pochard"
            },
            {
                "Scientific_Name": "FAKE ANIMAL",
                "Common_Name": "NOT A REAL ANIMAL"
            }
        ];

        const animalsWithWiki = await WikipediaService.getAnimalsWiki(animalArray);

        expect(animalsWithWiki.length).toBe(1);

        const firstAnimal = animalsWithWiki[0];

        expect(firstAnimal).toEqual(expect.objectContaining({
            "Common_Name": "Ferruginous Pochard",
            "Scientific_Name": "Aythya nyroca",
            "Image_Link": "FerruginousDuckImageLink",
            "Description": "Ferruginous duck description."
        }));
    })

    it('should return an empty array if no animals are found on Wikipedia', async () => {

        const result =
        {
            "query": {
                "pages": {
                    "-1": {
                        "ns": 0,
                        "title": "FAKE ANIMAL",
                        "missing": ""
                    }
                }
            }

        };

        axios.mockResolvedValue({ data: result });

        const animalArray = [
            {
                "Scientific_Name": "FAKE ANIMAL",
                "Common_Name": "NOT A REAL ANIMAL"
            }
        ];

        const animalsWithWiki = await WikipediaService.getAnimalsWiki(animalArray);

        expect(Array.isArray(animalsWithWiki)).toBe(true);
        expect(animalsWithWiki.length).toBe(0);

    })

    it('should log a message and return null if there is an error thrown', async () => {

        const consoleSpy = jest.spyOn(console, 'log');
        
        const animalsWithWiki = await WikipediaService.getAnimalsWiki(null);

        expect(consoleSpy).toHaveBeenCalled();
        expect(animalsWithWiki).toBeNull();

        consoleSpy.mockRestore();
    })
})

describe('getInfo', () => {

    it('should return an object with image and description for an animal found on Wikipedia', async () => {

        const result =
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

        axios.mockResolvedValue({ data: result });

        const animalName = "Aythya nyroca";

        const wikiInfo = await WikipediaService.getInfo(animalName);

        expect(wikiInfo).toEqual(expect.objectContaining({
            "img": "FerruginousDuckImageLink",
            "desc": "Ferruginous duck description."
        }));
    })

    it('should return null if the animal is not found on Wikipedia', async () => {

        const result =
        {
            "query": {
                "pages": {
                    "-1": {
                        "ns": 0,
                        "title": "FAKE ANIMAL",
                        "missing": ""
                    }
                }
            }

        };

        axios.mockResolvedValue({ data: result });

        const animalName = "FAKE ANIMAL";

        const wikiInfo = await WikipediaService.getInfo(animalName);

        expect(wikiInfo).toBeNull();
    })

    it('should log a message and return null if there is an error thrown', async () => {

        const queryUrl =
            'https://en.wikipedia.org/w/api.php?action=query&format=json' +
            '&titles=' + 'FAKE%20REQUEST' +
            '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url';

        axios.mockImplementation((queryUrl) => {
            if (queryUrl) {
                return Promise.reject(null);
            }
        });

        const consoleSpy = jest.spyOn(console, 'log');

        const animalName = "FAKE REQUEST";

        const wikiInfo = await WikipediaService.getInfo(animalName);

        expect(consoleSpy).toHaveBeenCalledWith("ERROR: at Wikipedia api");
        expect(wikiInfo).toBeNull();

        consoleSpy.mockRestore();
    })
})
