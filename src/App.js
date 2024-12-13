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

  // async function userJoined(user, mediaType) {
  //   console.log("channelName>>", channelName);
  //   const remoteUser = document.getElementById(`user-id-${user.uid}`);
  //   if (!remoteUser) {
  //     console.error("Remote user element not found.");
  //     return;
  //   }
  //   const apiRes = await fetch(`${baseUrl}/get-user`, {
  //     method: "POST",
  //     headers: {
  //       "Content-type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       roomName: channelName,
  //       uid: user.uid,
  //     }),
  //   });
  //   const memberData = await apiRes.json();
  //   console.log("memberData>>>", memberData.user);
  //   const memberNameDiv = document.createElement("div");
  //   memberNameDiv.className =
  //     "absolute bottom-4 left-4 z-10 text-white text-lg capitalize";
  //   memberNameDiv.innerHTML = `<p>${memberData?.user?.name}</p>`;
  //   remoteUser.appendChild(memberNameDiv);
  // }

  // agoraClient.on("user-published", userJoined);

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
