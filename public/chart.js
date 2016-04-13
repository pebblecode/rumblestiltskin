'use strict';

d3.xhr('/events', function (err, xhr) {

    if (err) console.log(err);

    var data = JSON.parse(xhr.response).filter(function (i) {
        return i.avgValue;
    });

    if (err) console.log(err);

    var margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear().range([0, width]);

    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(x).orient('bottom');

    var yAxis = d3.svg.axis().scale(y).orient('left');

    var line = d3.svg.line().x(function (d) {
        return x(d.date);
    }).y(function (d) {
        return y(d.close);
    });

    var svg = d3.select('body').append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var lineGen = d3.svg.line().x(function (d) {
        return x(d.time);
    }).y(function (d) {
        return y(parseFloat(d.avgValue || 0));
    });

    // let slimData = [];
    // data.forEach(d => {
    //   if (/Train/.test(d.tag)) slimData.push(d)
    // })
    // console.log(slimData)
    var colours = ['red', 'orange', 'green', 'blue', 'purple', 'lightblue'];

    var nestedData = d3.nest().key(function (d) {
        return d.tag;
    }).entries(data);

    nestedData.forEach(function (i, idx) {
        $('.buttons').append('<button style="color: ' + colours[idx] + ';" id="button-' + idx + '">' + i.key + '</button>');
        $('#button-' + idx).click(function () {
            drawGraph(i, idx);
        });
    });

    $('.buttons').append('<button id="button-all">All</button>');
    $('#button-all').click(function () {
        drawAll();
    });

    drawAll();

    function drawGraph(i, idx) {
        svg.selectAll('*').remove();

        x.domain(d3.extent(i.values, function (d) {
            return d.time;
        }));
        y.domain(d3.extent(i.values, function (d) {
            return d.avgValue || 0;
        }));

        svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);

        svg.append('g').attr('class', 'y axis').call(yAxis).append('text').attr('transform', 'rotate(-90)').attr('y', 6).attr('dy', '.71em').style('text-anchor', 'end').text('Vibration');

        var sortedValues = i.values.sort(function (a, b) {
            return a.time - b.time;
        });
        svg.append('svg:path').attr('d', lineGen(sortedValues)).attr('stroke', colours[idx]).attr('stroke-width', 2).attr('fill', 'none').attr('class', 'tag');
    }

    function drawAll() {
        svg.selectAll('*').remove();

        x.domain(d3.extent(data, function (d) {
            return d.time;
        }));
        y.domain(d3.extent(data, function (d) {
            return d.avgValue || 0;
        }));

        svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);

        svg.append('g').attr('class', 'y axis').call(yAxis).append('text').attr('transform', 'rotate(-90)').attr('y', 6).attr('dy', '.71em').style('text-anchor', 'end').text('Vibration');

        nestedData.forEach(function (d, i) {
            var sortedValues = d.values.sort(function (a, b) {
                return a.time - b.time;
            });
            svg.append('svg:path').attr('d', lineGen(sortedValues)).attr('stroke', colours[i]).attr('stroke-width', 2).attr('fill', 'none').attr('class', 'tag');
        });
    }
});
//# sourceMappingURL=chart.js.map