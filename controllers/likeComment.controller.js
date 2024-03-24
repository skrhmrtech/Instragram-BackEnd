const postService = require("./../servies/post.service");
const likeCommentService = require("./../servies/likeComment.service");
const userService = require("./../servies/user.service");
const catchAsync = require("./../utils/controllerErrorHandler");
const { User } = require("./../models");


const postLikeCommentController = catchAsync(async (req, res) => {
    const { type, postID } = req.params;
    const { id: userID } = req.user;

    const post = await postService.findUserPosts({ id: postID });
    if (!post) throw Error("Post not found");

    let user = await userService.findUser({ id: userID });
    if (!user) throw Error("User not found or Invalid request");

    if (type === "like") {
        const like = await likeCommentService.findLikeOrCommentInPost("like", postID, userID);
        if (!like) {
            await addRemoveHashTags(user, post, "ADD");
            await likeCommentService.postLike(postID, userID);
            return res.status(200).json({ error: false, message: "like added in this post" });
        }
        await addRemoveHashTags(user, post, "REMOVE");
        await like.destroy();
        return res.status(200).json({ error: false, message: "like removed in this post" });
    }
    if (type === "comment") {
        const { message } = req.body;
        if (!message) throw Error("message is required for add comment");
        await likeCommentService.addCommentInPost(message, postID, userID);
        return res.status(200).json({ error: false, message: "comment added in this post" });
    }
    throw Error("invalid type for this type");
});

const deleteCommentController = catchAsync(async (req, res) => {
    const { commentID, type, postID } = req.params;
    const { id: userID } = req.user;
    if (type !== "comment") throw Error("invalid request. please try again");

    await likeCommentService.deleteComment(commentID, postID, userID);

    return res.status(200).json({ error: false, message: "comment deleted successfully" });
})

const addRemoveHashTags = async (user, post, status) => {

    if (status === "ADD") user.likedHashTags = user?.likedHashTags.concat(JSON.parse(JSON.stringify(post))[0]?.hashTag);

    if (status === "REMOVE") JSON.parse(JSON.stringify(post))[0]?.hashTag.forEach(tag => { if (user.likedHashTags.indexOf(tag) !== -1) user.likedHashTags.splice(user.likedHashTags.indexOf(tag), 1) });

    await userService.updateUsers({ likedHashTags: user.likedHashTags }, { id: user.id });
}

module.exports = { postLikeCommentController, deleteCommentController };