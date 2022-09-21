const Pool = require('pg').Pool; //postgres
require("dotenv").config();

/** USE THIS DB */
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

/** LANGUAGES MATCHING WITH ID AND LANGUAGE_NAME */
/** ONLY ONCE */

const getLanguages = () => {
  const langIDAndName = {};
  pool.query(`
    SELECT id, language_name FROM languages
  `, (err, result) => {
    result.rows.map(idAndName => {
      langIDAndName[idAndName.id] = idAndName.language_name;
    });
    return langIDAndName;
  }
  );
};
/** LANG_ID : LANG_NAME */
const languageIdAndName = getLanguages();

/** GET to get all users from DB */
const getUsers = (req, res) => {
  pool.query("SELECT * FROM users ORDER BY id ASC", (err, result) => {
    if (err) throw err;
    res.status(200).json(result.rows);
    // console.log("result.rows - coding_buddy_db.js", result.rows)
    return result.rows;
  });
};

const getFriendsName = (userID) => {
  pool.query(`
    SELECT username FROM users 
      JOIN favorites 
        ON users.id = favorites.added
      WHERE favorites.added_by = $1
      RETURNING *
  `, [userID]);
};

/** GET to identify user information */
const tryLogin = (req, res) => {
  const email = req.body.userEmail;
  const password = req.body.userPassword;
  pool.query(`
    SELECT users.id, avatar_id, users.username, language_name FROM languages
    JOIN user_language
    ON languages.id = user_language.language_id
    JOIN users
    ON users.id = user_language.user_id
    WHERE (users.email = $1 AND users.password = $2)
    `, [email, password])
    .then((result) => {
      console.log(result.rows);
      const userName = result.rows[0].username;
      const avatar = result.rows[0].avatar_id;
      const userID = result.rows[0].id;
      const userFriendsList = {};
      const userLanguages = [];
      pool.query(`
      SELECT avatar_id AS avatar, friends.username FROM users
        JOIN (
          SELECT username, users.id FROM users 
            JOIN favorites 
              ON users.id = favorites.added
            WHERE favorites.added_by = $1
        ) AS friends
        ON friends.id = users.id
        `, [userID])
        .then((res) => {
          console.log(res.rows);
          const friendsAvatar = res.rows;
          friendsAvatar.forEach(friend => {
            userFriendsList[friend.username] = {
              username: friend.username,
              avatar: friend.avatar
            };
          });
          result.rows.forEach((userData) => {
            userLanguages.push(userData.language_name);
          });
        })
        .then(() => {
          const loginUserData = {
            userName,
            avatar,
            userLanguages,
            userID,
            userFriendsList
          };
          res.status(200).send(loginUserData);
        })
        .catch(err => {
          res.status(409).send("Invalid information. Please try again");
        });
    })
    .catch((err) => {
      res.status(409).send("Invalid information. Please try again");
    });
};

/** INSERT USER DATA TO CREATE NEW USER */
const insertRow = (userData, res) => {
  const { userName,
    userPassword,
    userEmail,
    userLanguages,
    avatar
  } = userData;
  pool.query(`
  INSERT INTO users (username, password, email, avatar_id)
  VALUES ($1, $2, $3, $4)
  RETURNING id
  `, [userName, userPassword, userEmail, avatar])
    .then(response => {
      const userID = response.rows[0].id;
      const targets = [userID];
      let insertState = "INSERT INTO user_language (user_id, language_id) VALUES ";
      userLanguages.forEach((lang_id, ind) => {
        let addComma = ", ";
        if (ind === userLanguages.length - 1) {
          addComma = "";
        }
        insertState += `($1, $${ind + 2})${addComma}`;
        targets.push(lang_id);
      });
      pool.query(insertState + "RETURNING *", targets)
        .then(() => {
          /** AFTER ALL DATA INSERTED, SEND USER DATA TO FRONT */
          const userFriendsList = [];
          const loginUserData = {
            userName,
            avatar,
            userLanguages,
            userID,
            userFriendsList
          };
          res.status(200).send(loginUserData);
        });
    })
    .catch(err => {
      res.status(409).send(isUnique);
    });
};


