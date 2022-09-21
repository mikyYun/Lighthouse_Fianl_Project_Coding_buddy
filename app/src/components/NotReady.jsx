import { UserListContext } from "../App";
import { useEffect, useContext, useState } from "react";
import "./NotReady.scss";
const NotReady = () => {
  const [count, setCount] = useState(3);
  const {
    navigate,
  } = useContext(UserListContext);
  // const navigate = useNavigate();
  useEffect(() => {
    const goBack = setInterval(() => {
      if (count >0) setCount(count - 1);
      if (count === 0) {
        return setTimeout(() => {
          navigate("/game/plaza");
        }, 100);
      }
    }, [1000]);
    return () => clearInterval(goBack)
  }, [count]);

  const goBackMessage = () => {
    return (
      <div className="go_back_message">
        GO BACK TO PREVIOUS ROOM in :
        <span>{count > 1 ? count + " seconds" : count + " second"}</span>
      </div>
    );
  };
  
  return (
    <section className="container">
      <div className="inner">
        <div className="header">Sorry, This room is not ready yet.</div>
        {goBackMessage()}
      </div>
    </section>
  );
};

export default NotReady;
