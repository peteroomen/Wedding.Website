const self = this;
const Sequelize = require('sequelize');
const Crypto = require('crypto');

sequelize = new Sequelize('live', 'wedding', '9kroMKNyinFykqnd', {
  host: '192.168.20.14',
  port: 3306,
  operatorAliases: false,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});

/* MODELS */
User = sequelize.define('user', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  passwordHash: {
    type: Sequelize.STRING
  },
  salt: {
    type: Sequelize.STRING
  },
  isAdmin: {
    type: Sequelize.BOOLEAN
  }
});

Guest = sequelize.define('guest', {
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  },
  isAttending: {
    type: Sequelize.BOOLEAN
  },
  dietaryRequirements: {
    type: Sequelize.STRING
  },
  songRequest: {
    type: Sequelize.STRING
  }
});

User.hasMany(Guest, { as: 'guests', onDelete: 'CASCADE' });

/* METHODS */

/* Database initialisation */

init = function () {
  sequelize.authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    }).catch(error => {
      console.error('Unable to connect to the database:', error);
    });

  // force: true will drop the table if it already exists
  sequelize.sync().then(() => {
    // Check if the admin user exists

    // Create admin user
    var username = 'admin';

    return getUserByUsername(username).then((user) => {
      console.log(user);
      if (!user) {
        var salt = generateSalt();
        var password = 'rubyrose20';
        var passwordHash = sha512(password, salt);

        return User.create({
          username: 'admin',
          passwordHash: passwordHash,
          salt: salt,
          isAdmin: true
        });
      }
    });
  });
}

/* Users */
listUsers = function () {
  return User.findAll({
    include: [
      { model: Guest, as: 'guests' }
    ]
  });
}

getUser = function (id) {
  return User.findOne({
    where: {
      id: id
    }, 
    include: [
      { model: Guest, as: 'guests' }
    ]
  });
}

getUserByUsername = function (username) {
  return User.findOne({
    where: {
      username: username
    }
  });
}

addOrUpdateUser = function (user) {
  if (!user.id) {
    // Add a new user
    return User.create(user).then((dbUser) => {
      return Guest.bulkCreate(user.guests).then((guests) => {
        return dbUser.setGuests(guests);
      });
    });
  } else {
    return User.findOne({
      where: {
        id: user.id
      }             
    }).then((dbUser) => {
      return dbUser.update(user).then((dbUser) => {
        return Guest.bulkCreate(user.guests).then((guests) => {
          return dbUser.setGuests(guests);
        });
      });
    });
  }
}

setUserPassword = function (id, password) {
    return User.findOne({
      where: {
        id: id
      }
    }).then((dbUser) => {
      var salt = generateSalt();
      var passwordHash = sha512(password, salt);
      return dbUser.update({
        passwordHash: passwordHash,
        salt: salt
      });
    });
}

deleteUser = function (id) {
  return User.findOne({
    where: {
      id: id
    }, 
    include: [
      { model: Guest, as: 'guests' }
    ]
  }).then((user) => {
    return Guest.destroy({ where: { id: user.guests.map((g) => g.id) } }).then(() => {
      return user.destroy();
    });
  });
}

authenticateUser = function (username, password) {
  return getUserByUsername(username).then((user) => {
    var passwordHash = sha512(password, user.salt);
    user.isAuthenticated = passwordHash === user.passwordHash;
    return user;
  });
}

generateRandomUsername = function (length) {
  length = length || 4;
  return random(length);
}

generateRandomPassword = function (length) {
  length = length || 8;
  return Crypto.randomBytes(length)
        .toString('base64')   // convert to base64 format
        .slice(0, length)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
}

function random (howMany, chars) {
    chars = chars 
        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ";
    var rnd = Crypto.randomBytes(howMany);
    var value = new Array(howMany);
    var len = Math.min(256, chars.length);
    var d = 256 / len;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[Math.floor(rnd[i] / d)]
    };

    return value.join('');
}

/* Password hashing */

generateSalt = function(){
  var length = 16;
  return Crypto.randomBytes(Math.ceil(length/2))
          .toString('hex') /** convert to hexadecimal format */
          .slice(0,length);   /** return required number of characters */
};

sha512 = function(password, salt){
  console.log('About to sha512+salt password:', password, salt);
  var hash = Crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  return hash.digest('hex');
};

module.exports = {
  init: init,
  users: User,
  authenticateUser: authenticateUser,
  listUsers: listUsers,
  getUser: getUser,
  deleteUser: deleteUser,
  addOrUpdateUser: addOrUpdateUser,
  setUserPassword: setUserPassword,
  generateRandomUsername: generateRandomUsername,
  generateRandomPassword: generateRandomPassword
}