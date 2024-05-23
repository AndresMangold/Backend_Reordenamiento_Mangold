const express = require('express');
const http = require('http');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo'); 
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { DEFAULT_MAX_AGE } = require('./constants')

const ProductManager = require('./dao/dbManagers/productManager');
const CartManager = require('./dao/dbManagers/CartManager');
const { dbName, mongoUrl } = require('./dbConfig');

const createProductRouter = require('./routes/createProduct.router');
const productsRouter = require('./routes/products.router');
const cartRouter = require('./routes/cart.router');
const sessionRouter = require('./routes/session.router'); 

const initializePassport = require('./config/passport.config');
const initializePassportGitHub = require('./config/passport-github.config');

const app = express();

app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');


app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(`${__dirname}/../public`));
app.use(express.static('public'));

app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL || "mongodb+srv://andresmangold:andresPass@cluster0.hrz9nqj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        ttl: 60 * 60 
    }),
    secret: process.env.SESSION_SECRET || "adminCod3r123",
    resave: false,
    saveUninitialized: false,
    maxAge: DEFAULT_MAX_AGE
}));

initializePassport();
initializePassportGitHub();
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

app.use('/api', sessionRouter);
app.use('/api/createProduct', createProductRouter);
app.use('/api/products', productsRouter); 
app.use('/api/cart', cartRouter);
app.use('/', require('./routes/views.router'));
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

app.set('productManager', new ProductManager());
app.set('cartManager', new CartManager());

const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

const main = async () => {
    try {
        await mongoose.connect(mongoUrl, { dbName: dbName });
        server.listen(PORT, () => {
            console.log('Servidor cargado!');
            console.log(`http://localhost:${PORT}/api/products`);
        });
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
};

main();
