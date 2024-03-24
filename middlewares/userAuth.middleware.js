const { verify } = require("jsonwebtoken");
const catchAsync = require("./../utils/controllerErrorHandler");
const { atSecretKey } = require("./../config");
const userService = require("../servies/user.service");

const userAuthMiddleware = catchAsync(async (req, res, next) => {
    const tokenString = req.header("authorization")
    
    if (!tokenString || !tokenString.startsWith("Bearer "))
        throw Error("Invalid token or use bearer auth token");

    const token = tokenString.split(" ")[1];
    if (!token)
        throw Error("Please provide valid token");

    const isValidToken = verify(token, atSecretKey);

    if (!isValidToken)
        throw Error("Invalid token, try again please");
    const isValidUser = await userService.isValidUser({ id: isValidToken.id });
    if (!isValidUser)
        throw Error("User not found with this token");

    delete isValidToken.iat
    delete isValidToken.exp;

    req.user = isValidToken;
    next();
})

module.exports = userAuthMiddleware;