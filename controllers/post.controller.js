const { Op } = require("sequelize");
const { User, Post, LikeComment, FollowersFollowing, sequelize, Sequelize } = require("./../models");
const postService = require("../servies/post.service");
const { isEmpty } = require("../utils");
const catchAsync = require("./../utils/controllerErrorHandler");
// const { model } = require("mongoose");

const createPostController = catchAsync(async (req, res) => {
    const postBody = req.body;
    const { id: userID } = req.user;

    const post = await postService.createPost({ ...postBody, user_id: userID });
    if (!post) throw Error("post not created");

    return res.status(200).json({ error: false, message: "user post create successfully", data: post });
});

const updatePostController = catchAsync(async (req, res) => {
    if (isEmpty(req.body)) throw Error("Please provide details for update in post");

    const { postID } = req.params;
    const { title, description, image } = req.body;
    const { id: userID } = req.user;

    const post = await postService.findUserPost(postID, userID);
    if (!post) throw Error("post not found");

    if (title) post.title = title;
    if (description) {
        post.description = description.split("#")[0].trim();
        post.hashTag = `${description}`.split("#").splice(1).reduce((arr, ele) => { return arr.concat(ele.toLowerCase().trim()) }, []).filter((v, i, a) => { return a.indexOf(v) === i });
    }
    if (image) post.image = image;

    await post.save();

    return res.status(200).json({ error: false, message: "user post updated successfully" });
});

const deletePostController = catchAsync(async (req, res) => {
    const { postID } = req.params;
    const { id: userID } = req.user;
    await postService.deletePost(postID, userID);
    return res.status(200).json({ error: false, message: "user post deleted successfully" });
});

const fetchPostController = catchAsync(async (req, res) => {
    const { id: userID } = req.user;
    let { title, description } = req.body;

    if (!(title.search("#") === -1)) title = description = title.replace('#', '');

    const posts = await Post.findAll({
        where: [
            {
                [Op.and]: [
                    {
                        [Op.or]: [
                            {
                                ...title ? { title: { [Op.iLike]: `%${title}%` } } : {},
                            }, {
                                ...description ? { description: { [Op.iLike]: `%${description}%` } } : {},
                            }, {
                                hashTag: {
                                    [Op.overlap]: [title]
                                }
                            }
                        ],
                    },
                    {
                        [Op.or]: [
                            { user_id: userID },
                            { '$user.isPublic$': true },
                            {
                                [Op.and]: [
                                    {
                                        '$user.followers.sender_id$': userID
                                    },
                                    {
                                        '$user.followers.status$': "accepted"
                                    },
                                ]
                            },
                        ]
                    }
                ]

            }
        ],
        include: [
            {
                model: User,
                as: "user",
                attributes: { exclude: ["password", "bio", "createdAt", "updatedAt"] },
                include: [
                    {
                        model: FollowersFollowing,
                        as: "followers",
                    }
                ]
            }
        ],
        order: [
            ["id", "DESC"]
        ]
    });

    return res.status(200).json({ error: false, message: "user post fetched successfully", data: posts });
});

const fetchPostFFController = catchAsync(async (req, res) => {
    const { id: userID } = req.user;
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);

    const userHashTags = JSON.parse(JSON.stringify(await User.findOne({ where: { id: userID }, attributes: ["likedHashTags"] }))).likedHashTags;

    const postSearch = await Post.findAll({
        order: [
            ['id', 'DESC'],
            [
                { model: LikeComment, as: "likes" },
                "id",
                "DESC"
            ],
            [
                { model: LikeComment, as: "comments" },
                "id",
                "DESC"
            ]
        ],
        required: false,
        where: {
            [Op.or]: [
                { user_id: userID },
                {
                    [Op.and]: [
                        {
                            '$user.isPublic$': true
                        }, {
                            hashTag: {
                                [Op.overlap]: userHashTags
                            }
                        }
                    ]
                },
                {
                    [Op.and]: [
                        {
                            '$user.followers.sender_id$': userID
                        },
                        {
                            '$user.followers.status$': "accepted"
                        },
                    ]
                },
            ]
        },
        include: [
            {
                model: User,
                as: "user",
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"],
                },
                required: true,
                include: [
                    {
                        model: FollowersFollowing,
                        as: "followers",
                        required: true,
                        duplicating: false
                    },
                ]
            },
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
        ],
        offset: skip,
        limit: limit,
    });

    // const posts = JSON.parse(JSON.stringify(postSearch)).filter(post => {
    //     return !(post?.user?.isPublic === true && post?.user_id !== userID && post?.followers?.sender_id !== userID) || (post.hashTag.filter(value => userHashTags.includes(value)).length >= parseInt((post.hashTag.length * 50) / 100))
    // })

    return res.status(200).json({ error: false, message: "user post fetched successfully", userID, data: postSearch, skip, limit });
});

const fetchSinglePostController = catchAsync(async (req, res) => {
    const { id: userID } = req.user;
    const currentPostID = req.params.id;

    const posts = await Post.findOne({
        where: [
            {
                id: currentPostID
            }
        ],
        order: [
            ['id', 'DESC'],
            [
                { model: LikeComment, as: "likes" },
                "id",
                "DESC"
            ],
            [
                { model: LikeComment, as: "comments" },
                "id",
                "DESC"
            ]
        ],
        include: [
            {
                model: User,
                as: "user",
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"]
                },
                required: true,
            },
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
    });

    return res.status(200).json({ error: false, message: "user post fetched successfully", userID, data: posts });
});

module.exports = { createPostController, updatePostController, deletePostController, fetchPostController, fetchPostFFController, fetchSinglePostController };