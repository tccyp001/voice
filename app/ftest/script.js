'use strict';


$(document).ready(function(){
    var model;
    var correctCnt = 0;
    var errorCnt = 0;
    var ipad_voice = false;
    var recognizing = false;
    $.get('/api/question').then(function(data){
      model = data;
      model.status = 1;
    });
    function init(){
      correctCnt = 0;
      errorCnt = 0;
      recognizing = false;
      $('#test_result').html("Score");
    }

    showInfo('info_start');
    function voiceEnd(data){
      checkResult(data);
    }
    function voiceError(data){
      showInfo(data);
    }
    function startButton(event) {
      init();
      if(ipad_voice){
        if (recognizing) {
          recognition.stop();
          $('#start_button').find('i').removeClass('mic_red').addClass('fa-microphone');
          return;
        }
        final_transcript = '';
        recognition.lang = 'cmn-Hans-CN';
        recognition.start();
        ignore_onend = false;
      }
      else {
        if(recognizing==false) {
          recognizing = true;
          sendMessage('voice:start');
          showInfo('info_speak_now');
          $('#start_button').find('i').addClass('mic_red');  
        }
        else if(recognizing ==true) {
          recognizing = false;
          sendMessage('voice:end');
          showInfo('info_default');
          $('#start_button').find('i').removeClass('mic_red');
        }
        
      }
    }
    bindClickEvents();
    handleEvents();

    function upgrade() {
      start_button.style.visibility = 'hidden';
      showInfo('info_upgrade');
    }
    var two_line = /\n\n/g;
    var one_line = /\n/g;
    function linebreak(s) {
      return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
    }
    var first_char = /\S/;
    function capitalize(s) {
      return s.replace(first_char, function(m) { return m.toUpperCase(); });
    }

    function showInfo(s) {
      if (s) {
        for (var child = info.firstChild; child; child = child.nextSibling) {
          if (child.style) {
            child.style.display = child.id == s ? 'inline' : 'none';
          }
        }
        info.style.visibility = 'visible';
      } else {
        info.style.visibility = 'hidden';
      }
    }
    var current_style;
    function showButtons(style) {
      if (style == current_style) {
        return;
      }
      current_style = style;
    }

    function checkResult(data){
        //var index = model['question' + model.status].indexOf(data);
        
        if(data == model['answer_question' + model.status]){
           // sendMessage('play:question' + model.status);
       //     model.status = model.status + 1;
           // generatePerviousNextButton(model.status);
            // hightLightButton(index);
            correctCnt += 1;
        }
        else {
            errorCnt +=1;
            //sendMessage('play:wrong' + model.status);
        }
        model.status = model.status + 1;
      sendMessage('play:question' + model.status);
  
    }

    function sendMessage(msg){
      var socket = io();
      if(msg.indexOf('play:question') >=0) {
        msg+= ':Please speak now.'
      }
      socket.emit('chat message', msg);        
    }
/*
    generatePerviousNextButton(1);
    function generatePerviousNextButton(index){
        $('[name="previous"]').text('上一题(' + (index-1) +')');
        $('[name="next"]').text('下一题(' + (index+1) +')');
    }
*/
    function bindClickEvents(){
        $('#start_button').on('click', function(e){
            startButton(e);
        })
        $('.btn-groups').on('click', 'button', function(){
            var msg = $(this).attr('value');
            if(msg ==='play:question1') {
              init();
              model.status = 1;
            }
            if (msg === 'previous') {
              model.status--;
              msg = 'play:question' + model.status;
            } else if(msg === 'next') {
              model.status++;
              msg = 'play:question' + model.status;
            }
           // generatePerviousNextButton(model.status);
            sendMessage(msg + ':Please speak now.');
        })

        $('.input-groups').on('click', 'input', function(){
            var msg = $(this).attr('value');
            sendMessage(msg);
        })

        $('#continue_button').on('click','button', function(){
            var msg = $(this).attr('value');
            sendMessage(msg);
            $('#continue_button').empty();
        })
    }
    function micOff() {
      showInfo('info_default');
      $('#start_button').find('i').removeClass('mic_red'); 
    }
    function micOnSendMsg() {
        sendMessage('voice:start');
        showInfo('info_speak_now');
        $('#start_button').find('i').addClass('mic_red'); 
    }
    function handleEvents(){
        var socket = io();
        socket.on('chat message', function(msg){
            console.log(msg);   

            if(msg == ('done:question' + model.status)) {
                // generateButtons('question' + model.status);
              micOnSendMsg();
            }
            if(msg == ('done:wrong' + model.status)) {
                // generateButtons('question' + model.status);
               micOnSendMsg();
            }
            if(msg.indexOf('result:')>=0) {
              voiceEnd(msg.split(":")[1]);
              micOff();
            }
            if(msg.indexOf('voice_error:')>=0) {
              voiceError(msg.split(":")[1]);
              micOff();
            }

            if(msg.indexOf('done_all')>=0){
              console.log("show score");
              var score = 0;
              if(correctCnt>0) {
                score = correctCnt*1.0/(errorCnt + correctCnt) * 100;
              }
              var text_s = score.toFixed(0) + "%";
               console.log(correctCnt);
               console.log(errorCnt);
              $('#test_result').html("Your score is: " + text_s);
              micOff();
            }

        });
    }


});
var isFullScreen = false;
function fullScreen(){
  if(!isFullScreen) {
   enterFullScreen();
   isFullScreen = true;
  }
  else {
    exitfullScreen();
    isFullScreen =false;
  }
}

function enterFullScreen(){
    var docElm = document.documentElement;
  
  if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
  }
  else if (docElm.mozRequestFullScreen) {
      docElm.mozRequestFullScreen();
  }
  else if (docElm.webkitRequestFullScreen) {
      docElm.webkitRequestFullScreen();
  }
  else if (docElm.msRequestFullscreen) {
      docElm.msRequestFullscreen();
  }
}
function exitfullScreen(){
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
  else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
  }
  else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
  }
  else if (document.msExitFullscreen) {
      document.msExitFullscreen();
  }
}