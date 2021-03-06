const request = require('supertest');
const createServer = require('../../app');
const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const DatabaseService = require('../../services/DatabaseService');
const WikipediaService = require('../../services/WikipediaService');

jest.mock('axios');

const app = createServer();

beforeAll(async () => {

    const badWikiQuery = 
        'https://en.wikipedia.org/w/api.php?action=query&format=json' +
        '&titles=' + 'NotAnAnimal' +
        '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100';
    
    const badWikiResult =
    {
        "batchcomplete": "",
        "query": {
            "pages": {
                "-1": {
                    "ns": 0,
                    "title": "NotAnAnimal",
                    "missing": ""
                }
            }
        }
    }

    const catWikiQuery =
        'https://en.wikipedia.org/w/api.php?action=query&format=json' +
        '&titles=' + 'Felis%20catus' +
        '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100';

    const catWikiResult =
    {
        "batchcomplete": "",
        "query": {
            "redirects": [
                {
                    "from": "Felis catus",
                    "to": "Cat"
                }
            ],
            "pages": {
                "6678": {
                    "pageid": 6678,
                    "ns": 0,
                    "title": "Cat",
                    "thumbnail": {
                        "source": "ThisWouldBeALinkToTheCatImage/image.jpg",
                        "width": 100,
                        "height": 66
                    },
                    "pageimage": "Cat_poster_1.jpg",
                    "extract": "The cat is a cat which is a cat."
                }
            }
        }
    }

    const catImageLink = "ThisWouldBeALinkToTheCatImage/image.jpg";
    const catImageBuffer = Buffer.from('ThisWouldBeTheCatImage');

    axios.get.mockImplementation((queryUrl) => {
        switch (queryUrl) {
            case badWikiQuery:
                return Promise.resolve({ data: badWikiResult });
            case catWikiQuery:
                return Promise.resolve({ data: catWikiResult });
            case catImageLink:
                return Promise.resolve({
                    headers: {
                        "content-type": "image/jpeg",
                    },
                    data: catImageBuffer
                })
        }
    })
});

describe('GET - /api/encylopedia', () => {

    describe('Error Checking', () => {
        it('should return \"Animal Was Not Found\" message when animal is not found', async () => {

            const animalName = "NotAnAnimal";

            const response = await request(app)
                                    .get("/api/encyclopedia")
                                    .query({
                                        animalName: animalName
                                    });

            const animalInfo = response.body.animal_info;

            expect(animalInfo).toBe("Animal Was Not Found");
        })

        it('should return 400 when no parameter is given', async () => {

            const animalName = "NotAnAnimal";

            const response = await request(app)
                                    .get("/api/encyclopedia")
                                    .query({ });

            const animalInfo = response.body.animal_info;

            expect(response.status).toBe(400);
        })

        it('should return GET error in response if any errors are thrown', async () => {

            jest.spyOn(WikipediaService, 'getInfo').mockRejectedValue();

            const animalName = "Felis catus";

            const response = await request(app)
                                    .get("/api/encyclopedia")
                                    .query({
                                        animalName: animalName
                                    });

            expect(response.error.status).toBe(404);

            expect(response.error.text).toEqual(expect.stringContaining(
                "Cannot GET /api/encyclopedia"
            ));

            jest.spyOn(WikipediaService, 'getInfo').mockRestore();
        })
    })

    describe('Valid Call', () => {

        it('should return animal information when animal is found', async () => {
            const animalName = "Felis catus";

            const response = await request(app)
                                    .get("/api/encyclopedia")
                                    .query({
                                        animalName: animalName
                                    });

            const animalInfo = response.body.animal_info;

            expect(animalInfo).toEqual(expect.objectContaining({ 
                "b64image": "data:image/jpeg;base64,VGhpc1dvdWxkQmVUaGVDYXRJbWFnZQ==",
                "imglink": "ThisWouldBeALinkToTheCatImage/image.jpg",
                "desc": "The cat is a cat which is a cat."
            }));
        })
    })
})