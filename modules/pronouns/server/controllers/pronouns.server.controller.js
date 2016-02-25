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

  pronoun.pattern = pronoun.subject + '/' + pronoun.object + '/' + pronoun.determiner + '/' + pronoun.possessive + '/' + pronoun.reflexive;
  pronoun.user = req.user;

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


  pronoun.subject = req.body.subject;
  pronoun.object = req.body.object;
  pronoun.determiner = req.body.determiner;
  pronoun.possessive = req.body.possessive;
  pronoun.reflexive = req.body.reflexive;
  pronoun.content = req.body.content;

  pronoun.pattern = pronoun.subject + '/' + pronoun.object + '/' + pronoun.determiner + '/' + pronoun.possessive + '/' + pronoun.reflexive;

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
 * List of Pronouns
 */
exports.list = function (req, res) {
  Pronoun.find().sort('-created').populate('user', 'displayName').exec(function (err, pronouns) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(pronouns);
    }
  });
};
exports.findByPattern = function(req, res){
  Pronoun.findOne({ pattern: req.params.subject + '/' + req.params.object + '/' + req.params.determiner + '/' + req.params.possessive + '/' + req.params.reflexive }, '_id', function(err, pronoun){
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

  Pronoun.findById(id).populate('user', 'displayName').exec(function (err, pronoun) {
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
