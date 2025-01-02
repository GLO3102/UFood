export const getHome = (req, res) => {
  res.status(200).send('Welcome to UFood API.')
}

export const getStatus = (req, res) => {
  res.status(200).send({
    status: 'UP'
  })
}
