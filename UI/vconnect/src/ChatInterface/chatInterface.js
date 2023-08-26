import React, { useState, useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";
import { Link, Navigate } from "react-router-dom";
import "./chatInterface.css";
const ENDPOINT = "http://localhost:8080";
const socket = socketIOClient(ENDPOINT);

function App() {
    const [isAuth, setIsAuth] = useState(false);
    const [messagesMap, setMessagesMap] = useState(new Map());
    const [messageInput, setMessageInput] = useState(null);
    const [recipeintUsername, setRecipientUsername] = useState(null);
    const [usernameGL, setUsernameGL] = useState(null);
    const [isAllow, setIsAllow] = useState(false);
    const [friendReq, setFriendReq] = useState(false);
    const [friendsBT, setFriendsBT] = useState(false);
    const [searchFriendSt, setSearchFriendSt] = useState(0);
    const [addRequestResponse, setAddRequestResponse] = useState(null);
    const activeUsers = useRef([]);
    const messagesEndRef = useRef(null);
    const usernameRef = useRef(null); // using this since usernameGL state was coming null even after updating to a value inside empty useEffect
    const chatInputRef = useRef(null);
    const searchFriendRef = useRef(null);
    const searchUserRef = useRef(null);
    const onlineFriendsRef = useRef([]);
    const offlineFriendsRef = useRef([]);
    const requestsRef = useRef({ sentRequests: [], pendingRequests: [] });

    function checkAuth() {
        fetch('http://localhost:8080/checkAuth', { credentials: 'include' }).then(response => {
            console.log(response);
            if (response.status === 200) setIsAuth(false);
            else setIsAuth(true);
            return response.json();
        },
            error => {
                setIsAuth(true)
                console.log(error);
            })
            .then(json => {
                const msg = json === undefined ? 'json is undefined' : json.message;
                console.log('JSON Body: ' + msg);
            }, error => {
                console.log('cannot retrieve json body: ' + error);
            });
    }

    useEffect(() => {
        scrollToBottom()
    }, [messagesMap]);

    useEffect(() => {
        // Check authentication when the page loads
        checkAuth();

        socket.on("getActiveUsers", (data) => {
            activeUsers.current = [];
            activeUsers.current.push(...data);
        });

        socket.on("private message", (senderUsername, msg) => {
            addMessage(senderUsername, msg, 'left');
        });

        // Set repetitive check of authentication using interval
        const id = setInterval(checkAuth, 1000 * 60 * 15);

        // Check whether cookie is set for username
        let userName = document.cookie.split('; ').find(row => row.startsWith('username='));
        if (userName) {
            userName = userName.split('=')[1];
        }
        if (userName) {
            setUsernameGL(userName);
        }

        socket.on("user status", (user, msg) => {
            if (usernameRef.current && usernameRef.current === user && !msg) setIsAllow(true);
        });

        socket.on("search response", (response) => {
            if (response) setSearchFriendSt(1);
            else setSearchFriendSt(2);
        });

        socket.on("add request response", (response) => {
            setAddRequestResponse(response);
        });

        socket.on("show friends response", (response) => {
            if (response) {
                onlineFriendsRef.current = [];
                offlineFriendsRef.current = [];
                onlineFriendsRef.current.push(...response.onlineFriends);
                offlineFriendsRef.current.push(...response.offlineFriends);
            }
        });

        socket.on("show requests response", (response) => {
            if (response && response.sentRequests && response.pendingRequests) {
                requestsRef.current = response;
            }
        });

        return () => {
            clearInterval(id);
        }
    }, []);

    useEffect(() => {
        // Add the user to the map of users at the backend
        usernameRef.current = usernameGL;
        if (usernameGL) {
            socket.emit("check user active", usernameGL);
        }
    }, [usernameGL]);

    useEffect(() => {
        if (isAllow) socket.emit("new user", usernameGL);

        // First call to getActiveUsers when the user is allowed to access
        socket.emit("getActiveUsers");

        socket.emit("show friends");

        socket.emit("show requests");

        // check repetitive check of showfriends
        const friendsId = setInterval(() => socket.emit("show friends"), 1000 * 60);
        const requestsId = setInterval(() => socket.emit("show requests"), 1000 * 60);
        return () => {
            clearInterval(friendsId);
            clearInterval(requestsId);
        }
    }, [isAllow]);

    function updateInputMessage(e) {
        setMessageInput(e.target.value);
    }

    function addMessage(senderUsername, msg, pos) {
        setMessagesMap(prevState => {
            const updatedMap = new Map(prevState);
            let updatedArr = [];
            if (prevState.get(senderUsername)) {
                updatedArr = [...prevState.get(senderUsername), { username: senderUsername, msg: msg, time: new Date(), pos: pos }];
            } else {
                updatedArr.push({ username: senderUsername, msg: msg, time: new Date(), pos: pos });
            }
            updatedMap.set(senderUsername, updatedArr);
            return updatedMap;
        });
    }

    useEffect(() => {
        console.log(messagesMap);
    }, [messagesMap])

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }

    function handleSubmit() {
        chatInputRef.current.focus();
        if (recipeintUsername && messageInput && messageInput.length > 0) {
            // set the chat input message as empty 
            chatInputRef.current.value = "";
            setMessageInput("");

            socket.emit("private message", recipeintUsername, messageInput);
            addMessage(recipeintUsername, messageInput, 'right');
        }
    }

    function toggleFriendRequests() {
        setFriendReq(prev => !prev);
    }

    function toggleFriends() {
        setFriendsBT(prev => !prev);
    }

    function friendRequests() {
        socket.emit("show requests");
        return (
            <div className="friendRequests" style={friendReq ? { display: 'block', animationName: 'lightUp', animationDuration: '0.5s' } : { display: 'none' }}>
                <button className="closeButton" onClick={() => toggleFriendRequests()}>Close</button>
                <div className="sentRequests">
                    <p>Sent Requests</p>
                    <hr></hr>
                    <ul>
                        {
                            requestsRef.current.sentRequests.map((obj, index) => {
                                return <li className="requestsLi" key={index + "sentRequests"}>{obj}</li>
                            })
                        }
                    </ul>
                </div>
                <div className="pendingRequests">
                    <p>Pending Requests</p>
                    <hr></hr>
                    <ul>
                        {
                            requestsRef.current.pendingRequests.map((obj, index) => {
                                return <li className="requestsLi" key={index + "pendingRequests" + (Math.random() * 100)}>{obj}<button class="requestsBT" onClick={(e) => handleAcceptRequest(obj, e)}>Accept</button><br></br></li>
                            })
                        }
                    </ul>
                </div>
            </div>
        )
    }

    function handleAcceptRequest(username, e) {
        socket.emit("accept user", username);
        socket.emit("show requests");
        socket.emit("show friends");
        e.target.disabled = true;
    }

    function friends() {
        socket.emit("show friends");
        return (
            <div className="friends" style={friendsBT ? { display: 'block', animationName: 'lightUp', animationDuration: '0.5s' } : { display: 'none' }}>
                <button className="closeButton" onClick={() => toggleFriends()}>Close</button>
                <div className="onlineFriends">
                    <p>Online</p>
                    <hr></hr>
                    <ul>
                        {
                            onlineFriendsRef.current.map((user, index) => <li class="onlineLi" key={index + 'on'}>{user}<button class="setFriend" onClick={() => {
                                setRecipientUsername(user);
                                toggleFriends();
                            }}>Set Recipient</button><br></br></li>)
                        }
                    </ul>
                </div>
                <div className="offlineFriends">
                    <p>Offline</p>
                    <hr></hr>
                    <ul>
                        {
                            offlineFriendsRef.current.map((user, index) => <li key={index + 'off'}>{user}</li>)
                        }
                    </ul>
                </div>
            </div>
        )
    }

    function handleSearchFriend() {

        if (searchFriendRef.current != null && searchFriendRef.current.value !== "") {
            socket.emit("search user", searchFriendRef.current.value);
        }
    }

    function handleSendRequest() {
        searchUserRef.current.disabled = true;
        socket.emit("add request", searchFriendRef.current.value);
    }

    function showSendRequestPopUp() {
        return (
            <div className="shadow">
                <div className="sendRequestPopUp">
                    <span>User Found!</span>
                    <button onClick={() => {
                        setSearchFriendSt(0);
                        searchFriendRef.current.value = "";
                        setAddRequestResponse(null);
                    }}>Close</button>
                    <span>{searchFriendRef.current.value}</span>
                    <button onClick={() => handleSendRequest()} ref={searchUserRef}>Send Request</button>
                    {
                        addRequestResponse != null ? addRequestResponse == true ? <span>Operation Successful!</span> : <span>Operation Failed!</span> : <></>
                    }
                </div>
            </div>
        )
    }

    function showNotExistNotif() {
        searchFriendRef.current.value = "";
        return (
            <div className="notExistNotif">
                <span>User doesn't exist</span>
            </div>
        )
    }

    useEffect(() => {
        if (searchFriendSt === 2) {
            const clearNotif = setTimeout(() => setSearchFriendSt(0), 2000);
            return () => clearTimeout(clearNotif);
        }
    }, [searchFriendSt])

    if (isAuth) {
        return <Navigate to='/login'></Navigate>
    }
    else if (!isAllow) {
        return (
            <div>
                <h3>Please close the previous session</h3>
            </div>
        )
    }
    else {
        return (
            <div class='chatMain'>
                <div className="friendsPanel">
                    <input type="text" placeholder="Add Friends" id="inputFriend" ref={searchFriendRef}></input>
                    <button className="searchButton" onClick={() => handleSearchFriend()}>Search</button>
                    <button className="friendsButton" onClick={() => toggleFriends()}>Friends</button>
                    <button className="friendReqButton" onClick={() => toggleFriendRequests()}>Friend Requests</button>
                </div>
                {
                    friendRequests()
                }
                {
                    friends()
                }
                {
                    searchFriendSt == 1 ? showSendRequestPopUp() : searchFriendSt == 2 ? showNotExistNotif() : <></>
                }
                <br></br>
                {
                    recipeintUsername ? (<div class='chat'>
                        <div class='window'>
                            <div class='chatWindow'>
                                {
                                    messagesMap.get(recipeintUsername) ? messagesMap.get(recipeintUsername).map((obj, index) => <div class={obj.pos == 'right' ? 'chatText right' : 'chatText'} key={'chat' + index}>{obj.msg}</div>) : <></>
                                }
                                <div ref={messagesEndRef}></div>
                            </div>
                            <div class='inputWindow'>
                                <textarea placeholder="Enter message here" id='inputMain' onChange={e => updateInputMessage(e)} ref={chatInputRef}></textarea>
                                <button className="sendButton"
                                    onClick={() => handleSubmit()}
                                >Send</button>
                            </div>
                        </div>
                    </div>) : <div className="friendNotSelected"><span>Please select friend to chat with</span></div>
                }

            </div>
        );
    }
}

export default App;
