const mongoose = require('mongoose');

// Enable Mongoose debug mode for more detailed logs
mongoose.set('debug', true);

// const username = 'aaditya';
// const password = 'rC2UE01uFY56374I';
// const host = 'db-mongodb-sfo3-98432-07a86b3f.mongo.ondigitalocean.com';
// const database = 'production';

// MongoDB connection URI
const mongoURI = `mongodb+srv://Dipaksrm:12345@cluster1.zaaat.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;


const connectToMongo = () => {
    mongoose.connect(mongoURI, {
        connectTimeoutMS: 10000, // Increase the timeout to 10 seconds
    })
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
}

module.exports = connectToMongo;
