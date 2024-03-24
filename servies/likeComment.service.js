const { LikeComment } = require("./../models");

const findLikeOrCommentInPost = async (type, postID, userID) => {
    const like = await LikeComment.findOne({ where: { type, post_id: postID, user_id: userID } });
    return like;
};

const postLike = async (postID, userID) => {
    const like = await LikeComment.create({ type: "like", post_id: postID, user_id: userID });
    return like;
};

const addCommentInPost = async (message, postID, userID) => {
    const comment = await LikeComment.create({ type: "comment", message, post_id: postID, user_id: userID });
    return comment;
};

const deleteComment = async (commentID, postID, userID) => {
    const comment = await LikeComment.findOne({ where: { id: commentID, type: "comment", post_id: postID, user_id: userID } });
    if (!comment) throw Error("comment not found");
    await comment.destroy();
};

module.exports = { findLikeOrCommentInPost, postLike, addCommentInPost, deleteComment };