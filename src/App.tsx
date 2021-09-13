import React from "react";
import "./App.css";
import Box from "./Box";

const boxes = Array(200).fill(" ");

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React-lazyload-hook</h1>
        <p>Scroll down</p>
      </header>
      <ul className="list">
        {boxes.map((box, index) => (
          <li className="item" key={index}>
            <Box className="box" id={index} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
