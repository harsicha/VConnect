const jwt = require('jsonwebtoken');
require('dotenv').config();
const { PRIVATE_KEY } = process.env;

function generateToken(name) {
    return jwt.sign(
        { username: name, },
        PRIVATE_KEY,
        {
            expiresIn: '3h',
        }
    );
}

function validateToken(token) {
    try {
        const decoded = jwt.verify(token, PRIVATE_KEY);
        return decoded;
    }
    catch (e) {
        return null;
    }
}

function decodeExpiredToken(token) {
    return jwt.verify(token, PRIVATE_KEY, { ignoreExpiration: true });
}

module.exports = {
    generateToken,
    validateToken,
    decodeExpiredToken,
}