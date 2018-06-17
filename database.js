const self = this;
const Sequelize = require('sequelize');
const Crypto = require('crypto');

sequelize = new Sequelize('live', 'root', '9kroMKNyinFykqnd', {
  host: '35.201.3.29',
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

deleteUser = function (id) {
  return User.findOne({
    where: {
      id: id
    }, 
    include: [
      { model: Guest, as: 'guests' }
    ]
  }).then((user) => {
    return user.destroy();
  });
}

authenticateUser = function (username, password) {
  return getUserByUsername(username).then((user) => {
    var passwordHash = sha512(password, user.salt);
    user.isAuthenticated = passwordHash === user.passwordHash;
    return user;
  });
}

/* Password hashing */

generateSalt = function(){
  var length = 16;
  return Crypto.randomBytes(Math.ceil(length/2))
          .toString('hex') /** convert to hexadecimal format */
          .slice(0,length);   /** return required number of characters */
};

sha512 = function(password, salt){
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
  addOrUpdateUser: addOrUpdateUser
}