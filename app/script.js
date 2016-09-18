'use strict';


$('document').ready(function(){
	$.get('/api/question').then(function(data){
      var questionModel = data;
      generateInput(questionModel, 'question');
    }); 

	$.get('/api/movie').then(function(data){
      var movieModel = data;
      generateInput(movieModel, 'movie');
    }); 

	// $('#submit_question').on('click', function(){
	// 	var obj = $('.form_question').serializeObject();
	// 	for (var key in obj) {
	// 		var pattern = /^question/i;
	// 		if(pattern.test(key)) {
	// 		var values = $('input[name="' + key + '"]')
	// 		              .map(function(){return $(this).val();}).get();
	// 		obj[key] = values;		
	// 		}	
	// 	}
	// 	$.ajax({
	// 	    contentType: 'application/json',
	// 	    data: JSON.stringify(obj),
	// 	    complete: function(){
	// 	    	 $('#myModal').modal('hide');
	// 	    },
	// 	    type: 'POST',
	// 	    url: '/api/question'
	// 	});
	// })
	$('#submit_question').on('click', function(){
		var obj = $('[name="question"]').val();
		$.ajax({
		    contentType: 'application/json',
		    data: obj,
		    complete: function(){
		    	 $('#myModal').modal('hide');
		    },
		    type: 'POST',
		    url: '/api/question'
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
		    url: '/api/movie'
		});		

	});

});
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
var isFullScreen = false;
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