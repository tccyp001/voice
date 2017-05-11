'use strict';


$('document').ready(function(){
	var roomName = getChannelName();
	var sceneName =  getSceneName();

	if(roomName != null && sceneName != null) {
	 $('#lang_selections_div').hide();
	 $('#scene_selections_english_div').hide();
	 $('#scene_selections_chinese_div').hide();
	 $('#hysk_module_div').show();
	}
	$.get('/api/question' + '__' + sceneName).then(function(data){
      var questionModel = data;
      generateInput(questionModel, 'question');
    }); 

	$.get('/api/movie' + '__' + sceneName).then(function(data){
      var movieModel = data;
      generateInput(movieModel, 'movie');
    }); 

	$('#submit_question').on('click', function(){
		var obj = $('[name="question"]').val();
		$.ajax({
		    contentType: 'application/json',
		    data: obj,
		    complete: function(){
		    	 $('#myModal').modal('hide');
		    },
		    type: 'POST',
		    url: '/api/question' + '__' + sceneName
		});		

	});
	$('#submit_movie').on('click', function(){
		var obj = $('[name="movie"]').val();
		$.ajax({
		    contentType: 'application/json',
		    data: obj,
		    complete: function(){
		    	 $('#myModal').modal('hide');
		    },
		    type: 'POST',
		    url: '/api/movie' + '__' + sceneName
		});		

	});
var select_scene = function(scene_name){
	var classroom_number = $('#classroom_number').val();
	 if (classroom_number == ''){
	 	alert("please put a classroom number");
	 }
	 sessionStorage.setItem('scene_name', scene_name);
	 sessionStorage.setItem('classroom_number', classroom_number);
	 console.log(scene_name);
	 console.log(classroom_number);
	 if (sessionStorage.getItem('isPlayerMode') != null) {
	 	location.href = '/player';
	 	return;
	 }
 	 if (sessionStorage.getItem('isDebugMode') != null) {
	 	location.href = '/debug';
	 	return;
	 }
	 else {
		$('.scene_selections_div').hide();
		$('#hysk_module_div').show();
	 }
}
$('#scene_selector_ul_chinese').on('click','li', function(){
	 var scene_name = $(this).data('value');
	 select_scene(scene_name);

});
$('#scene_selector_ul_english').on('click','li', function(){
	 var scene_name = $(this).data('value');
	 select_scene(scene_name);

});
$('#lang_selector').on('click','li', function(){
	 var lang_name = $(this).data('value');
	 sessionStorage.setItem('lang_name', lang_name);
	 $('#lang_selections_div').hide();
	 if(lang_name=='english'){	
	 	$('#scene_selections_english_div').show();
	 }
	 else {
	 //chinese
	 $('#scene_selections_chinese_div').show();
	}

});

$('#change_scene_btn').on('click', function(){
	 $('#lang_selections_div').show();
	 $('#scene_selections_english_div').hide();
	 $('#scene_selections_chinese_div').hide();
	 $('#hysk_module_div').hide();
});



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
function generateInput(data, type) {
	var $input = $('<div></div>');
	var jsondata = JSON.stringify(data, null, '\t');
	$input.append($('<textarea name="' + type + '"></textarea>').val(jsondata));
	$('.form_' + type).append($input);
}

function generateForm(data, type) {
	var pattern = /^question/i;
	for (var key in data) {
		if(pattern.test(key) && type === 'question') {
			var $inputGroup = $('<div></div>');
			$inputGroup.append($('<div>题目选项</div>'))
			for (var i = 0; i < data[key].length; i++) {
				var $elem = $('<input type="text" name="' + key + '" value="'+ data[key][i] +' ">').val(data[key][i]);
				$inputGroup.append($elem);
				if (data['answer_'+ key] - 0 === i) {
					$inputGroup.append($('<input type="radio" name="answer_' + key + '" checked >').val(i));
				} else {
					$inputGroup.append($('<input type="radio"  name="answer_' + key + '">').val(i));
				}
			}
		}
		$('.form_' + type).append($inputGroup);
	}
}