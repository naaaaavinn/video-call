// import { Route, Routes } from "react-router-dom";
// import Lobby from "./ui/Lobby";
// import VideoCallPage from "./ui/VideoCallPage";
// import AgoraVideoComponent from "./ui/VideoController";

// function App() {
//   return (
//     <div>
//       <header></header>
//       <Routes>
//         <Route element={<Lobby />} path="/" />
//         <Route element={<VideoCallPage />} path="/call/:id" />
//         <Route />
//       </Routes>
//     </div>
//   );
// }

// export default App;

import { Route, Routes, useNavigate } from "react-router-dom";

import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";

import "./App.css";
import { ConnectForm } from "./ui/ConnectForm";
import { LiveVideo } from "./ui/LiveVideo";

function App() {
  const navigate = useNavigate();
  const agoraClient = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })
  ); // Initialize Agora Client

  const handleConnect = (channelName, token, uid) => {
    navigate(`/via/${channelName}`, { state: { token, uid } }); // on form submit, navigate to new route
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<ConnectForm connectToVideo={handleConnect} />}
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
