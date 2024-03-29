'use strict';

var LIMIT = 5;

var noSleep = new NoSleep();

var counter = 0;
var maxValue = 0;
var values = [];

var $button = $('#button');
var $tag = $('#tag');
var $interval = $('#interval');

$button.off('click').on('click', start);

function start() {
  noSleep.enable();
  window.addEventListener('devicemotion', listener, true);
  $button.text('Stop');
  $button.off('click');
  $button.on('click', stop);
  maxValue = 0;
}

function stop() {
  window.removeEventListener('devicemotion', listener, true);
  noSleep.disable;
  $button.text('Start');
  $button.off('click');
  $button.on('click', start);
}

function getAbsoluteAcceleration(x, y, z) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
}

function getAvgValue(values) {
  var sum = values.reduce(function (s, n) {
    return s += n;
  });
  return sum / values.length;
}

function listener(event) {
  if (!event.acceleration) return;
  var acc = event.acceleration;

  $interval.text(event.interval);

  var absAcceleration = getAbsoluteAcceleration(acc.x, acc.y, acc.z);

  maxValue = maxValue > absAcceleration ? maxValue : absAcceleration;
  values.push(absAcceleration);

  counter++;
  if (counter % 200 == 0) {
    var avgValue = getAvgValue(values);
    var _event = {
      maxValue: maxValue,
      avgValue: avgValue,
      tag: $tag.val()
    };
    $.post('/event', _event);
    $('#logs').append('<p>max:' + maxValue.toFixed(3) + ' avg: ' + avgValue.toFixed(3) + '</p>');
    maxValue = 0;
    values = [];
  }
}
//# sourceMappingURL=client.js.map