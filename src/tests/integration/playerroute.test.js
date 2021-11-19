const request = require('supertest');
const createServer = require('../../app');
const MongoClient = require('mongodb').MongoClient;

let db;
let playerProfiles;

const app = createServer();

beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    db = await connection.db('PlayerRoute-Animal-Game');
    app.locals.db = db;

    playerProfiles = await db.collection('Player-Profiles');
});

afterAll(async () => {
    await connection.close();
});

describe('GET - /api/player', () => {

    describe('Error Checking', () => {

        beforeEach(async () => {
            playerProfiles.deleteMany();
        });

        it('should return 400 when username parameter is not part of the request', async () => {

            const response = await request(app)
                                    .get("/api/player")
                                    .query({});

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })
    })

    describe('Valid Call', () => {

        beforeEach(async () => {
            playerProfiles.deleteMany();

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
        });

        it('should return 200 when parameter is valid and player is found', async () => {

            const username = "RandomPlayer";

            const response = await request(app)
                                    .get("/api/player")
                                    .query({
                                        username: username
                                    });

            expect(response.status).toBe(200);
        })

        it('should return true when player profile is found', async () => {

            const username = "RandomPlayer";

            const response = await request(app)
                                    .get("/api/player")
                                    .query({
                                        username: username
                                    });

            const foundMessage = response.body.player_exists;

            expect(foundMessage).toBe(true);
        })

        it('should return false when player profile is not found', async () => {

            const otherUsername = "OtherPlayer";

            const response = await request(app)
                                    .get("/api/player")
                                    .query({
                                        username: otherUsername
                                    });

            const foundMessage = response.body.player_exists;

            expect(foundMessage).toBe(false);
        })
    })
})

describe('POST - /api/player', () => {

    describe('Error Checking', () => {

        beforeEach(async () => {
            playerProfiles.deleteMany();
        });

        it('should return 400 when no parameters are part of the request', async () => {

            const response = await request(app).post("/api/player");

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when username parameter is not part of the request', async () => {

            const response = await request(app)
                                    .post("/api/player")
                                    .send({
                                        email: "random@email.com"
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when email parameter is not part of the request', async () => {

            const response = await request(app)
                                    .post("/api/player")
                                    .send({
                                        username: "RandomUser"
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })
    })

    describe('Valid Call', () => {

        beforeEach(async () => {
            playerProfiles.deleteMany();
        });

        it('should return 200 when parameters are valid and player profile is created', async () => {

            const username = "RandomPlayer";
            const email = "random@email.com";

            const response = await request(app)
                                    .post("/api/player")
                                    .send({
                                        username: username,
                                        email: email
                                    });

            expect(response.status).toBe(200);
        })

        it('should indicate the player profile is created when insert is successful', async () => {

            const username = "RandomPlayer";
            const email = "random@email.com";

            const response = await request(app)
                                    .post("/api/player")
                                    .send({
                                        username: username,
                                        email: email
                                    });

            const insertMessage = response.body.insert_player;

            expect(insertMessage).toEqual(expect.stringContaining(
                "Player profile created successfully"
            ))
        })
    })
})

describe('PUT - /api/player', () => {

    describe('Error Checking', () => {

        beforeEach(async () => {
            playerProfiles.deleteMany();
        });

        it('should return 400 when no parameters are part of the request', async () => {

            const response = await request(app).put("/api/player");

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when username parameter is not part of the request', async () => {

            const response = await request(app)
                                    .put("/api/player")
                                    .send({
                                        common_animal: "CommonName",
                                        scientific_animal: "ScientificName"
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when common_animal parameter is not part of the request', async () => {

            const response = await request(app)
                                    .put("/api/player")
                                    .send({
                                        location: "LocationName",
                                        scientific_animal: "ScientificName"
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 400 when scientific_animal parameter is not part of the request', async () => {

            const response = await request(app)
                                    .put("/api/player")
                                    .send({
                                        location: "LocationName",
                                        common_animal: "CommonName"
                                    });

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })
    })

    describe('Valid Call', () => {

        beforeEach(async () => {
            playerProfiles.deleteMany();

            const username = "Knight";
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
        });

        it('should return 200 when parameters are valid and player profile is updated', async () => {

            const username = "Knight";
            const commonName = "European swallow";
            const scientificName = "Hirundo rustica";

            const response = await request(app)
                                    .put("/api/player")
                                    .send({
                                        username: username,
                                        common_animal: commonName,
                                        scientific_animal: scientificName
                                    });

            expect(response.status).toBe(200);
        })

        it('should indicate the player profile is updated when insert animal is successful', async () => {

            const username = "Knight";
            const commonName = "European swallow";
            const scientificName = "Hirundo rustica";

            const response = await request(app)
                                    .put("/api/player")
                                    .send({
                                        username: username,
                                        common_animal: commonName,
                                        scientific_animal: scientificName
                                    });

            const updateMessage = response.body.update_profile;

            expect(updateMessage).toEqual(expect.stringContaining(
                "Player profile updated successfully"
            ))
        })

        it('should indicate the player profile is updated when animal count update is successful', async () => {

            const username = "Knight";
            const commonName = "American alligator";
            const scientificName = "Alligator mississippiensis";

            const response = await request(app)
                                    .put("/api/player")
                                    .send({
                                        username: username,
                                        common_animal: commonName,
                                        scientific_animal: scientificName
                                    });

            const updateMessage = response.body.update_profile;

            expect(updateMessage).toEqual(expect.stringContaining(
                "Player profile updated successfully"
            ))
        })
    })
})

describe('DELETE - /api/player', () => {

    describe('Error Checking', () => {

        beforeEach(async () => {
            playerProfiles.deleteMany();
        });

        it('should return 400 when username parameter is not part of the request', async () => {

            const response = await request(app)
                                    .delete("/api/player")
                                    .send({});

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({});
        })

        it('should return 422 when profile is not removed successfully', async () => {

            const username = "NonExistantUser";

            const response = await request(app)
                                    .delete("/api/player")
                                    .send({
                                        username: username
                                    });

            expect(response.status).toBe(422);
        })

        it('should indicate the profile was not removed when remove is not successful', async () => {

            const username = "NonExistantUser";

            const response = await request(app)
                                    .delete("/api/player")
                                    .send({
                                        username: username
                                    });

            const deleteMessage = response.body.remove_profile;

            expect(deleteMessage).toEqual(expect.stringContaining(
                "Profile not removed successfully"
            ))
        })
    })

    describe('Valid Call', () => {

        beforeEach(async () => {
            playerProfiles.deleteMany();

            const username = "Knight";
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
        });

        it('should return 200 when parameters are valid and player profile is removed', async () => {

            const username = "Knight";

            const response = await request(app)
                                    .delete("/api/player")
                                    .send({
                                        username: username
                                    });

            expect(response.status).toBe(200);
        })

        it('should indicate the profile was removed when remove is successful', async () => {

            const username = "Knight";

            const response = await request(app)
                                    .delete("/api/player")
                                    .send({
                                        username: username
                                    });

            const deleteMessage = response.body.remove_profile;

            expect(deleteMessage).toEqual(expect.stringContaining(
                "Profile removed successfully"
            ))
        })
    })
})