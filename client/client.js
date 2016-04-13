
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





