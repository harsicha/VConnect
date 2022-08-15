// npm run dev
import './App.css';
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Home></Home>
    </div>
  );
}

function Home() {

  const [isAuth, setIsAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [])

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

  if (isAuth) {
    return (
      <div>
        <h1>Welcome to VConnect!</h1>
        <h2>Please <Link to='/login'>Login or Register</Link> to continue</h2>
      </div>
    );
  }
  else {
    return <Navigate to='/chat'></Navigate>
  }
}

export default App;
