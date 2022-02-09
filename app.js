const express = require("express")
const path = require('path')
const config = require("config")
const mongoose = require("mongoose")

const app = express() // старт сервера

app.use(express.json({extended: true}))

app.use('/api/auth', require('./routes/auth.routes')) // подключение роутера авторизации

app.use('/api/link', require('./routes/link.router')) // роутер ссылок

app.use('/t', require('./routes/redirect.routes')) // редирект.

if (process.env.NODE_ENV === "production") {
  app.use('/', express.static(path.join(__dirname, 'client', 'build')))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

const PORT = config.get('port') || 5002 // если порт не определен, то порт будет 3000, иначе то, что указано в default.json

async function start() {
  try {
    await mongoose.connect(config.get('mongoURI'), { // подключение к mongodb
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`)) // сервер начал прослушку подключений и информирует нас соотв. колбэком

  } catch (e) {
    console.log('DB server error.', e.message)
    process.exit(1)
  }
}

start()




