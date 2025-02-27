const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema
const PhotoSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  });
  
  const Photo = mongoose.model('Photo', PhotoSchema);
  
  module.exports = Photo;
  