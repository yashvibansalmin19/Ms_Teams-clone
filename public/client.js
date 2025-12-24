const socket = io('/');
const videoGrid = document.getElementById('video-grid');

let myPeer;
let localStream = null;
let peers = {};
let myPeerId = null;
let participantCount = 1;
let myUsername = localStorage.getItem('Username') || 'Guest';

// Track added video streams to prevent duplicates
const addedVideos = new Set();

// Track user info (name, mute status, video status)
const userInfo = {};

// Initialize the application
async function init() {
    try {
        // First, get media stream
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        // Add local video
        addVideoStream(localStream, 'local', myUsername, true);

        // Fetch TURN credentials from Metered API
        let iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
        try {
            const response = await fetch('https://connect-video-app.metered.live/api/v1/turn/credentials?apiKey=93f0c8b9ce8ac1f7d9c807394c0ac85c4dfe');
            iceServers = await response.json();
            console.log('TURN credentials loaded');
        } catch (err) {
            console.error('Failed to fetch TURN credentials:', err);
        }

        // Now initialize PeerJS after we have the stream
        myPeer = new Peer(undefined, {
            path: '/peerjs',
            host: '/',
            port: location.port || (location.protocol === 'https:' ? '443' : '80'),
            config: { iceServers }
        });

        // When peer connection opens
        myPeer.on('open', id => {
            myPeerId = id;
            console.log('My peer ID:', id);
            socket.emit('join-room', ROOM_ID, id, myUsername);
        });

        // When we receive a call from another peer
        myPeer.on('call', call => {
            console.log('Receiving call from:', call.peer);
            call.answer(localStream);

            call.on('stream', remoteStream => {
                console.log('Received stream from:', call.peer);
                const username = userInfo[call.peer]?.name || 'Guest';
                addVideoStream(remoteStream, call.peer, username, false);
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
        socket.on('user-connected', (userId, username) => {
            console.log('User connected:', userId, username);
            userInfo[userId] = { name: username || 'Guest', muted: false, videoOff: false };
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
            delete userInfo[userId];
            removeVideo(userId);
            updateParticipantCount(-1);
        });

        // Listen for user status updates (mute/video toggle)
        socket.on('user-status-update', (userId, status) => {
            console.log('Status update from:', userId, status);
            if (userInfo[userId]) {
                userInfo[userId] = { ...userInfo[userId], ...status };
            } else {
                userInfo[userId] = { name: 'Guest', ...status };
            }
            updateVideoTile(userId, status);
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

    call.on('stream', remoteStream => {
        console.log('Got stream from:', userId);
        const username = userInfo[userId]?.name || 'Guest';
        addVideoStream(remoteStream, userId, username, false);
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

// Create video tile container with overlays
function createVideoTile(peerId, username, isLocal) {
    const container = document.createElement('div');
    container.className = 'video-tile';
    container.setAttribute('data-peer', peerId);

    // Video element
    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');
    video.playsInline = true;
    video.autoplay = true;
    if (isLocal) video.muted = true;

    // Avatar placeholder (shown when video is off)
    const avatar = document.createElement('div');
    avatar.className = 'video-avatar';
    const initials = getInitials(username);
    avatar.innerHTML = `<span>${initials}</span>`;

    // Bottom overlay with name and mic status
    const overlay = document.createElement('div');
    overlay.className = 'video-overlay';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'video-name';
    nameSpan.textContent = isLocal ? `${username} (You)` : username;

    const micIcon = document.createElement('span');
    micIcon.className = 'video-mic';
    micIcon.innerHTML = '<i class="fas fa-microphone"></i>';

    overlay.appendChild(nameSpan);
    overlay.appendChild(micIcon);

    container.appendChild(video);
    container.appendChild(avatar);
    container.appendChild(overlay);

    return { container, video, avatar, micIcon };
}

// Get initials from name
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Add video stream to grid (with duplicate prevention)
function addVideoStream(stream, peerId, username, isLocal) {
    if (addedVideos.has(peerId)) {
        console.log('Video already added for:', peerId);
        return;
    }

    addedVideos.add(peerId);

    const { container, video, avatar, micIcon } = createVideoTile(peerId, username, isLocal);

    video.srcObject = stream;

    video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => console.error('Video play error:', err));
    });

    videoGrid.appendChild(container);
    console.log('Added video for:', peerId, 'Total videos:', videoGrid.children.length);

    // Store reference for updates
    userInfo[peerId] = userInfo[peerId] || {};
    userInfo[peerId].name = username;
}

// Update video tile based on status
function updateVideoTile(peerId, status) {
    const container = videoGrid.querySelector(`.video-tile[data-peer="${peerId}"]`);
    if (!container) return;

    const avatar = container.querySelector('.video-avatar');
    const micIcon = container.querySelector('.video-mic');
    const video = container.querySelector('video');

    if (status.muted !== undefined && micIcon) {
        if (status.muted) {
            micIcon.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            micIcon.classList.add('muted');
        } else {
            micIcon.innerHTML = '<i class="fas fa-microphone"></i>';
            micIcon.classList.remove('muted');
        }
    }

    if (status.videoOff !== undefined) {
        if (status.videoOff) {
            container.classList.add('video-off');
            if (video) video.style.opacity = '0';
            if (avatar) avatar.style.display = 'flex';
        } else {
            container.classList.remove('video-off');
            if (video) video.style.opacity = '1';
            if (avatar) avatar.style.display = 'none';
        }
    }
}

// Remove video from grid
function removeVideo(peerId) {
    addedVideos.delete(peerId);
    const container = videoGrid.querySelector(`.video-tile[data-peer="${peerId}"]`);
    if (container) {
        const video = container.querySelector('video');
        if (video) video.srcObject = null;
        container.remove();
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
    const isMuted = audioTrack.enabled;

    audioTrack.enabled = !isMuted;

    if (isMuted) {
        // Now muted
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        btn.title = 'Unmute';
    } else {
        // Now unmuted
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
        btn.title = 'Mute';
    }

    // Update local video tile
    updateVideoTile('local', { muted: isMuted });

    // Broadcast status to other users
    socket.emit('user-status', { muted: isMuted, videoOff: !localStream.getVideoTracks()[0]?.enabled });
}

// Toggle video on/off
function on_off() {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const btn = document.getElementById('video_on_off');
    const isVideoOn = videoTrack.enabled;

    videoTrack.enabled = !isVideoOn;

    if (isVideoOn) {
        // Now video off
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-video-slash"></i>';
        btn.title = 'Turn on camera';
    } else {
        // Now video on
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-video"></i>';
        btn.title = 'Turn off camera';
    }

    // Update local video tile
    updateVideoTile('local', { videoOff: isVideoOn });

    // Broadcast status to other users
    socket.emit('user-status', { muted: !localStream.getAudioTracks()[0]?.enabled, videoOff: isVideoOn });
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
