const { sign } = require("jsonwebtoken");
const { atSecretKey, rtSecretKey } = require("../config");

function createTokenPair(data) {
    return {
        accessToken: sign(data, atSecretKey, { expiresIn: "1w" }), refreshToken: sign(data, rtSecretKey, { expiresIn: "4w" })
    };
}

module.exports = { createTokenPair };