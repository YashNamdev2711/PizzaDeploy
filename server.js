require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const expressLayout = require("express-ejs-layouts");
const PORT = process.env.PORT || 3000;
const session = require("express-session");
const mongoose = require("mongoose");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo")(session);
const passport = require('passport')
const Emitter = require('events')

//Database connection
const url = "mongodb://localhost/pizza";
mongoose.connect(process.env.MONGO_CONNECTION_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Connection failed");
  });

 

//session store
let mongoStore = new MongoDbStore({
  mongooseConnection: connection,
  collection: "sessions",
});

// Event emitter 
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)


//session config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, //time is of 24hours
    // cookie:{maxAge: 1000*15 } //time is of 24hours
  })
);
//passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash());

//Assets
app.use(express.static("public"));
app.use(express.urlencoded({ extended :false}))
app.use(express.json())

 

//global middleware
app.use((req, res, next) => {
  res.locals.session = req.session
   res.locals.user = req.user
  next();
});

// set template engine
app.use(expressLayout);
app.use(express.json());
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");


//routes initialization
require("./routes/web")(app);
app.use((req,res)=>{
  res.status(404).render('errors/404')
})

const server = app.listen(PORT, () => {
  console.log("listening on port 3000");
  // console.log(" remove .example from  when copy from github.env.example ");
});


//socket

const io = require('socket.io')(server)
io.on('connection', (socket) => {
      // Join  
      // console.log(socket.id);
      socket.on('join', (orderId) => {
        socket.join(orderId)
      })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})
 