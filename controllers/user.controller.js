const catchAsync = require("./../utils/controllerErrorHandler");
const userService = require("./../servies/user.service");
const { User, Post, LikeComment, FollowersFollowing } = require("./../models");
const { isEmpty } = require("./../utils");
const { createTokenPair } = require("./../utils/JWTtokenHandler");
const { Op } = require("sequelize");
const { compare } = require("bcrypt");
const { verify } = require("jsonwebtoken");
const { rtSecretKey } = require("../config");

const getMe = catchAsync(async (req, res) => {
    const { id: userID } = req.user;
    const user = await userService.findUser({ id: userID }, { exclude: ["password"] }, {
        include: [
            {
                model: Post,
                as: "posts",
                attributes: {
                    exclude: ["user_id"]
                },
                include: [
                    {
                        model: LikeComment,
                        as: "likes",
                        where: { type: "like" },
                        required: false,
                        attributes: {
                            exclude: ["type", "post_id", "user_id", "createdAt"]
                        },
                        include: [
                            {
                                model: User,
                                as: "user",
                                attributes: ["id", "fname", "lname", "avatar"]
                            }
                        ]
                    },
                    {
                        model: LikeComment,
                        as: "comments",
                        required: false,
                        where: { type: "comment" },
                        attributes: {
                            exclude: ["type", "post_id", "user_id", "createdAt"]
                        },
                        include: [
                            {
                                model: User,
                                as: "user",
                                attributes: ["id", "fname", "lname", "avatar"]
                            }
                        ]
                    }
                ]
            },
            {
                model: FollowersFollowing,
                as: "followers",
                attributes: { exclude: ["sender_id", "receiver_id", "createdAt"] },
                where: { status: "accepted" },
                required: false,
                include: {
                    model: User,
                    as: "sender_user",
                    attributes: { exclude: ["updatedAt", "gender", "username", "updatedAt", "password"] },
                }
            },
            {
                model: FollowersFollowing,
                as: "following",
                attributes: { exclude: ["sender_id", "receiver_id", "createdAt"] },
                where: { status: "accepted" },
                required: false,
                include: {
                    model: User,
                    as: "receiver_user",
                    attributes: { exclude: ["updatedAt", "gender", "username", "updatedAt", "password"] },
                }
            },
            // {
            //     model: LikeComment,
            //     as: "likes",
            //     required: false,
            //     where: { type: "like" },
            //     attributes: { exclude: ["user_id", "createdAt"] },
            //     include: {
            //         model: Post,
            //         as: "post",
            //         attributes: { exclude: ["user_id", "createdAt"] },
            //     }
            // },
            // {
            //     model: LikeComment,
            //     as: "comments",
            //     where: { type: "comment" },
            //     required: false,
            //     attributes: { exclude: ["user_id", "createdAt"] },
            //     include: {
            //         model: Post,
            //         as: "post",
            //         attributes: { exclude: ["user_id", "createdAt"] },
            //     }
            // }
        ],
        order: [
            [
                { model: Post, as: "posts" },
                "id",
                "ASC"
            ],
            [
                { model: Post, as: "posts" },
                { model: LikeComment, as: "likes" },
                "id",
                "DESC"
            ],
            [
                { model: Post, as: "posts" },
                { model: LikeComment, as: "comments" },
                "id",
                "DESC"
            ]
        ],
    });

    return res.status(201).json({ error: false, message: "user profile fetched successfully", data: user });
});

const createUserController = catchAsync(async (req, res) => {
    const userBody = req.body;
    const user = await userService.createUser(userBody);
    const tokens = createTokenPair(user);
    return res.status(201).json({ error: false, message: "user created successfully", data: { ...user, tokens: tokens } });
});

