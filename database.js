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
    type: Sequelize.STRING
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

User.hasMany(Guest, { as: 'guests' });

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
  sequelize.sync({force: true}).then(() => {
    // Create admin user
    var salt = generateSalt();
    var password = 'rubyrose20';
    var passwordHash = sha512(password, salt);

    User.create({
      username: 'admin',
      passwordHash: passwordHash,
      salt: salt,
      isAdmin: true
    });

    // Create test user
    salt = generateSalt();
    passwordHash = sha512(password, salt);

    User.create({
      username: 'test',
      passwordHash: passwordHash,
      salt: salt,
      isAdmin: false
    }).then((user) => {
      Guest.create({
        firstName: "John",
        lastName: "Smith",
        isAttending: true,
        dietaryRequirements: 'Vegan',
        userId: user.id
      });

      Guest.create({
        firstName: "Lucy",
        lastName: "Smith",
        isAttending: false,
        userId: user.id
      });
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

listGuests = function () {
  return Guest.findAll();
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
  listGuests: listGuests
}