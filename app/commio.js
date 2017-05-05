function getChannelName(){
   var scene_name = sessionStorage.getItem('scene_name');
   var classroom_number = sessionStorage.getItem('classroom_number');
   if(classroom_number == null || scene_name == null) {
      location.href = '/';
      return;
   }
   return scene_name + '__' + classroom_number;
}
function msgWrapper(msg){
  return { 'room': getChannelName(), 'msg': msg }
}