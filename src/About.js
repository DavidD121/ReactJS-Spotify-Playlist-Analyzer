import React, { useState, useEffect } from 'react';
import './About.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import githublogo from './images/githublogo.png';

function About() {


  return (
    <div className='about'>
      <Link className="link" to="/"> Back </Link>
      <h1>About</h1>
      <div className="about-description">
        A website to analyse Spotify playlists and find new songs for them made by a bored college student
        <br/><br/> 
        Spotify stores attributes such as dancablity, energy, etc. for each song, this website simply takes
        these values from Spotify and displays them in an accessable manner. I've found that these values can 
        be wildly inaccurate i.e Jigsaw Falling Into Place by Radiohead has a .81, maximum being 1, in positivity?!?!? 
        But averaged out in a large enough playlist they work to a degree. What I'm trying to say here is, if this 
        is completely off, don't blame me, blame Spotify.
        <br/><br/> 
        Also, Spotify's API does not allow you to add songs to playlists you don't own, meaning you cannot add
        songs to collaborative playlists you don't own from this website.
      </div>
      <div className = "github">
        Source code on github:
        <a className="logo" href={"https://github.com/DavidD121/ReactJS-Spotify-Playlist-Analyzer"}>
          <img src = {githublogo} />
        </a>
        <br/><br/>
        Feel free to report any bugs/issues in the issues tab of the Github repo (theres probably a bunch)
      </div>
    </div>
  )
}

export default About;