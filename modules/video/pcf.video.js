pcf_module_video = {
  playing: false,
  properties: {
    'aspect_ratio': '16:9',
    'attributes': {
      'webkit-playsinline': false,
      'controls': true,
      'autoplay': true,
    },
    'container_id': null,
    'close_callback': null,
    'full_screen': false,
    'hide_close_btn': true,
    'pause_callback': null,
    'play_callback': null,
    'reload': false,
    'style': {
      'width': '320px',
      'height': '180px',
      'zIndex': 5000,
      'margin': 0,
      'padding': 0,
    },
  },
  reload: false,
  close: function(){
    if(this.isPhad){
      ph.v.remove();
    }
    else{
      this.video.properties.container_id.innerHTML = '';
    }
    this.video.playing = false;
    if(typeof(this.video.properties.close_callback) == 'function'){
      this.video.properties.close_callback();
    }
    if(this.video.properties.reload){
      this.video.reload = true;
      this.video.properties.attributes.autoplay = false;
      this.video.load();
    }
  },
  full_screen: function(elem){
    var self = this;
    var endEvent = 'endfullscreen';
    if(elem.requestFullscreen) {
        elem.requestFullscreen();
    }
    else if(elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
        endEvent = 'mozendfullscreen';
    }
    else if(elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
      endEvent = 'webkitendfullscreen';
    }
    else if(elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
        endEvent = 'msendfullscreen';
    }
    elem.addEventListener(endEvent, function(){
          self.video.close();
    });
  },
  load: function(vars){
    var self = this;
    this.video.playing = true;
    objCheck = ['style', 'attributes'];
    if(!this.video.reload){
      for(var i in vars){
        if(objCheck.indexOf(i) != -1){
          for(var v in vars[i]){
            this.video.properties[i][v] = vars[i][v];
          }
        }
        else{
          this.video.properties[i] = vars[i];
        }
      }
    }
    if(this.video.properties.full_screen){
      this.video.properties.attributes['webkit-playsinline'] = false;
    }
    var cid = this.video.properties.container_id;
    this.video.properties.style.width = cid.offsetWidth+'px';
    this.video.properties.style.height = cid.offsetHeight+'px';
    var ar = this.video.properties.aspect_ratio.split(':');
    if(this.video.properties.style.width == '0px' && this.video.properties.style.height == '0px'){
      console.log('at least a height or a width for the video element or its parent element must be declared');
      return false;
    }
    if(this.video.properties.style.width != '0px' && this.video.properties.style.height == '0px'){
      this.video.properties.style.height = this.video.properties.style.width.replace('px','')*(ar[1]/ar[0])+'px';
    }
    if(this.video.properties.style.width == '0px' && this.video.properties.style.height != '0px'){
      this.video.properties.style.width = this.video.properties.style.height.replace('px','')*(ar[0]/[1])+'px';
    }
    if(this.isPhad){
      ph.v.play(this.video.properties.video_url, this.video.properties.name, this.campaignID, this.executionID, this.sessionID, cid);
      if(this.video.properties.hide_close_btn){
        var phVidClose = this.gid('phVidClose');
        if(phVidClose){
          phVidClose.style.display = 'none';
        }
      }
    }
    else{
      var videoHtml = '<video src="'+this.video.properties.video_url+'"></video>';
      cid.innerHTML = videoHtml;
    }
    var ph_videoElement = cid.getElementsByTagName('video')[0];
    if(ph_videoElement){
      for(var i in this.video.properties.attributes){
        ph_videoElement.setAttribute(i, this.video.properties.attributes[i]);
      }
      for(var i in this.video.properties.style){
        ph_videoElement.style[i] = this.video.properties.style[i];
      }
      ph_videoElement.addEventListener('play', function(){
        if(self.video.properties.full_screen){
          self.video_full_screen(ph_videoElement);
        }
        if(typeof(self.video.properties.play_callback )== 'function'){
          self.video.properties.play_callback();
        }
      });
      ph_videoElement.addEventListener('pause', function(){
        if(typeof(self.video.properties.pause_callback )== 'function'){
          self.video.properties.pause_callback();
        }
      });
      if(this.video.properties.attributes.autoplay === true){
        setTimeout(function(){
          ph_videoElement.play();
        },500);
      }
      if(!this.video.properties.full_screen){
        ph_videoElement.addEventListener('webkitendfullscreen', function(){
              self.video_close();
        });
      }
      ph_videoElement.addEventListener('ended', function(){
            self.video_close();
        });
    }
  },
}
