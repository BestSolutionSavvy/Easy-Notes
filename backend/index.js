require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api.yaml');

const notebookRouter = require('./src/routes/notebookRoutes');

mongoose.connect(process.env.MONGO_URI);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/notebooks', notebookRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
    console.log('Server listening on http://localhost:3000');
    console.log('API docs available at http://localhost:3000/api-docs');
});
