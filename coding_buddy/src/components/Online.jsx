import { useEffect, useContext, useState } from "react";
import { SocketContext } from "../App.js";
import { UserListContext } from '../App.js'
import FriendList from "./FriendsList.jsx";
import Avatar from "./Avatar.jsx"
export default function Online() {
  const { online, friendList, socket } = useContext(SocketContext);
  const { setClicked, setShow } = useContext(UserListContext);
  // const [playToggleClassName, setPlayToggleClassName] = useState("friendsListToggle");
  // console.log("online_in_Online.jsx", online);
  const usersOnline = online.map((obj, i) => <li key={i} onClick={() => {
    setClicked(obj)
    setShow(true)
  }}> {<Avatar url={obj.avatar} alt="avatar" />} {obj.value} </li>);
  // const friendsNames = Object.keys(friendList); // [이름, 이름]

  // window.addEventListener("click", () => {
  //   for (let obj in friendList) {
  //     // console.log(obj)
  //     // const languages = friendList[obj].languages
  //     if (obj === 'mike') {
  //       // const results = languages.map(lang => <li key={lang}> {lang}</li>)
  //       // return results
  //     }
  //   }
  // })
  // const languagesArr = Object.values(friendList)

  const listing = (arr) => {
    // arr.map(element => <li key={element.id}>{element}</li>);
  };

  // const createLists = (friendName) => {
  //   friendList.map(obj => {
  //     <li key={obj}>{listing(obj[friendName].languages)}</li>;
  //   });
  // };
  // const friendsListing = friendsNames.map((friendName, i) => (
  //   <li key={i}>{friendName}</li>
  // ));

  useEffect(() => {
    socket.emit("friendsList", { socketID: socket.id });
    // console.log("ONLINE USEEFFECT");

    // return () => {
    //   socket.disconnect();
    // };
  }, [online]);
  return (
    <div className="online-list">
      {/* <div className="friendsListToggle">Friends</div> */}
      {/* {friendsListing} */}
      {/* {friendLanguages} */}
      <FriendList />
      <span>Online</span>
      <div>{usersOnline}</div>
      {/* </div> */}
    </div>
  );
}
