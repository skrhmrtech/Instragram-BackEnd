const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LikeComment extends Model {
    static associate(db) {
      db.LikeComment.belongsTo(db.User, { as: "user", foreignKey: "user_id" });
      db.LikeComment.belongsTo(db.Post, { as: "post", foreignKey: "post_id" });
    }
  }

  LikeComment.init({
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [['like', 'comment']] }
    },
    message: {
      type: DataTypes.STRING,
      trim: true,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'LikeComment'
  });

  return LikeComment;
};