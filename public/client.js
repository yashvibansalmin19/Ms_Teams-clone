// Getting refrence to the webpage elements

let divSelectRoom = document.getElementById("selectRoom");
let divConsultingRoom = document.getElementById("consultingRoom");
let inputRoomNumber = document.getElementById("roomNumber");
let buttonGoToRoom = document.getElementById("goToRoom");
let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");
let buttonToLeave = document.getElementById("EndCall");
let buttonToShare = document.querySelector("screenShare");

// establshing global letiables

let roomNumber;
let localStream;
let remoteStream;
let rtcPeerConnection;
let isCaller = false;
let ScreenShare;

// Connecting the socket.io server

let socket = io();

let streamConstraints = {
    audio: true,
    video: true
};

// STUN and TURN Servers

let iceServers = {
    'iceServers': [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
    ],
}

// Adding click event to the button
buttonGoToRoom.onclick = function () {

    if (inputRoomNumber.value == '') {
        alert("Please enter a room number");
    }
    else {
        console.log('Hello');
        roomNumber = inputRoomNumber.value;  // Taking value from the element
        socket.emit('create or join', roomNumber); //Sending message to the server
        //     divSelectRoom.style = "display: none"; // Hide select room division
        //     divConsultingRoom.style = "display: block"; // Show consultingRoom division 
        let loginPage = document.getElementById("login");
        let VideoPage = document.getElementById("videoPage");
        loginPage.classList.toggle("hidden");
        VideoPage.classList.toggle("hidden");
    }
}


// When server emits 'created'

socket.on('created', function (room) {

    // Caller gets user media devices with defined constraints

    navigator.mediaDevices.getUserMedia(streamConstraints).then(function (stream) {
        localStream = stream; // Sets localStream to variable
        localVideo.srcObject = stream; // Shows stream to the user
        isCaller = true; // Sets current user as caller
        console.log('created');
    }).catch(function (err) {
        console.log("An error occured when accessing media devices.", err);
    });
});

// When server emits 'joined'

socket.on("joined", function (room) {

    // Caller gets user media devices

    navigator.mediaDevices.getUserMedia(streamConstraints).then(function (stream) {
        localStream = stream; // Sets localStram to variable
        localVideo.srcObject = stream; // Shows stream to the user
        socket.emit('ready', roomNumber); // Sends message to the server
        console.log('joined');
    }).catch(function (err) {
        console.log("An error occured when accessing media devices.", err);
    });
});

// Whe server emits 'ready'

socket.on('ready', function () {

    if (isCaller) {

        // Create an RTCPeerConnection object

        rtcPeerConnection = new RTCPeerConnection(iceServers);

        // Adds event listeners to newly created object

        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.onaddstream = onAddStream;

        // Adds current local stream to the object

        rtcPeerConnection.addStream(localStream);

        // Prepares an offer

        rtcPeerConnection.createOffer(setLocalAndOffer, function (e) { console.group(e) });
    }
});

// When server emits offer

socket.on('offer', function (event) {

    if (!isCaller) {

        // Creates an RTCPeerConnection Object

        rtcPeerConnection = new RTCPeerConnection(iceServers);

        // Adds event listeners to newly ceated object

        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.onaddstream = onAddStream;

        // Adds current local stream to the object

        rtcPeerConnection.addStream(localStream);

        // Stores the offer as remote description

        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));

        // Prepares an answer

        rtcPeerConnection.createAnswer(setLocalAndAnswer, function (e) { console.log(e) });
    }
});

// When server emits 'answer'

socket.on('answer', function (event) {

    // Stores it as remote description

    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
});

// When server emits 'candidate'

socket.on('candidate', function (event) {

    // Craetes a candidate object

    let candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate
    });

    // Stores candidate

    rtcPeerConnection.addIceCandidate(candidate);
});

socket.on('full', function (event) {
    alert("Room full, Please enter another room number. ")
})

// buttonToLeave.onclick = function(){
//    localStream = hangup;
//    socket.emit('leaving', roomNumber);
//    divSelectRoom.style = "display: none";
//    divConsultingRoom.style = "display: none";
// }

// Functions that are refrences before as listeners for the peer connection
// When a user receives the other user's video and audio stream

function onAddStream(event) {
    remoteVideo.srcObject = event.stream;
    remoteStream = event.stream;
}

// function leave() {
//     rtcPeerConnection.close();
//     console.log("leaving");
//     delete[rtcPeerConnection.candidate];
//     delete [rtcPeerConnection.addIceCandidate];
//     delete [rtcPeerConnection.addStream];
//     localStream=null;
//     remoteStream=null;
// }

// Sends a candidate message to the sever

function onIceCandidate(event) {
    if (event.candidate) {
        console.log('sending ice candidate');
        socket.emit('candidate', {
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
            room: roomNumber
        })
    }
}

// Stores offer and sends messge to the server

function setLocalAndOffer(sessionDescription) {
    rtcPeerConnection.setLocalDescription(sessionDescription);
    socket.emit('offer', {
        type: 'offer',
        sdp: sessionDescription,
        room: roomNumber
    });
    console.log('offer')
}

// Stores answer and sends message to the server

function setLocalAndAnswer(sessionDescription) {
    rtcPeerConnection.setLocalDescription(sessionDescription);
    socket.emit('answer', {
        type: 'answer',
        sdp: sessionDescription,
        room: roomNumber
    });
    console.log('answer')
}


function muteunmute() {
    const Audio = localStream.getAudioTracks()[0].enabled;
    if (Audio) {
        console.log("audio off");
        localStream.getAudioTracks()[0].enabled = false;
    }
    else {
        console.log("audio on");
        localStream.getAudioTracks()[0].enabled = true;
    }
}

function on_off() {
    const Video = localStream.getVideoTracks()[0].enabled;
    if (Video) {
        console.log("video off");
        localStream.getVideoTracks()[0].enabled = false;
    }
    else {
        console.log("video on");
        localStream.getVideoTracks()[0].enabled = true;
    }
}

// const start = () => {
//     var x= document.getElementById('mute-unmute');
//     x.style.visibility = "visible";
// }