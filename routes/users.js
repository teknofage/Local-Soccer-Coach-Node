var express = require('express');
var router = express.Router();
const ObjectID = require('mongodb').ObjectID;
const Transloadit = require('transloadit')
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
  if (req.files) {

    const transloadit = new Transloadit({
        authKey: process.env.authKey,
        authSecret: process.env.authSecret
    })
    
    // Set Encoding Instructions
    const options = {
        params: {
            template_id: process.env.templateId,
        }
    }
    


    // Add files to upload
    // check which files have been added and whether there are 1 or 2 files, check file inputs
    // if the form element has a file, upload it, otherwise don't do anything.
    // What are these arguments? (filename? path?)
    console.log("*******************************************")
    console.log(req.files.profilepicture)
    console.log(req.files.resume)
    const profilepicture = req.files.profilepicture
    const resume = req.files.resume
    // if there is a picture:
    if(profilepicture) {
        transloadit.addFile(profilepicture.name, profilepicture.tempFilePath)
    }
    // if there is a pdf:
    if(resume) {
        transloadit.addFile(resume.name, resume.tempFilePath)
    }
    // Start the Assembly
    transloadit.createAssembly(options, (err, result) => {
    if (err) {
        console.log({ err })
        console.log('fail')
        } else {
        console.log('success')
        }
        console.log({ result })
    })
  
    // return res.status(400).send('No files were selected')
  }


  const users = req.app.locals.users;
  const { name, role, sport, biography, profilepicture, resume, email, phone } = req.body;
  const _id = ObjectID(req.session.passport.user);

 
//   profile photo file
//   const body = req.body;
  // Get the image data from the req.body
//   const picimageFile = req.files.profilepicture;
//   // Split the name on the .
//   const picfileNameArray = picimageFile.name.split('.');
//   // get the file extension
//   const picfileExtsion = picfileNameArray[picfileNameArray.length - 1];
//   // generate a short id with the same file extension
//   const picfilePath = `/${shortid.generate()}.${picfileExtsion}`;
//   // Define the upload path
//   const picuploadPath = `./uploads/${picfilePath}`;

// //   resume file
// // const body = req.body;
// // Get the image data from the req.body
// const resimageFile = req.files.resume;
// // Split the name on the .
// const resfileNameArray = resimageFile.name.split('.');
// // get the file extension
// const resfileExtsion = resfileNameArray[resfileNameArray.length - 1];
// // generate a short id with the same file extension
// const resfilePath = `/${shortid.generate()}.${resfileExtsion}`;
// // Define the upload path
// const resuploadPath = `./uploads/${resfilePath}`;

  // Move the uploaded file to the upload path this "saves" the file.
  // This should move the file to the uploads directory
//   picimageFile.mv(picuploadPath, (err) => {
//     // Check for errors
//     if (err) {
//       console.log(err);
//       return res.status(500)
//     }
//     resimageFile.mv(resuploadPath, (err) => {
//         // Check for errors
//         if (err) {
//             console.log(err);
//             return res.status(500)
//         }


// });
    // If no error make a post that includes the path to the file.
    users.updateOne({ _id }, { $set: { name, role, sport, biography, profilepicture, resume, email, phone } }, (err) => {
        if (err) {
          throw err;
        }
        
        res.redirect('/users');
      });
  });
// });
// --------------------------------------------------

module.exports = router;
