function getChannelName(){
   var scene_name = sessionStorage.getItem('scene_name');
   var classroom_number = sessionStorage.getItem('classroom_number');
   if(classroom_number == null || scene_name == null ||
    classroom_number == "" || scene_name == "") {
      if(location.pathname !='/') {
        location.href = '/';
      }
      return;
   }
   return scene_name + '-' + classroom_number;
}
function getSceneName(){
  var scene_name = sessionStorage.getItem('scene_name');
  if(scene_name == null) {
      if(location.pathname !='/') {
        location.href = '/';
      }
      return;
   }
   return scene_name;
}
function msgWrapper(msg){
  return { 'room': getChannelName(), 'msg': msg }
}