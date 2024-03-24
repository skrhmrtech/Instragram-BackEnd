const { checkSchema, body } = require("express-validator");
const checkRouteSchema = require("../utils/checkRouteSchema");

const createPostValidation = checkSchema({
    "image": { isString: true, isEmpty: false },
    "title": { isString: true, isEmpty: false },
    "description": { isString: true, isEmpty: false }
});

const updatePostValidation = [
    body("title").optional().isLength({ min: 3 }).withMessage("title must be minimum 3 character"),
    body("description").optional().isString().withMessage("description required")
];

module.exports = {
    createPostValidation: [createPostValidation, checkRouteSchema],
    updatePostValidation: [...updatePostValidation, checkRouteSchema]
}