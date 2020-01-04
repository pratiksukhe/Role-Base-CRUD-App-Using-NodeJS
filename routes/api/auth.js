const express = require('express');
const router = express.Router();
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const key = require('../../setup/myurl');
const passport = require('passport');
//Importing Schema Person to register
const Person = require('../../models/Person');

// @type    POST
//@route    /api/auth/register
// @desc    route for registration of users
// @access  PUBLIC
router.post('/register', (req, res)=> {
    console.log(req.body);
    
    Person.findOne({ email: req.body.email }).then(person => {
        if(person) {
            return res
             .status(400)
             .json({ emailerror: "Email is already registered.." });
        } else  {
            const newPerson = new Person({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                role: req.body.role
            });

            //Encrypt password using bcrypt
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newPerson.password, salt, (err, hash) => {
               if (err) throw err;
                
                
                newPerson.password = hash;
                newPerson
                    .save()
                    .then(person => res.json(person))
                    .catch(err => console.log(err));
                });
            });
        }
    }).catch((error)=> console.log(error))
} )

// @type    POST
//@route    /api/auth/login
// @desc    route for login
// @access  PUBLIC
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    Person.findOne({ email }).then(person => {
        if(!person) {
            return res
                .status(404)
                .json({ emailerror: "User not found with this email" });
        }

        bcrypt
        .compare(password, person.password)
        .then(isCorrect => {
          if (isCorrect) {
            // res.json({ success: "User is able to login successfully" });
            //use payload and create token for user
            const payload = {
              id: person.id,
              name: person.name,
              email: person.email,
              role: person.role
            };
            jwt.sign(
              payload,
              key.secret,
              { expiresIn: 3600 },
              (err, token) => {
                res.json({
                  success: true,
                  token: "Bearer " + token,
                  
                 
                });
              }
            );
          } else {
            res.status(400).json({ passworderror: "Password is not correct" });
          }
        })
        .catch(err => console.log(err));

    }).catch(error => console.log(error))
})

// @type    GET
//@route    /api/auth/
// @desc    route for user/current profile
// @access  PRIVATE

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};    
    
    Person.findOne({_id: req.user.id})
      .then(person => {
        if (!person) {
          errors.noperson = 'There is no profile for this user';
          return res.status(404).json(errors);
        }
        
        res.json(person);
      })
      .catch(err => res.status(404).json(err));
  }
);


// @route   GET api/auth/all
// @desc    Get all person profiles base on role
// @access  Private
router.get('/all', passport.authenticate("jwt", { session: false }), (req, res) => {
  const errors = {};
  const role = req.user.role;
  //console.log(role);
  
  if (role == "QUEEN") {
    //IF ROLE IS QUEEN
    Person.find( {role: { $in:['QUEEN', 'MEN' , 'WOMEN'] }})
      .then(person => {
        if (!person) {
          errors.noperson = 'There are no person';
          return res.status(404).json(errors);
        }
        res.json(person) 
      }).catch(err => res.status(404).json({ person: 'There are no person' }))

  } else if(role == "KING") {
    //IF ROLE IS KING
    Person.find( {role: { $in:['QUEEN', 'MEN' , 'WOMEN', 'KING'] }})
      .then(person => {
        if (!person) {
          errors.noperson = 'There are no person';
          return res.status(404).json(errors);
        }
        res.json(person) 
      }).catch(err => res.status(404).json({ person: 'There are no person' }))

  } else if (role == "MEN") {

    //IF ROLE IS MEN
    Person.find( {role: { $in:['MEN' , 'WOMEN'] }})
      .then(person => {
        if (!person) {
          errors.noperson = 'There are no person';
          return res.status(404).json(errors);
        }
        res.json(person) 
      }).catch(err => res.status(404).json({ person: 'There are no person' }))
    
  } else if (role == "WOMEN") {

    //IF ROLE IS WOMEN
    Person.find( {role: { $in:['MEN' , 'WOMEN'] }})
    .then(person => {
      if (!person) {
        errors.noperson = 'There are no person';
        return res.status(404).json(errors);
      }
      res.json(person) 
    }).catch(err => res.status(404).json({ person: 'There are no person' }))
    
  }
});


// @route   GET api/auth/update
// @desc    updating/saving person  base on objectid
// @access  Private

router.get('/update/:id', passport.authenticate("jwt",{session: false}), (req, res) => {
  const role = req.user.role;
  const personValues = {};
  
  //personValues.id = req.params.id;
  // if (req.body.username) personValues.username = req.body.username;
  // if (req.body.website) personValues.website = req.body.website;
  // if (req.body.country) personValues.country = req.body.country;

  //do database stuff
  Person.findOneAndUpdate(
      {_id: req.params.id},
      {$set: 
        {
          username:req.body.username,
          website:req.body.website,
          country:req.body.country
        },          
      },
      {new: true}
    )
    .then(person => { res.json(person)})
    .catch(error => console.log("Problem in updating:" + error));

})



// @route   GET api/auth/delete
// @desc    delete person 
// @access  Private
router.delete('/delete/:id', passport.authenticate("jwt",{session: false}), (req, res) => {
  Person.findOneAndRemove({_id: req.params.id})
    .then(() => {
      res.json({success: true})
    })
    .catch(error => console.log("Problem in deleting:" + error))
})

module.exports = router;