function lineplot() {

    // Default parameters.
    var width = 900,
        height = 600,
        ml = 120,
        mr = 20,
        mt = 20,
        mb = 80,
        w = width - ml - mr,
        h = height - mt - mb,
        xlabel = "Time of Day",
        ylabel = "Awesomeness",
        title = "The most important graph ever made",
        xlim,
        ylim,
        xticks,
        yticks;

    // Plot elements.
    var svg, plot, dataRegion,
        xscale = d3.scale.linear(),
        yscale = d3.scale.linear();

    // Plotting functions.
    var elements = [];

    // The plot itself.
    var lineplot = function (nm) {
        svg = d3.select(nm).append("svg")
                    .classed('chart',true)
                    .attr("width", width)
                    .attr("height", height);
        plot = svg.append("g")
                    .attr('id','plot')
                    .attr("transform", "translate(" + ml + ", "
                                                    + mt + ")");
        dataRegion = plot.append('g')
                    .attr('id','data-region');

        return lineplot;
    };

    // Do the render.
    lineplot.draw = function () {
        // Set the axes limits.
        xscale.domain(xlim).range([0, w]);
        yscale.domain(ylim).range([h, 0]);

        // Compute the zero points where the axes will be drawn.
        var x0 = xscale(0),
            y0 = yscale(0),
            xMax = xscale.range()[1];

        // Draw the axes.
        var axis = d3.svg.line();
        var xaxis = plot.append("svg:g")
            .attr("class", "axis x");
        xaxis.append('svg:path')
            .attr("d", axis([[0, y0], [w, y0]]));
        var yaxis = plot.append("svg:g")
            .attr("class", "axis y")
        yaxis.append('svg:path')
            .attr("d", axis([[x0, 0], [x0, h]]));

        xaxis.append('g')
            .attr('class','ticks x')
            .selectAll('.tick.x')
                .data(xticks)
                .enter()
                    .append('svg:g')
                    .attr('class','tick x');
        xticks = d3.selectAll('.tick.x');
        xticks.append('svg:path')
            .attr('d',function(d) { return axis([[xscale(d.x),y0],[xscale(d.x),y0+10]]); });
        xticks.append('svg:text')
            .text(function(d) { return d.label; })
            .attr('x',function(d) { return xscale(d.x); })
            .attr('y',y0+30);

        yaxis.append('g')
            .attr('class','ticks y')
            .selectAll('.tick.y')
                .data(yticks)
                .enter()
                    .append('svg:g')
                    .attr('class','tick y');
        yticks = d3.selectAll('.tick.y');
        yticks.append('svg:path')
            .attr('d',function(d) { return axis([[x0-10,yscale(d.y)],[x0,yscale(d.y)]]); });
        yticks.append('svg:text')
            .text(function(d) { return d.label; })
            .attr('y',function(d) { return yscale(d.y); })
            .attr('dy',7)
            .attr('x',x0-40);

        // Draw the data lines
        for (var i = 0, l = elements.length; i < l; ++i) {
            var e = elements[i];
            e.func(e.data, e.x, e.y, e.opts);
        }

        // Add some axes labels.
        plot.append("text").attr("class", "x label")
                              .attr("text-anchor", "middle")
                              .attr("x", x0+((xMax-x0)/2))
                              .attr("y", h+50)
                              .attr("dy", ".75em")
                              .text(xlabel);
        plot.append("text").attr("class", "y label")
                              .attr("text-anchor", "middle")
                              .attr("x", 0)
                              .attr("y", 0) 
                              .attr('dx',-h/2)
                              .attr('dy',-75)
                              .attr("transform", "rotate(-90)")
                              .text(ylabel);

        // And a title.
        plot.append("text").attr("class", "title")
                              .attr("text-anchor", "end")
                              .attr("x", w)
                              .attr("y", 0)
                              .text(title);

        return lineplot;
    };

    lineplot.transition = function (data, opts) {
        var x = function (d) { return d.x; },
            y = function (d) { return d.y; },
            cx = function (d) { return xscale(x(d)); },
            cy = function (d) { return yscale(y(d)); };

        var line = d3.svg.line().x(cx).y(cy).interpolate(xinterp);

        d3.selectAll('.'+opts.classed+'.bgline').transition().duration(1000)
            .ease('elastic',1,.28)
            .attr("d", line(data));
        d3.selectAll('.'+opts.classed+'.line').transition().duration(1000)
            .ease('elastic',1,.28)
            .attr("d", line(data));

        return lineplot;
    }

    // Adding plot elements.
    lineplot.plot = function (data, opts) {
        var x = function (d) { return d.x; },
            y = function (d) { return d.y; },
            cx = function (d) { return xscale(x(d)); },
            cy = function (d) { return yscale(y(d)); },
            xl = d3.extent(data, x),
            yl = d3.extent(data, y);

        // Rescale the axes.
        xlim = xlim || xl;
        xlim[0] = Math.min(xlim[0], xl[0]);
        xlim[1] = Math.max(xlim[1], xl[1]);
        ylim = ylim || yl;
        ylim[0] = Math.min(ylim[0], yl[0]);
        ylim[1] = Math.max(ylim[1], yl[1]);

        // Add the plotting function.
        elements.push({
                        data: data,
                        func: plotline,
                        x: cx,
                        y: cy,
                        opts: opts
                      });

        return lineplot;
    };

    // Plot styles.
    function plotline(data, x, y, opts) {
        var line = d3.svg.line().x(x).y(y),
            classed = _get(opts,"classed","line"),
            stroke = _get(opts,'stroke',''),
            id = _get(opts,'id','');
        dataRegion.append("svg:path")
            .attr('class',classed)
            .attr('id',id)
            .attr("d", line(data))
            .style('stroke',stroke)
            .classed("line",true);
    };

    // Get a value from an object or return a default if that doesn't work.
    function _get(d, k, def) {
        if (typeof d === "undefined") return def;
        if (typeof d[k] === "undefined") return def;
        return d[k];
    }
    
    // Getters and setters.
    lineplot.xlim = function () {
        if (!arguments.length) return xlim;
        xlim = arguments[0];
        return lineplot;
    };
    lineplot.ylim = function () {
        if (!arguments.length) return ylim;
        ylim = arguments[0];
        return lineplot;
    };
    lineplot.ylabel = function () {
        if (!arguments.length) return ylabel;
        ylabel = arguments[0];
        return lineplot;
    };
    lineplot.xlabel = function () {
        if (!arguments.length) return xlabel;
        xlabel = arguments[0];
        return lineplot;
    };
    lineplot.title = function () {
        if (!arguments.length) return title;
        title = arguments[0];
        return lineplot;
    };
    lineplot.xticks = function () {
        if (!arguments.length) return xticks;
        xticks = arguments[0];
        return lineplot;
    };
    lineplot.yticks = function () {
        if (!arguments.length) return yticks;
        yticks = arguments[0];
        return lineplot;
    };

    return lineplot;

}
