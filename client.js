// Getting refrence to the webpage elements

var divSelectRoom = document.getElementById("selectRoom");
var divConsultingRoom = document.getElementById("consultingRoom");
var inputRoomNumber = document.getElementById("roomNumber");
var buttonGoToRoom = document.getElementById("goToRoom");
var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");

// establshing global variables

var roomNumber;
var localStream;
var remoteStream;
var rtcPeerConnection;

// STUN and TURN Servers

var iceServers = {
    'iceServers': [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
    ],
}

var streamConstraints = {audio: true, video: true};
var isCaller;

// Connecting the socket.io server

var socket = io.connect();

// Adding click event to the button

buttonGoToRoom.onclick = function(){
    if(inputRoomNumber.value==''){
        alert("Please enter a room number");
    }
    else{
        roomNumber = inputRoomNumber.value;  // Taking value from the element
        socket.emit('create or join', roomNumber); //Sending message to the server
        divSelectRoom.style = "display: none"; // Hide select room division
        divConsultingRoom.style = "display: block"; // Show consultingRoom division 
    }
};

// When server emits 'created'

socket.on('created', function(room){

    // Caller gets user media devices with defined constraints

    navigator.mediaDevices.getUserMedia(streamConstraints).then(function(stream){
        localStream = stream; // Sets localStream to variable
        localVideo.srcObject = stream; // Shows stream to the user
        isCaller = true; // Sets current user as caller
    }).catch(function(err){
        console.log("An error occured when accessing media devices.", err);
    });
});

// When server emits 'joined'

socket.on("joined", function(room){

    // Caller gets user media devices

    navigator.mediaDevices.getUserMedia(streamConstraints).then(function(stream){
        localStream = stream; // Sets localStram to variable
        localVideo.srcObject = stream; // Shows stream to the user
        socket.emit('ready', roomNumber); // Sends message to the server
    }).catch(function(err){
        console.log("An error occured when accessing media devices.", err);
    });
});

// Whe server emits 'ready'

socket.on('ready', function(){
    if(isCaller){

        // Create an RTCPeerConnection object

        rtcPeerConnection= new RTCPeerConnection(iceServers);

        // Adds event listeners to newly created object

        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.ontrack = onAddStream;

        // Adds current local stream to the object
        rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
        rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream);

        // Prepares an offer

        rtcPeerConnection.createOffer().then(sessionDescription => {
            rtcPeerConnection.setLocalDescription(sessionDescription);
            socket.emit('offer', {
                type: 'offer',
                sdp: sessionDescription,
                room: roomNumber
            });
        })
        .catch(error => {
            console.log(error)
        })
    }
});

// When server emits offer

socket.on('offer', function(event){
    if(!isCaller){

        // Creates an RTCPeerConnection Object

        rtcPeerConnection = new RTCPeerConnection(iceServers);

        // Adds event listeners to newly ceated object

        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.addtrack = onAddStream;

        // Adds current local stream to the object

        rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
        rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream);
        
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
        // Prepares an answer

        rtcPeerConnection.createAnswer().then(sessionDescription => {
            rtcPeerConnection.setLocalDescription(sessionDescription);
            socket.emit('answer', {
                type: 'answer',
                sdp: sessionDescription,
                room: roomNumber
            });
        })
        .catch(error => {
            console.log(error)
        })
    }
});

// When server emits 'answer'

socket.on('answer', function(event){
     
    // Stores it as remote description

    rtcpeerConnection.setRemoteDescription(new RTCSessionDescription (event));
});

// When server emits 'candidate'

// socket.on('candidate', function(event){
         
//     // Craetes a candidate object

//     var candidate = new RTCIceCandidate({
//         sdpMLineIndex: event.label,
//         candidate: event.candidate
//     });

//     // Stores candidate

//     rtcPeerConnection.addIceCandidate(candidate);
// });

// When a user receives the other user's video and audio stream

function onAddStream(event){
    remoteVideo.srcObject = event.stream;
    remoteStream = event.stream;
}

// Functions that are refrences before as listeners for the peer connection

// Sends a candidate message to the sever

function onIceCandidate(event){
    if(event.candidate){
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

// function setLocalAndOffer(sessionDescription){
//     rtcPeerConnection.setLocalDescription(sessionDescription);
//     socket.emit('offer',{
//         type: 'offer',
//         sdp: sessionDescription,
//         room: roomNumber
//     });
// }

// // Stores answer and sends message to the server

// function setLocalAndAnswer (sessionDescription){
//     rtcPeerConnection.setLocalDescription(sessionDescription);
//     socket.emit('answer', {
//         type: 'answer',
//         sdp: sessionDescription,
//         room: roomNumber
//     });
// }