module.exports = function (socketIo) {

  // ===============  EVENT TYPES  =============== //

  const SOCKET_EVENT = {
    JOIN_ROOM: "JOIN_ROOM",
    SEND_MESSAGE: "SEND_MESSAGE",
    RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
  };

  // ===============  CONNECT  =============== //

  // client side event listener
  socketIo.on("connection", function (client) {
    // 클라이언트와 연결이 되면 연결된 사실을 출력합니다.
    console.log("socket connection succeeded."); //in terminal - vs code
    console.log("MEKLFMSKLDFM:SEMFKLS:DJF:KLJDVLKJSL:VJDKL:VJKLSD:JFKL:SD")
    // 구현 편의상, 모든 클라이언트의 방 번호는 모두 "plaza"로 배정해줍니다.
    const roomName = "plaza";

    /*
    "JOIN_ROOM": 유저가 방에 참가했을 때 발생
    "UPDATE_NICKNAME": 유저가 닉네임을 변경했을 때 발생
    "SEND_MESSAGE": 유저가 메시지를 전송했을 때 발생
    "RECEIVE_MESSAGE": 유저가 메시지를 받을 때 발생
    */

    // ===============  EVENTS  =============== //

    // --------------- JOIN ROOM ------------

    // server side event listener

    client.on(SOCKET_EVENT.JOIN_ROOM, requestData => {
      // 콜백함수의 파라미터는 클라이언트에서 보내주는 데이터. 
      // 이 데이터를 소켓 서버에 던져줌.
      // 소켓서버는 데이터를 받아 콜백함수를 실행.
      client.join(roomName); // user를 "room 1" 방에 참가시킴.
      const responseData = {
        ...requestData,
        type: SOCKET_EVENT.JOIN_ROOM,
        time: new Date(),
      };
      // "plaza"에는 이벤트타입과 서버에서 받은 시각을 덧붙여 데이터를 그대로 전송.

      socketIo.to(roomName).emit("RECEIVE_MESSAGE", responseData);
      // 클라이언트 App.js 로 이벤트를 전달.
      // 클라이언트에 App.js 는 RECEIVE_MESSAGE 이벤트 리스너를 가지고 있어서 그쪽 콜백 함수가 또 실행됌.

      /* App.js:
        useEffect(() => {
        socket.on(SOCKET_EVENT.RECEIVE_MESSAGE, handleReceivePublicMessage); // 이벤트 리스너 - 퍼블릭 메세지
        socket.on("PRIVATE", handleReceivePrivateMessage); // 이벤트 리스너 - 프라이빗 메세지
      */

      console.log(`JOIN_ROOM is fired with data: ${JSON.stringify(responseData)}`);
    });

       // receive.message는 ChatRoom.jsx 에서 defined 됌.
    // --------------- SEND MESSAGE ---------------
    client.on(SOCKET_EVENT.SEND_MESSAGE, requestData => {
      //emiting back to receive message in line 67 above.
      const responseData = {
        ...requestData,
        type: SOCKET_EVENT.SEND_MESSAGE,
        time: new Date(),
      };
      // SVGPreserveAspectRatio.to(roomName).emit
      socketIo.emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData);
      // responseData = chat message body
      console.log(`${SOCKET_EVENT.SEND_MESSAGE} is fired with data: ${JSON.stringify(responseData)}`);
    });

    // ===============  DISCONNECT  =============== //
    client.on("disconnect", reason => {
      console.log(`disconnect: ${reason}`);
    })
  })
}