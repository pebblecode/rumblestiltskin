/**
 * NoSleep.js v0.5.0 - git.io/vfn01
 * Rich Tibbett
 * MIT license
 **/
(function(root) {
  // UA matching
  var ua = {
    Android: /Android/ig.test(navigator.userAgent),
    iOS: /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent)
  };

  var media = {
    WebM: "data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA=",
    MP4: "data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw=="
  };

  function addSourceToVideo(element, type, dataURI) {
    var source = document.createElement('source');
    source.src = dataURI;
    source.type = "video/" + type;
    element.appendChild(source);
  }

  // NoSleep instance constructor
  var NoSleep = function() {
    if (ua.iOS) {
      this.noSleepTimer = null;
    } else if (ua.Android) {
      // Set up no sleep video element
      this.noSleepVideo = document.createElement('video');
      this.noSleepVideo.setAttribute("loop", "");

      // Append nosleep video sources
      addSourceToVideo(this.noSleepVideo, "webm", media.WebM);
      addSourceToVideo(this.noSleepVideo, "mp4", media.MP4);
    }

    return this;
  };

  // Enable NoSleep instance
  NoSleep.prototype.enable = function(duration) {
    if (ua.iOS) {
      this.disable();
      this.noSleepTimer = window.setInterval(function() {
        window.location.href = '/';
        window.setTimeout(window.stop, 0);
      }, duration || 15000);
    } else if (ua.Android) {
      this.noSleepVideo.play();
    }
  };

  // Disable NoSleep instance
  NoSleep.prototype.disable = function() {
    if (ua.iOS) {
      if (this.noSleepTimer) {
        window.clearInterval(this.noSleepTimer);
        this.noSleepTimer = null;
      }
    } else if (ua.Android) {
      this.noSleepVideo.pause();
    }
  };

  // Append NoSleep API to root object
  window.NoSleep = NoSleep;
})(this);


// ---------------------------------------------------------------------------------------------


const LIMIT = 5;

const noSleep = new NoSleep();

let counter = 0;
let maxValue = 0;
let values = [];

const $button = $('#button');
const $tag = $('#tag');
const $interval = $('#interval');

$button.off('click').on('click', start);

function start() {
  noSleep.enable();
  window.addEventListener('devicemotion', listener, true);
  $button.text('Stop');
  $button.off('click')
  $button.on('click', stop);
  maxValue = 0;
}

function stop() {
  window.removeEventListener('devicemotion', listener, true);
  noSleep.disable;
  $button.text('Start');
  $button.off('click')
  $button.on('click', start);
}

function getAbsoluteAcceleration(x, y, z) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
}

function getAvgValue(values) {
  const sum = values.reduce((s, n) => s += n);
  return sum / values.length;
}

function listener(event) {
  if (!event.acceleration) return;
  const acc = event.acceleration;

  $interval.text(event.interval);

  const absAcceleration = getAbsoluteAcceleration(acc.x, acc.y, acc.z);

  maxValue = maxValue > absAcceleration ? maxValue : absAcceleration;
  values.push(absAcceleration);

  counter++
  if (counter % 200 == 0) {
    const avgValue = getAvgValue(values);
    const event = {
      maxValue: maxValue,
      avgValue: avgValue,
      tag: $tag.val()
    }
    $.post('/event', event);
    $('#logs').append( `<p>max:${maxValue.toFixed(3)} avg: ${avgValue.toFixed(3)}</p>` );
    maxValue = 0;
    values = [];
  }
}





