const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVideoStream;
let currentUserId;
let peers = {};

var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream, "me");

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
        console.log(peers);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    socket.on("user-disconnected", (userId) => {
      if (peers[userId]) peers[userId].close();
      console.log(`User ${userId} left`);
    });

    let text = $('input');

    $('html').keydown((e) => {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit('message', text.val(), currentUserId);
        text.val('');
      }
    });

    socket.on('createMessage', message => {
      if (message.user != currentUserId) {
        $('.messages').append(`<li class="message other-user"><b>${message.user.substring(0, 8)}</b><br/>${message.content}</li>`);
      } else {
        $('.messages').append(`<li class="message me"><b>ME</b><br/>${message.content}</li>`);
      }
      scrollToBottom();
    });
  });

peer.on("call", function (call) {
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);
      });
    },
    function (err) {
      console.log("Failed to get local stream", err);
    }
  );
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
  currentUserId = id;
});

socket.on("disconnect", () => {
  socket.emit("leave-room", ROOM_ID, currentUserId);
});

const connectToNewUser = (userId, streams) => {
  var call = peer.call(userId, streams);
  var video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
};

const addVideoStream = (videoEl, stream, uId = "") => {
  videoEl.srcObject = stream;
  videoEl.id = uId;
  videoEl.addEventListener("loadedmetadata", () => {
    videoEl.play();
  });

  videoGrid.append(videoEl);

  let numberOfUsers = document.getElementsByTagName("video").length;
  if (numberOfUsers > 1) {
    for (let i = 0; i < numberOfUsers; i++) {
      document.getElementsByTagName("video")[i].style.width = 100 / numberOfUsers + "%";
    }
  }
};

const scrollToBottom = () => {
  let d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fa fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fa fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setStopVideo = () => {
  const html = `
    <i class="fa fa-video-camera"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
    <i class="unmute fa fa-pause-circle"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const leaveMeeting = () => {
  window.location.href = '/page/thank-you';
}

