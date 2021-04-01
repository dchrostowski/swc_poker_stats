const mongoose = require('mongoose');

const MONGO_USERNAME = 'pokerplayer';
const MONGO_PASSWORD = 'swcpoker';
const MONGO_HOSTNAME = 'localhost';
const MONGO_PORT = '2000';
const MONGO_DB = 'tournaments';

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

mongoose.connect(url, {useNewUrlParser: true});