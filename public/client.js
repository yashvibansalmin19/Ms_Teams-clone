const socket = io('/')
const videoGrid = document.getElementById('video-grid')
let myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '5500'
})

// let userName;
// document.getElementById('Name').innerHTML = window.location.search = userName;

const peers = {};
let localVideo;
let remoteVideo;

navigator.mediaDevices.getUserMedia({  //apna video 
    video: true,
    audio: true
}).then(stream => {
    const MyVideo = document.createElement('video')
    MyVideo.muted = true
    localVideo = stream;
    addVideoStream(MyVideo, stream)
    prompt('Press "ctrl+c" to copy meeting URL:', window.location);
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })

    // input value

    let text = $("input");

    // when press enter send message

    $('html').keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('')
        }
    });
    socket.on("createMessage", message => {
        $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom()
    })
})

myPeer.on('call', call => { //jo call kr rha h uska video

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        call.answer(localVideo)
        const video = document.createElement('video')
        call.on('stream', remoteVideo => {
            addVideoStream(video, remoteVideo)
        })
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

// Defining the funtions

function scrollToBottom() {
    let d = $('.chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', remoteVideo => {
        addVideoStream(video, remoteVideo)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

// To mute or unmute yourself

function muteunmute() {
    const Audio = localVideo.getAudioTracks()[0].enabled;
    if (Audio) {
        console.log("audio off");
        localVideo.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
        document.getElementById("mute_unmute").style.background = '#FF0000';
        document.getElementById("mute_unmute").title = 'unmute';
    }
    else {
        console.log("audio on");
        localVideo.getAudioTracks()[0].enabled = true;
        setMuteButton();
        document.getElementById("mute_unmute").style.background = '#0088D6';
        document.getElementById("mute_unmute").title = 'mute';
    }
}

// To show or hide your video

function on_off() {
    const Video = localVideo.getVideoTracks()[0].enabled;
    if (Video) {
        console.log("video off");
        localVideo.getVideoTracks()[0].enabled = false;
        setPlayVideo();
        document.getElementById("video_on_off").style.background = '#FF0000';
        document.getElementById("video_on_off").title = 'video on';
    }
    else {
        console.log("video on");
        localVideo.getVideoTracks()[0].enabled = true;
        setStopVideo();
        document.getElementById("video_on_off").style.background = '#0088D6';
        document.getElementById("video_on_off").title = 'video off';
    }
}

// Share your screen


function shareScreen() {
    navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(function (stream) {
        let videoTrack = stream.getVideoTracks()[0];
        remoteVideo.forEach(function (myPeer) {
            var sender = myPeer.getSenders().find(function (s) {
                return s.track.kind == videoTrack.kind;
            });
            console.log('found sender:', sender);
            sender.replaceTrack(videoTrack);
        });
        screenTrack.onended = function () {
            sender.replaceTrack(localVideo.getTracks()[1]);
        }
    }).catch((err) => {
        console.log(err);
    })
}
// Stop Screen Share

// function stopScreenShare() {
//     let videotrack = localVideo.getVideoTracks()[0];
//     var sender = currentPeer.getSenders().find(function (s) {
//         return s.track.kind == videotrack;
//     })
//     sender.replaceTrack(videotrack)
// }

//Chnaging icon

function setMuteButton() {
    const html = `
      <i class="fas fa-microphone"></i>
    `
    document.querySelector('.muteUnmute').innerHTML = html;
}

function setUnmuteButton() {
    const html = `
      <i class="fas fa-microphone-slash"></i>
    `
    document.querySelector('.muteUnmute').innerHTML = html;
}

function setStopVideo() {
    const html = `
      <i class="fas fa-video"></i>
    `
    document.querySelector('.videoOnOff').innerHTML = html;
}

function setPlayVideo() {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    `
    document.querySelector('.videoOnOff').innerHTML = html;
}
