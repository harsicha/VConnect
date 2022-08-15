const mongoose = require('mongoose');
const { DB_MONGO_CONN_STR } = process.env;

exports.connect = () => {
    mongoose.connect(DB_MONGO_CONN_STR)
        .then(() => {
            console.log("Successfully connected to database");
        })
        .catch(err => {
            console.log("database connection failed. exiting now...");
            console.error(err);
            process.exit(1);
        });
};