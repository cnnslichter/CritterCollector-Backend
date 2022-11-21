const swaggerJSDoc = require('swagger-jsdoc');

/**
 * Return Swagger specification with customized definition and options
 */
exports.getSwaggerSpec = () => {
    const swaggerDefinition = {
        openapi: '3.0.0',
        info: {
            title: 'Express API for Critter Collector',
            version: '1.0.0',
            description:
                'This API is used for the Critter Collector mobile game.',
            contact: {
                name: 'Critter Collector Team',
                url: 'https://github.com/matt-iknow/CritterCollector-Backend'
            },
            license: {
                name: 'Licensed Under ISC',
                url: 'https://opensource.org/licenses/ISC'
            }
        },
        tags: [
            {
                name: "/api/animal",
                description: "Animals for special locations"
            },
            {
                name: "/api/location",
                description: "Interacts with player location"
            },
            {
                name: "/api/player",
                description: "Operations for player profile"
            },
            {
                name: "/api/spawner",
                description: "Spawners for regular locations"
            },
            {
                name: "/api/special-spawner",
                description: "Spawners for special locations"
            }
        ],
        servers: [
            {
                url: 'http://localhost:8666/',
                description: 'Development server'
            },
            {
                url: 'https://crittercollector.herokuapp.com/',
                description: 'Production server'
            }
        ],
        consumes: [
            'application/json'
        ],
        produces: [
            'application/json'
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    };

    const options = {
        swaggerDefinition,
        apis: ['./src/docs/**/*.yml'],
    };

    return swaggerJSDoc(options);
}