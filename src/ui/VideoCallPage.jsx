import React from "react";

export default function VideoCallPage({
  localTracks,
  roomName,
  leaveAndRemoveLocalStream,
  showVideoControls,
}) {
  let toggleMic = async (e) => {
    if (localTracks[0].muted) {
      await localTracks[0].setMuted(false);
      e.target.innerText = "Mic On";
      e.target.style.background = "cadetblue";
    } else {
      await localTracks[0].setMuted(true);
      e.target.innerText = "Mic Off";
      e.target.style.background = "#EE4B2B";
    }
  };

  let toggleCamera = async (e) => {
    if (localTracks[1].muted) {
      await localTracks[1].setMuted(false);
      e.target.innerText = "Camera On";
      e.target.style.background = "cadetblue";
    } else {
      await localTracks[1].setMuted(true);
      e.target.innerText = "Camera Off";
      e.target.style.background = "#EE4B2B";
    }
  };

  return (
    <div className="w-full">
      <h2>
        Room Name: <span className="capitalize">{roomName}</span>
      </h2>
      <div id="stream-wrapper">
        <div id="video-stream"></div>
        {showVideoControls && (
          <div id="stream-controls">
            <button
              id="leave-btn"
              onClick={() => {
                document.getElementById("video-stream").innerHTML = "";
                leaveAndRemoveLocalStream();
              }}
            >
              Leave Stream
            </button>
            <button id="mic-btn" onClick={toggleMic}>
              Mic ON
            </button>
            <button id="camera-btn" onClick={toggleCamera}>
              Camera ON
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
