const { FollowersFollowing } = require("../models");

const sendFollowRequest = async (SenderID, ReceiverID) => {
    try {

        const request = await FollowersFollowing.findOne({ where: { sender_id: SenderID, receiver_id: ReceiverID } });
        if (request) {
            // throw Error("You both are already in connection");
            await request.destroy();
            return false;    
        } else {
            await FollowersFollowing.create({ status: "pending", sender_id: SenderID, receiver_id: ReceiverID });
            return true;
        }
    } catch (error) {
        if (error.index === "FollowersFollowings_receiver_id_fkey")
            throw Error("Invalid user for the request");
        throw Error(error);
    }
};

const acceptUserRequest = async ({ RequestID, SenderID, ReceiverID }) => {
    if (!((RequestID || SenderID) && ReceiverID)) throw Error("Invalid request");

    const request = await FollowersFollowing.findOne({
        where: {
            status: "pending",
            ...RequestID ? ({ id: RequestID }) : ({}),
            ...SenderID ? ({ sender_id: SenderID }) : ({}),
            receiver_id: ReceiverID
        }
    });

    if (!request) throw Error("follow request not found");
    request.status = "accepted";
    await request.save();
}

const declineUserRequest = async ({ RequestID, SenderID, ReceiverID }) => {
    if (!((RequestID || SenderID) && ReceiverID)) throw Error("Invalid request");

    const request = await FollowersFollowing.findOne({
        where: {
            status: "pending",
            ...RequestID ? ({ id: RequestID }) : ({}),
            ...SenderID ? ({ sender_id: SenderID }) : ({}),
            receiver_id: ReceiverID
        }
    });

    if (!request) throw Error("follow request not found");
    request.status = "declined";
    await request.save();
}

const blockUserRequest = async ({ RequestID, SenderID, ReceiverID }) => {
    if (!((RequestID || SenderID) && ReceiverID)) throw Error("Invalid request");

    const request = await FollowersFollowing.findOne({
        where: {
            status: "accepted",
            ...RequestID ? ({ id: RequestID }) : ({}),
            ...SenderID ? ({ sender_id: SenderID }) : ({}),
            receiver_id: ReceiverID
        }
    });

    if (!request) throw Error("follower not found");
    request.status = "blocked";
    await request.save();
}

module.exports = {
    sendFollowRequest,
    acceptUserRequest,
    declineUserRequest,
    blockUserRequest
};