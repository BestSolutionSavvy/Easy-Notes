require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const movieRouter = require('./src/routes/notebookRoutes');
const cors = require('cors');

mongoose.connect(process.env.MONGO_URI);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/notebooks', notebookRouter);

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
