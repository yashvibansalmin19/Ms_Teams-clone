



let video1 = document.querySelector("#video");

if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
    navigator.mediaDevices.getUserMedia({video: true, audio: true}). then((stream) => {
       video1.srcObject = stream;
       video1.play();
    });
}

let video2 = document.querySelector("#video1");

if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
    navigator.mediaDevices.getUserMedia({video: true, audio: true}). then((stream) => {
       video2.srcObject = stream;
       video2.play();
    });
}
