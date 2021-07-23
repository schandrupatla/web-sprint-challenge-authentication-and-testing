const db = require("../users/users-model")

//2.must not exist already in the `users` table
async function checkUsernameExists(req, res, next) {
    try{
       const users = await db.findBy({username:req.body.username})
       if(users.length){
         req.user =users[0]
         next()
       }
       else{
         next({
           status:401,
           message:"Invalid credentials"
         })
       }
    }
    catch(err){
      next(err)
    }
   
   }

//3. On FAILED registration due to `username` or `password` missing from the request body,
// the response body should include a string exactly as follows: "username and password required".
function checkPayload(req, res, next) {
    if(req.body.username === undefined || req.body.username === "" ||req.body.password === undefined || req.body.password === "" ){
      res.status(422).json({message:"username and password required"});
    }
    else{
      next();
    }
  }
//4- On FAILED registration due to the `username` being taken,
async function checkUsernameFree(req, res, next) {
    try{
        const users = await db.findBy({username:req.body.username}) //as good as passing where("username", username)
        if(!users.length){
          next()
        }else{
          next({status:422,
          message:"username taken"})
        }    
      }//try
      catch(err){
        next(err);
      }
  }

  module.exports = {
    checkPayload,
    checkUsernameExists,
    checkUsernameFree

    }