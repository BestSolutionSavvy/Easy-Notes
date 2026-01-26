const mongoose = require('mongoose');

let gridFSBucket;

mongoose.connection.once("open", () => {
    gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "pdfs",
    });
});

const getGridFSBucket = () => {
    if (!gridFSBucket) {
        throw new Error('GridFSBucket not initialized. Database connection may not be open.');
    }
    return gridFSBucket;
};

module.exports = { getGridFSBucket };
