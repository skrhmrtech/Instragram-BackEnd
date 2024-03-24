const router = require('express').Router();

const { getMe, createUserController, loginUserController, updateUserController, removeAvatarUserController, deleteUserController, regenerateAccessToken, getAllUsers, fetchUserController, getSingleUsers, isPublic } = require("../controllers/user.controller");
const { createUserValidation, loginUserValidation, updateUserValidation, userAccessTokenValidation } = require('../validations/user.validate');
const { userAvatarUpdate } = require('../middlewares/fileUpload.middleware');
const userAuthMiddleware = require('../middlewares/userAuth.middleware');

router.get("/me", userAuthMiddleware, getMe);

router.post("/login", loginUserValidation, loginUserController);
router.post("/create", createUserValidation, createUserController);

router.post("/search", userAuthMiddleware, fetchUserController);

router.patch("/update", userAuthMiddleware, userAvatarUpdate, updateUserValidation, updateUserController);
router.patch("/remove-avatar", userAuthMiddleware, removeAvatarUserController);

router.delete("/delete", userAuthMiddleware, deleteUserController);

router.get("/get-all-user", userAuthMiddleware, getAllUsers);

router.get("/get-single-user/:id", userAuthMiddleware, getSingleUsers);

router.patch("/isPublic", userAuthMiddleware, isPublic);

router.post("/access-token", userAccessTokenValidation, regenerateAccessToken);

module.exports = router;