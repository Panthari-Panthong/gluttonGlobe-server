const mongoose = require("mongoose");

const Place = require("../models/Place.Model");

const data = require("../data.json");

require("../db/index");

const insertData = async () => {
  try {
    let insertedPlaces = await Place.insertMany(data);
    console.log(insertedPlaces);
  } catch (error) {
    mongoose.connection.close();
    console.log("ERROR", error);
  } finally {
    mongoose.connection.close();
  }
};

insertData();
