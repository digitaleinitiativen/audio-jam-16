/**
 * Common tools for WebAudio API
 * Based upon http://webaudioapi.com/static/js/shared.js
 **/

(function(){

  // Start off by initializing a new audioCtx.
  window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  if (!audioCtx.createGain)
    audioCtx.createGain = audioCtx.createGainNode;
  if (!audioCtx.createDelay)
    audioCtx.createDelay = audioCtx.createDelayNode;
  if (!audioCtx.createScriptProcessor)
    audioCtx.createScriptProcessor = audioCtx.createJavaScriptNode;

  // shim layer with setTimeout fallback
  window.requestFrame = ((w) => {
    return w.requestAnimationFrame ||
      w.webkitRequestAnimationFrame ||
      w.mozRequestAnimationFrame ||
      w.oRequestAnimationFrame ||
      w.msRequestAnimationFrame ||
      function(cb) {
        w.setTimeout(cb, 1000.0 / 60.0);
      };
  })(window);
  
  window.getUserMedia = ((n) => {
    return n.getUserMedia ||
      n.webkitGetUserMedia ||
      n.mozGetUserMedia ||
      n.msGetUserMedia;
  })(navigator);

  var playSound = (buffer, time) => {
    var source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source[source.start ? 'start' : 'noteOn'](time);
  };

  var loadSounds = (obj, soundMap, callback) => {
    // Array-ify
    let names = [];
    let paths = [];
    for (let name in soundMap) {
      let path = soundMap[name];
      names.push(name);
      paths.push(path);
    }
    let bufferLoader = new BufferLoader(audioCtx, paths, (bufferList) => {
      for (let i = 0; i < bufferList.length; i++) {
        let buffer = bufferList[i];
        let name = names[i];
        obj[name] = buffer;
      }
      if (callback) callback();
    });
    bufferLoader.load();
  };

  class BufferLoader {

    constructor(audioCtx, urlList, callback) {
      this.audioCtx = audioCtx;
      this.urlList = urlList;
      this.onload = callback;
      this.bufferList = new Array();
      this.loadCount = 0;
    }

    load() {
      for (let i = 0; i < this.urlList.length; ++i) {
        this.loadBuffer(this.urlList[i], i);
      }
    }

    loadBuffer(url, index) {
      // Load buffer asynchronously
      let request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "arraybuffer";
      var loader = this;
      request.onload = () => {
        // Asynchronously decode the audio file data in request.response
        loader.audioCtx.decodeAudioData(
          request.response,
          (buffer) => {
            if (!buffer) {
              alert('error decoding file data: ' + url);
              return;
            }
            loader.bufferList[index] = buffer;
            if (++loader.loadCount == loader.urlList.length) {
              loader.onload(loader.bufferList);
            }
          },
          (error) => {
            console.error('decodeAudioData error', error);
          }
        );
      }
      request.onerror = () => {
        alert('BufferLoader: XHR error');
      }
      request.send();
    }

  }

}());
