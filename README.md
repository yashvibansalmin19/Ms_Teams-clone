# CONNECT- A Video Chat website

Welcome to connect repository. This contains all the code that I have written for my website. The website can accomodate multiple users users and let them have video call and chat.

## Features

1. You can sign into the website using **google log in.**
2. You can start a meeting using **start meeting button** on the home page of the website.
3. You can copt the link of the meeting using **copy meeting link button** and share it with your friends.
4. Anyone **with the meeting link can join the video chat.**
5. You can **mute/unmute** or switch you **video on and off.**
6. You can also **chat** with your friends.
7. If you have signed into the website once, then your name will appear during chat, else you will be displayed as **guest.**
8. You can leave the meeting anytime using **leave meeting button.

## The technologies used:

1. WebRTC
2. PeerJs
3. NodeJs
4. Express
5. Socket.io
6. UUID
7. Google OAuth
8. Passport
9. PostgresSQL

## How the things work:

1. **getUserMedia API** provided by **WebRTC** helps the user to get connected by video call.
2. **NodeJS** and **Express** frameworks provides assistance (libraries socket.io, PeerJS and setting up server) to cater the real time connection very easily. 
3. As this is a real time connection, http protocols fail to cater our need. So we have to upgrade our connection to **websockets**, which allow us to communicate real time. For this I have used the **socket.io** library.
4. **PeerJs** equips with the **UserID** which lets different user to establish the connection with other peers (i.e diffrent user).
5. **UUID** generates a **unique meeting id**, everytime a user hits the **start meeting button**. This unique id servers as the identity to a particular meeting room.
6. **GoogleOauth API** helps the user to login into the website using their google account. As the user hits the log in with google button and grants the permission to use their google id. I have generated the google **client ID**, and **client password**, which lets me access the user info and store the user data, after they permit by clicking on the google id. 
7. **PassportJS** is the authentication middleware provided by NodeJS framework. The whole process of authentication is eased out as passportJS provides comprehensive strategies to login via username and password. In this case the google account information (name, google id).
8. **PostgresSQL** is the SQL database which I have used to store the user information, messages, and room id (meeting id) so that they can be displayed after you leave the meeting.

I have tried to build this project under Microsoft Engage Program' 21. This is my first experience with thid developing environment. I tried to deliver the in these 4 weeks. I hope you find it good.

Thank you!
