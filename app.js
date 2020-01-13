/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START app]
const express = require('express');
const app = express();

// Load the config file
const config = require('./config.json');

// Set the view engine and configure
app.set('view engine', 'pug');

// Allow url encoded post data
app.use(express.urlencoded());

// Setup the static files
app.use(express.static('static'));
app.use('/libs/perfect-scrollbar', express.static('node_modules/perfect-scrollbar'));
app.use('/libs/materialize-css', express.static('node_modules/materialize-css/dist'));

// Setup the database
const database = require('./database.js');
database.init();

// Setup authentication
const authentication = require('./authentication.js');
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// Setup routes
app.get('/', (req, res) => {
  authentication.requireAuth(req, res, (currentUser) => {
    res.render('home', { page: 'home', currentUser: currentUser });
  });
});

app.get('/info', (req, res) => {
  authentication.requireAuth(req, res, (currentUser) => {
    res.render('info', { page: 'info', currentUser: currentUser  });
  });
});

app.get('/story', (req, res) => {
  authentication.requireAuth(req, res, (currentUser) => {
    res.render('our-story', { page: 'story', currentUser: currentUser  });
  });
});

app.get('/rsvp', (req, res) => {
  authentication.requireAuth(req, res, (currentUser) => {
    var status = req.query.status || '';
    database.getUser(currentUser.userId).then((user) => {
      console.log("RSVP for user:", user);
      res.render('rsvp', { page: 'rsvp', currentUser: currentUser, user: user, status: status });
    }, (error) => {
      console.error('error', error);
      res.redirect('/');
    });
  });
});

app.post('/rsvp', (req, res) => {
  authentication.requireAuth(req, res, (currentUser) => {
    var user = {
      id: currentUser.userId,
      username: currentUser.username,
      message: currentUser.message,
      isAdmin: currentUser.isAdmin,
      isCeremonyOnly: currentUser.isCeremonyOnly,
      guests: (req.body.guests || []).map((guest) => {
        return {
          firstName: guest.firstName,
          lastName: guest.lastName,
          dietaryRequirements: guest.dietaryRequirements,
          songRequest: guest.songRequest,
          isAttending: guest.isAttending != undefined
        };
      })
    };
    database.addOrUpdateUser(user).then((user) => {
      res.redirect('/rsvp?status=success');
    }, (error) => {
      console.error('error', error);
      res.redirect('/rsvp?status=error');
    });
  });
});

app.get('/registry', (req, res) => {
  authentication.requireAuth(req, res, (currentUser) => {
    database.listGiftsForUser(currentUser.userId).then((gifts) => {
      res.render('registry', { page: 'registry', currentUser: currentUser, gifts: gifts.sort(function (a, b) { return a.name.localeCompare(b.name); }) });
    });
  });
});

app.post('/registry', (req, res) => {
  var giftId = req.body.giftId;
  var userId = req.body.userId;
  var add = req.body.add == "true";

  authentication.requireAuth(req, res, (currentUser) => {
    var promise;

    if (add) promise = database.setGiftPurchaser(giftId, userId);
    else promise = database.removeGiftPurchaser(giftId, userId);

    promise.then(() => {
      res.sendStatus(200);
    }, (error) => {
      console.error('error', error);
      res.sendStatus(400);
    });
  });
});

app.get('/photos', (req, res) => {
  authentication.requireAuth(req, res, (currentUser) => {
    res.render('photos', { page: 'photos', currentUser: currentUser  });
  });
});

app.get('/login', (req, res) => {
  res.render('login', { page: 'login', redirect: req.query.redirect });
});

app.post('/login', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var redirect = req.body.redirect;
  console.log('Logging in', username, password);
  database.authenticateUser(username, password).then((user) => {
    if (user.isAuthenticated) {
      var token = authentication.issueToken(req, res, user, redirect);
    } else {
      res.sendStatus(403);
    }
  });
});

app.get('/logout', (req, res) => {
  authentication.clearToken(req, res);
  res.redirect('/login');
});

app.get('/admin', (req, res) => {
  authentication.requireAdmin(req, res, (currentUser) => {
    database.listUsers().then((users) => {
      res.render('admin/overview', { page: 'overview', currentUser: currentUser, users: users  });
    });
  });
});

