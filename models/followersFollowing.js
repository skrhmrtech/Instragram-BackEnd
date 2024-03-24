const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class FollowersFollowing extends Model {
        static associate(db) {
            db.FollowersFollowing.belongsTo(db.User, { as: "sender_user", foreignKey: "sender_id" });
            db.FollowersFollowing.belongsTo(db.User, { as: "receiver_user", foreignKey: "receiver_id" });
        }
    }

    FollowersFollowing.init({
        status: {
            type: DataTypes.STRING,
            trim: true,
            allowNull: false,
            validate: { isIn: [["pending", "accepted", "declined", "blocked"]], notNull: { msg: "image is required" } }
        }
    }, {
        sequelize,
        modelName: 'FollowersFollowing',
        indexes: [
            {
                unique: true,
                fields: ['sender_id', 'receiver_id']
            }
        ]
    });

    return FollowersFollowing;
};