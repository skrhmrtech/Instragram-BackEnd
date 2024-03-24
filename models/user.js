const { hashSync, genSaltSync } = require('bcrypt');
const { Model } = require('sequelize');
const { saltRounds } = require('../config');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(db) {
      db.User.hasMany(db.Post, { as: "posts", foreignKey: "user_id" });
      db.User.hasMany(db.LikeComment, { as: "likes", foreignKey: "user_id" });
      db.User.hasMany(db.LikeComment, { as: "comments", foreignKey: "user_id" });
      db.User.hasMany(db.FollowersFollowing, { as: "followers", foreignKey: "receiver_id" });
      db.User.hasMany(db.FollowersFollowing, { as: "following", foreignKey: "sender_id" });
    }
  }

  Users.init({
    fname: {
      type: DataTypes.STRING,
      trim: true,
      allowNull: false,
      validate: { notNull: { msg: "fname is required" } }
    },
    lname: {
      type: DataTypes.STRING,
      trim: true,
      allowNull: false,
      validate: { notNull: { msg: "lname is required" } }
    },
    avatar: {
      type: DataTypes.STRING,
      trim: true
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [['male', 'female', 'other']] }
    },
    username: {
      type: DataTypes.STRING,
      trim: true,
      unique: { msg: "username already exist" },
      set() {
        const username = `${this.getDataValue("fname")}${this.getDataValue("lname")}`.replace(/[^a-zA-Z]/g, '').toLocaleLowerCase();
        console.log("username", username);
        this.setDataValue('username', username);
      }
    },
    email: {
      type: DataTypes.STRING,
      trim: true,
      unique: { msg: "email already exist" },
      validate: { isEmail: true },
      set(value) {
        this.setDataValue('email', value.toLocaleLowerCase());
      }
    },
    password: {
      type: DataTypes.STRING,
      trim: true,
      allowNull: false,
      validate: { notNull: { msg: "password is required" } },
      set(value) {
        this.setDataValue('password', hashSync(value, genSaltSync(saltRounds)));
      }
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
      validate: { notNull: { msg: "bio is required" } }
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: { isIn: [[true, false]] },
      defaultValue: false
    },
    likedHashTags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      afterCreate(row) {
        delete row.dataValues.password
        delete row.dataValues.createdAt
        delete row.dataValues.updatedAt
        delete row.dataValues.avatar
      }
    }
  });

  return Users;
};