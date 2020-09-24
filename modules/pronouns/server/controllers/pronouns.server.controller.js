'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Pronoun = mongoose.model('Pronoun'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a pronoun
 */
exports.create = function (req, res) {
  var pronoun = new Pronoun(req.body);
  if(pronoun.listed && req.user.roles.indexOf('admin') === -1){
    return res.status(400).send({
      message: 'Only admins can create public pronouns'
    });
  }
  pronoun.user = req.user;
  if(pronoun.pronounType === 'X') {
    pronoun.pattern = pronoun.subject + '/' + pronoun.object + '/' + pronoun.determiner + '/' + pronoun.possessive + '/' + pronoun.reflexive;
  }
  pronoun.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(pronoun);
    }
  });
};

/**
 * Show the current pronoun
 */
exports.read = function (req, res) {
  res.json(req.pronoun);
};

/**
 * Update a pronoun
 */
exports.update = function (req, res) {
  var pronoun = req.pronoun;

  pronoun.content = req.body.content;
  pronoun.title = req.body.title;

  if(req.user.roles.indexOf('admin') !== -1){
    pronoun.listed = req.body.listed;
  }

  if(pronoun.pronounType === 'X') {
    pronoun.subject = req.body.subject;
    pronoun.object = req.body.object;
    pronoun.determiner = req.body.determiner;
    pronoun.possessive = req.body.possessive;
    pronoun.reflexive = req.body.reflexive;
    pronoun.pattern = pronoun.subject + '/' + pronoun.object + '/' + pronoun.determiner + '/' + pronoun.possessive + '/' + pronoun.reflexive;
  }

  pronoun.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(pronoun);
    }
  });
};

/**
 * Delete an pronoun
 */
exports.delete = function (req, res) {
  var pronoun = req.pronoun;
  User.collection.update({}, {
    $pullAll: {
      pronouns: [pronoun._id]
    }
  }, { multi: true });
  pronoun.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(pronoun);
    }
  });
};

/**
 * Public list of Pronouns
 */

let listCache = null;
let cacheExpire = 0;
exports.list = function (req, res) {
  if(listCache != null && Date.now() < cacheExpire){
    res.json(listCache);
  } else {
    Pronoun.find({ listed: true }).sort('-created').populate('user', 'displayName username').exec(function (err, pronouns) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        listCache = pronouns;
        cacheExpire = Date.now() + (60 * 1000 * 10);
        res.json(pronouns);
      }
    });
  }
};
/**
 * Personal list of Pronouns
 */
exports.listMine = function (req, res) {
  Pronoun.find({ user: req.user._id, listed: false }).sort('-created').populate('user', 'displayName username').exec(function (err, pronouns) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(pronouns);
    }
  });
};
/**
 * List a users created pronouns
 * (for Admin)
 */
exports.listUser = function (req, res) {
  Pronoun.find({ user: req.params.userId }).sort('-created').populate('user', 'displayName username').exec(function (err, pronouns) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(pronouns);
    }
  });
};
exports.findByPattern = function(req, res, next){
  if(req.params.subject === 'api'){
    next();
    return;
  }
  Pronoun.findOne({ pattern: req.params.subject + '/' + req.params.object + '/' + req.params.determiner + '/' + req.params.possessive + '/' + req.params.reflexive, listed: true }, '_id', function(err, pronoun){
    if(err !== null || pronoun === null){
      res.redirect('/pronouns');
    }
    else{
      res.redirect('/pronouns/' + pronoun._id);
    }
  });
};
/**
 * Pronoun middleware
 */
exports.pronounByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Pronoun is invalid'
    });
  }

  Pronoun.findById(id).populate('user', 'displayName username').exec(function (err, pronoun) {
    if (err) {
      return next(err);
    } else if (!pronoun) {
      return res.status(404).send({
        message: 'No pronoun with that identifier has been found'
      });
    }
    req.pronoun = pronoun;
    next();
  });
};
