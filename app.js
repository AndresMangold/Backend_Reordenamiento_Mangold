const express = require('express');
const http = require('http');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo'); 
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { mongoUrl, sessionSecret, port } = require('./src/config/config');
const initializePassport = require('./src/config/passport.config');
const initializePassportGitHub = require('./src/config/passport-github.config');

const app = express();

app.engine('handlebars', handlebars.engine());
app.set('views', './src/views');
app.set('view engine', 'handlebars');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    store: MongoStore.create({ mongoUrl, ttl: 15 }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false
}));

initializePassport();
initializePassportGitHub();
app.use(passport.initialize());
app.use(passport.session());

// Routing
app.use('/api/cart', require('./src/routes/api/cart.router'));
app.use('/api/createProduct', require('./src/routes/api/createProduct.router'));
app.use('/api/products', require('./src/routes/api/products.router'));
app.use('/api/session', require('./src/routes/api/session.router'));
app.use('/', require('./src/routes/view.router'));

const server = http.createServer(app);

const main = async () => {
    try {
        await mongoose.connect(mongoUrl, { dbName: 'ecommerce' });
        server.listen(port, () => {
            console.log(`Servidor cargado en http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
};

main();
