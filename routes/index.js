const router = require('express').Router();

const userRoute = require('./user.route');
const postRoute = require('./post.route');
const followersFollowingRoute = require('./followersFollowing.route');

router.use("/user", userRoute);
router.use("/post", postRoute);
router.use("/followers-following", followersFollowingRoute);

module.exports = router;