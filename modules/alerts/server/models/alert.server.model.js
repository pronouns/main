'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = mongoose.Types.ObjectId;

var userKey = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  key: {
    type: Schema.Types.ObjectId,
    default: function () { return new ObjectId(); }
  }
});

/**
 * Alert Schema
 */
var AlertSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  link: {
    type: String,
    required: 'Alert requires link.'
  },
  type: {
    type: String,
    enum: ['pronoun', 'system'],
    required: 'Alert requires type.'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  targetUsers: [userKey],
  viewedUsers: [userKey]
});

AlertSchema.methods.linkForUser = function(user){
  //console.log(user);
  //console.log(this.targetUsers);
  for(var i = 0; i < this.targetUsers.length; i++){
    if(this.targetUsers[i].user === user._id){
      return 'api/alerts/open/' + this._id + '/' + this.targetUsers[i].key;
    }
  }
  for(i = 0; i < this.viewedUsers.length; i++){
    if(this.viewedUsers[i].user === user._id){
      return 'api/alerts/open/' + this._id + '/' + this.viewedUsers[i].key;
    }
  }
  return false;
};
AlertSchema.methods.markViewed = function (key) {
  for(var i = 0; i < this.targetUsers.length; i++){
    if(String(this.targetUsers[i].key) === String(key)){
      var user = this.targetUsers[i].user;
      this.viewedUsers.push(this.targetUsers[i]);
      this.targetUsers.splice(i, 1);
      return user;
    }
  }
  return false;
};
AlertSchema.methods.checkUsedKey = function(key){
  for(var i = 0; i < this.viewedUsers.length; i++){
    if(String(this.viewedUsers[i].key) === String(key)){
      return this.viewedUsers[i].user;
    }
  }
  return false;
};
AlertSchema.methods.isComplete = function () {
  return this.targetUsers.length === 0;
};
mongoose.model('Alert', AlertSchema);
