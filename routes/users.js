var express = require('express');
var router = express.Router();
const ObjectID = require('mongodb').ObjectID;


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
  if (!req.isAuthenticated()) {
    res.redirect('/auth/login');
  }

  const users = req.app.locals.users;
  const { name, role, sport, biography, profilepicture, resume, email, phone } = req.body;
  const _id = ObjectID(req.session.passport.user);

//   profile photo file
  const body = req.body;
  // Get the image data from the req.body
  const picimageFile = req.files.image;
  // Split the name on the .
  const picfileNameArray = picimageFile.name.split('.');
  // get the file extension
  const picfileExtsion = picfileNameArray[picfileNameArray.length - 1];
  // generate a short id with the same file extension
  const picfilePath = `/${shortid.generate()}.${picfileExtsion}`;
  // Define the upload path
  const picuploadPath = `./uploads/${picfilePath}`;

//   resume file
// const body = req.body;
// Get the image data from the req.body
const resimageFile = req.files.image;
// Split the name on the .
const resfileNameArray = resimageFile.name.split('.');
// get the file extension
const resfileExtsion = resfileNameArray[resfileNameArray.length - 1];
// generate a short id with the same file extension
const resfilePath = `/${shortid.generate()}.${resfileExtsion}`;
// Define the upload path
const resuploadPath = `./uploads/${resfilePath}`;

  // Move the uploaded file to the upload path this "saves" the file.
  // This should move the file to the uploads directory
  imageFile.mv(uploadPath, (err) => {
    // Check for errors
    if (err) {
      console.log(err);
      return res.status(500)
    }
    // If no error make a post that includes the path to the file.
    users.updateOne({ _id }, { $set: { name, role, sport, biography, profilePhotoPath:picfilePath, resumePath:resfilePath, email, phone } }, (err) => {
        if (err) {
          throw err;
        }
        
        res.redirect('/users');
      });
  });

});
// --------------------------------------------------

module.exports = router;
