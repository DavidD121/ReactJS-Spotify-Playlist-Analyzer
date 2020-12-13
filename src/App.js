import React, { useState, useEffect } from 'react';
import './App.css'
import SpotifyWebApi from 'spotify-web-api-js';
import Playlist from './Playlist.js';
import PlaylistAnalysis from './PlaylistAnalysis.js';
import About from './About.js';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

export const authEndpoint = 'https://accounts.spotify.com/authorize?';
var client_id = 'e5b02384340a479a9e35f3279285bfcb';
var client_secret = 'c8a9d7c2a1c34ac08825eda1c8fdd2f2';
var redirect_uri = 'http://localhost:3000/';
//var redirect_uri = 'http://localhost:3000/';
var scopes = ['user-read-private', 'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private', 'playlist-read-collaborative'];

const spotifyApi = new SpotifyWebApi();

var initialLoggedIn = false;

async function setToken(token) {
  await spotifyApi.setAccessToken(token);
}

const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function (initial, item) {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});



if (hash.access_token) {
  setToken(hash.access_token);
  console.log("token");
  initialLoggedIn = true;
  //window.location = ""
}


function App() {

  return (
    <div className="App">



      <Router>
        <Switch>
          <Route path='/' exact component={PlaylistList} />
          <Route path='/about' component={About} />
          <Route path='/playlist/:id' component={PlaylistAnalysis} />
          

        </Switch>
      </Router>

    </div>
  );
}


function PlaylistList() {


  var sounds = document.getElementsByTagName('audio');
  for (var i = 0; i < sounds.length; i++) sounds[i].pause();


  const [userPlaylists, setUserPlaylists] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    console.log(userPlaylists);
  }, [userPlaylists]);

  async function getAllPlaylists() {
    var lim = 50;
    var arr = [];
    var getting = true;
    var acc = 0;
    while (getting) {
      await spotifyApi.getUserPlaylists({ limit: lim, offset: acc * lim }).then(
        function (data) {
          if (data.items.length != 0) {
            console.log(data.items);
            arr = arr.concat(data.items);
            acc++;
          } else {
            getting = false;
          }
        }
      );
    }

    setUserPlaylists(arr);
  }


  useEffect(() => {
    spotifyApi.getMe().then(
      function (data) {
        console.log(data);
        setUsername(data.display_name);
      }
    );

    getAllPlaylists();
  }, []);


  return (
    <div>
      <div className='navbar'>

        <Link to={'/about/'}>
          <div className='about'>
            about
          </div>

        </Link>
        <a href={`${authEndpoint}client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`} className='button login'> <div className='login-text'>Login</div> </a>
        <div className='welcome'>
          {initialLoggedIn ? "Welcome, " + username + "." : "Login to see your playlists below"}<br />
          {initialLoggedIn ? "Select a playlist below" : ""}
        </div>
        <h1 className='main-title'>Playlist Analyzer</h1>
      </div>
      <div className='list-flex'>
        {userPlaylists.map(item => (
          <Link to={'/playlist/' + item.id}>
            <Playlist playlist={item} />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default App;