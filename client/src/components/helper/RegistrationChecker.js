const { io } = require("socket.io-client");
const socket = io.connect("http://localhost:5000", {
  reconnectionDelay: 1000,
  reconnection: true,
  reconnectionAttemps: 10,
  transports: ["websocket"],
  agent: false,
  upgrade: false,
  rejectUnauthorized: false,
}); // same domain

export default function RegistrationChecker(val, e) {
  const userData = [];
  const selectedLanguages = [];
  for (let i = 0; i < val.length; i++) {
    if (i <= 3) {
      // user data
      userData.push(val[i].value);
    } else if (i > 3) {
      // programming languages
      // if checked
      if (val[i].checked)
        selectedLanguages.push(val[i].value);
    }
  }
  // email, name, password length check
  if (userData[0].length < 1 || userData[1].length < 2 || userData[2].length < 2) {
    // if password and confirmation are not matched, alert and return
    e.preventDefault(); // block form action
    alert("invalid input")
  } else if (userData[2] !== userData[3]) {
    e.preventDefault(); // block form action
    alert("mismatched password");
  } else {
    // if all good, pass all datas to server
    console.log("userData", userData);
    console.log("languages", selectedLanguages);
    socket.emit("REGISTERED", { userData, selectedLanguages });
    // const wasSuccessful = () => {
    //   socket.on("REGISTRATION SUCCESS", (value) => value)
    // }
    // if (wasSuccessful) return true
  }
}