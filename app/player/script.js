'use strict';

$(document).ready(function(){


      var recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      var final_transcript = '';
      var recognizing = false;
      var ignore_onend;
      if (!('webkitSpeechRecognition' in window)) {
        upgrade();
      } else {
    //  start_button.style.display = 'inline-block';
      var recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onstart = function() {
        recognizing = true;
      };

      recognition.onerror = function(event) {
        if (event.error == 'no-speech') {
          ignore_onend = true;
          socket.emit('chat message', "voice_error:" + 'info_no_speech')
        }
        if (event.error == 'audio-capture') {
          socket.emit('chat message', "voice_error:" + 'info_no_microphone')
          ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
          if (event.timeStamp - start_timestamp < 100) {
            socket.emit('chat message', "voice_error:" + 'info_blocked')
          } else {
            socket.emit('chat message', "voice_error:" + 'info_blocked')
          }
          ignore_onend = true;
        }
      };
      recognition.onend = function() {
        recognizing = false;
        if (ignore_onend) {
          return;
        }
        if (!final_transcript) {
          return;
        }
        socket.emit('chat message', "result:" + final_transcript)

      };
      recognition.onresult = function(event) {
        var interim_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
          } else {
            interim_transcript += event.results[i][0].transcript;
          }
        }
        
      };
    }
    function stopRecognition() {
      final_transcript = '';
      recognition.stop();
    }
    function startRecognition() {
      final_transcript = '';
      recognition.lang = 'cmn-Hans-CN';
      recognition.start();
      ignore_onend = false;
    }

     var stopAt = -1;
      // var clips = {
      //   "question1": { src:"../video/normal.mp4", "start":0, "end":4},
      //   "question2": { src:"../video/normal.mp4", "start":4.7, "end":8.48},
      //   "question3": { src:"../video/normal.mp4", "start":9, "end":59},
      //   "correct1": { src:"../video/expression.mp4", "start":14, "end":16},   
      //   "correct2": { src:"../video/expression.mp4", "start":0, "end":2},   
      //   "wrong1": { src:"../video/expression.mp4", "start":18.7, "end":20.2},
      //   "wrong2": { src:"../video/expression.mp4", "start":28, "end":30},
      //   "normal": { src:"../video/normal.mp4", "start":0, "end":59},
      //   "slow": { src:"../video/lower_speed.mp4", "start":0, "end":59},
      //   "superslow": { src:"../video/super_low_speed.mp4", "start":0, "end":59},
      // }
      var isLastClip = false;
      var clips;
      $.get('/api/movie').then(function(data){
        clips = data;
      });
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
        //console.log(clipName);
        //player.pause();
        var curClip = clips[clipName];
        if(curClip ==null) {
             socket.emit('chat message', "done_all:no_more" );
        }
        currentClip = clipName;
        if(curClip.isLastClip === true) {
            isLastClip = true;
        }
        else {
            isLastClip = false;
        }
        player.pause();
        if(getVideoFilename(player.currentSrc) != getVideoFilename(curClip.src)) {
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
        if(msg.indexOf('play:') >=0) {
          var clipName = msg.split(":")[1];
          if(clipName.indexOf('wrong') >=0) {
            playWrong(clipName);
          }
          else if(clipName.indexOf('correct') >=0) {
            playCorrect(clipName);
          }
          else {
            playClip(clipName);   
          }

        }
        if(msg.indexOf('set_speed')>=0) {
          var speed = msg.split(":")[1];
          setSpeed(speed);
        }
        if(msg=='play') {
          play();
        }
        if(msg=='pause') {
          pause();
        }
        if(msg=='replay') {
          replay();
        }
        if(msg=='voice:start') {
          startRecognition();
        }
        if(msg=='voice:end') {
          stopRecognition();
        }
      });
      function fullScreen(){
        player.webkitEnterFullscreen();
      }
      function test(){
       // player.webkitEnterFullscreen();
        player.pause();
      // player.src="../video/wrong_video/01_wrong.mp4";
        player.currentTime = 10;
       // stopAt = curClip.end;
        player.play();
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
      function setSpeed(speed){
        player.pause();
        player.src=clips[speed].src;
        player.load();
        stopAt = -1;
      }
      function playWrong(clipName){
        var qIndex = parseInt(clipName.replace('wrong', ''));
        var nextClip = 'question' + qIndex;
        console.log(nextClip);
        playClip(clipName);
        //playClip(clipName, playClip.bind(null, nextClip, null));
        //
      }

      function playCorrect(clipName){
        var qIndex = parseInt(clipName.replace('correct', ''));
        var nextClip = 'question' + (qIndex+1);
        console.log(nextClip);

        playClip(clipName, playClip.bind(null, nextClip, null));
        //
        
      }
      function checkStop(callback){
        if(stopAt>0 && player.currentTime>=stopAt || (player.currentTime + 0.01> player.duration)) {
          player.pause();
          stopAt = -1;
          if(isLastClip == true) {
            socket.emit('chat message', "done_all:no_more");
          }
          else {
           socket.emit('chat message', "done:" + currentClip); 
          }
          
          if(callback){
            callback();
          }
          
        }
      }
      function getVideoFilename(path) {
         return path.split('\\').pop().split('/').pop();
      }
      function bindClickEvents(){
        $('#fullscreen_btn').on('click', function(e){
            fullScreen();
        });
        $('#test_btn').on('click', function(e){
            test();
        });
      }
    bindClickEvents();

});