/** POST REGISTER NEW USER */
const registerUser = (req, res) => {
  const userName = req.body.userInfo.userName;
  const userPassword = req.body.userInfo.userPassword;
  const userEmail = req.body.userInfo.userEmail;
  const userLanguages = req.body.userInfo.userLanguages;
  const avatar = req.body.userInfo.userAvatar;
  let isUnique;
  const userData = {
    userName,
    userPassword,
    userEmail,
    userLanguages,
    avatar,
    isUnique
  };
  /** CHECK UNIQUE */
  pool.query(`
  SELECT * FROM users WHERE username = $1 OR email = $2
  `, [userName, userEmail])
    .then(response => {
      /** GIVEN username OR email IS ALREADY IN DB */
      if (response.rows[0]) {
        isUnique = false;
        console.log("isUnique", isUnique);
        res.status(409).send({ isUnique });
      }
      /** IF GIVEN INFORMATION is UNIQUE */
      insertRow(userData, res);
    })
    .catch(err => {
      console.log("REGISTRATION ERROR", err);
      res.status(409).send(false);
    });
};

const getUserInfo = (req, res) => {
  const username = req.body.username;
  console.log(username);
  pool.query(`
    SELECT languages.language_name, user_info.email
     FROM languages
    JOIN (
      SELECT language_id, users.id, email
        FROM users
        JOIN user_language
        ON user_language.user_id = users.id
        WHERE username = $1
    ) AS user_info
      ON user_info.language_id = languages.id
    `,
    [username])
    .then(response => {
      const userInfo = {
        [username]: {}
      };
      response.rows.forEach(langAndEmail => {
        if (userInfo[username].email) {
          if (!userInfo[username].languages) {
            userInfo[username].languages = [];
          }
          userInfo[username].languages.push(langAndEmail.language_name);
        }
        if (!userInfo[username].email) {
          userInfo[username].email = langAndEmail.email;
        }

      });
      res.status(200).send(userInfo);
    });
};


const findAvatar = async (username) => {
  const avatarData = await pool.query(
    `SELECT avatar_id
      FROM users
      WHERE users.username = $1`,
    [username]);
  const avatar_id = await avatarData.rows[0];
  return avatar_id;
};



const addFriend = (req, res) => {
  const { userID, add, avatar } = req.body;
  const bind = [userID, add];
  /** CHECK */
  pool.query(`
  SELECT * FROM favorites
    JOIN (
      SELECT users.id FROM users
      WHERE users.username = $2
      ) AS friend
      ON favorites.added = friend.id
    WHERE favorites.added_by = $1 AND favorites.added = friend.id
`, bind, (err, response) => {
    if (err) res.status(409).send(false);
    if (response.rows.length > 0) {
      res.status(409).send(false);
    } else {

      /** INSERT */
      pool.query(`
      INSERT INTO favorites (added_by, added)
      (
      SELECT $1, (users.id) FROM users
      WHERE users.username = $2
      )
      `, bind, (err, result) => {
        /** COOKIE FORM */
        const updateOnline = {
          [add]: {
            username: add,
            avatar
          }
        };
        res.status(200).send({ updateOnline });
      });
    }
  });
};


// PUT : updated data in an existing user
const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;
  pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3", [name, email, id],
    (err, result) => {
      if (err) throw err;
    });
  res.status(200).send(`User modified with ID: ${id}`);
};

// DELETE : delete a user
const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);
  //
  pool.query("DELETE FROM users WHERE id = $1", [id], (err, result) => {
    if (err) throw err;
    res.status(200).send(`User deleted with ID: ${id}`);
  });
};




/** REQUIRE poolGroup OBJ inside Server */
const poolGroup = {
  pool,
  tryLogin,
  registerUser,
  getUserInfo,
  addFriend
  // findAvatar,
  // filterEssentials,
  // getUsers,
  // updateUser,
  // deleteUser
};

/** EXPORT poolGroup as a MODULE */
module.exports = poolGroup;