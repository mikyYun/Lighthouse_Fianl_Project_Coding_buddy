const Pool = require('pg').Pool; //postgres
require("dotenv").config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

// 데이터베이스 관리...
// GET : get all users
const getUsers = (req, res) => {
  pool.query("SELECT * FROM users ORDER BY id ASC", (err, result) => {
    if (err) throw err;
    res.status(200).json(result.rows);
    console.log(result.rows)
    return result.rows
  });
};

// GET : get a user
const getUserById = (req, res) => {
  const id = parseInt(req.params.id)

  pool.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
    if (err) {
      throw err
    }
    res.status(200).json(result.rows)

  })
}

// POST a new user
const createUser = (req, res) => {
  const { name, email } = req.body;
  pool.query("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *", [name, email], (err, result) => {
    if (err) throw err;
    response.status(201).send(`User added with ID: ${result.rows[0].id}`)
  });
};

// PUT : updated data in an existing user
const updateUser = (req, res) => {
  const id = parseInt(req.params.id)
  const { name, email } = req.body
  pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3", [name, email, id],
    (err, result) => {
      if (err) throw err
    })
  res.status(200).send(`User modified with ID: ${id}`)
}

// DELETE : delete a user
const deleteUser = (req, res) => {
  const id = parseInt(req.params.id)

  pool.query("DELETE FROM users WHERE id = $1", [id], (err, result) => {
    if (err) throw err
    res.status(200).send(`User deleted with ID: ${id}`)
  })
}

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser }