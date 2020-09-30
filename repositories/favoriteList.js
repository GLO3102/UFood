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

  obj.restaurants = obj.restaurants.map(r => {
    return { id: r._id }
  })

  return obj
}

const FavoriteList = mongoose.model('FavoriteList', favoriteListSchema)

exports.schema = favoriteListSchema
exports.model = FavoriteList
