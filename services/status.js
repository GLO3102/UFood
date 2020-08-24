exports.getHome = (req, res) => {
  res.status(200).send('Welcome to UFood API.')
}

exports.getStatus = (req, res) => {
  res.status(200).send({
    status: 'UP'
  })
}
