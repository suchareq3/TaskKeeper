import { useState } from "react";
import { useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "../../shared/shared.js";
import { checkUserStatus, konsool, logInWithPassword, logOutUser } from "../../shared/shared.js";
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


function App() {
  const [count, setCount] = useState(0);

  


// Your web app's Firebase configuration


// Initialize Firebase


  useEffect(() => {
    fetch("http://127.0.0.1:5001/taskkeeper-studia/us-central1/app")
      //.then(response => response.json())
      //.then(data => console.log(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
        <button onClick={() => konsool()}>console log!</button>
        <button onClick={() => logInWithPassword('abc123@gmail.com','abc123')}>LOG IN DUDE!</button>
        <button onClick={() => logOutUser()}>log OUT!</button>
        <button onClick={() => checkUserStatus()}>show user status!!!</button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
