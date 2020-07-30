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
  if (!req.isAuthenticated()) {
    res.redirect('/auth/login');
  }
  const users = req.app.locals.users;
  const { name, role, sport, biography, profilepicture, resume, email, phone } = req.body;
  const _id = ObjectID(req.session.passport.user);
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
    
    let profilepicture = req.files.profilepicture
    let resume = req.files.resume

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
            console.log(err)
            res.redirect('/users')

        } else {
            console.log('success')
            const obj = { name, role, sport, biography, email, phone }
            // response redirect to display file needed here
          
            if (profilepicture) {
                obj.profilepicture = result['uploads'][0]["ssl_url"]
                if (resume) {
                    obj.resume = result['uploads'][1]["ssl_url"]
                }
            } else if (resume) {
                obj.resume = result['uploads'][0]["ssl_url"]
            }
            
            // If no error make a post that includes the path to the file.
            users.updateOne({ _id }, { $set: obj }, (err) => {
                if (err) {
                throw err;
                }
                
                res.redirect('/users');
            });
        }
        
        
    })
  
  } else {
    const { name, role, sport, biography, email, phone } = req.body;
    users.updateOne({ _id }, { $set: { name, role, sport, biography, email, phone } }, (err) => {
        if (err) {
            throw err;
        }
        
        res.redirect('/users');
    });

  }



  });


module.exports = router;
