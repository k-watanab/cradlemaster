var timer;
var axlist = [];
var aylist = [];
var azlist = [];
var dlist = [];
var counter = 0;
var babyStatus = 300;
var babyChange = 0;
var hpyStatus = 0;
var targetLength = 50;
var timeSpan = 0.2;
var startFlag = true;
var flag = true;

//midi
var media = null;
var srcFile = "audio/crying.mp3";

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    console.log("device ready");
    media = new Media (getPath() + srcFile , onSuccess, onError,mediaStatus);
}

window.addEventListener("devicemotion",function(event){
   ax = event.acceleration.x;
   ay = event.acceleration.y;
   az = event.acceleration.z;
});

function init(){
  $("#DispBaby").html('<img src="./img/cry.png">');
  babyStatus = 300;
  hpyStatus = 0;  
  axlist = [];
  aylist = [];
  azlist = [];
  dlist = [];
  counter = 0;
}

function start(){
  if(startFlag){
    init();
    startFlag = false;
    media.play({numberOfLoops:"infinite"});
    timer = setInterval(() => {
        displayData();
    }, 200); 
  }
}

function stop(){
  clearInterval(timer);
  startFlag = true;
  if(babyStatus <= 0){
    $("#SF").html("<h1>成功!</h> <br>");  
  }else{
    $("#SF").html("<h1>失敗...</h> <br>");  
  }

  media.stop();
  $("#Result").html(
     "時間: " + counter + " 秒<br>"   // かかった時間
      + "リズム感: " + hpyStatus       // リズム感
  );
}

function displayData() {
    if(flag){
      $("#DispBaby").css('transform','scale(-1, 1)');
      flag = false;
    }else{
      $("#DispBaby").css('transform','scale(1, 1)');
      flag = true;
 
    }

    if(babyStatus > 200){
      if(babyChange != 0){
        media.pause();
        media = new Media (getPath() + srcFile , onSuccess, onError,mediaStatus);
    		media.play({numberOfLoops:"infinite"});
        babyChange = 0;
      }
      $("#DispBaby").html('<img src="./img/cry.png">');
    }else if((babyStatus <= 0)&&(hpyStatus >= 100)){
      media.pause();
      media = new Media (getPath() + "audio/happy.mp3" , onSuccess, onError,mediaStatus);
    	media.play({numberOfLoops:0});
      $("#DispBaby").html('<img src="./img/happy.png">');
      stop();
    }else if((babyStatus <= 0)&&(hpyStatus < 100)){
      media.pause();
      $("#DispBaby").html('<img src="./img/sleep.png">');
      stop();
    }else{
      if(babyChange != 1){
        media.pause();
        media = new Media (getPath() + "audio/normal.mp3" , onSuccess, onError,mediaStatus);
    		media.play({numberOfLoops:"infinite"});
        babyChange = 1;
      }
      $("#DispBaby").html('<img src="./img/joy.png">');
    }

    if(counter > 60){
      stop();      
    }

    $("#DispAcceleration").html(
      "x: " + ax + "<br>"         // x軸の値
      + "y: " + ay + "<br>"       // y軸の値
      + "z: " + az + "<br>"       // z軸の値
      + "c: " + counter + "<br>"
      + "Baby: " + babyStatus + "<br>"
      + "Happy: " + hpyStatus);  

    axlist.push(ax);
    aylist.push(ay);
    azlist.push(az);
    dlist.push(counter);
    counter = counter + timeSpan;

    // 10秒から判定開始
    if(axlist.length > targetLength){
      axlist.shift();
      aylist.shift();
      azlist.shift();
      dlist.shift();

      if((jStat.stdev(aylist) < 0.3)&&(jStat.stdev(aylist) > 0.1)){
        babyStatus = babyStatus - 5;
      }else{
        babyStatus = babyStatus + 2;        
      }

      if((jStat.stdev(azlist) < 0.3)&&(jStat.stdev(azlist) > 0.1)){
        babyStatus = babyStatus - 5;
      }else{
        babyStatus = babyStatus + 2;
      }

      psum = jStat.sum(azlist.filter( function( value ) { 
        // 正数のみ
        return value > 0;
      }));

      nsum = jStat.sum(azlist.filter( function( value ) { 
        // 負数のみ
        return value < 0;
      })) * -1;

      balance = 1 - psum / nsum;

      if(balance < 0.2 && balance > -0.2){
        hpyStatus = hpyStatus + 10;
      }
    }
}

//midi
function getPath() {
    var str = location.pathname;
    var i = str.lastIndexOf('/');
    return str.substring(0,i+1);
}

function mediaStatus(e){
	if ( e == 4 ){ //4は再生終了のイベントコード
		media.play({numberOfLoops:"infinite"});
	}
}

function onSuccess(){
    console.log("Successfully initialize a media file.");
}

function onError(error){
    console.log("Failed to initialize a media file. [ Error code: " + error.code + ", Error message: " + error.message + "]");
}