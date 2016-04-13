'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Alert = mongoose.model('Alert'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  User = mongoose.model('User'),
  request = require('request'),
  async = require('async'),
  config = require(path.resolve('./config/config')),
  PushBullet = require('pushbullet'),
  nodemailer = require('nodemailer'),
  sgTransport = require('nodemailer-sendgrid-transport'),
  ObjectId = mongoose.Types.ObjectId,
  _ = require('lodash');

var smtpTransport = nodemailer.createTransport(sgTransport(config.mailer.options));

/**
 * Create a Alert
 */
exports.create = function (req, res) {
  var user = req.user;
  if (user) {
    if ((user.nextAlertAt === undefined || user.nextAlertAt < Date.now()) && user.canSendAlert) {
      user.nextAlertAt = Date.now() + (30 * 1000); // 2 minutes
      user.canSendAlert = false;
      user.save(function (err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        var userHasFacebook = user.additionalProvidersData && user.additionalProvidersData.facebook;
        User.find({ following: user._id }, function (err, docs) {
          async.filter(docs, function(target, callback) {
            Alert.count({ 'user': user, 'targetUsers': { $elemMatch: { user: target._id } } }, function(err, c){
              callback(c === 0);
            });
          }, function(docs){
            var targets = [];
            for (var i = 0; i < docs.length; i++) {
              targets.push({
                user: docs[i],
                key: new ObjectId()
              });
            }
            //CREATE ALERT
            var alert = new Alert({
              link: 'https://pronouny.xyz/users/' + user.username,
              type: 'pronoun',
              user: user,
              targetUsers: targets,
              viewedUsers: []
            });

            alert.save(function (err) {
              if (err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                docs.forEach(function (target) {
                  // FACEBOOK
                  if (target.additionalProvidersData && target.additionalProvidersData.facebook && target.alertChannels.indexOf('facebook') > -1) {
                    console.log('sending to ' + target.username);
                    request
                      .post('https://graph.facebook.com/' + target.additionalProvidersData.facebook.id + '/notifications')
                      .on('response', function (response) {
                        if (response.statusCode === 200) {
                          //YAY
                        }
                      })
                      .form({
                        'access_token': config.facebook.clientID + '|' + config.facebook.clientSecret,
                        'href': alert.linkForUser(target),
                        'template': (userHasFacebook ? '@[' + user.additionalProvidersData.facebook.id + ']' : user.displayName) + ' has posted new pronouns.'
                      });
                  }
                  // PUSHBULLET
                  if (target.alertChannels.indexOf('pushbullet') > -1 && target.pushbulletKey) {
                    var pusher = new PushBullet(target.pushbulletKey);
                    pusher.link({}, user.displayName + ' has posted new pronouns', 'https://pronouny.xyz/' + alert.linkForUser(target), function (error, response) {
                    });
                  }

                  // EMAIL
                  if (target.alertChannels.indexOf('email') > -1) {
                    res.render(path.resolve('modules/users/server/templates/pronoun-update-alert-email'), {
                      user: user,
                      target: target,
                      link: alert.linkForUser(target)
                    }, function (err, emailHTML) {
                      var mailOptions = {
                        to: target.email,
                        from: config.mailer.from,
                        subject: 'Pronoun update',
                        html: emailHTML
                      };
                      smtpTransport.sendMail(mailOptions, function (err) {
                      });
                    });
                  }
                });
                res.json(alert);
              }
            });
          });
        });
      });
    }
    else {
      res.status(400).send({
        message: 'Rate limited'
      });
    }
  }
  else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Show the current Alert
 */
exports.read = function (req, res) {

  // strip tokens to prevent spam attacks
  for(var i = 0; i < req.alert.targetUsers.length; i++){
    req.alert.targetUsers[i] = req.alert.targetUsers[i].user;
  }
  for(i = 0; i < req.alert.viewedUsers.length; i++){
    req.alert.viewedUsers[i] = req.alert.viewedUsers[i].user;
  }

  var alert = req.alert ? req.alert.toJSON() : {};

  alert.isCurrentUserOwner = req.user && alert.user && alert.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(alert);
};
/**
 * Delete an Alert
 */
exports.delete = function (req, res) {
  var alert = req.alert;
  if (alert.isComplete() && String(req.user._id) === String(alert.user._id)) {
    alert.remove(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(alert);
      }
    });
  }
};

/**
 * List of Alerts
 */
exports.list = function (req, res) {
  Alert.find({ user: req.user._id }).sort('-created').populate('user', 'displayName username').populate('targetUsers').populate('viewedUsers').exec(function (err, alerts) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(alerts);
    }
  });
};

exports.open = function (req, res) {
  var user = req.alert.markViewed(req.params.openId);
  if (user !== false) {
    req.alert.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.redirect(req.alert.link);
      }
    });
  }
  else {
    user = req.alert.checkUsedKey(req.params.openId);
    if (user !== false) {
      res.redirect(req.alert.link);
    }
    else {
      res.jsonp({ error: 'Could not find that alert.' });
    }
  }
};

/**
 * Alert middleware
 */
exports.alertByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Alert is invalid'
    });
  }

  Alert.findById(id).populate('user', 'displayName username').populate('targetUsers.user').populate('viewedUsers.user').exec(function (err, alert) {
    if (err) {
      return next(err);
    } else if (!alert) {
      return res.status(404).send({
        message: 'No Alert with that identifier has been found'
      });
    }
    req.alert = alert;
    next();
  });
};
