const pool = require("../queries")

const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
        response.status(400).json("Invalid")
    }
    response.status(200).json(results.rows)
})
  };
module.exports = getUsers;
