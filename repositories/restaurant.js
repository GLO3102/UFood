const mongoose = require('mongoose')
const modelHelpers = require('./modelHelpers.js')

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point']
  },
  coordinates: {
    type: [Number]
  }
})

const restaurantSchema = new mongoose.Schema()
restaurantSchema.add({
  name: String,
  place_id: String,
  address: String,
  tel: String,
  location: {
    type: pointSchema,
    index: '2dsphere'
  },
  opening_hours: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String
  },
  pictures: [String],
  genres: [String],
  price_range: Number,
  rating: Number
})

restaurantSchema.methods.toDTO = function () {
  const dto = this.toJSON()

  delete dto.location._id

  return dto
}

restaurantSchema.method('toJSON', modelHelpers.toJSON)

const Restaurant = mongoose.model('Restaurant', restaurantSchema)

exports.schema = restaurantSchema
exports.model = Restaurant
