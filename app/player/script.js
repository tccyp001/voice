'use strict';

$(document).ready(function(){
     var stopAt = -1;
      var clips = {
        "question1": { src:"../video/normal.mp4", "start":0, "end":4},
        "question2": { src:"../video/normal.mp4", "start":4.7, "end":8.48},
        "question3": { src:"../video/normal.mp4", "start":9, "end":59},
        "correct1": { src:"../video/expression.mp4", "start":14, "end":16},   
        "wrong1": { src:"../video/expression.mp4", "start":18.7, "end":20.2},
        "normalall": { src:"../video/normal.mp4", "start":0, "end":59},
        "slowall": { src:"../video/lower_speed.mp4", "start":0, "end":59},
        "superslowall": { src:"../video/super_low_speed.mp4", "start":0, "end":59},
      }
      var correctList = [{"start":10, "end":20}];
      var wrongList = [{"start":10, "end":20}];
      var player = $('#myplayer').get(0);
      var socket = io();      
      var currentClip = '';
      function actionLog(msg){
        $('#messages').append($('<li>').text(msg));
        console.log(msg);
      }
      function playClip(clipName, callback) {
        var curClip = clips[clipName];
        currentClip = clipName;
        player.pause();
        if(player.currentSrc != curClip.src) {
          player.src = curClip.src;
          player.load();
        }
        player.currentTime = curClip.start;
        stopAt = curClip.end;
        player.play();
        player.ontimeupdate = function() {checkStop(callback)};
        
      }
  
      socket.on('chat message', function(msg){
        actionLog(msg);
        if(msg.indexOf('play') >=0) {
          var clipName = msg.split(":")[1];
          playClip(clipName);
        }
        if(msg=='replay') {
          replay();
        }
      });
      function fullScreen(){
        player.webkitEnterFullscreen();
      }
      function play(){
         player.play();
      }
      function pause(){
         player.pause();
      }
      function replay(){
          player.pause();
          player.currentTime = '0';
          player.play();

      }
      function next(){
        player.pause();
        player.src="../video/question2.webm";
        player.load();
        stopAt = -1;
        /*
          player.pause();
          player.currentTime = '0';
          player.play();
        */
      }
      function playq3(){
        playClip("question3");
      }
      function wrong(){
        playClip("wrong1", playq3);
        //
        
      }
      function checkStop(callback){
        if(stopAt>0 && player.currentTime>=stopAt) {
          player.pause();
          stopAt = -1;
          socket.emit('chat message', "done:" + currentClip);
          if(callback){
            callback();
          }
          
        }
      }
      function bindClickEvents(){
        $('#fullscreen_btn').on('click', function(e){
            fullScreen();
        });
      }
    bindClickEvents();

})