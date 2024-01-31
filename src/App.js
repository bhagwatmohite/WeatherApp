// App.js

import React from 'react';
import './App.css';
import WeatherApp from './Components/WeatherApp/WeatherApp';
// import WeatherApp from './Components/WeatherApp';

function App() {
  return (
    <div className="App">
      {/* Render the WeatherApp component */}
     <WeatherApp/>
    </div>
  );
}

// Export the App component as the default export
export default App;
