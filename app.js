const path = require('path')

const express = require('express')
const handlebars = require('express-handlebars')
const sassMiddleware = require('node-sass-middleware')

const routerShop = require('./routes/shop')

const app = express()

app.engine(
	'hbs',
	handlebars({
		layoutsDir: 'views/layout',
		defaultLayout: 'main',
		extname: 'hbs',
		partialsDir: 'views/includes'
	})
)

// sass
app.use(
	sassMiddleware({
		src: path.join(__dirname, 'public', 'sass'),
		dest: path.join(__dirname, 'public', 'css'),
		debug: false,
		outputStyle: 'compressed',
		response: false,
		error: err => console.log('[sassMiddleware][error]', err, '\n[sassMiddleware][file]', err.file, '\n[sassMiddleware][line]', err.line),
		prefix: '/css'
	})
)

app.set('view engine', 'hbs')
app.set('views', 'views')
app.use(express.static('public'))

app.use(routerShop)

app.use((req, res, next) => {
	// 404
	res.status(404).send('<h1>Sorry, 404 - Not Found</h1>')
})

app.use((err, req, res, next) => {
	// errors
	console.log('[app][error]', err)
	res.status(500).send('Error appeared!')
})

// stargin app
const PORT = 8080
app.listen(PORT)
console.log(`Server started on http://localhost:${PORT}`)