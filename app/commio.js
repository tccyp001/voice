function getChannelName(){
   var scene_name = sessionStorage.getItem('scene_name');
   var classroom_number = sessionStorage.getItem('classroom_number');
   if(classroom_number == null || scene_name == null ||
    classroom_number == "" || scene_name == "") {
      if(location.pathname !='/') {
        location.href = '/';
      }
      return null;
   }
   return scene_name + '-' + classroom_number;
}
function getSceneName(){
  var scene_name = sessionStorage.getItem('scene_name');
  if(scene_name == null) {
      if(location.pathname !='/') {
        location.href = '/';
      }
      return null;
   }
   return scene_name;
}
function msgWrapper(msg){
  return { 'room': getChannelName(), 'msg': msg }
}
function validateAnswer(data, model){
  if(model["lang"] =="en-US") {
    if(removeSignAndToLower(data) == removeSignAndToLower(model['answer_question' + model.status])){
      return true;
    }
    return false;
  }
  else {
    return data == model['answer_question' + model.status];
  }
}
function removeSignAndToLower(str){
  str = str.replace(/[^a-zA-Z0-9]/g, '');
  str = str.toLowerCase();
  return str;
}