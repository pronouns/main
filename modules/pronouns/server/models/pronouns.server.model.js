'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Pronoun Schema
 */
var PronounSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String
  },
  subject: {
    type: String,
    required: 'Please fill in a subject'
  },
  object: {
    type: String,
    required: 'Please fill in an object'
  },
  determiner: {
    type: String,
    required: 'Please fill in a determiner'
  },
  possessive: {
    type: String,
    required: 'Please fill in a possessive'
  },
  reflexive: {
    type: String,
    required: 'Please fill in a reflexive'
  },
  pattern: {
    type: String,
    unique: 'Pronoun already exists',
    lowercase: true,
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});
mongoose.model('Pronoun', PronounSchema);
