import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import AgoraRTC, {
  LocalUser,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteAudioTracks,
  useRemoteUsers,
  useRTCClient
} from "agora-rtc-react";
import MicOff from "../assets/new-mute.png";
import EndCall from "../assets/phone-call-end.png";
import ScreenShareIcon from "../assets/screen-share.png";
import CloseScreenShareIcon from "../assets/close-share-screen.png";

export const LiveVideo = () => {
  const [userDetails, setUserDetails] = useState({});
  const [screenShareOn, setScreenShareOn] = useState(false);
  const [screenTrack, setScreenTrack] = useState(null); // State for screen track
  const appId = process.env.REACT_APP_AGORA_APP_ID;
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const { state } = useLocation();
  const client = useRTCClient();
  const { channelName } = useParams();

  useEffect(() => {
    async function userJoined(user) {
      try {
        const apiRes = await fetch(`${baseUrl}/get-user`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            roomName: channelName,
            uid: user.uid,
          }),
        });
        const memberData = await apiRes.json();
        if (memberData?.user?.name) {
          setUserDetails((prev) => ({
            ...prev,
            [user.uid]: memberData.user.name,
          }));
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    }

    client.on("user-joined", userJoined);

    return () => {
      client.off("user-joined", userJoined);
    };
  }, [client, channelName]);

  // set the connection state
  const [activeConnection, setActiveConnection] = useState(true);

  // track the mic/video state - Turn on Mic and Camera On
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);

  // get local video and mic tracks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);

  // to leave the call
  const navigate = useNavigate();

  // Join the channel
  useJoin(
    {
      appid: appId,
      channel: channelName,
      token: state.token,
      uid: state.uid,
    },
    activeConnection
  );

  usePublish([localMicrophoneTrack, localCameraTrack]);

  //remote users
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  // play the remote user audio tracks
  useEffect(() => {
    audioTracks.forEach((track) => track.play());
  }, [audioTracks]);

  async function disconnectCall() {
    const userRes = await fetch(`${baseUrl}/delete-user/${state.uid}`, {
      method: "DELETE",
    });
    await userRes.json();
    setActiveConnection(false);
    navigate("/");
  }

  const startScreenSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = AgoraRTC.createCustomVideoTrack({
        mediaStreamTrack: stream.getVideoTracks()[0],
      });

      if (localCameraTrack) {
        await client.unpublish(localCameraTrack); // Unpublish the camera video track
      }
      await client.publish(screenTrack); // Publish the screen-sharing track
      setScreenTrack(screenTrack);
      setScreenShareOn(true);

      screenTrack.on("track-ended", async () => {
        // Stop screen sharing when the track ends
        stopScreenSharing();
      });

      console.log("Screen sharing started");
    } catch (error) {
      console.error("Error starting screen sharing:", error);
    }
  };

  const stopScreenSharing = async () => {
    if (screenTrack) {
      try {
        await client.unpublish(screenTrack); // Unpublish the screen-sharing track
        screenTrack.close();
        setScreenTrack(null);
        setScreenShareOn(false);
        await client.publish(localCameraTrack); // Re-publish the camera video track
        console.log("Screen sharing stopped");
      } catch (error) {
        console.error("Error stopping screen sharing:", error);
      }
    }
  };

  return (
    <div className="pt-8">
      {/* <h2 className="py-3 flex items-center rounded-md text-lg mb-4 text-white">
        Room: <span className="!text-2xl font-medium ml-2">{channelName}</span>
      </h2> */}
      <div id="video-stream" className="px-2">
        {remoteUsers.map((user) => (
          <div
            key={user.uid}
            className={`relative remote-video-container mx-auto rounded-xl border border-gray-800 ${
              remoteUsers.length === 1 ? "w-4/5" : "w-full"
            }`}
            id={`user-id-${user.uid}`}
          >
            <button className="btn absolute top-4 left-4 z-10">
              {user.hasAudio ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-9 h-9 text-white px-2 rounded"
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
                  className="w-8.5 h-9 bg-red-500 px-2 py-2 rounded"
                />
              )}
            </button>
            <button className="absolute bottom-4 left-4 z-10 text-white text-lg capitalize">
              <p>{userDetails[user.uid]}</p>
            </button>
            <RemoteUser user={user} />
          </div>
        ))}

        {screenShareOn && screenTrack && (
          <div className="screen-share-container">
            <video
              ref={(ref) => ref && screenTrack.play(ref)}
              autoPlay
              playsInline
              style={{
                width: "100%",
                border: "2px solid gray",
                marginTop: "10px",
              }}
            ></video>
          </div>
        )}
      </div>
      <div id="localVideo">
        <LocalUser
          audioTrack={localMicrophoneTrack}
          videoTrack={localCameraTrack}
          cameraOn={cameraOn}
          micOn={micOn}
          playAudio={false}
          playVideo={cameraOn}
          className="rounded-xl border-2 border-gray-800"
        />
      </div>

      <div id="mediaControls">
        <button
          className="btn relative mic-icon"
          onClick={() => setMic((a) => !a)}
        >
          {micOn ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="w-9 h-9 px-2 rounded-full bg-white"
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
              className="w-8.5 h-9 bg-red-500 rounded-full px-2 py-2"
            />
          )}
          <p className="mic-tool-tip tool-tip-message">
            Turn {micOn ? "Off" : "On"} Mic
          </p>
        </button>
        <button
          className="btn relative camera-icon"
          onClick={() => setCamera((a) => !a)}
        >
          {cameraOn ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="w-9 h-9 bg-white px-2 rounded-full"
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
              className="w-9 h-9 !bg-red-500 px-2 rounded-full"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"
              />
            </svg>
          )}
          <p className="camera-tool-tip tool-tip-message">
            Turn {cameraOn ? "Off" : "On"} Camera
          </p>
        </button>
        <button className="btn relative screen-icon">
          {!screenShareOn ? (
            <img
              src={ScreenShareIcon}
              onClick={startScreenSharing}
              alt="screen-share"
              className="w-9 h-9 bg-white rounded-full mx-1 p-1"
            />
          ) : (
            <img
              src={CloseScreenShareIcon}
              onClick={stopScreenSharing}
              alt="close-screen-share"
              className="w-9 h-9 bg-white rounded-full mx-1 p-1"
            />
          )}
          <p className="screen-tool-tip tool-tip-message">
            {screenShareOn ? "Stop" : "Start"} Screen Share
          </p>
        </button>
        <button
          id="endConnection"
          onClick={disconnectCall}
          className="w-9 h-9 text-white"
        >
          {" "}
          <img src={EndCall} alt="call-end" className="text-white" />
        </button>
      </div>
    </div>
  );
};
