const mongoose = require('mongoose')

module.exports = async () => {
  const mongoUri = process.env.TEST_DATABASE_URL || 'mongodb://localhost/ufood-test'

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
}
