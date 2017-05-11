'use strict';


$(document).ready(function(){
    var model;
    var ipad_voice = false;
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('autoplay', 'autoplay');
    var socket = io();
    var roomName = getChannelName();
    if(roomName!='') {
        socket.emit('join', roomName);
    }
    $.get('/api/question' + '__' + getSceneName()).then(function(data){
      model = data;
      model.status = 1;
    });

    showInfo('info_start');
    var retry = 0;
    var final_transcript = '';
    var recognizing = false;
    var ignore_onend;
    var start_timestamp;

    function voiceEnd(data){
      $('#start_button').removeClass('icon_color');

      showInfo('info_start');
      checkResult(data);
    }
    function voiceError(data){
      $('#start_button').removeClass('icon_color');
      showInfo(data);
      ignore_onend = true;
    }
    start_button.style.display = 'inline-block';


    bindClickEvents();
    handleEvents();

  
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
          return;
        }
        final_transcript = '';
        recognition.lang = 'cmn-Hans-CN';
        recognition.start();
        ignore_onend = false;
      }
      else {
        sendMessage('voice:start');
      }

      // final_span.innerHTML = '';
      // interim_span.innerHTML = '';
      //$('#start_button').find('i').removeClass('fa-microphone').addClass('fa-microphone-slash');
      showInfo('info_speak_now');
      showButtons('none');
      start_timestamp = event.timeStamp;
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
            retry=0;
            // hightLightButton(index);
        }
        else {
            sendMessage('play:wrong' + model.status);
            retry++;
      }
      $('#selections').empty();
    }

    function sendMessage(msg){
      if(msg.indexOf('play:question') >=0) {
        msg+= ':Please check the options and click the mic icon on the ipad to Speak.'
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

        $('#selections').on('click', 'button', function(){
            var src = $(this).attr('value');
            audioElement.setAttribute('src', src);
            audioElement.play();
        })

    }

    function handleEvents(){
        socket.on('chat', function(msg){
            console.log(msg);   
            if(msg == 'done_all:no_more') { 
                location.href = '/';
                return;
            } 
            if(msg == ('done:question' + model.status)) {
                generateButtons('question' + model.status, model.status);
            }
            //if(msg == ('done:wrong' + model.status)) {
                // generateButtons('question' + model.status);
          //      sendMessage('voice:start');
          //  }
            if(msg.indexOf('result:')>=0) {
              voiceEnd(msg.split(":")[1]);
            }
            if(msg.indexOf('voice_error:')>=0) {
              voiceError(msg.split(":")[1]);
            }
            // if(msg == ('done:correct' + model.status)) {
            //     model.status = model.status + 1;
            //     generateButton('继续', 'question' + model.status);
            // }
            // if(msg == ('done:wrong' + model.status)) {
            //     generateButton('再来一次', 'question' + model.status);
            // }

        });
    }

    function generateButtons(question, status){
        $('#selections').empty();
        var array = model[question];
        var title = $('<div> 题目 '+ status +'</div>')
        $('#selections').append(title);
        var arrayDOM = array.map(function(item){
            return $('<div><button type="button" class="btn btn-default btn-lg" value="'+ item.src + '">'+ item.text + '</button></div>');
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