const loginUserController = catchAsync(async (req, res) => {
    const { username, password } = req.body;
    const requestedUser = await userService.findUser({ [Op.or]: [{ username }, { email: username }] }, ["id", "fname", "lname", "gender", "avatar", "email", "username", "password"]);
    const isValidPassword = await compare(password, requestedUser.password);

    if (!isValidPassword)
        throw Error("Invalid password, try again with correct password")
    delete requestedUser.password;

    const tokens = createTokenPair(requestedUser);
    return res.status(200).json({ error: false, message: "user loggedin successfully", data: { ...requestedUser, token: tokens } });
});

const updateUserController = catchAsync(async (req, res) => {
    if (isEmpty(req.body))
        throw Error("Please provide details for update");

    const { fname, lname, bio, avatar } = req.body;
    const { id: userID } = req.user;

    await userService.updateUsers({
        ...(fname ? { fname } : {}), ...(lname ? { lname } : {}), ...(bio ? { bio } : {}), ...(avatar ? { avatar } : {})
    }, { id: userID }, ["id", ...Object.keys(req.body)]);

    return res.status(200).json({ error: false, message: "user info updated successfully" });
});

const removeAvatarUserController = catchAsync(async (req, res) => {
    const { id: userID } = req.user;
    await userService.deleteUserAvatar(userID);
    return res.status(200).json({ error: false, message: "user avatar removed successfully" });
});

const deleteUserController = catchAsync(async (req, res) => {
    const { id: userId } = req.user;
    await userService.deleteUser(userId);
    return res.status(200).json({ error: false, message: "user account deleted successfully" });
});

const regenerateAccessToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    const user = await verify(refreshToken, rtSecretKey);

    const isValidUser = await userService.isValidUser(user.id);

    if (!isValidUser)
        throw Error("User not found");

    delete user.exp;
    delete user.iat;

    const newLoginTokenPair = createTokenPair(user);

    return res.status(200).json({ error: false, message: "new access-token generated successfully from refresh-token", data: newLoginTokenPair });
});

const getAllUsers = catchAsync(async (req, res) => {
    const { id: userID } = req.user;

    let requestedUser = await User.findAll({
        exclude: ["password"],
        where: [
            {
                id: userID
            }
        ],
        required: false,
        include: [
            {
                model: FollowersFollowing,
                as: "following",
                where: [{ "status": "pending" }],
                required: false,
                include: [
                    {
                        model: User,
                        as: "receiver_user",
                    }
                ]
            }, {
                model: FollowersFollowing,
                as: "followers",
                where: [{ "status": "pending" }],
                required: false,
                include: [
                    {
                        model: User,
                        as: "sender_user",
                    }
                ]
            }
        ],
        order: [
            [
                { model: FollowersFollowing, as: "following" },
                "updatedAt",
                "ASC"
            ],
            [
                { model: FollowersFollowing, as: "followers" },
                "updatedAt",
                "ASC"
            ]
        ],
    });

    let receiverUser = await User.findAll({
        exclude: ["password"],
        where: [
            {
                id: userID
            }
        ],
        required: false,
        include: [
            {
                model: FollowersFollowing,
                as: "following",
                required: false,
                include: [
                    {
                        model: User,
                        as: "receiver_user",
                    }
                ]
            }
        ],
        order: [
            [
                { model: FollowersFollowing, as: "following" },
                "updatedAt",
                "ASC"
            ]
        ],
    });

    let userIdRemoved = JSON.parse(JSON.stringify(receiverUser, null, 2)).reduce((total, user) => {
        var ids = new Array();
        ids.push(userID);
        for (var items in user.following) {
            if (!ids.includes(user.following[items]["receiver_id"])) {
                ids.push(user.following[items]["receiver_id"]);
            }
        }
        return ids;
    }, []);

    let user = await userService.findAllUser({
        [Op.not]: [
            {
                id: userIdRemoved
            }
        ]
    }, {
        exclude: ["password"],
    }, {
        order: [
            [
                { model: FollowersFollowing, as: "following" },
                "updatedAt",
                "ASC"
            ],
            [
                { model: FollowersFollowing, as: "followers" },
                "updatedAt",
                "ASC"
            ],
            ["id", "DESC"],
        ],
        include: [
            {
                model: FollowersFollowing,
                as: "following",
                include: [
                    {
                        model: User,
                        as: "receiver_user",
                    }
                ]
            }, {
                model: FollowersFollowing,
                as: "followers",
                include: [
                    {
                        model: User,
                        as: "sender_user",
                    }
                ]
            }
        ]
    });

    return res.status(201).json({ error: false, message: "user profile fetched successfully", requestedUser, data: user, userId: userID });
});

