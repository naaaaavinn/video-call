import { Button, TextField } from "@mui/material";
import { useState } from "react";
// import logo from "./../assets/react.svg";

export const ConnectForm = ({ connectToVideo }) => {
  const [channelName, setChannelName] = useState("");
  const [userName, setUserName] = useState("");
  const [invalidInputMsg, setInvalidInputMsg] = useState("");

  const handleConnect = async (e) => {
    e.preventDefault();
    const trimmedChannelName = channelName.trim();
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
    <div className="flex justify-center items-center min-h-[90vh]">
      <form
        className="w-full max-w-md bg-white rounded-lg shadow-md p-8"
        onSubmit={handleConnect}
      >
        <div className="mb-4">
          <TextField
            id="outlined-basic"
            label="Name"
            variant="standard"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>
        <div className="mb-8">
          <TextField
            id="outlined-basic"
            label="Room Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            variant="standard"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="contained">
          Connect
        </Button>
      </form>
    </div>
  );
};
