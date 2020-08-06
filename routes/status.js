exports.getHome = function(req, res) {
  res.status(200).send('Welcome to UBeat API.')
}

exports.getStatus = function(req, res) {
  res.status(200).send({
    status: 'online'
  })
}
