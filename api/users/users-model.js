const db = require('../../data/dbConfig');


function findById(id) {  
    let results =  db("users").where( "id", id ).first();
    return results;
  }

  function findBy(filter) {
    return db("users").where(filter)
  }
async function add(user) {
    const [id] = await db("users").insert(user);
    return findById(id);
  }
  
  module.exports = {
    add,
    findById,
    findBy
  };