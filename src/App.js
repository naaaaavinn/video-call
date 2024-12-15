import { Route, Routes, useNavigate } from "react-router-dom";

import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";

import "./App.css";
import { ConnectForm } from "./ui/ConnectForm";
import { LiveVideo } from "./ui/LiveVideo";
import { useState } from "react";

function App() {
  const [channelName, setChannelName] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const agoraClient = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })
  );
  const baseUrl = process.env.REACT_APP_BASE_URL;

  const connectToVideo = (channelName, token, uid, userId) => {
    navigate(`/via/${channelName}`, { state: { token, uid, userId } });
  };

  agoraClient.on("user-left", async (user) => {
    const userRes = await fetch(`${baseUrl}/delete-user/${user.uid}`, {
      method: "DELETE",
    });
    await userRes.json();
  });

  const handleConnect = async (e) => {
    e.preventDefault();
    const trimmedChannelName = channelName.trim();
    const res = await fetch(`${baseUrl}/generate-token`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ channelName: trimmedChannelName }),
    });
    const data = await res.json();

    const apiRes = await fetch(`${baseUrl}/add-user`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        roomName: trimmedChannelName,
        name: userName,
        uid: data.uid,
      }),
    });
    const user = await apiRes.json();
    connectToVideo(trimmedChannelName, data.token, data.uid, user.user._id);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ConnectForm
            connectToVideo={handleConnect}
            setChannelName={setChannelName}
            setUserName={setUserName}
          />
        }
      />
      <Route
        path="/via/:channelName"
        element={
          <AgoraRTCProvider client={agoraClient}>
            <LiveVideo />
          </AgoraRTCProvider>
        }
      />
    </Routes>
  );
}

export default App;
