import mongoose from 'mongoose'
import { toJSON } from './modelHelpers.js'
import { schema as restaurantSchema } from './restaurant.js'

const favoriteListSchema = new mongoose.Schema()
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
  const obj = toJSON.call(this)

  obj.restaurants = obj.restaurants.map(r => {
    return { id: r._id }
  })

  return obj
}

const FavoriteList = mongoose.model('FavoriteList', favoriteListSchema)

export { favoriteListSchema as schema, FavoriteList }
