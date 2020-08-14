const mongoose = require('mongoose')
const modelHelpers = require('./modelHelpers.js')

const restaurantSchema = new mongoose.Schema()
restaurantSchema.add({
  name: String,
  id: String,
  address: String,
  tel: String,
  position: {
    lon: Number,
    lat: Number
  },
  opening_hours: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String,
  },
  pictures: [],
  genres: [],
  price_range: Number,
  rating: Number
})

restaurantSchema.method('toJSON', modelHelpers.toJSON)

const Restaurant = mongoose.model('Restaurant', restaurantSchema)

exports.schema = restaurantSchema
exports.model = Restaurant
