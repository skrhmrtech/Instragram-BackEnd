const { unlink } = require("fs");
const { Post } = require("../models");
const { join } = require("path");

const createPost = async (postBody) => {
    let hashTags = `${postBody.description}`.split("#").splice(1).reduce((arr, ele) => { return arr.concat(ele.toLowerCase().trim()) }, []).filter((v, i, a) => { return a.indexOf(v) === i });
    postBody.description = postBody.description.split("#")[0].trim();

    const post = await Post.create({ ...postBody, hashTag: hashTags });
    return post.toJSON();
}

const findUserPost = async (postID, userID) => {
    const post = await Post.findOne({
        where: [
            {
                id: postID,
                user_id: userID
            }
        ]
    });
    return post;
}

const deletePost = async (postID, userID) => {
    const post = await findUserPost(postID, userID);
    if (!post) throw Error("post not found");
    unlink(join(`${__dirname}/../public/${post.image}`), console.log);
    await post.destroy();
}

const findUserPosts = async (whereQuery, attributes = null) => {
    console.log("whereQuery", whereQuery);
    const posts = await Post.findAll({
        where: whereQuery, attributes,
        order: [
            ["id", "DESC"]
        ]
    });
    return posts;
}

const findFFPosts = async (whereQuery, attributes = null) => {
    console.log("whereQuery", whereQuery);
    const posts = await Post.findAll({ where: whereQuery, attributes });
    return posts;
}

module.exports = {
    createPost,
    findUserPost,
    deletePost,
    findUserPosts,
    findFFPosts
};