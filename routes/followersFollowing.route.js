const router = require('express').Router();
const { followController, updateUserRequestStatusController, updateStatusController } = require('./../controllers/followersFollowing.controller');
const userAuthMiddleware = require('./../middlewares/userAuth.middleware');

router.post("/:userID/follow", userAuthMiddleware, followController);
router.patch("/:userID/:status(accepted|declined|blocked)", userAuthMiddleware, updateStatusController);

router.patch("/request/:requestID/:status(accepted|declined|blocked)", userAuthMiddleware, updateUserRequestStatusController);

module.exports = router;