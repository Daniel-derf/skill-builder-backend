const mongoose = require('mongoose');

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
const dbURL = process.env.DB_URL;

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}${dbURL}`)
    .then(() => console.log('Connected to database'))
    .catch((err) => console.error('Database connection error:', err));

module.exports = mongoose;
