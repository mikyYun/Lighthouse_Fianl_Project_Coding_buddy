// PG database client connection setup
const { Pool } = require('pg'); //postgres
const dbParams = require('./lib/db.js')
const pool = new Pool(dbParams);

// export default queryMethos = {getOneUserLanguages}


module.exports = {
  getUsers: () => {
    const queryString = `
      SELECT id, username AS name, email, avatar_id
      FROM users
    `;
    const queryGetLang = `
      SELECT languages.id, user_id, language_name
      FROM user_language
      JOIN languages ON language_id=languages.id
    `;

    return pool
      .query(queryString)
      .then(res => {
        return res.rows || null;
      })
      .catch(err => {
        console.log('Error ', err.stack);
      });
  },

  getLangsByUserId: (id) => {
    const queryString = ``

  },

  getLoginUser: (email, pw) => {
    const queryString = `
      SELECT * FROM users
      WHERE email=$1 AND password=$2
    `;

    return pool
      .query(queryString, [email, pw])
      .then(res => {
        return res.rows[0] || null;
      })
      .catch(err => {
        console.log('Error ', err.stack)
      })
  },

  getLoginUserLangs: (userId) => {
    const queryString = `
      SELECT language_name as name
      FROM languages
      JOIN user_language
      ON user_language.language_id = languages.id
      WHERE user_id=$1;
    `

    return pool
      .query(queryString, [userId])
      .then(res => {
        return res.rows || null;
      })
      .catch(err => {
        console.log('Error ', err.stack)
      })
  },


  getFriends: (id) => {
    const queryString = `
      SELECT username as name
      FROM users
      JOIN favorites
      ON favorites.added = users.id
      WHERE added_by=$1;
    `

    return pool
      .query(queryString, [id])
      .then(res => {
        return res.rows || null;
      })
      .catch(err => {
        console.log('Error ', err.message)
      })
  }

}











// when user login, pass essential data
const filterEssentials = function (currentUsers) {
  pool.query(
    "SELECT id, username, email, avatar_id FROM users",
    (err, res) => {
      // res.rows => {id: , username: , email: , avatar_id}
      const allUsersObj = res.rows
      pool.query(
        "SELECT languages.id, user_id, language_name FROM user_language JOIN languages ON language_id=languages.id",
        (err, res_1) => {
          // res.rows_1 => {id(languageID): , user_id: , language_name: }
          const userIDAndLang = res_1.rows
          allUsersObj.map(user => {
            if (currentUsers[user.username]) {

            }
          })
        }
      )
    }
  )
}

// // 데이터베이스 관리...
// // GET : get all users
// const getUsers = (req, res) => {
//   pool.query("SELECT * FROM users ORDER BY id ASC", (err, result) => {
//     if (err) throw err;
//     res.status(200).json(result.rows);
//     // console.log("result.rows - coding_buddy_db.js", result.rows)
//     return result.rows
//   });
// };

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
  const { username, password, email, avatar_id, languages } = req.body;
  pool.query("INSERT INTO users (username, password, email, avatar_id) VALUES ($1, $2, $3, $4) RETURNING *", [username, password, email, avatar_id], (err, result) => {
    if (err) throw err;
    res.status(201).send(`User added with ID: ${result.rows[0].id}`)
  });
  pool.query("INSERT INTO user_language (user_id, language_id) VALUES ($1) RETURNING *", [languages], (err, result) => {
    if (err) throw err;
    res.status(201).send(`User added with `)
  })
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

// module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser }