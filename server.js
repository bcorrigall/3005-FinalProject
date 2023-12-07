// --------------------- Import Required Modules --------------
const fs = require('fs'); // file system module to check if a file exists
const path = require('path'); // path module to handle file paths
const express = require('express');
const session = require('express-session');
const logger = require('morgan');
const csv = require('fast-csv');
const http = require('http'); 
const bodyParser = require('body-parser');
const db = require('./server/dbConnect.js'); // database connection
const { verifyUser, registerUser, getAll, getAllWithID, getMembersInClass, getAllWithIDAsync } = require('./server/queries.js');

// ------------- Initialize Express app and Port --------------
const app = express();
const PORT = 3000;
// ----------------------- Start the Server -----------------------
const server = http.createServer(app); // create an HTTP server with Express app
server.timeout = 10000;

// ---------------------- View Engine Setup ---------------------
app.set("view engine", "pug"); // sets pug as the view engine, templates will be .pug files
app.set('views', './views');   // sets the path to the directory containing the pug files

// --------------------- Middleware Setup ----------------

// session middleware
app.use(session({ 
  secret: 'top secret key',
  resave: true,
  saveUninitialized: false
}));

// authorization middleware
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.session.userRole === role) {
      next();
    } else {
      res.status(403).send("Forbidden"); // user does not have required role
    }
  };
};

// logging middleware
app.use(logger((tokens, req, res) => {
  return [
    `METHOD: ${tokens.method(req, res)}`,
    `FILEPATH: ${tokens.url(req, res)}`,
    `STATUS: ${tokens.status(req, res)}`,    
  ].join(' || ');
}));

// parsing json middleware
app.use(express.json());              //<--- we currently do not send any json files, not sure we will be sending in the future. i dont think we will need this

// Use bodyParser to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

function getValue(err, result) {
  if (err) {
    console.error("Error:", err);
    return;
  }
  console.log(result);
}

// ---------------------- Static File Setup ---------------------
// serves static files from the public folder (css, images)
app.use(express.static("public"));

// --------------------------- Routes ---------------------------

// landing Page Route
app.get("/", async (req, res) =>{
  res.render("./home", { session: req.session });
});

// members page route
app.get("/members", requireRole('admins'), async (req, res) => {
  const { member_id } = req.params;
  try {
    console.log(req.session.userRole);
    getAll(db, 'Members', (err, result) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Result:', result);
        res.render('members', { session: req.session, result });
      }
    });

  } catch (err) {  
    if (err.code === 'ENOENT') {                  //<--- ENOENT is the error code for "File Not Found" returned by res.render                  
      res.status(404).send("Template not found");
    } else{
      res.status(500).send("Internal Server Error");
    }
  }
});


// members page route
app.get("/members/:member_id", async (req, res) => {
  const { member_id } = req.params;
  try {
    let member = await getAllWithIDAsync(db, 'Members', 'm_id', member_id);
    let goals = await getAllWithIDAsync(db, 'Goals', 'm_id', member_id);
    let exercises = await getAllWithIDAsync(db, 'Exercises', 'm_id', member_id);
    let sessions = await getAllWithIDAsync(db, 'Sessions', 'm_id', member_id);
    let complaints = await getAllWithIDAsync(db, 'Complaints', 'm_id', member_id);
    let payments = await getAllWithIDAsync(db, 'Payments', 'm_id', member_id);
    let loyalty = await getAllWithIDAsync(db, 'Loyalty', 'm_id', member_id);

    let data = {
      member: member,
      goals: goals,
      exercises: exercises,
      sessions: sessions,
      complaints: complaints,
      payments: payments,
      loyalty: loyalty
    };
    console.log(data);

    res.render('member', { session: req.session, data });
  } catch (err) {  
    if (err.code === 'ENOENT') {                  //<--- ENOENT is the error code for "File Not Found" returned by res.render                  
      res.status(404).send("Template not found");
    } else{
      res.status(500).send("Internal Server Error");
    }
  }
});

app.post('/submit', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const userType = req.body.userChoice;
  const loginType = req.body.loginChoice;

  if (loginType === 'logout') {
    req.session.destroy((err) => {
        if (err) {console.error("Error destroying session:", err);}
        res.redirect("/");
    });
  } else if (loginType === 'login') {
    verifyUser(db, userType, username, password, (err, result) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Result:', result);
        if (result.length === 0) {
          console.log("incorrect password");
        } else{
          if ( userType === "members") {
            req.session.userID = result[0].m_id;
          } else if ( userType === "trainers") { 
            req.session.userID = result[0].t_id;
          } else if ( userType === "admins") { 
            req.session.userID = result[0].a_id;
          }
          req.session.userRole = userType;
          res.redirect("/"+userType+"/"+req.session.userID);
        }
      }
    });
  } else if (loginType === 'register') {
    registerUser(db, userType, username, password, (err, result) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Result:', result);
      }
    });
  }
});

//==================================================================================================
//=======================================TESTING====================================================
//==================================================================================================


//==================================================================================================
//=======================================TESTING END================================================
//==================================================================================================


// ----------------------- Start the Server -----------------------
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});