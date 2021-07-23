const router = require("express").Router();
const Users = require("./users-model");
const { restricted, only } = require("../middleware/restricted");
router.get("/:user_id", restricted, only('admin'), (req, res, next) => { // done for you
    Users.findById(req.params.user_id)
      .then(user => {
        res.json(user);
      })
      .catch(next);
  });
  
  //findby
  router.get("/:username", (req,res,next)=>{
    Users.findBy(req.param.username)
    .then(users =>{
      res.status(200).json(users);
    })
    .catch(next);
  })
  
  module.exports = router;