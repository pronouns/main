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
  title: {
    type: String
  },
  pronounType: {
    type: String,
    enum: ['X', 'M'],
    required: 'Please configure a type for your pronoun.'
  },
  listed: {
    type: Boolean,
    required: 'Please configure a privacy setting for your pronoun.'
  },
  content: {
    type: String
  },
  subject: {
    type: String
  },
  object: {
    type: String
  },
  determiner: {
    type: String
  },
  possessive: {
    type: String
  },
  reflexive: {
    type: String
  },
  pattern: {
    type: String,
    lowercase: true,
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});
PronounSchema.pre('validate', function(next) {
  if (this.pronounType === 'X') {
    if(!!this.subject && !!this.object && !!this.determiner && !!this.possessive && !!this.reflexive){
      if(this.listed){
        mongoose.model('Pronoun').count({ listed: true, pattern: this.pattern, _id: { '$ne': this._id } }, function (err, count) {
          if (err) {
            return next(err);
          }
          if(count > 0){
            return next(new Error('Pronoun already exists.'));
          }
          next();
        });
      }
      else{
        next();
      }
    }
    else{
      next(new Error('Pronoun is missing a grammatical argument.'));
    }
  } else if(this.pronounType === 'M') {
    if(this.title && this.content){
      next();
    }
    else{
      next(new Error('Pronoun must have content and a title.'));
    }
  } else {
    next(new Error('Pronoun must have a type.'));
  }
});
mongoose.model('Pronoun', PronounSchema);
