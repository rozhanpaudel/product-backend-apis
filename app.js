const express = require('express')
const compression = require('compression')
const { default: helmet } = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

app.use(cors())
app.use(compression())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '100mb', type: 'application/json' }))
app.use(
  express.urlencoded({
    limit: '100mb',
    extended: true,
    parameterLimit: 50000
  })
)
app.use('/api/products', require("./controllers/product.controller"))
app.get('/health', (_, res) => {
  res.status(200).json({
    success: true,
    message: "Everything is working fine"
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

process.on('exit', () => {
  console.log('Shutting the system down')
  process.exit(0)
})

process.on('uncaughtException', (err) => {
  console.log('Something went wrong with error message ', err.message)
})
module.exports = app




