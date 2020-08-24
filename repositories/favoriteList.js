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

restaurantSchema.method('toJSON', modelHelpers.toJSON)

const FavoriteList = mongoose.model('FavoriteList', favoriteListSchema)

exports.schema = favoriteListSchema
exports.model = FavoriteList
