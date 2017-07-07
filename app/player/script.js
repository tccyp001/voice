'use strict';

$(document).ready(function(){


      var recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      var final_transcript = '';
      var recognizing = false;
      var ignore_onend;
      var player_real_src ='';
     if (sessionStorage.getItem('scene_name') == null) {
      sessionStorage.setItem('isPlayerMode', 'true');
      location.href = '/';
      return;
     }

      if (!('webkitSpeechRecognition' in window)) {
        upgrade();
      } else {
      var socket = io();
      var roomName = getChannelName();
      if(roomName!='') {
          socket.emit('join', roomName);
      }
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
          var msg = "voice_error:" + 'info_no_speech';
          socket.emit('chat', msgWrapper(msg));
        }
        if (event.error == 'audio-capture') {
          var msg = "voice_error:" + 'info_no_microphone';
          socket.emit('chat', msgWrapper(msg));
          ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
          if (event.timeStamp - start_timestamp < 100) {
            var msg = "voice_error:" + 'info_blocked';
            socket.emit('chat', msgWrapper(msg));
          } else {
            var msg = "voice_error:" + 'info_blocked';
            socket.emit('chat', msgWrapper(msg));
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
        var msg = "result:" + final_transcript;
        socket.emit('chat', msgWrapper(msg));

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
      if(clips.lang == undefined) {
        recognition.lang = 'cmn-Hans-CN';
      }
      else {
        recognition.lang = clips.lang;
      }
      
      recognition.start();
      ignore_onend = false;
    }
    console.log("start loadVideo");

     var stopAt = -1;

      var isLastClip = false;
      var clips;
      var stopMsg = '';
      var player = $('#myplayer').get(0);
      $.get('/api/movie' + '__' + getSceneName()).then(function(data){
        clips = data;
        player_real_src = clips['question1'].src; 
        loadVideo(clips['question1'].src);   
      });

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
             var msg = "done_all:no_more";
             socket.emit('chat', msgWrapper(msg));
        }
        currentClip = clipName;
        if(curClip.isLastClip === true) {
            isLastClip = true;
        }
        else {
            isLastClip = false;
        }
        player.pause();
        if(getVideoFilename(player_real_src) != getVideoFilename(curClip.src)) {
          
          player_real_src = curClip.src;
          player.src = player_real_src;
          // will be changed later
          loadVideo(curClip.src);
                    //player.load();
        }
        player.currentTime = curClip.start;
        stopAt = curClip.end;
        play();
        player.ontimeupdate = function() {checkStop(callback)};
        
      }
      function loadVideo(path){
        console.log("start loadVideo");
        var req = new XMLHttpRequest();
        req.open('GET', path, true);
        req.responseType = 'blob';

        req.onload = function() {
           // Onload is triggered even on 404
           // so we need to check the status code
           if (this.status === 200) {
              var videoBlob = this.response;
              var vid = URL.createObjectURL(videoBlob); // IE10+
              // Video is now downloaded
              // and we can set it as source on the video element
              //video.src = vid;
              var player = $('#myplayer').get(0);
              player.src = vid;
              console.log(vid);
              console.log("done")
           }
        }
        req.onerror = function() {
           // Error
        }

        req.send();
    }
    
      socket.on('chat', function(msg){
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
            if(msg.split(":").length>2) {
              stopMsg = msg.split(":")[2];
            } 
            else {
              stopMsg = '';
            } 
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
         $('#overlayid').addClass("hide");
      }
      function pause(){
         player.pause();
         if(stopMsg!=''){
           $('#overlayid').html(stopMsg);
           $('#overlayid').removeClass("hide");;
         }
         
      }
      function replay(){
          player.pause();
          player.currentTime = '0';
          player.play();
          $('#overlayid').addClass("hide");
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
          pause();
          stopAt = -1;
          if(isLastClip == true) {
            var msg = "done_all:no_more";
            socket.emit('chat', msgWrapper(msg));
          }
          else {
            var msg = "done:" + currentClip;
            socket.emit('chat', msgWrapper(msg)); 
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
