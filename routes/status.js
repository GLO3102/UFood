exports.getHome = (req, res) => {
  res.status(200).send('Welcome to UFood! API is up.')
}

exports.getStatus = (req, res) => {
  res.status(200).send({
    status: 'online'
  })
}
