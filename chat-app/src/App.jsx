/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect, useContext, useRef } from "react";
import { socket, SocketContext, SOCKET_EVENT } from "service/socket";
import NicknameForm from "components/NicknameForm";
import ChatRoom from "components/ChatRoom";
/*
"JOIN_ROOM": 유저가 방에 참가했을 때 발생
"UPDATE_NICKNAME": 유저가 닉네임을 변경했을 때 발생
"SEND_MESSAGE": 유저가 메시지를 전송했을 때 발생
"RECEIVE_MESSAGE": 유저가 메시지를 받을 때 발생
*/

function App() {
  const prevNickname = useRef(null); // prevNickname 변경은 컴포넌트를 리렌더링 하지않습니다.
  const [nickname, setNickname] = useState("김첨지");
  const handleSubmitNickname = useCallback(newNickname => {
    prevNickname.current = nickname;
    setNickname(newNickname);
  }, [nickname]);

  useEffect(() => {
    return () => { // App 컴포넌트 unmount시 실행
      socket.disconnect();
    }
  }, []);

  useEffect(() => {
    if (prevNickname.current) {
      socket.emit(SOCKET_EVENT.UPDATE_NICKNAME, { // 서버에는 이전 닉네임과 바뀐 닉네임을 전송.
        prevNickname: prevNickname.current,
        nickname,
      });
    } else {
      socket.emit(SOCKET_EVENT.JOIN_ROOM, { nickname });
      // JOIN_ROOM event type과 nickname data를 서버에 전송.
    }
  }, [nickname]);

  return (
    <SocketContext.Provider value={socket}>
      {/* //??PROVIDER ? */}
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <NicknameForm handleSubmitNickname={handleSubmitNickname} />
        <ChatRoom nickname={nickname} />
      </div>
    </SocketContext.Provider>
  );
}

export default App;