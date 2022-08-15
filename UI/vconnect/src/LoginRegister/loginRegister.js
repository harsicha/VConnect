import React, { useState, useEffect } from 'react';
import './loginRegister.css';
import { Link, Navigate } from "react-router-dom";

function Authentication() {
    const [isRequired, setIsRequired] = useState(true);
    const [isCookie, setIsCookie] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [isRegister, setIsRegister] = useState(false);

    useEffect(() => {
        checkAuth();
    }, [isCookie])

    useEffect(() => {
        const id = setInterval(checkAuth, 1000 * 60 * 15);
        return () => clearInterval(id);
    }, [])

    function checkAuth() {
        fetch('http://localhost:8080/checkAuth', { credentials: 'include' }).then(response => {
            console.log(response);
            if (response.status === 200) setIsRequired(false);
            else setIsRequired(true);
            return response.json();
        },
            error => {
                setIsRequired(true);
                console.log(error);
            })
            .then(json => {
                const msg = json === undefined ? 'json is undefined' : json.message;
                console.log('JSON Body: ' + msg);
            }, error => {
                console.log('cannot retrieve json body: ' + error);
            });
    }

    // Toggle Register/Login ON or OFF
    let getDivStyle = () => {
        return isRequired ? { display: 'block' } : { display: 'none' };
    }

    let toggleLogin = () => {
        setIsLogin(true);
        setIsRegister(false);
    }

    let toggleRegister = () => {
        setIsLogin(false);
        setIsRegister(true);
    }

    let toggleDisplay = check => {
        return check ? { display: 'grid' } : { display: 'none' };
    }

    if (isRequired) {
        return (
            <div class="auth" style={getDivStyle()}>
                <div class="toggleHeader">
                    <button onClick={toggleLogin} class={isLogin ? 'toggleButton buttonBorderLeft selectedLeft' : 'toggleButton buttonBorderLeft'}>Login</button>
                    <button onClick={toggleRegister} class={isRegister ? 'toggleButton buttonBorderRight selectedRight' : 'toggleButton buttonBorderRight'}>Register</button>
                </div>
                <div class='login' style={toggleDisplay(isLogin)}>
                    <Login isCookie={setIsCookie} checkAuth={checkAuth}></Login>
                </div>
                <div class='register' style={toggleDisplay(isRegister)}>
                    <Register isCookie={setIsCookie} checkAuth={checkAuth}></Register>
                </div>
            </div>
        )
    }
    else {
        return <Navigate to='/chat'></Navigate>
    }
}

function Login(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        if (username.length >= 8 && password.length >= 8) {
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    }, [username, password]);

    useEffect(() => {
        console.log("Login isValid: " + isValid);
    }, [isValid]);

    function handleSubmit(e) {
        e.preventDefault();
        fetch('http://localhost:8080/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password })
        }).then(response => {
            e.target.reset();
            console.log(response);
            if (response.status === 200) {
                console.log('Cookies set!');
                props.isCookie(true);
            }
            else {
                console.log('There was a problem');
                props.isCookie(false);
            }
            props.checkAuth();
            return response.json();
        },
            error => {
                console.log(error);
            })
            .then(json => {
                const msg = json === undefined ? 'json is undefined' : json.message;
                console.log('JSON Body: ' + msg);
            }, error => {
                console.log('cannot retrieve json body: ' + error);
            });
    }

    return (
        <form id='loginForm' action="#" method="post" onSubmit={e => {
            handleSubmit(e);
        }}>
            {/* <label for="username" class='lbl'>Username</label> */}
            <input type="text" name="username" id="usermame" class='inputBox' placeholder='Username' onChange={e => {
                setUsername(e.target.value);
            }}></input><br></br>
            {/* <label for="password" class='lbl'>Password</label> */}
            <input type="password" name="password" id="password" class='inputBox' placeholder='Password' onChange={e => {
                setPassword(e.target.value);
            }}></input><br></br><br></br>
            <input type="submit" value="Login" class='submit' disabled={!isValid}></input>
        </form>
    );
}

function Register(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [cnfpassword, setcnfpassword] = useState("");
    const [isValid, setIsValid] = useState(false);
    useEffect(() => {
        if (username.length >= 8 && password.length >= 8 && cnfpassword === password) {
            setIsValid(true);
        }
        else {
            setIsValid(false);
        }
    }, [username, password, cnfpassword])

    useEffect(() => {
        console.log("isValid: " + isValid);
    }, [isValid])

    function handleSubmit(e) {
        e.preventDefault();
        fetch('http://localhost:8080/register', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password })
        }).then(response => {
            console.log(response);
            if (response.status === 200) {
                console.log('Cookies set!');
                props.isCookie(true);
            }
            else {
                console.log('There was a problem');
                props.isCookie(false);
            }
            props.checkAuth();
            return response.json();
        },
            error => {
                console.log(error);
            })
            .then(json => {
                const msg = json === undefined ? 'json is undefined' : json.message;
                console.log('JSON Body: ' + msg);
            }, error => {
                console.log('cannot retrieve json body: ' + error);
            });
    }

    return (
        <form action="#" method="post" id='RegisterForm' onSubmit={e => {
            handleSubmit(e);
        }}>
            {/* <label for="username" class='lbl'>Username</label> */}
            <input type="text" name="username" id="usermame" class='inputBox' placeholder='Username' onChange={e => {
                setUsername(e.target.value);
            }}></input><br></br>
            {/* <label for="password" class='lbl'>Password</label> */}
            <input type="password" name="password" id="password" class='inputBox' placeholder='Password' onChange={e => {
                setPassword(e.target.value);
            }}></input><br></br>
            {/* <label for="password" class='lbl'>Confirm Password</label> */}
            <input type="password" name="cnfpassword" id="cnfpassword" class='inputBox' placeholder='Confirm Password' onChange={e => {
                setcnfpassword(e.target.value);
            }}></input><br></br><br></br>
            <input type="submit" value="Register" class='submit' disabled={!isValid}></input>
        </form>
    );
}

export default Authentication;  