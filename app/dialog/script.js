'use strict';


$(document).ready(function(){
    var model;
    var retry = 0;
    var socket = io();
    var roomName = getChannelName();
    if(roomName!='') {
        socket.emit('join', roomName);
    }
    $.get('/api/question'+ '__' +  getSceneName()).then(function(data){
      model = data;
      model.status = 1;
    });

    var ipad_voice = false;
    var recognizing = false;
    showInfo('info_start');
    function voiceEnd(data){
      checkResult(data);
    }
    function voiceError(data){
      showInfo(data);
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
    function startButton(event) {

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
        if(validateAnswer(data, model) || retry ==2){
            if(retry ===2) {
              sendMessage('play:question' + (model.status + 1));
            }
            else {
              sendMessage('play:correct' + model.status);
            }
            model.status = model.status + 1;
            generatePerviousNextButton(model.status);
            micOff();
            retry=0;

            // hightLightButton(index);
        }
        else {
            sendMessage('play:wrong' + model.status);
            micOff();
            retry++;
      }
      $('#selections').empty();
    }

    function sendMessage(msg){
      
      if(msg.indexOf('play:question') >=0) {
        msg+= ':Please speak now.'
      }
      socket.emit('chat', msgWrapper(msg));        
    }

    generatePerviousNextButton(1);
    function generatePerviousNextButton(index){
      var preQuestionText = "Previous";
      var nextQuestionText = "Next";
      if(sessionStorage.getItem('lang_name') == 'chinese') {
            preQuestionText= "上一题";
            nextQuestionText= "下一题";
      }
        $('[name="previous"]').text(preQuestionText+'(' + (index-1) +')');
        $('[name="next"]').text(nextQuestionText+'(' + (index+1) +')');
    }

    function bindClickEvents(){
        $('#start_button').on('click', function(e){
            startButton(e);
        })
        $('.btn-groups').on('click', 'button', function(){
            var msg = $(this).attr('value');
            if(msg ==='play:question1') {
              model.status = 1;
            }
            if (msg === 'previous') {
              model.status--;
              msg = 'play:question' + model.status;
            } else if(msg === 'next') {
              model.status++;
              msg = 'play:question' + model.status;
            }
            generatePerviousNextButton(model.status);
            sendMessage(msg);
            $('#selections').empty();
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

        socket.on('chat', function(msg){
            console.log(msg);   
            if(msg == ('done:question' + model.status)) { 
                micOnSendMsg();
            }
            if(msg == ('done:wrong' + model.status)) {
                // generateButtons('question' + model.status);
                micOnSendMsg();
            }
            if(msg.indexOf('result:')>=0) {
              voiceEnd(msg.split(":")[1]);
            }
            if(msg.indexOf('voice_error:')>=0) {
              voiceError(msg.split(":")[1]);
            }

        });
    }

    function generateButtons(question){
        $('#selections').empty();
        var array = model[question];
        var arrayDOM = array.map(function(item){
            return $('<div><button type="button" class="btn btn-default btn-lg">'+ item + '</button></div>');
        })
        $('#selections').append(arrayDOM);
    }

    function generateButton(name, value){
        $('#selections').empty();
        var arrayDOM = $('<div><button type="button" class="btn btn-success btn-lg" value="' + value + '">'+ name + '</button></div>');
        $('#continue_button').append(arrayDOM);
    }

    function hightLightButton(index){
        $('#selections').find('button').eq(index).css('background', 'orange');
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