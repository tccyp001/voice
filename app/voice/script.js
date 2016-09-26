'use strict';


$(document).ready(function(){
    var model;
    var ipad_voice = false;
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('autoplay', 'autoplay');

    $.get('/api/question').then(function(data){
      model = data;
    });

    showInfo('info_start');

    var final_transcript = '';
    var recognizing = false;
    var ignore_onend;
    var start_timestamp;

    function voiceEnd(data){
      $('#start_button').removeClass('icon_color');
      checkResult(data);
    }
    function voiceError(data){
      $('#start_button').removeClass('icon_color');
      showInfo(data);
      ignore_onend = true;
    }
    if (!('webkitSpeechRecognition' in window)) {
      upgrade();
    } else {
      start_button.style.display = 'inline-block';
      var recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onstart = function() {
        recognizing = true;
        showInfo('info_speak_now');
        $('#start_button').addClass('icon_color');
      };
      recognition.onerror = function(event) {
        if (event.error == 'no-speech') {
          $('#start_button').removeClass('icon_color');
          showInfo('info_no_speech');
          ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
          $('#start_button').removeClass('icon_color');
          showInfo('info_no_microphone');
          ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
          if (event.timeStamp - start_timestamp < 100) {
            showInfo('info_blocked');
          } else {
            showInfo('info_denied');
          }
          ignore_onend = true;
        }
      };
      recognition.onend = function() {
        recognizing = false;
        if (ignore_onend) {
          return;
        }
        $('#start_button').removeClass('icon_color');
        if (!final_transcript) {
          showInfo('info_start');
          return;
        }
        showInfo('');
        checkResult(final_transcript);
        
        // if (window.getSelection) {
        //   window.getSelection().removeAllRanges();
        //   var range = document.createRange();
        //   range.selectNode(document.getElementById('final_span'));
        //   window.getSelection().addRange(range);
        // }

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
        final_transcript = capitalize(final_transcript);
        // final_span.innerHTML = linebreak(final_transcript);
        // interim_span.innerHTML = linebreak(interim_transcript);
        if (final_transcript || interim_transcript) {
          showButtons('inline-block');
        }
        //recognition.stop();
        
      };
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
      $('#start_button').find('i').removeClass('fa-microphone').addClass('fa-microphone-slash');
      showInfo('info_allow');
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
        if(data == model['answer_question' + model.status]){
            sendMessage('play:correct' + model.status);
            model.status = model.status + 1;
            hightLightButton(index);
        }
        else {
            sendMessage('play:wrong' + model.status);
      }
      $('#selections').empty();
    }

    function sendMessage(msg){
      var socket = io();
      socket.emit('chat message', msg);        
    }

    function bindClickEvents(){
        $('#start_button').on('click', function(e){
            startButton(e);
        })

        $('.btn-groups').on('click', 'button', function(){
            var msg = $(this).attr('value');
            $('#selections').empty();
            sendMessage(msg);
            model.status = 1;
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
        var socket = io();
        socket.on('chat message', function(msg){
            console.log(msg);   
            if(msg == ('done:question' + model.status)) {
                generateButtons('question' + model.status);
            }
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

    function generateButtons(question){
        $('#selections').empty();
        var array = model[question];
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

})