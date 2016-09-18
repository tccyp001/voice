'use strict';

$(document).ready(function(){
    var socket = io();
    socket.on('chat message', function(msg){
        console.log(msg);   
        if(msg=='play') {
            $('#myplayer').get(0).play();
            $('#messages').append($('<li>').text(msg));
        }

    });
    function play(){
        $('#myplayer').get(0).play();
    }
})