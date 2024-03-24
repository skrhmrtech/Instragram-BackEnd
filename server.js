require('dotenv').config();
const express = require('express');

const { PORT } = require('./config');
const routes = require('./routes');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const morgan = require('morgan');

const cors=require('cors');

const app = express();

sequelize.sync({ force: false })
    .then(() => console.log("DB connected"))
    .catch((error) => console.log("------------------ DB connection error ------------------", error));

app.use(cors());
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(morgan('dev'));

app.use("/api/v1", routes);

app.all("*", function (req, res, next) {
    next(Error(`Invalid route ${req.method} ${req.url}`));
});

app.use(function (err, req, res, next) {
    console.log("err", err);
    return res.status(400).json({
        error: true,
        message: err.message || err.stack || "Something is wronging here"
    });
});

app.listen(PORT, () => {
    console.log(`Server is listening on server http://localhost:${PORT}`);
});