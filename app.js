const express = require('express')
const app = express();
const routerHome = require('./routes/home')
const routerApps = require('./routes/apps')
const routerUsers = require('./routes/users')
const routerStatistic = require('./routes/statistics')
const routerProduts = require('./routes/products')
const morgan = require('morgan')

app.use(express.json());
app.use(express.urlencoded({ extends: true }));
app.use(morgan('dev'));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Header',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'

    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET')
        return res.status(200).send({})
    }
    next()
})

const api = process.env.API_URL

app.use(`/${api}/`, routerHome)

app.use(`/${api}/apps`, routerApps)

app.use(`/${api}/users`, routerUsers)

app.use(`/${api}/statistics`, routerStatistic)

app.use(`/${api}/products`, routerProduts)

app.use((req, res, next) => {
    const error = new Error('Not found')
    error.status = 404
    next(error);

})

app.use((Error, req, res, next) => {
    res.status(Error.status || 500);
    return res.send({
        error: {
            msg: Error.message
        }
    });



})
module.exports = app;