exports.toJSON = function () {
  const obj = this.toObject()

  obj.id = obj._id.toString()
  delete obj._id
  delete obj.__v
  delete obj.password

  return obj
}
