const { checkSchema, oneOf, body } = require("express-validator");
const checkRouteSchema = require("./../utils/checkRouteSchema");

const createUserValidation = checkSchema({
    "fname": {
        in: ["body"],
        isString: {
            bail: true,
            errorMessage: "fname is required"
        }
    },
    "lname": {
        in: ["body"],
        isEmpty: false,
        isString: {
            bail: true,
            errorMessage: "username is required"
        }
    },
    "bio": {
        in: ["body"],
        isEmpty: false,
        isString: {
            bail: true,
            errorMessage: "bio is required"
        }
    },
    "gender": {
        in: ["body"],
        matches: {
            options: [/\b(?:male|female|other)\b/],
            errorMessage: "invalid gender type, currect value 'male', 'female' and 'other'"
        }
    },
    "email": {
        in: ["body"],
        isEmpty: false,
        isEmail: {
            bail: true,
            errorMessage: "Invalid email value"
        }
    },
    "password": {
        in: ["body"],
        isEmpty: false,
        isStrongPassword: {
            bail: true,
            errorMessage: "This is not a strong password"
        }
    }
});

const loginUserValidation = checkSchema({
    "username": {
        in: ["body"],
        notEmpty: {
            errorMessage: "username required"
        },
    },
    "password": {
        in: ["body"],
        isEmpty: false,
        isStrongPassword: {
            bail: true,
            errorMessage: "This is not a strong password"
        }
    }
})

const updateUserValidation = [
    body("fname").optional().isLength({ min: 3 }).withMessage("fname value must be minimum 3 characters"),
    body("lname").optional().isLength({ min: 3 }).withMessage("lname value must be minimum 3 characters"),
    body("bio").optional().isLength({ min: 3 }).withMessage("bio value must be minimum 10 characters"),
    body("avatar").optional().isString().withMessage("Invalid URL in user avarat")
];

const userAccessTokenValidation = [
    body("refreshToken").notEmpty().withMessage("refresh token is required")
]

module.exports = {
    createUserValidation: [createUserValidation, checkRouteSchema],
    loginUserValidation: [loginUserValidation, checkRouteSchema],
    updateUserValidation: [...updateUserValidation, checkRouteSchema],
    userAccessTokenValidation: [userAccessTokenValidation, checkRouteSchema]
};