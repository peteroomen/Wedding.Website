var jwt = require('jsonwebtoken');
const secret = '2413FB3709B05939F04CF2E92F7D0897FC2596F9AD0B8A9EA855C7BFEBAAE892';

requireAuth = function (req, res, success) {
  var token = req.cookies.authentication;

  // decode token
  if (token) {
    jwt.verify(token, secret, function(err, tokenData) {
      if (err) {
      	loginRedirect(req, res);
      } else {
        req.userData = tokenData;
        success(req.userData);
      }
    });
  } else {
     loginRedirect(req, res);
  }
}

requireAdmin = function (req, res, success) {
  var token = req.cookies.authentication;

  // decode token
  if (token) {
    jwt.verify(token, secret, function(err, tokenData) {
      if (err) {
        loginRedirect(req, res);
      } else {
        req.userData = tokenData;
        if (tokenData.isAdmin) {
          success();
        } else {
          res.send(403,"You must be an admin to visit this page");
        }        
      }
    });
  } else {
     loginRedirect(req, res);
  }
}

loginRedirect = function (req, res) {
  res.redirect('/login?redirect=' + encodeURI(req.originalUrl));
}

issueToken = function (req, res, user, redirect) {
    var token = jwt.sign({
      userId: user.id,
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

clearToken = function (req, res) {
    res.clearCookie('authentication');
}

module.exports = {
  requireAuth: requireAuth,
  requireAdmin: requireAdmin,
  issueToken: issueToken,
  clearToken: clearToken
}