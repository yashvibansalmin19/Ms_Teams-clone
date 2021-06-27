'use strict'
function pip_() {
    const videopip = document.querySelector("#videopip");
    const button = document.querySelector("#button");

    if ("pictureInPictureEnabled" in document) {
        pip.style.display = null;

        pip.addEventListener("click", () => {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture().catch(err => {
                    console.log(err);
                });
                return;
            }
            // mute_unmute.requestPictureInPicture().catch(err =>{
            //     console.log(error);
            // });
            remoteVideo.requestPictureInPicture().catch(err => {
                console.log(err);
            });
        });

        remoteVideo.addEventListener("enterpictureinpicture", e => {
            console.log(e);

            pip.textContent = "Leave Picture-in-Picture";
        })
        // mute_unmute.addEventListener("enterpictureinpicture", e => {
        //     console.log(e);

        //     pip.textContent = "Leave Picture-in-Picture";
        // })

        remoteVideo.addEventListener("leavepictureinpicture", e => {
            console.log(e);

            pip.textContent = "Enter Picture-in-Picture";
        })
        // mute_unmute.addEventListener("leavepictureinpicture", e => {
        //     console.log(e);

        //     pip.textContent = "Enter Picture-in-Picture";
        // })
    }
}