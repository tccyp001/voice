'use strict';


$(document).ready(function(){
    bindClickEvents();


    function sendMessage(msg){
      var socket = io();
      socket.emit('chat message', msg);        
    }

    function bindClickEvents(){
        $('.btn-groups').on('click', 'button', function(){
            var msg = $(this).attr('value');
            sendMessage(msg);
        })

        $('.input-groups').on('click', 'input', function(){
            var msg = $(this).attr('value');
            console.log(msg);
            sendMessage(msg);
        })

    }



})