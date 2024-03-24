const multer = require('multer');
const { v4 } = require('uuid');
const { extname, join } = require('path');
const { deleteUserAvatar } = require('../servies/user.service');
const { findUserPost } = require('../servies/post.service');
const { unlink } = require('fs');

const userAvatarStorage = multer.diskStorage({
    destination: "public/u/",
    async filename(req, file, cb) {
        const imageId = v4();
        try {
            const { id: userID } = req.user;
            await deleteUserAvatar(userID)
        } catch (error) { }
        req.body = { ...req.body, avatar: `u/${imageId}${extname(file.originalname)}` };
        cb(null, `${imageId}${extname(file.originalname)}`);
    }
});

const userAvatarUpdate = multer({
    storage: userAvatarStorage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB
    fileFilter(req, file, callback) {
        const ext = extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') return callback(new Error('avatar must be valid image format'));
        callback(null, true);
    }
}).single("avatar");

const uploadPostStorage = multer.diskStorage({
    destination: "public/p/",
    async filename(req, file, cb) {
        const imageId = v4();
        const { postID } = req.params;
        if (postID) {
            try {
                const { id: userID } = req.user;
                const post = await findUserPost(postID, userID);
                unlink(join(`${__dirname}/../public/${post.image}`), console.log);
            } catch (error) { }
        }
        req.body = { ...req.body, image: `p/${imageId}${extname(file.originalname)}` };
        cb(null, `${imageId}${extname(file.originalname)}`);
    }
});

const uploadPostImage = multer({
    storage: uploadPostStorage,
    limits: { fileSize: 1024 * 1024 * 2 }, // 2 MB
    fileFilter(req, file, callback) {
        const ext = extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') return callback(new Error('post must be valid image format'));
        callback(null, true);
    }
}).single("image");

module.exports = { userAvatarUpdate, uploadPostImage };