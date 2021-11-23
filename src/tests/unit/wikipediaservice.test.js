const WikipediaService = require('../../services/WikipediaService');
const axios = require('axios');

jest.mock('axios');

describe('getAnimalsWiki', () => {

    it('should return array with each animal having common & scientific name, image, image link, and description', async () => {

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

        const firstImageLink = "FerruginousDuckImageLink";
        const secondImageLink = "Sundevall'sJirdImageLink";

        const firstBuffer = Buffer.from('testduck');
        const secondBuffer = Buffer.from('testrodent');

        axios.get.mockImplementation((queryUrl) => {
            switch (queryUrl) {
                case firstQuery:
                    return Promise.resolve({ data: firstResult });
                case secondQuery:
                    return Promise.resolve({ data: secondResult });
                case firstImageLink:
                    return Promise.resolve({
                        headers: {
                            "content-type": "image/jpeg",
                        },
                        data: firstBuffer
                    });
                case secondImageLink:
                    return Promise.resolve({
                        headers: {
                            "content-type": "image/jpeg",
                        },
                        data: secondBuffer
                    });
            }
        })

        const animalArray = [
            {
                "Common_Name": "Ferruginous Pochard",
                "Scientific_Name": "Aythya nyroca"
            },
            {
                "Common_Name": "Sundevall's Jird",
                "Scientific_Name": "Meriones crassus"
            }
        ];

        const animalsWithWiki = await WikipediaService.getAnimalsWiki(animalArray);

        expect(animalsWithWiki.length).toBe(2);

        const firstAnimal = animalsWithWiki[0];

        expect(firstAnimal).toEqual(expect.objectContaining({
            "Common_Name": "Ferruginous Pochard",
            "Scientific_Name": "Aythya nyroca",
            "Raw_Image": "data:image/jpeg;base64,dGVzdGR1Y2s=",
            "Image_Link": "FerruginousDuckImageLink",
            "Description": "Ferruginous duck description."
        }));

        const secondAnimal = animalsWithWiki[1];

        expect(secondAnimal).toEqual(expect.objectContaining({
            "Common_Name": "Sundevall's Jird",
            "Scientific_Name": "Meriones crassus",
            "Raw_Image": "data:image/jpeg;base64,dGVzdHJvZGVudA==",
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

        const firstImageLink = "FerruginousDuckImageLink";

        const firstBuffer = Buffer.from('testduck');

        axios.get.mockImplementation((queryUrl) => {
            switch (queryUrl) {
                case firstQuery:
                    return Promise.resolve({ data: firstResult });
                case secondQuery:
                    return Promise.resolve({ data: secondResult });
                case firstImageLink:
                    return Promise.resolve({
                        headers: {
                            "content-type": "image/jpeg",
                        },
                        data: firstBuffer
                    });
            }
        })

        const animalArray = [
            {
                "Common_Name": "Ferruginous Pochard",
                "Scientific_Name": "Aythya nyroca"
            },
            {
                "Common_Name": "NOT A REAL ANIMAL",
                "Scientific_Name": "FAKE ANIMAL"
            }
        ];

        const animalsWithWiki = await WikipediaService.getAnimalsWiki(animalArray);

        expect(animalsWithWiki.length).toBe(1);

        const firstAnimal = animalsWithWiki[0];

        expect(firstAnimal).toEqual(expect.objectContaining({
            "Common_Name": "Ferruginous Pochard",
            "Scientific_Name": "Aythya nyroca",
            "Raw_Image": "data:image/jpeg;base64,dGVzdGR1Y2s=",
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

        axios.get.mockResolvedValue({ data: result });

        const animalArray = [
            {
                "Common_Name": "NOT A REAL ANIMAL",
                "Scientific_Name": "FAKE ANIMAL"
            }
        ];

        const animalsWithWiki = await WikipediaService.getAnimalsWiki(animalArray);

        expect(Array.isArray(animalsWithWiki)).toBe(true);
        expect(animalsWithWiki.length).toBe(0);

    })

    it('should return null if there is an error thrown', async () => {
        
        const animalsWithWiki = await WikipediaService.getAnimalsWiki(null);

        expect(animalsWithWiki).toBeNull();
    })
})

describe('getInfo', () => {

    it('should return an object with image, image link, and description for an animal found on Wikipedia', async () => {

        const animalQuery =
            'https://en.wikipedia.org/w/api.php?action=query&format=json' +
            '&titles=' + 'Aythya%20nyroca' +
            '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url';

        const animalResult =
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

        const imageLink = "FerruginousDuckImageLink";

        const imageBuffer = Buffer.from('testduck');

        axios.get.mockImplementation((queryUrl) => {
            switch (queryUrl) {
                case animalQuery:
                    return Promise.resolve({ data: animalResult });
                case imageLink:
                    return Promise.resolve({
                        headers: {
                            "content-type": "image/jpeg",
                        },
                        data: imageBuffer
                    });
            }
        })

        const animalName = "Aythya nyroca";

        const wikiInfo = await WikipediaService.getInfo(animalName);

        expect(wikiInfo).toEqual(expect.objectContaining({
            "b64image": "data:image/jpeg;base64,dGVzdGR1Y2s=",
            "imglink": "FerruginousDuckImageLink",
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

        axios.get.mockResolvedValue({ data: result });

        const animalName = "FAKE ANIMAL";

        const wikiInfo = await WikipediaService.getInfo(animalName);

        expect(wikiInfo).toBeNull();
    })

    it('should return null if there is an error thrown', async () => {

        const animalQuery =
            'https://en.wikipedia.org/w/api.php?action=query&format=json' +
            '&titles=' + 'FAKE%20REQUEST' +
            '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url';

        axios.get.mockImplementation((queryUrl) => {
            if (queryUrl == animalQuery) {
                return Promise.reject(null);
            }
        });

        const animalName = "FAKE REQUEST";

        const wikiInfo = await WikipediaService.getInfo(animalName);

        expect(wikiInfo).toBeNull();
    })
})

describe('getAnimalImage', () => {

    it('should return a string with data type and base64 image', async () => {

        const imageLink = "FerruginousDuckImageLink";

        const imageBuffer = Buffer.from('testduck');

        axios.get.mockImplementation((queryUrl) => {
            if (queryUrl == imageLink) {
                return Promise.resolve({
                    headers: {
                        "content-type": "image/jpeg",
                    },
                    data: imageBuffer
                });
            }
        })

        const animalImage = await WikipediaService.getAnimalImage(imageLink);

        expect(animalImage).toEqual(expect.stringContaining(
            "data:image/jpeg;base64,dGVzdGR1Y2s="
        ));
    })

    it('should return null if there is an error thrown', async () => {

        const imageLink = "FerruginousDuckImageLink";

        axios.get.mockImplementation((queryUrl) => {
            if (queryUrl == imageLink) {
                return Promise.reject(null);
            }
        });

        const animalImage = await WikipediaService.getAnimalImage(imageLink);

        expect(animalImage).toBeNull();
    })
})