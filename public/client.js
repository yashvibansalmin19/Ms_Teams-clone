// Getting refrence to the webpage elements

let divSelectRoom = document.getElementById("selectRoom");
let divConsultingRoom = document.getElementById("consultingRoom");
let inputRoomNumber = document.getElementById("roomNumber");
let buttonGoToRoom = document.getElementById("goToRoom");
let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");

// establshing global letiables

let roomNumber;
let localStream;
let remoteStream;
let rtcPeerConnection;
let isCaller=false;

// Connecting the socket.io server

let socket = io();

let streamConstraints = {
    audio: false, 
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

buttonGoToRoom.onclick = function(){
    if(inputRoomNumber.value==''){
        alert("Please enter a room number");
    }
    else{
        console.log('Hello');
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
        localStream = stream; // Sets localStream to letiable
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
        localStream = stream; // Sets localStram to letiable
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
        rtcPeerConnection.onaddstream = onAddStream;

        // Adds current local stream to the object
        
        rtcPeerConnection.addStream(localStream);
        
        // Prepares an offer

        rtcPeerConnection.createOffer(setLocalAndOffer, function(e){console.group(e)});
    }
});

// When server emits offer

socket.on('offer', function(event){
    
    if(!isCaller){

        // Creates an RTCPeerConnection Object

        rtcPeerConnection = new RTCPeerConnection(iceServers);

        // Adds event listeners to newly ceated object

        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.onaddStream = onAddStream;

        // Adds current local stream to the object

        rtcPeerConnection.addStream(localStream);
        
        // Stores the offer as remote description
        
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
        
        // Prepares an answer

        rtcPeerConnection.createAnswer(setLocalAndAnswer, function(e){console.log(e)});
    }
});

// When server emits 'answer'

socket.on('answer', function(event){
     
    // Stores it as remote description

    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription (event));
});

// When server emits 'candidate'

socket.on('candidate', function(event){
         
    // Craetes a candidate object

    let candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate
    });

    // Stores candidate
//if(rtcPeerConnection)
    rtcPeerConnection.addIceCandidate(candidate);
});

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

function setLocalAndOffer(sessionDescription){
    rtcPeerConnection.setLocalDescription(sessionDescription);
    socket.emit('offer',{
        type: 'offer',
        sdp: sessionDescription,
        room: roomNumber
    });
    console.log('offer')
}

// Stores answer and sends message to the server

function setLocalAndAnswer (sessionDescription){
    rtcPeerConnection.setLocalDescription(sessionDescription);
    socket.emit('answer', {
        type: 'answer',
        sdp: sessionDescription,
        room: roomNumber
    });
    console.log('answer')
}
