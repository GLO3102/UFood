const mongoose = require('mongoose')
const modelHelpers = require('./modelHelpers.js')

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
    restaurant_id: obj.restaurant_id,
    comment: obj.comment,
    rating: obj.rating,
    date: obj.date
  }

  return dto
}

visitSchema.method('toJSON', modelHelpers.toJSON)

const Visit = mongoose.model('Visit', visitSchema)

exports.schema = visitSchema
exports.model = Visit
