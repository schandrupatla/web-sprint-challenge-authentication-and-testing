const router = require("express").Router();
const bcrypt = require('bcryptjs');
const Users = require("../users/users-model");
const tokenBuilder = require('../auth/token-builder')
const { checkPayload,
        checkUsernameExists,
        checkUsernameFree} = require('../middleware/auth-middleware');
//const { JWT_SECRET } = require("../secrets"); // use this secret!



router.post('/register', checkPayload , checkUsernameFree , (req, res, next) => {
  
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
 let user ={
  username :req.body.username,
  password: req.body.password,
}
// bcrypting the password before saving
const rounds = process.env.BCRYPT_ROUNDS || 8; // 2 ^ 8
const hash = bcrypt.hashSync(user.password, rounds);

// never save the plain text password in the db
user.password = hash

Users.add(user)
  .then(saved => {
    res.status(201).json(saved);
  })
  .catch(next);
  
  //res.end('implement register, please!');
});

router.post('/login',checkPayload , checkUsernameExists , (req, res, next) => {
  // res.end('implement login, please!');
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
 let { username, password } = req.body;
  Users.findBy({ username }) 
    .then(([user]) => {
      if (user && bcrypt.compareSync(password, user.password)) {
        // generate a token and send it back
        const token = tokenBuilder(user)
        // the client will provide token in future requests
        res.status(200).json({
          message: `welcome, ${user.username}`,
          token,
        });
      } else {
        next({ status: 401, message: 'invalid credentials' });
      }
    })
    .catch(next);
});

module.exports = router;
