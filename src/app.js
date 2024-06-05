const express = require('express');
const http = require('http');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const methodOverride = require('method-override');
const { DEFAULT_MAX_AGE } = require('./constants');

const daoProducts = require('./dao/mongo/daoProducts');
const daoCarts = require('./dao/mongo/daoCarts');
const { dbName, mongoUrl } = require('./dbConfig');

const createProductRouter = require('./routes/createProduct.router');
const productsRouter = require('./routes/products.router');
const cartRouter = require('./routes/cart.router');
const sessionRouter = require('./routes/session.router');

const initializePassport = require('./config/passport.config');
const initializePassportGitHub = require('./config/passport-github.config');
const initializePassportJWT = require('./config/passport-jwt.config');

const app = express();

const hbs = exphbs.create({
    extname: '.handlebars',
    defaultLayout: 'main',
    layoutsDir: `${__dirname}/views/layouts`,
    partialsDir: `${__dirname}/views/partials`,
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/views`);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride('_method'));

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
    cookie: { maxAge: DEFAULT_MAX_AGE }
}));

initializePassport();
initializePassportGitHub();
initializePassportJWT();
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.redirect('/sessions/login');
});

app.use('/sessions', sessionRouter);
app.use('/api/createProduct', createProductRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);

app.use((req, res, next) => {
    res.status(404).send('Page Not Found');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.set('productManager', new daoProducts());
app.set('cartManager', new daoCarts());

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
