import React, { useRef, useState } from "react";
import { Button, TextField } from "@mui/material";
import AgoraRTC from "agora-rtc-sdk-ng";
import VideoCallPage from "./VideoCallPage";
import MicOff from "../assets/new-mute.png";

export default function Lobby() {
  const [formValues, setFormValues] = useState({ name: "", roomName: "" });
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [isJoined, setIsJoined] = useState(false);
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  const [currentUser, setCurrentUser] = useState(null);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  let streamId;

  console.log("APP_ID", process.env.REACT_APP_AGORA_APP_ID);
  const videoStreamRef = useRef(null);

  async function joinAndDisplayLocalStream(e) {
    e.preventDefault();
    let localTracks = [];
    let UID;

    const res = await fetch("http://localhost:8080/generate-token", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ channelName: formValues.roomName }),
    });
    const data = await res.json();
    console.log("data>>", data);
    const APP_ID = process.env.REACT_APP_AGORA_APP_ID;
    console.log("APP_ID>>", APP_ID);

    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);
    try {
      await client.join(APP_ID, formValues.roomName, data.token, data.uid);
    } catch (error) {
      return console.error("Error while client connecting:", error);
    }

    setIsJoined(true);
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
    setLocalTracks(localTracks);
    const userRes = await fetch("http://localhost:8080/add-user", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        roomName: formValues.roomName,
        name: formValues.name,
        uid: data.uid,
      }),
    });
    const userData = await userRes.json();
    setCurrentUser(userData.user);
    console.log("userData>>>", userData);
    const player = document.createElement("div");
    player.id = `user-container-${data.uid}`;
    player.className = `video-container relative w-full h-full bg-gray-200 rounded-lg overflow-hidden shadow-md`;
    player.innerHTML = `<p class="user-name">${formValues.name}</p><div id="user-${data.uid}" class="video-player"></div>`;
    videoStreamRef.current.appendChild(player);
    localTracks[1].play(`user-${data.uid}`);
    await client.publish([localTracks[0], localTracks[1]]);
    setShowVideoControls(true);
  }

  let handleUserJoined = async (user, mediaType) => {
    // remoteUsers[user.uid] = user;
    setRemoteUsers((prev) => ({ ...prev, [user.uid]: user }));
    await client.subscribe(user, mediaType);

    const apiRes = await fetch("http://localhost:8080/get-user", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        roomName: formValues.roomName,
        uid: user.uid,
      }),
    });
    const member = await apiRes.json();
    if (mediaType === "video") {
      let player = document.getElementById(`user-container-${user.uid}`);
      if (player !== null) {
        player.remove();
      }
      player = document.createElement("div");
      player.id = `user-container-${user.uid}`;
      player.className = `video-container relative w-full h-full bg-gray-200 rounded-lg overflow-hidden shadow-md`;
      player.innerHTML = `<p class="user-name">${member.user.name}</p><div id="user-${user.uid}" class="video-player"></div>`;
      videoStreamRef.current.appendChild(player);
      user.videoTrack.play(`user-${user.uid}`);
    }

    if (mediaType == "audio") {
      user.audioTrack.play();
    }
  };

  const handleUserLeft = (user) => {
    console.log("user>>>", user);

    setRemoteUsers((prev) => {
      const updatedUsers = { ...prev };
      delete updatedUsers[user.uid];
      return updatedUsers;
    });
    const player = document.getElementById(`user-container-${user.uid}`);
    console.log("player>>>", player);
    if (player) player.remove();
  };

  let leaveAndRemoveLocalStream = async () => {
    // client.sendStreamMessage(streamId, JSON.stringify({ type: "user-left", uid: currentUser.uid }));
    if (localTracks.length > 0) {
      setLocalTracks((prev) =>
        prev.forEach((track) => {
          track.stop();
          track.close();
        })
      );
      setLocalTracks([]); // Clear localTracks state
    }

    await client.leave();

    const userRes = await fetch(
      `http://localhost:8080/delete-user/${currentUser._id}`,
      {
        method: "DELETE",
      }
    );
    const data = await userRes.json();
    // document.getElementById("join-btn").style.display = "block";
    // document.getElementById("stream-controls").style.display = "none";
    setShowVideoControls(false);
    setIsJoined(false);
    setCurrentUser(null);
    setFormValues({ name: "", roomName: "" });
  };

  let toggleMic = async (e) => {
    setMicOn((prevState) => !prevState);
    if (localTracks[0].muted) {
      await localTracks[0].setMuted(false);
    } else {
      await localTracks[0].setMuted(true);
    }
  };

  let toggleCamera = async (e) => {
    setCameraOn((prevState) => !prevState);
    if (localTracks[1].muted) {
      await localTracks[1].setMuted(false);
    } else {
      await localTracks[1].setMuted(true);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen ">
      {!isJoined ? (
        <form
          className="w-full max-w-md bg-white rounded-lg shadow-md p-8"
          onSubmit={joinAndDisplayLocalStream}
        >
          <div className="mb-4">
            <TextField
              id="outlined-basic"
              label="Name"
              variant="standard"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formValues.name}
              onChange={(e) =>
                setFormValues({ ...formValues, name: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-8">
            <TextField
              id="outlined-basic"
              label="Room Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              variant="standard"
              value={formValues.roomName}
              onChange={(e) =>
                setFormValues({ ...formValues, roomName: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" variant="contained">
            Connect
          </Button>
        </form>
      ) : (
        <div className="w-full">
          <h2 className="py-3 rounded-md inline-block mb-4 text-gray-800">
            Room Name:{" "}
            <span className="capitalize text-xl font-medium">
              {formValues.roomName}
            </span>
          </h2>
          <div id="stream-wrapper">
            <div id="video-stream" ref={videoStreamRef}></div>
            {showVideoControls && (
              <div id="stream-controls">
                <button id="mic-btn" onClick={toggleMic}>
                  {micOn ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                      />
                    </svg>
                  ) : (
                    <img
                      src={MicOff}
                      alt="Mic off"
                      className="w-5 h-6 text-black"
                    />
                  )}
                </button>
                <button id="camera-btn" onClick={toggleCamera}>
                  {cameraOn ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"
                      />
                    </svg>
                  )}
                </button>
                <button
                  id="leave-btn"
                  onClick={() => {
                    // document.getElementById("video-stream").innerHTML = "";
                    leaveAndRemoveLocalStream();
                  }}
                  className="bg-red-500 py-2 px-4 rounded-md"
                >
                  Leave Call
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
