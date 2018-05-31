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
  authentication.requireAuth(req, res, () => {
  res.render('home', { page: 'home' });
  });
});

// Setup routes
app.get('/info', (req, res) => {
  authentication.requireAuth(req, res, () => {
  res.render('info', { page: 'info' });
  });
});

app.get('/rsvp', (req, res) => {
  authentication.requireAuth(req, res, () => {
  res.render('rsvp', { page: 'rsvp' });
  });
});

app.get('/registry', (req, res) => {
  authentication.requireAuth(req, res, () => {
  res.render('registry', { page: 'registry' });
  });
});

app.get('/photos', (req, res) => {
  authentication.requireAuth(req, res, () => {
  res.render('photos', { page: 'photos' });
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
  authentication.requireAdmin(req, res, () => {
    res.render('admin/overview', { page: 'overview' });
  });
});

app.get('/admin/users', (req, res) => {
  authentication.requireAdmin(req, res, () => {
    database.listUsers().then((users) => {
      res.render('admin/users', { page: 'users', users: users });
    });
  });
});


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
