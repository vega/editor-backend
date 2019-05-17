const express = require('express')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const port = process.env.PORT
app.get('/', (req, res) => {
  res.send('Initialized backend server for vega/editor-backend')
})
app.listen(port, err => {
  if (err) {
    return console.error(err)
  }
  return console.log(`Server is listening on ${port}`)
})
