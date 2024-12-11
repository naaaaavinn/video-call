import { useState } from "react";
// import logo from "./../assets/react.svg";

export const ConnectForm = ({ connectToVideo }) => {
  const [channelName, setChannelName] = useState("");
  const [invalidInputMsg, setInvalidInputMsg] = useState("");

  const handleConnect = async (e) => {
    e.preventDefault(); // keep the page from reloading on form submission
    // trim spaces
    const trimmedChannelName = channelName.trim();
    // validate input: make sure channelName is not empty
    if (trimmedChannelName === "") {
      setInvalidInputMsg("Channel name can't be empty."); // show warning
      return;
    }
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const res = await fetch(`${baseUrl}/generate-token`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ channelName: trimmedChannelName }),
    });
    const data = await res.json();
    connectToVideo(trimmedChannelName, data.token, data.uid);
  };

  return (
    <form onSubmit={handleConnect}>
      {/* <img src={logo} className="logo" alt="logo" /> */}
      <div className="card">
        <input
          id="channelName"
          type="text"
          placeholder="Channel Name"
          value={channelName}
          onChange={(e) => {
            setChannelName(e.target.value);
            setInvalidInputMsg(""); // clear the error message
          }}
        />
        <button>Connect</button>
        {invalidInputMsg && <p style={{ color: "red" }}> {invalidInputMsg} </p>}
      </div>
    </form>
  );
};
