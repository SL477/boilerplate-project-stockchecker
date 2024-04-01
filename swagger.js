import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'fccStockChecker',
            description:
                'What I made as part of the FreeCodeCamp Stock Checker',
            version: '0.0.2',
        },
        servers: [
            {
                url: 'http://localhost:3000/',
                description: 'Local server',
            },
            {
                url: 'https://sl477-boilerplate-project-stockchecker.glitch.me/',
                description: 'Live server',
            },
        ],
    },
    apis: ['./routes/api.js'],
});
