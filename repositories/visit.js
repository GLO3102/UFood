import mongoose from 'mongoose'
import { toJSON } from './modelHelpers.js'

const visitSchema = new mongoose.Schema()
visitSchema.add({
  restaurant_id: String,
  user_id: String,
  comment: String,
  rating: Number,
  date: Date
})

visitSchema.methods.toDTO = function () {
  const obj = this.toJSON()

  const dto = {
    id: obj.id.toString(),
    user_id: obj.user_id,
    restaurant_id: obj.restaurant_id,
    comment: obj.comment,
    rating: obj.rating,
    date: obj.date
  }

  return dto
}

visitSchema.method('toJSON', toJSON)

const Visit = mongoose.model('Visit', visitSchema)

export { visitSchema as schema, Visit }
