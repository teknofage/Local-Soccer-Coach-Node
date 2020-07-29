var express = require('express');
var router = express.Router();
const ObjectID = require('mongodb').ObjectID;
const Transloadit = require('transloadit')
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config()
const FILE_PATH = 'uploads';
const upload = multer({
    dest: `${FILE_PATH}/`
});

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
        waitForCompletion: true,
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
    // console.log(profilepicture.path)

    // if there is a picture:
    if(profilepicture) {
        console.log(profilepicture.name, profilepicture.tempFilePath)
        transloadit.addFile(profilepicture.name, profilepicture.tempFilePath)
    }
    // if there is a pdf:
    if(resume) {
        transloadit.addFile(resume.name, resume.tempFilePath)
    }
    // Start the Assembly
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++')
    transloadit.createAssembly(options, (err, result) => {
        if (err) {
            console.log({ err })
            console.log('fail')
            // response redirect to upload failure

        } else {
            console.log('success')
            console.log({ result })
            console.log(result['uploads'][0]["ssl_url"])
            // response redirect to display file needed here
            const users = req.app.locals.users;
            const { name, role, sport, biography, _, __, email, phone } = req.body;
            const _id = ObjectID(req.session.passport.user);
            const profilepicture = result['uploads'][0]["ssl_url"]
            const resume = result['uploads'][1]["ssl_url"]
          
          
              // If no error make a post that includes the path to the file.
              users.updateOne({ _id }, { $set: { name, role, sport, biography, profilepicture, resume, email, phone } }, (err) => {
                  if (err) {
                    throw err;
                  }
                  
                  res.redirect('/users');
                });
        }
        
    })
  
  }



  });
// });
// --------------------------------------------------
// // allow users to upload SINGLE profile image
// router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
//     try {
//         const avatar = req.file;

//         // make sure file is available
//         if (!avatar) {
//             res.status(400).send({
//                 status: false,
//                 data: 'No file is selected.'
//             });
//         } else {
//             // send response
//             res.send({
//                 status: true,
//                 message: 'File is uploaded.',
//                 data: {
//                     name: avatar.originalname,
//                     mimetype: avatar.mimetype,
//                     size: avatar.size
//                 }
//             });
//         }

//     } catch (err) {
//         res.status(500).send(err);
//     }
// });

// // allow users to upload MULTIPLE images
// router.post('/upload-photos', upload.array('photos', 8), async (req, res) => {
//     try {
//         const photos = req.files;

//         // check if photos are available
//         if (!photos) {
//             res.status(400).send({
//                 status: false,
//                 data: 'No photo is selected.'
//             });
//         } else {
//             let data = [];

//             // iterate over all photos
//             photos.map(p => data.push({
//                 name: p.originalname,
//                 mimetype: p.mimetype,
//                 size: p.size
//             }));

//             // send response
//             res.send({
//                 status: true,
//                 message: 'Photos are uploaded.',
//                 data: data
//             });
//         }

//     } catch (err) {
//         res.status(500).send(err);
//     }
// });

module.exports = router;
