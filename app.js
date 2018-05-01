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

// Setup the static files
app.use(express.static('static'));
app.use('/libs/perfect-scrollbar', express.static('node_modules/perfect-scrollbar/'));

// Setup routes
app.get('/', (req, res) => {
	res.render('home', { page: 'home' });
});

// Setup routes
app.get('/info', (req, res) => {
	res.render('info', { page: 'info' });
});

app.get('/rsvp', (req, res) => {
	res.render('rsvp', { page: 'rsvp' });
});

app.get('/registry', (req, res) => {
	res.render('registry', { page: 'registry' });
});

app.get('/photos', (req, res) => {
	res.render('photos', { page: 'photos' });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
	console.log('Press Ctrl+C to quit.');
});
// [END app]
