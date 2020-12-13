import React, {useState, useEffect} from 'react';
import './PlaylistList.css';
import SpotifyWebApi from 'spotify-web-api-js';
import placeholder from './placeholder.png';

const spotifyApi = new SpotifyWebApi();


function Playlist({playlist}) {

  function getImage() {
    //If no images are found, use placeholder image
    if (playlist.images.length < 1) {
      return placeholder;
    } else {
      return playlist.images[0].url;
    }
  }



  function getDescription() {
    var description = playlist.description;
    var unicodeNonos = {
      "&#x27;" : "'",
      "&amp;" : "&",
      "&#x2F;" : "/",
      "&lt;" : "<",
      "&gt;" : ">"
    }

    for(var nono in unicodeNonos) {
      description = description.split(nono).join(unicodeNonos[nono]);
    }

    return description;
  }

  return(
    <div  className='playlist-list-rows'>
      <div>
        <img src={getImage()} className='playlist-img'/>
        <div className='playlist-header'>
          <h2 className='title'>{playlist.name}</h2>
          <p className='description'>{getDescription()}</p>
          <p>by {playlist.owner.display_name} | {playlist.tracks.total} songs</p>
        </div>

      </div>
    </div>
  )

}

export default Playlist;