import React, { useState, useEffect } from 'react';
import './PlaylistAnalysis.css';
import AvgBar from './AvgBar.js';
import AddMenu from './AddMenu.js';
import SpotifyWebApi from 'spotify-web-api-js';
import placeholder from './images/placeholder.png';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Playlist from './Playlist';


const spotifyApi = new SpotifyWebApi();

var audio = new Audio();

function PlaylistAnalysis({ match }) {

  var PlaylistID = match.params.id;

  const [playlist, setPlaylist] = useState({ name: "", owner: "", images: [], tracks: { total: 0 } })

  function update() {
    spotifyApi.getPlaylist(PlaylistID).then(
      function (data) {
        //console.log(data);
        setPlaylist(data);
        getPlaylistItems(data);
      }
    );
  }

  useEffect(() => {
    update()
  }, []);


  const [playlistItems, setPlaylistItems] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    //console.log(playlistItems);
    getGenres();
  }, [playlistItems]);

  var invalidTracks = 0;

  async function getFeatures(arr) {
    await spotifyApi.getAudioFeaturesForTracks(arr.map(item => item.track.id)).then(
      function (data) {
        for (var i = 0; i < arr.length; i++) {
          arr[i].features = data.audio_features[i];
          if (!data.audio_features[i]) {
            invalidTracks += 1;
          }
        }
      }
    )
    return arr;
  }

  async function getGenres() {
    //Gets all unique artist IDs
    var artistIds = {};
    playlistItems.forEach(item => {
      item.track.artists.forEach(artist => {
        if (!artistIds[artist.id]) {
          artistIds[artist.id] = true;
        }
      })
    });

    var uniqueArtistIds = Object.keys(artistIds);

    //Loops through artists, getting all of their genres and the amount of times each unique genres shows up
    var loops = Math.ceil(uniqueArtistIds.length / 50);
    var genreFreq = {};
    for (var i = 0; i < loops; i++) {
      await spotifyApi.getArtists(uniqueArtistIds.slice(i * 50, (i + 1) * 50)).then(
        function (data) {
          data.artists.forEach(artist => {
            if (artist) {
              artist.genres.forEach(genre => {
                if (!genreFreq[genre]) {
                  genreFreq[genre] = 1;
                } else {
                  genreFreq[genre] += 1;
                }
              });
            }
          });
        }
      );
    }
    var genres = Object.keys(genreFreq).map(g => { return { genre: g, frequency: genreFreq[g] } });

    //sort genres by frequency if array is greater than zero, to avoid errors
    if (genres.length > 0) {
      setGenres(genres.sort((a, b) => b.frequency - a.frequency));
    }


  }

  async function getPlaylistItems(pl) {

    var arr = []

    var loops = 1 + Math.floor((pl.tracks.total - 1) / 100);

    for (var i = 0; i < loops; i++) {
      await spotifyApi.getPlaylistTracks(pl.id, { offset: (i * 100) }).then(
        async function (data) {
          arr = arr.concat(await getFeatures(data.items.map(item => { return { track: item.track, features: {} } })));
        }
      );
    }
    setPlaylistItems(arr);
  }


  function getPlaylistLength() {

    var len_ms = 0;
    playlistItems.forEach(item => len_ms += item.track.duration_ms);

    var string = "";
    var hours = Math.floor(len_ms / 3600000);
    var hoursRemainder = len_ms % 3600000;
    var minutes = Math.floor(hoursRemainder / 60000);

    //console.log(playlistLength);
    //convert ms length into displayable string


    if (hours > 0) {
      string += hours + " hr ";
    }

    return string + minutes + " min ";
  }

  function getImage() {
    //If no images are found, use placeholder image
    if (playlist.images.length < 1) {
      return placeholder;
    } else {
      return playlist.images[0].url;
    }
  }


  var currentFeatures = [{ name: "Danceability", func: (x) => x.features.danceability, max: 1, min: 0, avg: null },
  { name: "Energy", func: (x) => x.features.energy, max: 1, min: 0, avg: null },
  { name: "Loudness", func: (x) => x.features.loudness, max: 0, min: -20, avg: null },
  { name: "Positivity", func: (x) => x.features.valence, max: 1, min: 0, avg: null },
  { name: "Tempo (bpm)", func: (x) => x.features.tempo, max: 200, min: 0, avg: null }
  ];


  var validSongs = playlistItems.filter(song => song.features);

  currentFeatures.forEach(feature => {
    if (validSongs.length > 0) {
      feature.avg = validSongs.map(song => feature.func(song)).reduce((a, b) => a + b) / validSongs.length;
    }
  });


  function sortByFeature(func, reversed) {
    var reverse = 1;
    if (reversed) {
      reverse = -1;
    }

    var invalidSongs = playlistItems.filter(song => !song.features);

    setPlaylistItems(validSongs.sort(function (a, b) { return reverse * (func(b) - func(a)) }).concat(invalidSongs));
  }



  const [addMenuOpened, setAddMenuOpened] = useState(false);

  useEffect(() => {
    audio.src = null;
  }, [addMenuOpened]);

  function renderAddMenu() {
    if (addMenuOpened) {
      return (
        <div className='addmenu'>
          <AddMenu playlist={playlist} features={currentFeatures} genres={genres} tracks={validSongs} update={update} audio={audio} />
          <button className='closeMenuButton button' onClick={() => setAddMenuOpened(false)}>Back</button>
          <div className='instructions'>Adjust the bars and press search to find songs with your desired attributes</div>

        </div>
      );
    }
  }

  return (
    <div>
      <Link className="link" to="/"> Back </Link>
      <div className='flex'>
        <div className="info">
          <img src={getImage()} className='image' />
          <div className='header'>
            <h1 className='top'>{playlist.name}</h1>
            <div className='bottom'>
              <div className="sub-header">
                <h3>by {playlist.owner.display_name}</h3>
                <h4>{playlist.tracks.total} songs <br/> {getPlaylistLength()}</h4>  
              </div>
              <div className='genre'>
                <h3>Genres:</h3>
                <h4>{genres[0] ? genres[0].genre : "none"}{genres[1] ? " / " + genres[1].genre : ""}</h4>
              </div>
              <div className='divider'></div>
            </div>
          </div>
        </div>
        <div className='bars'>
          <table className="bar-table">
            <tbody>
              {currentFeatures.map(feature => (
                <td style={{ width: (60 / currentFeatures.length) + "%" }}>
                  <div className='bar-label'>{feature.name}</div>
                  <AvgBar avg={feature.avg} max={feature.max} min={feature.min} />
                </td>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="songs">
        <h1 className='songs-header'>Songs <button className='button addSongs' onClick={() => setAddMenuOpened(true)}>Add Songs</button></h1>
        <div className='songs-text'>Press the arrow buttons to sort songs by their attributes</div>
        <table className='song-table head'>
          <thead>
            <tr>
              <th className='song-names'>Name</th>
              <th className='artists'>Artist</th>
              {currentFeatures.map(feature => (
                <th className='table-right'>
                  <button className='sort-button' onClick={() => { sortByFeature(feature.func, false) }}>&uarr;</button>
                  <div className='feature-head'>{feature.name}</div>
                  <button className='sort-button' onClick={() => { sortByFeature(feature.func, true) }}>&darr;</button>
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="table-data">
          <table className='song-table'>
            <tbody className='song-list'>
              {playlistItems.map(song => (
                <tr>
                  <td className='song-names'>{song.track.name}</td>
                  <td className='artists'>{song.track.artists[0].name}</td>
                  {currentFeatures.map(feature => (
                    <td  className='table-right'>{song.features ? feature.func(song).toFixed(feature.max == 1 ? 2 : 0) : "not found"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderAddMenu()}
      </div>
    </div>
  )
}

export default PlaylistAnalysis;