app.get('/admin/users', (req, res) => {
  authentication.requireAdmin(req, res, (currentUser) => {
    database.listUsers().then((users) => {
      res.render('admin/users', { page: 'users', currentUser: currentUser, users: users });
    });
  });
});

app.get('/admin/users/add', (req, res) => {
  authentication.requireAdmin(req, res, (currentUser) => {
      var username = database.generateRandomUsername();
      var password = database.generateRandomPassword();
      res.render('admin/user', { page: 'users', currentUser: currentUser, user: { username: username, guests: [] }, password: password });
  });
});

app.post('/admin/users/save', (req, res) => {
  authentication.requireAdmin(req, res, (currentUser) => {
    var user = {
      id: req.body.id,
      username: req.body.username,
      message: req.body.message,
      isAdmin: req.body.isAdmin != undefined,
      isCeremonyOnly: req.body.isCeremonyOnly != undefined,
      guests: (req.body.guests || []).map((guest) => {
        return {
          firstName: guest.firstName,
          lastName: guest.lastName,
          dietaryRequirements: guest.dietaryRequirements,
          songRequest: guest.songRequest,
          isAttending: guest.isAttending != undefined
        };
      })
    };
    database.addOrUpdateUser(user).then((user) => {
      if (!req.body.password) {
        console.log('No password set, not updating');
        res.redirect('/admin/users');
        return;
      }
      database.setUserPassword(user.id, req.body.password).then((user) => {
        res.redirect('/admin/users');
      }, (error) => {
        console.error('error', error);
        res.redirect('/admin/users');
      });
    }, (error) => {
      console.error('error', error);
      res.redirect('/admin/users');
    });
  });
});

app.get('/admin/users/:id', (req, res) => {
  authentication.requireAdmin(req, res, (currentUser) => {
    var id = req.params.id;
    database.getUser(id).then((user) => {
      res.render('admin/user', { page: 'user', currentUser: currentUser, user: user });
    }, (error) => {
      console.error('error', error);
      res.redirect('/admin/users');
    });
  });
});

app.get('/admin/users/:id/delete', (req, res) => {
  authentication.requireAdmin(req, res, (currentUser) => {
    var id = req.params.id;
    database.deleteUser(id).then((user) => {
      res.redirect('/admin/users');
    }, (error) => {
      console.error('error', error);
      res.redirect('/admin/users');
    });
  });
});

app.get('/admin/gifts', (req, res) => {
  authentication.requireAdmin(req, res, (currentUser) => {
    database.listGifts().then((gifts) => {
      res.render('admin/gifts', { page: 'gifts', currentUser: currentUser, gifts: gifts });
    });
  });
});

app.get('/admin/gifts/add', (req, res) => {
  authentication.requireAdmin(req, res, (currentUser) => {
      res.render('admin/gift', { page: 'gifts', currentUser: currentUser, gift: { } });
  });
});

app.post('/admin/gifts/save', (req, res) => {
  authentication.requireAdmin(req, res, (currentUser) => {
    var gift = {
      id: req.body.id,
      name: req.body.name,
      specifications: req.body.specifications,
      description: req.body.description,
      imageUri: req.body.imageUri,
      purchaseUri: req.body.purchaseUri,
    };
    database.addOrUpdateGift(gift).then((user) => {
      res.redirect('/admin/gifts');
    }, (error) => {
      console.error('error', error);
      res.redirect('/admin/gifts');
    });
  });
});

app.get('/admin/gifts/:id', (req, res) => {
  authentication.requireAdmin(req, res, (currentUser) => {
    var id = req.params.id;
    database.getGift(id).then((gift) => {
      res.render('admin/gift', { page: 'gift', currentUser: currentUser, gift: gift });
    }, (error) => {
      console.error('error', error);
      res.redirect('/admin/gifts');
    });
  });
});

app.get('/admin/gifts/:id/delete', (req, res) => {
  authentication.requireAdmin(req, res, (currentUser) => {
    var id = req.params.id;
    database.deleteGift(id).then((gift) => {
      res.redirect('/admin/gifts');
    }, (error) => {
      console.error('error', error);
      res.redirect('/admin/gifts');
    });
  });
});


// Start the server
const PORT = config.web.port || process.env.PORT || 8080;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