const getSingleUsers = catchAsync(async (req, res) => {
    const { id: userID } = req.user;
    const currentUserID = req.params.id;

    if (userID == currentUserID) {
        throw Error("You can show a current user profile");
    }

    const user = await User.findOne({
        where: [
            {
                id: currentUserID
            }
        ],
        exclude: ["password"],
        include: [
            {
                model: Post,
                as: "posts",
                attributes: {
                    exclude: ["user_id"]
                },
                required: false,
                include: [
                    {
                        model: LikeComment,
                        as: "likes",
                        where: { type: "like" },
                        required: false,
                        attributes: {
                            exclude: ["type", "post_id", "user_id", "createdAt"]
                        },
                        include: [
                            {
                                model: User,
                                as: "user",
                                attributes: ["id", "fname", "lname", "avatar"]
                            }
                        ]
                    },
                    {
                        model: LikeComment,
                        as: "comments",
                        required: false,
                        where: { type: "comment" },
                        attributes: {
                            exclude: ["type", "post_id", "user_id", "createdAt"]
                        },
                        include: [
                            {
                                model: User,
                                as: "user",
                                attributes: ["id", "fname", "lname", "avatar"]
                            }
                        ]
                    }
                ]
            },
            {
                model: FollowersFollowing,
                as: "followers",
                attributes: { exclude: ["sender_id", "receiver_id", "createdAt"] },
                required: false,
                include: {
                    model: User,
                    as: "sender_user",
                    attributes: { exclude: ["updatedAt", "gender", "username", "updatedAt", "password"] },
                }
            },
            {
                model: FollowersFollowing,
                as: "following",
                attributes: { exclude: ["sender_id", "receiver_id", "createdAt"] },
                required: false,
                include: {
                    model: User,
                    as: "receiver_user",
                    attributes: { exclude: ["updatedAt", "gender", "username", "updatedAt", "password"] },
                }
            },
        ],
        order: [
            [
                { model: Post, as: "posts" },
                "id",
                "ASC"
            ],
            [
                { model: Post, as: "posts" },
                { model: LikeComment, as: "likes" },
                "id",
                "DESC"
            ],
            [
                { model: Post, as: "posts" },
                { model: LikeComment, as: "comments" },
                "id",
                "DESC"
            ]
        ],
    });

    return res.status(201).json({ error: false, message: "user profile fetched successfully", data: user, userId: userID });
});

const isPublic = catchAsync(async (req, res) => {
    const { id: userID } = req.user;

    const userSearch = await userService.findUser({ id: userID });
    if (!userSearch) {
        return res.status(200).json({ error: true, message: "user not found." });
    }
    await userService.updateUsers({ isPublic: (userSearch.isPublic) ? false : true }, { id: userID });

    return res.status(200).json({ error: false, message: "user status updated fetched successfully" });
});

const fetchUserController = catchAsync(async (req, res) => {
    const { id: userID } = req.user;
    const { username } = req.body;
    const user = await userService.findSearchUser({
        ...username ? { username: { [Op.iLike]: `%${username}%` } } : {},
    }, ["id", "fname", "lname", "avatar", "username", "email"]);
    return res.status(200).json({ error: false, message: "user fetched successfully", data: user });
});

module.exports = {
    getMe,
    createUserController,
    loginUserController,
    updateUserController,
    removeAvatarUserController,
    deleteUserController,
    regenerateAccessToken,
    getAllUsers,
    fetchUserController,
    getSingleUsers,
    isPublic
}