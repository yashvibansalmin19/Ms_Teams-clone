const socket = io('/');
const videoGrid = document.getElementById('video-grid');

let myPeer;
let localStream = null;
let peers = {};
let myPeerId = null;
let participantCount = 1;

// Track added video streams to prevent duplicates
const addedVideos = new Set();

// Initialize the application
async function init() {
    try {
        // First, get media stream
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        // Add local video
        const myVideo = document.createElement('video');
        myVideo.muted = true;
        myVideo.setAttribute('data-peer', 'local');
        addVideoStream(myVideo, localStream, 'local');

        // Now initialize PeerJS after we have the stream
        myPeer = new Peer(undefined, {
            path: '/peerjs',
            host: '/',
            port: location.port || (location.protocol === 'https:' ? '443' : '80')
        });

        // When peer connection opens
        myPeer.on('open', id => {
            myPeerId = id;
            console.log('My peer ID:', id);
            socket.emit('join-room', ROOM_ID, id);
        });

        // When we receive a call from another peer
        myPeer.on('call', call => {
            console.log('Receiving call from:', call.peer);
            call.answer(localStream);

            const video = document.createElement('video');
            video.setAttribute('data-peer', call.peer);

            call.on('stream', remoteStream => {
                console.log('Received stream from:', call.peer);
                addVideoStream(video, remoteStream, call.peer);
            });

            call.on('close', () => {
                removeVideo(call.peer);
            });

            call.on('error', err => {
                console.error('Call error:', err);
                removeVideo(call.peer);
            });
        });

        // Handle peer errors
        myPeer.on('error', err => {
            console.error('PeerJS error:', err);
        });

        // When a new user connects to the room
        socket.on('user-connected', userId => {
            console.log('User connected:', userId);
            // Small delay to ensure the other peer is ready
            setTimeout(() => {
                connectToNewUser(userId, localStream);
            }, 1000);
            updateParticipantCount(1);
        });

        // When a user disconnects
        socket.on('user-disconnected', userId => {
            console.log('User disconnected:', userId);
            if (peers[userId]) {
                peers[userId].close();
                delete peers[userId];
            }
            removeVideo(userId);
            updateParticipantCount(-1);
        });

        // Setup chat
        setupChat();

    } catch (err) {
        console.error('Error accessing media devices:', err);
        showMediaError(err);
    }
}

// Connect to a new user
function connectToNewUser(userId, stream) {
    if (peers[userId]) {
        console.log('Already connected to:', userId);
        return;
    }

    console.log('Calling user:', userId);
    const call = myPeer.call(userId, stream);

    if (!call) {
        console.error('Failed to create call to:', userId);
        return;
    }

    const video = document.createElement('video');
    video.setAttribute('data-peer', userId);

    call.on('stream', remoteStream => {
        console.log('Got stream from:', userId);
        addVideoStream(video, remoteStream, userId);
    });

    call.on('close', () => {
        console.log('Call closed with:', userId);
        removeVideo(userId);
    });

    call.on('error', err => {
        console.error('Call error with', userId, ':', err);
        removeVideo(userId);
    });

    peers[userId] = call;
}

// Add video stream to grid (with duplicate prevention)
function addVideoStream(video, stream, peerId) {
    if (addedVideos.has(peerId)) {
        console.log('Video already added for:', peerId);
        return;
    }

    addedVideos.add(peerId);
    video.srcObject = stream;
    video.setAttribute('data-peer', peerId);

    // Required for mobile browsers
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');
    video.playsInline = true;
    video.autoplay = true;

    video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => console.error('Video play error:', err));
    });

    videoGrid.appendChild(video);
    console.log('Added video for:', peerId, 'Total videos:', videoGrid.children.length);
}

// Remove video from grid
function removeVideo(peerId) {
    addedVideos.delete(peerId);
    const video = videoGrid.querySelector(`video[data-peer="${peerId}"]`);
    if (video) {
        video.srcObject = null;
        video.remove();
        console.log('Removed video for:', peerId);
    }
}

// Show error when media access fails
function showMediaError(err) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'media-error';
    errorDiv.innerHTML = `
        <i class="fas fa-video-slash" style="font-size: 48px; margin-bottom: 16px;"></i>
        <p>Unable to access camera/microphone</p>
        <small>${err.message || 'Please check your permissions'}</small>
    `;
    errorDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: #a1a1aa;
        font-size: 18px;
    `;
    videoGrid.appendChild(errorDiv);
}

// Setup chat functionality
function setupChat() {
    const chatInput = document.getElementById('chat_message');

    if (chatInput) {
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                const message = this.value.trim();
                const username = localStorage.getItem('Username') || 'Guest';
                const userId = localStorage.getItem('Userid') || '';

                socket.emit('message', message, username, userId);
                this.value = '';
            }
        });
    }

    // Listen for incoming messages
    socket.on('createMessage', (message, senderName) => {
        const messagesList = document.querySelector('.messages');
        if (messagesList) {
            const li = document.createElement('li');
            li.className = 'message';

            // Sanitize message to prevent XSS
            const sanitizedMessage = escapeHtml(message);
            const sanitizedName = escapeHtml(senderName || 'Guest');

            li.innerHTML = `<b>${sanitizedName}</b>${sanitizedMessage}`;
            messagesList.appendChild(li);
            scrollToBottom();
        }
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Scroll chat to bottom
function scrollToBottom() {
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Update participant count
function updateParticipantCount(change) {
    participantCount = Math.max(1, participantCount + change);
    const countEl = document.querySelector('#participantCount span');
    if (countEl) {
        countEl.textContent = participantCount;
    }
}

// Toggle mute/unmute
function muteunmute() {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    const btn = document.getElementById('mute_unmute');

    if (audioTrack.enabled) {
        audioTrack.enabled = false;
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        btn.title = 'Unmute';
    } else {
        audioTrack.enabled = true;
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
        btn.title = 'Mute';
    }
}

// Toggle video on/off
function on_off() {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const btn = document.getElementById('video_on_off');

    if (videoTrack.enabled) {
        videoTrack.enabled = false;
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-video-slash"></i>';
        btn.title = 'Turn on camera';
    } else {
        videoTrack.enabled = true;
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-video"></i>';
        btn.title = 'Turn off camera';
    }
}

// Copy meeting URL using modern Clipboard API
function CopyURL() {
    const url = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
            .then(() => showToast('Link copied to clipboard!'))
            .catch(() => fallbackCopyURL(url));
    } else {
        fallbackCopyURL(url);
    }
}

// Fallback for older browsers
function fallbackCopyURL(url) {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand('copy');
        showToast('Link copied to clipboard!');
    } catch (err) {
        showToast('Failed to copy link');
    }

    document.body.removeChild(textArea);
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
