const mongoose = require('mongoose')
const app = require('./app')

const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost/ufood'

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const port = process.env.PORT || 3000

app.listen(port)
