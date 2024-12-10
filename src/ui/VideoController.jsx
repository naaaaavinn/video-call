// const TOKEN =
//   "007eJxTYEg89+uDaFxOpU/ESrE+lq9yr/nOtnyvUzvZ9fbMqYzzWz4pMCQaWCYnGRmmpSQnpZmkphlZGhgYJKUapZhYJBsZpiQbTTEJSG8IZGTYcvQXEyMDBIL4rAxlmSmp+QwMAFAfI3M=";
// const APP_ID = "a09cb21fdcbf4ef29000be2d48c21dc2";
// const CHANNEL = "video";

// const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// let localTracks = [];
// let remoteUsers = {};

// async function joinAndDisplayLocalStream() {
//   client.on("user-published", handleUserJoined);
//   client.on("user-left", handleUserLeft);
//   let UID = await client.join(APP_ID, CHANNEL, TOKEN, null);
//   localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
//   let player = `<div class='video-container' id='user-container-${UID}'>
//                   <div class='video-player' id='user-${UID}'></div>
//                 </div>`;
//   document
//     .getElementById("video-stream")
//     .insertAdjacentHTML("beforeend", player);
//   localTracks[1].play(`user-${UID}`);
//   await client.publish([localTracks[0], localTracks[1]]);
// }

// async function joinStream() {
//   await joinAndDisplayLocalStream();
//   document.getElementById("join-btn").style.display = "none";
//   document.getElementById("stream-controls").style.display = "flex";
// }

// let handleUserJoined = async (user, mediaType) => {
//   remoteUsers[user.uid] = user;
//   await client.subscribe(user, mediaType);

//   if (mediaType === "video") {
//     let player = document.getElementById(`user-container-${user.uid}`);
//     if (player !== null) {
//       player.remove();
//     }

//     player = `<div class='video-container' id='user-container-${user.uid}'>
//                   <div class='video-player' id='user-${user.uid}'></div>
//               </div>`;
//     document
//       .getElementById("video-stream")
//       .insertAdjacentHTML("beforeend", player);
//     user.videoTrack.play(`user-${user.uid}`);
//   }

//   if (mediaType == "audio") {
//     user.audioTrack.play();
//   }
// };

// let handleUserLeft = async (user) => {
//   delete remoteUsers[user.uid];
//   document.getElementById(`user-container-${user.uid}`).remove();
// };

// let leaveAndRemoveLocalStream = async () => {
//   for (let index = 0; index < localTracks.length; index++) {
//     localTracks[index].stop();
//     localTracks[index].close();
//   }

//   await client.leave();
//   document.getElementById("join-btn").style.display = "block";
//   document.getElementById("stream-controls").style.display = "none";
//   document.getElementById("video-stream").innerHTML = "";
// };

// let toggleMic = async (e) => {
//   if (localTracks[0].muted) {
//     await localTracks[0].setMuted(false);
//     e.target.innerText = "Mic On";
//     e.target.style.background = "cadetblue";
//   } else {
//     await localTracks[0].setMuted(true);
//     e.target.innerText = "Mic Off";
//     e.target.style.background = "#EE4B2B";
//   }
// };

// let toggleCamera = async (e) => {
//   if (localTracks[1].muted) {
//     await localTracks[1].setMuted(false);
//     e.target.innerText = "Camera On";
//     e.target.style.background = "cadetblue";
//   } else {
//     await localTracks[1].setMuted(true);
//     e.target.innerText = "Camera Off";
//     e.target.style.background = "#EE4B2B";
//   }
// };

// document.getElementById("join-btn").addEventListener("click", joinStream);
// document
//   .getElementById("leave-btn")
//   .addEventListener("click", leaveAndRemoveLocalStream);
// document.getElementById("mic-btn").addEventListener("click", toggleMic);
// document.getElementById("camera-btn").addEventListener("click", toggleCamera);
