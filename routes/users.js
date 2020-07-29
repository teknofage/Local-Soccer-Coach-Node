var express = require('express');
var router = express.Router();
const ObjectID = require('mongodb').ObjectID;
const Transloadit = require('transloadit');
const multer = require('multer');
const upload = multer({dest:'uploads/'}).single("demo_image");
require('dotenv').config()

// Configure user account profile edit
// --------------------------------------------------
router.get('/', function(req, res, next) {
  if (!req.isAuthenticated()) { 
    res.redirect('/auth/login');
  }
  const users = req.app.locals.users;
  const _id = ObjectID(req.session.passport.user);

  users.findOne({ _id }, (err, results) => {
    if (err) {
      throw err;
    }

    res.render('account', { ...results });
  });
});
// --------------------------------------------------


// Get public profile for any user
// --------------------------------------------------
router.get('/:username', (req, res, next) => {
  const users = req.app.locals.users;
  const username = req.params.username;

  users.findOne({ username }, (err, results) => {
    if (err || !results) {
      res.render('public-profile', { messages: { error: ['User not found'] } });
    }

    res.render('public-profile', { ...results, username });
  });
})
// --------------------------------------------------


// Handle updating user profile data
// --------------------------------------------------
router.post('/', (req, res, next) => {
    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
    console.log(req.files)
  if (!req.isAuthenticated()) {
    res.redirect('/auth/login');
  }
//   console.log(req)
    upload(req, res, (err) => {
        if(err) {
        res.status(400).send("Something went wrong!");
        }
        res.send(req.files.profilepicture);
        // res.send(req.body);
    });
        // console.log({result})

   
  
    // return res.status(400).send('No files were selected')
  


  const users = req.app.locals.users;
  const { name, role, sport, biography, profilepicture, resume, email, phone } = req.body;
  const _id = ObjectID(req.session.passport.user);

// });
    // If no error make a post that includes the path to the file.
    // users.updateOne({ _id }, { $set: { name, role, sport, biography, profilePhotoPath:tempfilePath, resumePath:resfilePath, email, phone } }, (err) => {
    //     if (err) {
    //       throw err;
    //     }
        
    //     res.redirect('/users');
    //   });
  });
// });
// --------------------------------------------------

module.exports = router;
