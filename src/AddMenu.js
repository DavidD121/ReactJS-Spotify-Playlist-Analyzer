import React, { useState, useEffect } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import { useSpring, animated } from 'react-spring';
import placeholder from './images/placeholder.png';
import './AddMenu.css';

const spotifyApi = new SpotifyWebApi();

function AddMenu({ playlist, features, genres, tracks, update, audio}) {

    var currentSongs = tracks.map(track => track.track.uri);

    const w = useSpring({ x: 500, from: { x: 100 } });
    const height = useSpring({ height: 500, from: { height: 100 } });

    var menuAnimation = {

    }

    function getRandomTrackId() {
        return tracks[0] ? tracks[Math.floor(Math.random() * tracks.length)].track.id : "";
    }

    const [foundTracks, setFoundTracks] = useState([]);

    const [query,setQuery] = useState({});

    useEffect(() => {
        updateQuery();
    }, [])

    function updateQuery() {
        setQuery({
            target_danceability: document.getElementById('Danceability').value,
            target_energy: document.getElementById('Energy').value,
            target_loudness: document.getElementById('Loudness').value,
            target_valence: document.getElementById('Positivity').value,
            target_tempo: document.getElementById('Tempo (bpm)').value,
            seed_tracks: "",
            //seed_genres: genres[0].genre + "," + genres[1].genre,
            limit: 10
        });
    }

    function search() {
        audio.src = null;
        var results = Array.from(document.getElementsByClassName('track-info'));
        results.forEach(result => result.classList.remove('playing'));

        var newQuery = query;

        newQuery.seed_tracks = getRandomTrackId() + "," + getRandomTrackId() + "," + getRandomTrackId();

        //console.log(newQuery);

        spotifyApi.getRecommendations(newQuery).then(
            function (data) {
                //console.log(data);
                setFoundTracks(data.tracks.filter(track => !currentSongs.includes(track.uri)));
            },
            function(err){
                //console.log(err);
            }
        )
    }

    function getImage(images) {
        //If no images are found, use placeholder image
        if (images.length < 1) {
            return placeholder;
        } else {
            return images[0].url;
        }
    }

    function sample(url, id) {
        //console.log(url);

        var results = Array.from(document.getElementsByClassName('track-info'));

        results.forEach(result => result.classList.remove('playing'));

        var div = document.getElementById(id);

        if (audio.src != url) {
            audio.src = url;
            audio.play();
            div.classList.add('playing');
        } else {
            audio.src = null;
            div.classList.remove('playing');
        }
    }

    const [addedSongs, setAddedSongs] = useState([]);

    useEffect(() => {
        update();
    }, [addedSongs]);

    function displayButton(uri) {
        //console.log(addedSongs)
        if(addedSongs.includes(uri)) {
            return <div className='added'>&#x2714;</div>
        } else {
            return <button className='button' onClick={() => addSong(uri)}>+</button>
        }
    }

    function addSong(uri) {
        spotifyApi.addTracksToPlaylist(playlist.id, [uri]).then(
            function(data) {
                //console.log(data);
                setAddedSongs(addedSongs.concat([uri]));
            },
            function(err) {
                //console.log(err)
            }
        )
    }

    return (
        <div style={menuAnimation} className='addmenu'>
            <div className='features'>
                {features.map(feature => (
                    <div className='feature'>
                        <label for={feature.name} className='feature-label'>{feature.name}</label>
                        <input id={feature.name} className='feature-bar' type='range' defaultValue={feature.avg} min={feature.min} max={feature.max} step={(feature.max - feature.min) / 200} onChange={()=>updateQuery()}></input>
                        <div className='feature-value'>{document.getElementById(feature.name)? parseFloat(document.getElementById(feature.name).value).toFixed(feature.max == 1 ? 2 : 0) : ""}</div>
                    </div>
                ))}
            </div>
            <div className='search-results'>
                {foundTracks.map(track => (
                    <div className='result'>
                        <iframe src={"https://open.spotify.com/embed/track/" + track.id} className="track-info" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                        <div className='add-track'>
                            {displayButton(track.uri)}
                        </div>
                    </div>
                ))}
            </div>
            <button className='button search' onClick={() => search()}>Search</button>
        </div>
    )
}

export default AddMenu;