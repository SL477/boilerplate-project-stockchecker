import swaggerJSDoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';

// const options = {
//     definitions: {
//         servers: [
//             {
//                 url: 'http://localhost:3000/',
//                 description: 'Local server',
//             },
//             {
//                 url: 'https://sl477-boilerplate-project-stockchecker.glitch.me/',
//                 description: 'Live server',
//             },
//         ],
//     },
//     apis: ['./routers/api.js'],
// };

export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'fccStockChecker',
            description:
                'What I made as part of the FreeCodeCamp Stock Checker',
            version: '0.0.2',
        },
    },
    apis: ['./routes/api.js'],
});
// // eslint-disable-next-line no-unused-vars
// function swaggerDocs(app, port) {
//     // swagger page
//     app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//     // Documentation in JSON format
//     app.get('/docs.json', (req, res) => {
//         res.setHeader('Content-Type', 'application/json');
//         res.send(swaggerSpec);
//     });
// }
// export default swaggerDocs;
