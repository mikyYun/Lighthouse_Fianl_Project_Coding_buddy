import { useState, useCallback } from "react";

function NicknameForm({ handleSubmitNickname }) {
  const [nickname, setNickname] = useState("");

  const handleChangeNickname = useCallback(event => {
    setNickname(event.target.value);
  }, []);

  const handleSubmit = useCallback((event) => {
    handleSubmitNickname(nickname);
    setNickname(event.target.value);
  }, [handleSubmitNickname, nickname]);

  return (
    <form className="d-flex">
      <div className="card d-flex flex-row align-items-center">
        <label htmlFor="user-name-input" style={{ width: 60, height: 5 }}>
          Nick Name
        </label>
        <input
          type="text"
          className="form-control w300"
          id="user-name-input"
          maxLength={5}
          value={nickname}
          onChange={handleChangeNickname}
        />
        <button
          id="nicknamebutton"
          type="button"
          className="btn btn-primary send-btn"
          value="Save"
          placeholder="Save"
          onClick={handleSubmit}
        >
          SUBMIT
        </button>
      </div>
    </form>
  );
}

export default NicknameForm;