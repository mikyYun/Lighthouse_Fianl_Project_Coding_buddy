import { useState, useContext } from "react";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.scss";
import { UserListContext } from "../App.js";

export default function Login(props) {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const { setUser } = props;
  const cookies = new Cookies();
  const navigate = useNavigate();
  const goRegister = () => {
    navigate("/register");
  };
  const { room } = useContext(UserListContext);

  const goChat = () => {
    // const goChat = (userData) => {
    // const data = [...userData]
    // navigate(`/game/plaza`, { state: data })
    // navigate(0, { state: data })
    navigate(`/game/${room}`);
  };

  return (
    <div className="login-page">
      <div className="logo"></div>
      <form id="form_login" action="/game/plaza" method="GET" runat="server">
        <div>
          <p>EMAIL</p>
          <input
            name="email"
            id="login_email"
            rows="1"
            placeholder="EMAIL"
            type="email"
            value={userEmail}
            onChange={(e) => {
              setUserEmail(e.target.value);
            }}
          ></input>
        </div>
        <div>
          <p>PASSWORD </p>
          <input
            name="password"
            id="login_password"
            rows="1"
            placeholder="PASSWORD"
            value={userPassword}
            type="password"
            onChange={(e) => {
              setUserPassword(e.target.value);
            }}
          ></input>
        </div>
        <div className="btns">
          <button
            className="btn"
            type="submit"
            onClick={(e) => {
              const loginInfo = { userEmail, userPassword }
              // const loginInfo = {
              //   userEmail: "test2@test.com",
              //   userPassword: "mike",
              // };
              // cookies.set("username", userEmail)
              axios
                .post("/login", loginInfo)
                .then((res) => {
                  const target = res.data;
                  if (target.userName) {
                    // cookies.set("userdata", target, { maxAge: 3600 });
                    setUser(target)
                    // goChat(target.userName, target.avatar, target.userLanguages, target.userID)
                    // goChat();
                  }
                })
                .catch((err, res) => {
                  alert("Invalid information. Please try again");
                });
              e.preventDefault();
            }}
          >
            Login
          </button>
          <button className="btn" onClick={goRegister}>
            New here?
          </button>
        </div>
      </form>
    </div>
  );
}
