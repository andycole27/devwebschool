const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
var app = express();
var session = require('express-session');
const bodyParser = require('body-parser');

//require('./models/mongodb');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const csrf = require('csurf');
const resultController = require('./controllers/result');
//const exphb = require('ejs');
//const studentController = require('./controllers/studentController');
const adminStudentController = require('./controllers/adminStudentController');
const adminEmployeeController = require('./controllers/adminEmployeeController');
const adminGradeController = require('./controllers/adminGradeController');
//const csrfProtection = csrf();

const errorController = require('./controllers/error');
//  //local imports
const isAuth = require('./middleware/is-auth');

const User = require('./models/user');
const multer = require('multer');
app.post('/create-exam', isAuth, resultController.postExam);
//  const studentController = require('./controllers/studentController');
//Import the necessary libraries

const MONGODB_URI = 'mongodb://localhost:27017/student?connectTimeoutMS=10';
 const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
   store:store
  })
 );
 const csrfProtection = csrf();
//  app.get('/500', errorController.get500);
//  app.use(errorController.get404);
//const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {cb(null, 'images'); },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

 


//const auth = require('./controllers/auth');
//const isAuth = require('./middleware/is-auth');
//routes
const authRoutes = require('./routes/auth');
const resultRoutes = require('./routes/result');

//var studentRoutes = require('./routes/studentRoutes');
//middleware to return req to json.
app.use(bodyParser.urlencoded({extended: true}));
app.use( multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

//app.use(bodyParser.json());
//imports the student controller
app.post('/create-exam', isAuth, resultController.postExam);
//app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});
 app.use(csrfProtection);
app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});
// app.get('/500', errorController.get500);
// app.use(errorController.get404);
app.use((req, res, next) => {
   //res.locals.isAuthenticated = req.session.isLoggedIn;
   res.locals.csrfToken = req.csrfToken();
   next();
 });
// app.use(( req, res, next) => {
//  res.status(error.httpStatusCode).render(...);
//  res.redirect('/500');
//   res.status(500).render('500', {
//     viewTitle: 'Error!',
//     path: '/500',
//     isAuthenticated: req.session.isLoggedIn
//   });
//  });

app.use('/result',resultRoutes);
app.use(authRoutes);

  app.use(bodyParser.json());
//Routing
app.use(express.static('views/admin/employee'));
app.use(express.static('views/employee'));
app.use(express.static('views/student'));
app.use(express.static('views/admin'));
app.use(express.static('views/auth'));
app.use(express.static('views/result'));
app.use(express.static('views/404'));
app.use('http://localhost:3000/images', express.static(path.join(__dirname, 'images')));
//Configuring Express middleware for the handlebars
app.set('views', path.join(__dirname, '/views/'));


app.set('view engine', 'ejs');
//Establish the server connection

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 27017;
mongoose
  .connect(MONGODB_URI,{ useUnifiedTopology: true },(err) => {
    if (!err) {
    console.log('Successfully Established Connection with MongoDB')//sucess message
    }
    else {
    console.log('Failed to Establish Connection with MongoDB with Error: '+ err)//unsucessful message
    }
  })
  .then(result => {
    app.listen(3000, () => console.log(`Listening on port ${port}..`));
  })
  .catch(err => {
    console.log(err);
  });

// app.listen(3000, () => console.log(`Listening on port ${port}..`));

//app.use('/students', studentRoutes);
//app.use(404);
//app.use('/auth', authRoutes);
 //app.use('/student', studentController);
 app.use('/admin', adminStudentController);
 app.use('/admin', adminEmployeeController);
 app.use('/employee', adminEmployeeController);
 app.use('/admin', adminGradeController);
//app.use(csrf);
// mongoose
//   .connect(MONGODB_URI)
//   .then(result => {
//     app.listen(8080);
//   })
//   .catch(err => {
//     console.log(err);
//   });