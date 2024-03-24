const { unlink } = require("fs");
const { join } = require("path");

const { User } = require("./../models");

const createUser = async (userBody) => {
    const user = await User.create({ ...userBody, username: "" });
    return user.toJSON();
}

const findUser = async (whereQuery, attributes = null, query) => {
    const user = await User.findOne({ ...query, where: whereQuery, attributes });
    if (!user) throw Error("User not found or Invalid request");
    return user.toJSON();
}

const updateUsers = async (userData, whereQuery, attributes = null) => {
    console.log("whereQuery", whereQuery);
    const users = await User.update(userData, { where: whereQuery, attributes });
    if (!users[0]) throw Error("user details not updated yet, something is wrong here");

    return true;
}

const deleteUserAvatar = async (userID) => {
    const user = await User.findOne({ where: { id: userID } });
    if (!user.avatar) throw Error("user image is alread deleted")
    unlink(join(`${__dirname}/../public/${user.avatar}`), console.log);
    user.avatar = null;
    await user.save();
}

const isValidUser = async (whereQuery, attributes = null) => {
    const user = await User.findOne({ where: whereQuery, attributes });
    if (user) return true;
    return false;
}

const deleteUser = async (userID) => {
    const user = await User.findOne({ where: { id: userID } });

    unlink(join(`${__dirname}/../public/${user.avatar}`), console.log);
    await user.destroy();
}

const findAllUser = async (whereQuery, attributes = null, query) => {
    const user = await User.findAll({ ...query, where: whereQuery, attributes });
    if (!user) throw Error("User not found or Invalid request");
    return user;
}

const findSearchUser = async (whereQuery, attributes = null) => {
    console.log("whereQuery", whereQuery);
    const user = await User.findAll({
        where: whereQuery, attributes,
        order: [
            ["id", "DESC"]
        ]
    });
    return user;
}


module.exports = {
    createUser,
    findUser,
    updateUsers,
    deleteUserAvatar,
    isValidUser,
    deleteUser,
    findAllUser,
    findSearchUser
};