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

});

function generateForm(data, type) {
	var pattern = /^question/i
	for (var key in data) {
		if(pattern.test(key) && type === 'question') {
			console.log(key);
			var $inputGroup = $('<div></div>');
			$inputGroup.append($('<div>题目选项</div>'))
			for (var i = 0; i < data[key].length; i++) {
				$inputGroup.append($('<input type="text">').val(data[key][i]));
				if (data['answer_'+ key] === i) {
					$inputGroup.append($('<input type="radio" name="' + key + '" checked>'));
				} else {
					$inputGroup.append($('<input type="radio"  name="' + key + '">'));
				}
			}
		}
		$('.form_question').append($inputGroup);
	}
}