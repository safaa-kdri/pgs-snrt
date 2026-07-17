// src/config/database.js
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
        logger.info(`📚 Database: ${conn.connection.name}`);

        mongoose.connection.on('connected', () => {
            logger.info('✅ MongoDB connection established');
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️ MongoDB connection lost');
        });

        mongoose.connection.on('error', (err) => {
            logger.error(`❌ MongoDB connection error: ${err}`);
        });

        return conn;
    } catch (error) {
        logger.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;