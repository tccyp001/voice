'use strict';


$(document).ready(function(){
    bindClickEvents();
    var socket = io();
    var roomName = getChannelName();
    if(roomName!='') {
        socket.emit('join', roomName);
    }

    function sendMessage(msg){
        console.log(msg);
      socket.emit('chat', msgWrapper(msg));        
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