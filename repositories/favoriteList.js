const mongoose = require('mongoose')
const Schema = mongoose.Schema
const modelHelpers = require('./modelHelpers.js')

const restaurantSchema = require('./restaurant').schema

const favoriteListSchema = new Schema()
favoriteListSchema.add({
  name: String,
  owner: {
    id: String,
    email: String,
    name: String
  },
  restaurants: [restaurantSchema]
})

favoriteListSchema.methods.toJSON = function () {
  const obj = modelHelpers.toJSON.call(this)

  for (restaurant of obj.restaurants) {
    restaurant.id = restaurant._id.toString()
    delete restaurant._id

    if (restaurant.location) {
      restaurant.location.id = restaurant.location._id.toString()
      delete restaurant.location._id
    }
  }

  return obj
}

const FavoriteList = mongoose.model('FavoriteList', favoriteListSchema)

exports.schema = favoriteListSchema
exports.model = FavoriteList
