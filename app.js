const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const hbs = require('express-handlebars')
const app = express();
const fileUpload = require('express-fileUpload')

// //env
// require("dotenv").config()
// console.log(process.env.AUTH_TOKEN);
//if need here u can use this
//data base connection
const db = require('./config/connection')
//sessition
const session = require('express-session');
const { log } = require('console');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials'
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())

//sesstion usiing
app.use(session({ secret: "MTK", resave: true, saveUninitialized: true, cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } }));// sesstion for 30days seted
app.use((req, res, next) => {
  res.set('cache-control', 'no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0')
  next();
});
//data connection call
db.connect((err) => {
  if (err)
    console.log("Connection error" + err);
  else
    console.log("Datebase Connected to port 27017")
})


app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
