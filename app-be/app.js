const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const session = require('express-session');

/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();

// Create the Express application
var app = express();

// After you declare "app"
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'bla bla bla' 
}));

// Configures the database and opens a global connection that can be used in any module with `mongoose.connection`
require('./config/database');

// Must first load the models
require('./models/user');

// This will initialize the passport object on every request
app.use(passport.initialize());
app.use(passport.session());

// Pass the global passport object into the configuration function
require('./config/passport')(passport, app);

// Instead of using body-parser middleware, use the new Express implementation of the same thing
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Allows our Angular application to make HTTP requests to Express application
app.use(cors());

app.use((request, response, next) => {

  const requestStart = Date.now();

  let errorMessage = null;
  let body = [];
  request.on("data", chunk => {
      body.push(chunk);
  });
  request.on("end", () => {
      body = Buffer.concat(body).toString();
  });
  request.on("error", error => {
      errorMessage = error.message;
  });

  response.on("finish", () => {
      const { rawHeaders, httpVersion, method, socket, url } = request;
      const { remoteAddress, remoteFamily, _peername } = socket;

      const { statusCode, statusMessage } = response;
      const headers = response.getHeaders();

      console.log({
          timestamp: Date.now(),
          processingTime: Date.now() - requestStart,
          rawHeaders,
          body,
          errorMessage,
          httpVersion,
          method,
          remoteAddress,
          remoteFamily,
          url,
          response: {
              statusCode,
              statusMessage,
              headers,
              _peername
          }
      }
      );
  });

  next();
});

/**
 * -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
app.use("/api", require('./routes')); 

// Where Angular builds to - In the ./angular/angular.json file, you will find this configuration
// at the property: projects.angular.architect.build.options.outputPath
// When you run `ng build`, the output will go to the ./public directory
// app.use(express.static(path.join(__dirname, 'public')));

// app.get('*', function(req, res) {
//   res.sendFile(path.join(path.join(__dirname, '../app-fe/dist'), 'index.html'));
// });

app.use(express.static(path.join(__dirname, '../app-fe/dist')));

app.get('*', function(req, res) {
  res.sendFile(path.join(path.join(__dirname, '../app-fe/dist'), 'index.html'));
});
/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000

app.listen(3000, () => {
  console.log("server started");
});
