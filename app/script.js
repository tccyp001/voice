'use strict';


$('document').ready(function(){
	$.get('/api/question').then(function(data){
      var questionModel = data;
      generateForm(questionModel, 'question');
    }); 

	$.get('/api/movie').then(function(data){
      var movieModel = data;
      generateForm(movieModel, 'movie');
    }); 

	$('#submit_question').on('click', function(){
		var obj = $('.form_question').serializeObject();
		for (var key in obj) {
			var pattern = /^question/i;
			if(pattern.test(key)) {
			var values = $('input[name="' + key + '"]')
			              .map(function(){return $(this).val();}).get();
			obj[key] = values;		
			}	
		}
		console.log(JSON.stringify(obj));
		$.post('/api/question', JSON.stringify(obj), function(data){
			console.log('done');
			$(location).attr('href', '/')
		})

	})

});

function generateForm(data, type) {
	var pattern = /^question/i;
	for (var key in data) {
		if(pattern.test(key) && type === 'question') {
			var $inputGroup = $('<div></div>');
			$inputGroup.append($('<div>题目选项</div>'))
			for (var i = 0; i < data[key].length; i++) {
				var $elem = $('<input type="text" name="' + key + '" value="'+ data[key][i] +' ">').val(data[key][i]);
				$inputGroup.append($elem);
				if (data['answer_'+ key] === i) {
					$inputGroup.append($('<input type="radio" name="answer_' + key + '" checked >').val(i));
				} else {
					$inputGroup.append($('<input type="radio"  name="answer_' + key + '">').val(i));
				}
			}
		}
		$('.form_' + type).append($inputGroup);
	}
}