function xkcdplot() {

    // Default parameters.
    var width = 900,
        height = 600,
        ml = 150,
        mr = 20,
        mt = 20,
        mb = 20,
        w = width - ml - mr,
        h = height - mt - mb,
        arrowSize = 20,
        arrowAspect = 0.4,
        arrowOffset = 12,
        magnitude = 0.004,
        xlabel = "Time of Day",
        ylabel = "Awesomeness",
        title = "The most important graph ever made",
        xlim,
        ylim;

    // Plot elements.
    var el,
        xscale = d3.scale.linear(),
        yscale = d3.scale.linear();

    // Plotting functions.
    var elements = [];
    var xticks = [];
    var yticks = [];

    // The XKCD object itself.
    var xkcd = function (nm) {
        el = d3.select(nm).append("svg")
                    .attr("width", width)
                    .attr("height", height)
                .append("g")
                    .attr("transform", "translate(" + ml + ", "
                                                    + mt + ")");
        return xkcd;
    };

    // Getters and setters.
    xkcd.xlim = function () {
        if (!arguments.length) return xlim;
        xlim = arguments[0];
        return xkcd;
    };
    xkcd.ylim = function () {
        if (!arguments.length) return ylim;
        ylim = arguments[0];
        return xkcd;
    };
    xkcd.ylabel = function () {
        if (!arguments.length) return ylabel;
        ylabel = arguments[0];
        return xkcd;
    };
    xkcd.xlabel = function () {
        if (!arguments.length) return xlabel;
        xlabel = arguments[0];
        return xkcd;
    };
    xkcd.title = function () {
        if (!arguments.length) return title;
        title = arguments[0];
        return xkcd;
    };

    // Do the render.
    xkcd.draw = function () {
        // Set the axes limits.
        xscale.domain(xlim).range([0, w]);
        yscale.domain(ylim).range([h, 0]);

        // Compute the zero points where the axes will be drawn.
        var x0 = xscale(0),
            y0 = yscale(0),
            xMax = xscale.range()[1];

        // Draw the axes.
        var axis = d3.svg.line().interpolate(xinterp);
        el.selectAll(".axis").remove();
        el.append("svg:path")
            .attr("class", "x axis")
            .attr("d", axis([[x0, y0], [w, y0]]));
        el.append("svg:path")
            .attr("class", "y axis")
            .attr("d", axis([[x0, 0], [x0, y0]]));

        // Laboriously draw some arrows at the ends of the axes.
//        var aa = arrowAspect * arrowSize,
//            o = arrowOffset,
//            s = arrowSize;
//        el.append("svg:path")
//            .attr("class", "x axis arrow")
//            .attr("d", axis([[w - s + o, y0 + aa], [w + o, y0], [w - s + o, y0 - aa]]));
//        el.append("svg:path")
//            .attr("class", "x axis arrow")
//            .attr("d", axis([[s - o, y0 + aa], [-o, y0], [s - o, y0 - aa]]));
//        el.append("svg:path")
//            .attr("class", "y axis arrow")
//            .attr("d", axis([[x0 + aa, s - o], [x0, -o], [x0 - aa, s - o]]));
//        el.append("svg:path")
//            .attr("class", "y axis arrow")
//            .attr("d", axis([[x0 + aa, h - s + o], [x0, h + o], [x0 - aa, h - s + o]]));
//
        el.append('g').attr('class','x-ticks').selectAll('g.x-tick').data([{x:2,label:'Sample'},{x:8,label:'Probe'}]).enter().append('svg:g').attr('class','x-tick');
        xticks = d3.selectAll('.x-tick');
        xticks.append('svg:path')
            .attr('class','x axis tick')
            .attr('d',function(d) { return axis([[xscale(d.x),y0-10],[xscale(d.x),y0+10]]); });
        xticks.append('svg:text')
            .text(function(d) { return d.label; })
            .attr('x',function(d) { return xscale(d.x); })
            .attr('y',y0+30);

        el.append('g').attr('class','y-ticks').selectAll('g.y-tick').data([{y:0.25,label:0.25},{y:0.5,label:0.5},{y:0.75,label:0.75},{y:1.0,label:1.0}]).enter().append('svg:g').attr('class','y-tick');
        yticks = d3.selectAll('.y-tick');
        yticks.append('svg:path')
            .attr('class','y axis tick')
            .attr('d',function(d) { return axis([[x0-10,yscale(d.y)],[x0+10,yscale(d.y)]]); });
        yticks.append('svg:text')
            .text(function(d) { return d.label; })
            .attr('y',function(d) { return yscale(d.y); })
            .attr('dy',7)
            .attr('x',x0-20);

        // Draw the data lines
        for (var i = 0, l = elements.length; i < l; ++i) {
            var e = elements[i];
            e.func(e.data, e.x, e.y, e.opts);
        }

        // Add some axes labels.
        el.append("text").attr("class", "x label")
                              .attr("text-anchor", "middle")
                              .attr("x", x0+((xMax-x0)/2))
                              .attr("y", h-24)
                              .attr("dy", ".75em")
                              .text(xlabel);
        el.append("text").attr("class", "y label")
                              .attr("text-anchor", "middle")
                              .attr("x", -65)
                              .attr("y", y0/2-28-14)
                              .selectAll('tspan')
                                .data(ylabel)
                                  .enter().append('tspan')
                                  .attr('x',-65)
                                  .attr('dy',28)
                                  .text(function(d) { return d; });
                              //.attr("transform", "rotate(-90)")
            //                  .text(ylabel);

        // And a title.
        el.append("text").attr("class", "title")
                              .attr("text-anchor", "end")
                              .attr("x", w)
                              .attr("y", 0)
                              .text(title);

        return xkcd;
    };

    xkcd.transition = function (data, opts) {
        var x = function (d) { return d.x; },
            y = function (d) { return d.y; },
            cx = function (d) { return xscale(x(d)); },
            cy = function (d) { return yscale(y(d)); };

        var line = d3.svg.line().x(cx).y(cy).interpolate(xinterp);

//        d3.selectAll('.'+opts.classed+'.bgline').style('opacity',0);
        d3.selectAll('.'+opts.classed+'.bgline').transition().duration(2000)
//            .ease('bounce')
            .ease('elastic',1,.28)
            .attr("d", line(data));
//        d3.selectAll('.'+opts.classed+'.bgline').transition().delay(2000).duration(500).style('opacity',1);
        d3.selectAll('.'+opts.classed+'.line').transition().duration(2000)
//             .ease('bounce')
            .ease('elastic',1,.28)
            .attr("d", line(data));

        return xkcd;
    }

    // Adding plot elements.
    xkcd.plot = function (data, opts) {
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
                        func: lineplot,
                        x: cx,
                        y: cy,
                        opts: opts
                      });

        return xkcd;
    };

    // Plot styles.
    function lineplot(data, x, y, opts) {
        var line = d3.svg.line().x(x).y(y).interpolate(xinterp),
            bgline = d3.svg.line().x(x).y(y),
            strokeWidth = _get(opts, "stroke-width", 5),
            color = _get(opts, "stroke", "steelblue"),
            classed = _get(opts,"classed","line"),
            strokeDash = _get(opts, "stroke-dasharray", "1");
        el.append("svg:path").attr('class',classed).attr("d", bgline(data))
                             .style("stroke", "white")
                             .style('opacity',0)
                             //.style("stroke-width", 2 * strokeWidth + "px")
                             .style("stroke-width", 0)
                             .style("fill", "none")
                             .classed("bgline",true);
        el.append("svg:path").attr('class',classed).attr("d", line(data))
                             .style("stroke", color)
                             .style("stroke-dasharray", strokeDash)
                             .style("stroke-width", strokeWidth + "px")
                             .style("fill", "none")
                             .classed("line",true);
    };

    // XKCD-style line interpolation. Roughly based on:
    //    jakevdp.github.com/blog/2012/10/07/xkcd-style-plots-in-matplotlib
    function xinterp (points) {
        // Scale the data.
        var f = [xscale(xlim[1]) - xscale(xlim[0]),
                 yscale(ylim[1]) - yscale(ylim[0])],
            z = [xscale(xlim[0]),
                 yscale(ylim[0])],
            scaled = points.map(function (p) {
                return [(p[0] - z[0]) / f[0], (p[1] - z[1]) / f[1]];
            });

        // Compute the distance along the path using a map-reduce.
        var dists = scaled.map(function (d, i) {
            if (i == 0) return 0.0;
            var dx = d[0] - scaled[i - 1][0],
                dy = d[1] - scaled[i - 1][1];
            return Math.sqrt(dx * dx + dy * dy);
        }),
            dist = dists.reduce(function (curr, d) { return d + curr; }, 0.0);

        // Choose the number of interpolation points based on this distance.
        var N = Math.round(200 * dist);

        // Re-sample the line.
        var resampled = [];
        dists.map(function (d, i) {
            if (i == 0) return;
            var n = Math.max(3, Math.round(d / dist * N)),
                spline = d3.interpolate(scaled[i - 1][1], scaled[i][1]),
                delta = (scaled[i][0] - scaled[i - 1][0]) / (n - 1);
            for (var j = 0, x = scaled[i - 1][0]; j < n; ++j, x += delta)
                resampled.push([x, spline(j / (n - 1))]);
        });

        // Compute the gradients.
        var gradients = resampled.map(function (a, i, d) {
            if (i == 0) return [d[1][0] - d[0][0], d[1][1] - d[0][1]];
            if (i == resampled.length - 1)
                return [d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1]];
            return [0.5 * (d[i + 1][0] - d[i - 1][0]),
                    0.5 * (d[i + 1][1] - d[i - 1][1])];
        });

        // Normalize the gradient vectors to be unit vectors.
        gradients = gradients.map(function (d) {
            var len = Math.sqrt(d[0] * d[0] + d[1] * d[1]);
            return [d[0] / len, d[1] / len];
        });

        // Generate some perturbations.
        var perturbations = smooth(resampled.map(d3.random.normal()), 3);

        // Add in the perturbations and re-scale the re-sampled curve.
        var result = resampled.map(function (d, i) {
            var p = perturbations[i],
                g = gradients[i];
            return [(d[0] + magnitude * g[1] * p) * f[0] + z[0],
                    (d[1] - magnitude * g[0] * p) * f[1] + z[1]];
        });

        return result.join("L");
    }

    // Smooth some data with a given window size.
    function smooth(d, w) {
        var result = [];
        for (var i = 0, l = d.length; i < l; ++i) {
            var mn = Math.max(0, i - 5 * w),
                mx = Math.min(d.length - 1, i + 5 * w),
                s = 0.0;
            result[i] = 0.0;
            for (var j = mn; j < mx; ++j) {
                var wd = Math.exp(-0.5 * (i - j) * (i - j) / w / w);
                result[i] += wd * d[j];
                s += wd;
            }
            result[i] /= s;
        }
        return result;
    }

    // Get a value from an object or return a default if that doesn't work.
    function _get(d, k, def) {
        if (typeof d === "undefined") return def;
        if (typeof d[k] === "undefined") return def;
        return d[k];
    }

    return xkcd;

}
