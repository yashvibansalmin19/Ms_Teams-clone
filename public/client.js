const socket = io('/')
const videoGrid = document.getElementById('video-grid')
var myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '5500'
})

const peers = {}

navigator.mediaDevices.getUserMedia({  //apna video 
    video: true,
    audio: true
}).then(stream => {
    const MyVideo = document.createElement('video')
    MyVideo.muted = true
    localVideo = stream;
    addVideoStream(MyVideo, stream)
    prompt('Copy meeting URL:', window.location);
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
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

function muteunmute() {
    const Audio = localVideo.getAudioTracks()[0].enabled;
    if (Audio) {
        console.log("audio off");
        localVideo.getAudioTracks()[0].enabled = false;
        document.getElementById("mute_unmute").style.background = '#FF0000';

        document.getElementById("mute_unmute").title = 'unmute';
    }
    else {
        console.log("audio on");
        localVideo.getAudioTracks()[0].enabled = true;
        document.getElementById("mute_unmute").style.background = '#0088D6';

        document.getElementById("mute_unmute").title = 'mute';
    }
}

function on_off() {
    const Video = localVideo.getVideoTracks()[0].enabled;
    if (Video) {
        console.log("video off");
        localVideo.getVideoTracks()[0].enabled = false;
        document.getElementById("video_on_off").style.background = '#FF0000';
        document.getElementById("video_on_off").title = 'video off';
    }
    else {
        console.log("video on");
        localVideo.getVideoTracks()[0].enabled = true;
        document.getElementById("video_on_off").style.background = '#0088D6';
        document.getElementById("video_on_off").title = 'video on';
    }
}

