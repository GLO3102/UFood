exports.toJSON = function() {
  const obj = this.toObject()

  obj.id = obj._id
  delete obj._id
  delete obj.__v
  delete obj.password

  return obj
}
