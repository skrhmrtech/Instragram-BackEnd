const router = require('express').Router();

const { createPostController, updatePostController, deletePostController, fetchPostController, fetchPostFFController, fetchSinglePostController } = require("../controllers/post.controller");
const { postLikeCommentController, deleteCommentController } = require("../controllers/likeComment.controller");
const { createPostValidation, updatePostValidation } = require('../validations/post.validate.js');

const userAuthMiddleware = require('../middlewares/userAuth.middleware');
const { uploadPostImage } = require('../middlewares/fileUpload.middleware.js');

router.get("/", userAuthMiddleware, fetchPostController);
router.post("/search", userAuthMiddleware, fetchPostController);
router.get("/followers-following", userAuthMiddleware, fetchPostFFController);
router.post("/create", userAuthMiddleware, uploadPostImage, createPostValidation, createPostController);
router.patch("/update/:postID", userAuthMiddleware, uploadPostImage, updatePostValidation, updatePostController);
router.delete("/delete/:postID", userAuthMiddleware, deletePostController);

router.get("/get-single-post/:id", userAuthMiddleware, fetchSinglePostController);

router.post("/:postID/:type(like|comment)", userAuthMiddleware, postLikeCommentController);
router.delete("/:postID/:type(like|comment)/:commentID", userAuthMiddleware, deleteCommentController);

module.exports = router;