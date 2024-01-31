import React, { useState } from 'react';
import './WeatherApp.css';
import search_icon from '../Assets/search.png';
import clear_icon from '../Assets/clear.png';
import cloud_icon from '../Assets/cloud.png';
import drizzle_icon from '../Assets/drizzle.png';
import humidity_icon from '../Assets/humidity.png';
import rain_icon from '../Assets/rain.png';
import snow_icon from '../Assets/snow.png';
import wind_icon from '../Assets/wind.png';
import closeIcon from '../Assets/close.png';

const WeatherApp = () => {
  const [searchMode, setSearchMode] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [location, setLocation] = useState('');
  const [humidity, setHumidity] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [windDirection, setWindDirection] = useState('');
  const [wicon, setWicon] = useState(cloud_icon);
  const [weatherDescription, setWeatherDescription] = useState('');
  const [error, setError] = useState('');
  const [searchClick, setSearchClick] = useState(false);
  const [loader, setLoader] = useState(false);
  const [temperature, setTemperature] = useState(0);
  const [temperatureUnit, setTemperatureUnit] = useState('Celsius');
  const [minTemperature, setMinTemperature] = useState('');
  const [maxTemperature, setMaxTemperature] = useState('');
  const [forecast, setForecast] = useState([]);

  const toggleTemperatureUnit = () => {
    if (temperatureUnit === 'Celsius') {
      const fahrenheit = (temperature * 9) / 5 + 32;
      setTemperature(fahrenheit.toFixed(2));
      setMinTemperature((min) => (min !== '' ? ((min * 9) / 5 + 32).toFixed(2) : ''));
      setMaxTemperature((max) => (max !== '' ? ((max * 9) / 5 + 32).toFixed(2) : ''));

      const updatedForecast = forecast.map((day) => {
        const fahTemp = (day.main.temp * 9) / 5 + 32;
      
        return {
          ...day,
          main: {
            ...day.main,
            temp: fahTemp.toFixed(2),
          },
        };
      });
      
      setForecast(updatedForecast);
    } else {
      const celsius = (temperature - 32) * (5 / 9);
      setTemperature(celsius.toFixed(2));
      setMinTemperature((min) => (min !== '' ? ((min - 32) * (5 / 9)).toFixed(2) : ''));
      setMaxTemperature((max) => (max !== '' ? ((max - 32) * (5 / 9)).toFixed(2) : ''));
      const updatedForecast = forecast.map((day) => {
        const celTemp = (day.main.temp - 32) * (5 / 9);
    
        return {
          ...day,
          main: {
            ...day.main,
            temp: celTemp.toFixed(2),
          },
        };
      });
      setForecast(updatedForecast);
    }
    setTemperatureUnit((prevUnit) => (prevUnit === 'Celsius' ? 'Fahrenheit' : 'Celsius'));
  };

  let api_key = '9a1cc1bdca313a37c7ff8002a1323ff4';

  const getWindDirection = (degree) => {
    if (degree >= 337.5 || degree < 22.5) {
      return 'North';
    } else if (degree >= 22.5 && degree < 67.5) {
      return 'Northeast';
    } else if (degree >= 67.5 && degree < 112.5) {
      return 'East';
    } else if (degree >= 112.5 && degree < 157.5) {
      return 'Southeast';
    } else if (degree >= 157.5 && degree < 202.5) {
      return 'South';
    } else if (degree >= 202.5 && degree < 247.5) {
      return 'Southwest';
    } else if (degree >= 247.5 && degree < 292.5) {
      return 'West';
    } else {
      return 'Northwest';
    }
  };

  const handleSearch=()=>{
    setLoader(true);
    search();
    getFiveDayForecast();
  }
  const search = async () => {
    setTemperatureUnit('Celsius')
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&units=Metric&appid=${api_key}`;

    let response;
    let data;
    try {
      response = await fetch(url);
      data = await response.json();
    } catch (error) {
      console.error('Error fetching or parsing data:', error);
      setError('Error fetching data. Please try again.');

      setLoader(false);
      return;
    }

    if (data && data.main) {
      setError('');
      setHumidity(data.main.humidity + '%');
      // setWindSpeed(Math.floor(data.wind.speed || 0) + ' km/h');
      setWindSpeed((data.wind.speed ? data.wind.speed.toFixed(2) : 0) + ' m/s');
      setWindDirection(getWindDirection(data?.wind?.speed));
      setTemperature(data.main.temp ? data.main.temp.toFixed(2) : 0);
      setLocation(data.name);

      if (Array.isArray(data.weather) && data.weather.length > 0) {
        const weatherIcon = data.weather[0].icon;

        switch (weatherIcon) {
          case '01d':
          case '01n':
            setWicon(clear_icon);
            setWeatherDescription('clear sky');
            break;
          case '02d':
          case '02n':
            setWicon(cloud_icon);
            setWeatherDescription('Few clouds');
            break;
          case '03d':
          case '03n':
            setWicon(drizzle_icon);
            setWeatherDescription('Scattered clouds');
            break;
          case '04d':
          case '04n':
            setWicon(drizzle_icon);
            setWeatherDescription('Broken clouds');
            break;
          case '09d':
          case '09n':
            setWicon(rain_icon);
            setWeatherDescription('Rain');
            break;
          case '10d':
          case '10n':
            setWicon(rain_icon);
            setWeatherDescription('Light rain');
            break;
          case '13d':
          case '13n':
            setWicon(snow_icon);
            setWeatherDescription('Snow');
            break;
          default:
            setWicon(clear_icon);
            setWeatherDescription('smoke');
            break;
        }
      }

      setMinTemperature(data.main.temp_min ? data.main.temp_min.toFixed(2) : '');
      setMaxTemperature(data.main.temp_max ? data.main.temp_max.toFixed(2) : '');

      setSearchMode(true);
    } else {
      setSearchMode(false);
      setError('City not found. Please enter a valid city name.');
    }

    setSearchClick(true);
    setLoader(false);
  };

  const getFiveDayForecast = async () => {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&units=Metric&appid=${api_key}`;

    try {
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();

      if (forecastData && forecastData.list) {
        const fiveDayForecast = forecastData.list.filter((data, index) => index % 8 === 0); // Get every 8th entry for a daily forecast
        setForecast(fiveDayForecast);
      }
    } catch (error) {
      console.error('Error fetching or parsing forecast data:', error);
    }
  };


  return (
    <div className='container'>
      <div className='top-bar'>
        <input
          type='text'
          className='cityInput'
          placeholder='Enter City Name...'
          value={searchCity}
          onChange={(e) => {
            setSearchCity(e.target.value);
            setSearchClick(false);
            setError('');
          }}
        />

        {searchClick ? (
          <button
            className='search-icon'
            onClick={() => {
              setSearchCity('');
              setSearchMode(false);
              setSearchClick(false);
              setError('');
            }}
          >
            <img src={closeIcon} alt='' style={{ height: '50px', width: '50px', cursor: 'pointer' }} />
          </button>
        ) : (
          <button
            className='search-icon'
            onClick={() => {
              handleSearch()
            }}
            disabled={loader || searchCity === ''}
            style={{ cursor: loader || searchCity === '' ? 'default' : 'pointer' }}
          >
            <img src={search_icon} alt='' />
          </button>
        )}
      </div>

      {error && <div className='error-message'>{error}</div>}
      {!searchMode && !loader && error === '' && (
        <div className='error-message'>{"Please enter city name in search bar"}</div>
      )}

      {loader ? (
        <div className='loader-container'>
          <div className='loader'></div>
        </div>
      ) : (
        searchMode && (
          <div>
            <div>
              <h5 style={{ color: 'white' }}>
                Change temperature unit :
                <div style={{ marginTop: '10px' }}>
                  <select value={temperatureUnit} onChange={toggleTemperatureUnit} style={{borderRadius:'10px'}}>
                    <option value='Celsius'>Celsius</option>
                    <option value='Fahrenheit'>Fahrenheit</option>
                  </select>
                </div>
              </h5>
            </div>
            <div className='weather-img'>
              <img src={wicon} alt='' />
              {weatherDescription && <div className='weather-description'>{weatherDescription}</div>}
            </div>
            <div className='weather-temp' style={{ flexDirection: 'column' }}>
              {temperature} {temperatureUnit === 'Celsius' ? '°C' : '°F'}
              {minTemperature !== '' && maxTemperature !== '' && (
                <div className='temperature-range'>
                Min: {minTemperature} {temperatureUnit === 'Celsius' ? '°C' : '°F'} / Max: {maxTemperature} {temperatureUnit === 'Celsius' ? '°C' : '°F'}
              </div>
              )}
            </div>
            <div className='weather-location'>{location}</div>
            <div className='data-container'>
              <div className='element'>
                <img src={humidity_icon} alt='' className='icon' />
                <div className='data'>
                  <div className='humidity-percent'>{humidity}</div>
                  <div className='text'>Humidity</div>
                </div>
              </div>
              <div className='element' style={{ flexDirection: 'column', gap: '0px !important' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <img src={wind_icon} alt='' className='icon' style={{ marginRight: '10px' }} />
                  <div className='data'>
                    <div className='wind-rate'>{windSpeed}</div>
                  </div>
                </div>
                <div className='text' style={{ marginLeft: '30px' }}>
                  Wind Speed
                </div>

                <div className='wind-direction'>{`Wind Direction: ${windDirection}`}</div>
              </div>
            </div>
            <div style={{color:'white', border:'1px solid white', margin:'1em 1em 1em '  }}> </div>
            <div className='forecast-container' style={{marginBottom:'10px'}}>
              <h2 style={{color:'white'}}>5-Day Forecast</h2>
              {forecast.map((day, index) => (
                <div key={index} className='forecast-item' >
                  <div>{new Date(day.dt * 1000).toLocaleDateString()}</div>
                  <div>{day.main.temp} {temperatureUnit === 'Celsius' ? '°C' : '°F'}</div>
                  <div>{day.weather[0].description}</div>
                
                 <img src={`https://openweathermap.org/img/w/${day.weather[0].icon}.png`} alt='' />
                 
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default WeatherApp;


