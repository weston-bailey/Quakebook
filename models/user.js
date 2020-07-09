'use strict';
const bcrypt = require('bcrypt');

// declare user model format
module.exports = function(sequelize, DataTypes) {
  // define user object
  const user = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: 'Invalid email address'
        }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [1, 99],
          msg: 'First Name must be between 1 and 99 characters'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [1, 99],
          msg: 'Last Name must be between 1 and 99 characters'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [8, 99],
          msg: 'Password is of incorrect length. Double check character number.'
        }
      }
    },
    pfp: DataTypes.STRING,
    bio: DataTypes.TEXT,
    defaults: DataTypes.JSON
  }, {
    hooks: {
      // before record creation
      beforeCreate: function(createdUser, options) {
        if (createdUser && createdUser.password) {
          let hash = bcrypt.hashSync(createdUser.password, 12);
          createdUser.password = hash;
        }
      }
    }
  });
  user.associate = function(models) {
    models.user.hasMany(models.comment);
  }
  // validPassword definition to validate password at user login
  user.prototype.validPassword = function(passwordTyped) {
    return bcrypt.compareSync(passwordTyped, this.password);
  }
  // remove password before any serialization of User object
  user.prototype.toJSON = function() {
    let userData = this.get();
    delete userData.password;
    return userData;
  }
  //get user's fullname
  user.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`
  }
  //get only public data on user
  user.prototype.getPublicData = function(){
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: `${this.firstName} ${this.lastName}`,
      pfp: this.pfp,
      bio: this.bio
    }   
  } 
  return user;
};