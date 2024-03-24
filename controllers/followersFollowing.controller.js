const followersFollowingService = require("./../servies/followersFollowing.service");
const catchAsync = require("./../utils/controllerErrorHandler");

const followController = catchAsync(async (req, res) => {
    const { id: SenderID } = req.user;
    const { userID: ReceiverID } = req.params;
    if (+SenderID === +ReceiverID) throw Error("You can't send request to your self.");

    const response = await followersFollowingService.sendFollowRequest(SenderID, ReceiverID);
    return res.status(200).json({ error: false, message: (response) ? "follow request send successfully" : "follow request remove successfully" });
});

const updateStatusController = catchAsync(async (req, res) => {
    const { id: ReceiverID } = req.user;
    const { userID: SenderID, status } = req.params;

    if (+SenderID === +ReceiverID) throw Error("You can't perform any action with your self.");

    if (status === "accepted")
        await followersFollowingService.acceptUserRequest({ SenderID, ReceiverID });

    if (status === "declined")
        await followersFollowingService.declineUserRequest({ SenderID, ReceiverID });

    if (status === "blocked")
        await followersFollowingService.blockUserRequest({ SenderID, ReceiverID });

    return res.status(200).json({ error: false, message: "action perform successfully" });
});

const updateUserRequestStatusController = catchAsync(async (req, res) => {
    const { id: ReceiverID } = req.user;
    const { requestID: RequestID, status } = req.params;

    if (status === "accepted")
        await followersFollowingService.acceptUserRequest({ RequestID, ReceiverID });

    if (status === "declined")
        await followersFollowingService.declineUserRequest({ RequestID, ReceiverID });

    if (status === "blocked")
        await followersFollowingService.blockUserRequest({ RequestID, ReceiverID });

    return res.status(200).json({ error: false, message: "action perform successfully" });
});

module.exports = { followController, updateUserRequestStatusController, updateStatusController };