// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App'; // Import the App component
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') // This is where the app will be rendered in the DOM
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
reportWebVitals();
