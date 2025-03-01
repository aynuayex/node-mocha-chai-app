const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
    try {
        const dbURI = process.env.NODE_ENV === 'test' ? process.env.MONGO_TEST_URI : process.env.MONGO_URI;
        await mongoose.connect(dbURI);
        logger.info('MongoDB connected');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
    }
};

module.exports = connectDB;
