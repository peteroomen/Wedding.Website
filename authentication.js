const self = this;
var jwt = require('jsonwebtoken');
const secret = '2413FB3709B05939F04CF2E92F7D0897FC2596F9AD0B8A9EA855C7BFEBAAE892';

self.requireAuth = function (req, res, success) {
  var token = req.cookies.authentication;

  // decode token
  if (token) {
    jwt.verify(token, secret, function(err, tokenData) {
      if (err) {
      	self.loginRedirect(req, res);
      } else {
        req.userData = tokenData;
        success();
      }
    });
  } else {
     self.loginRedirect(req, res);
  }
}

self.requireAdmin = function (req, res, success) {
  var token = req.cookies.authentication;

  // decode token
  if (token) {
    jwt.verify(token, secret, function(err, tokenData) {
      if (err) {
        self.loginRedirect(req, res);
      } else {
        req.userData = tokenData;
        console.log(tokenData);
        if (tokenData.isAdmin) {
          success();
        } else {
          res.send(403,"You must be an admin to visit this page");
        }        
      }
    });
  } else {
     self.loginRedirect(req, res);
  }
}

self.loginRedirect = function (req, res) {
  res.redirect('/login?redirect=' + encodeURI(req.originalUrl));
}

self.issueToken = function (req, res, user, redirect) {
    var token = jwt.sign({
      username: user.username,
      isAdmin: user.isAdmin
    }, 
    secret, 
    {
      expiresIn : 30 * 60
    });
    res.cookie('authentication', token);
    res.redirect(redirect || '/');
}

self.clearToken = function (req, res) {
    res.clearCookie('authentication');
}

module.exports = {
  requireAuth: self.requireAuth,
  requireAdmin: self.requireAdmin,
  issueToken: self.issueToken,
  clearToken: self.clearToken
}