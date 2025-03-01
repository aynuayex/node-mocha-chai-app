require('dotenv').config();
const mongoose = require('mongoose');

const app = require('./src/app');
const logger = require("./src/config/logger");
const connectDB = require('./src/config/dbConnect');

const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Start the server once the database connection is open
mongoose.connection.once('open', () => {
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`)
    });
});