/**
 * Noise generating Web-Audio API patches
 **/

;(function(){

  var out = audioCtx.destination;

  var analyser = audioCtx.createAnalyser();
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;
  analyser.smoothingTimeConstant = 0.85;

  var newOsc = (f, t) => {
    var osc = audioCtx.createOscillator();
    osc.type = t;
    osc.frequency.value = f;
    return osc;
  };

  var gain = audioCtx.createGain();
  gain.gain.value = 1;

  var osc1 = newOsc(220, 'sine');
  var osc2 = newOsc(440, 'square');
  var osc3 = newOsc(880, 'sawtooth');

  var filterFreq = 80;
  var filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;
  filter.gain.value = 1;

  var convolver = audioCtx.createConvolver();

  osc1.connect(filter);
  osc2.connect(filter);
  osc3.connect(filter);
  filter.connect(gain);
  gain.connect(out);

  var playing = false;

  var play = (e) => {
    console.log('play');
    osc1.start();
    osc2.start();
    osc3.start();
    playing = true;
  };

  var pause = (e) => {
    console.log('pause');
    osc1.stop();
    osc2.stop();
    osc3.stop();
    playing = false;
  };

  window.toggleSound = (e) => {
    if (playing) {
      pause(e);
    } else {
      play(e);
    }
  };

  var ct = 0;
  var freqDelta = 100;
  var onFrame = (ts) => {
    ct++;
    if (ct <= 100) gain.gain.value = ct / 100.0;
    let y = Math.sin((ct++ % 10) / 60.0 * 2.0 * Math.PI);
    filter.frequency.value = filterFreq + y * freqDelta;
    // request next frame
    window.requestFrame(onFrame);
  };

  window.requestFrame(onFrame);

  var cX, cY;
  const minFreq = 40,
        maxFreq = 160,
        minQ = 1,
        maxQ = 10;
  var dF = maxFreq - minFreq;
  var dQ = maxQ - minQ;

  // Get new mouse pointer coordinates when mouse is moved
  // then set new gain and pitch values
  document.onmousemove = (e) => {
    cX = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
    cY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

    let f = minFreq + (cX / window.innerWidth) * dF;
    osc1.frequency.value = f;
    osc2.frequency.value = f * 2;
    osc3.frequency.value = f * 4;
    filter.Q.value = minQ + (cY / window.innerHeight) * dQ;
    filter.gain.value = minQ + (cY / window.innerHeight) * dQ * 10;
  };


  play();

})();

