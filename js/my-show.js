d3.select("body").selectAll(".slide-frame")
    .data(slides)
  .enter().append("div")
    .attr('id',function(d,i) {return 'frame-'+i; })
    .attr('class','slide-frame')
    .append("iframe")
      .attr("src",function(d) {return d.loc;});

d3.select("#navigator").selectAll("option")
    .data(slides)
  .enter().append("option")
    .attr('value',function(d,i) { return i; } )
    .text(function(d,i) {return d.title; });

var curIndex = 0,
    visible = false;

d3.select(window).on("resize", resize).on("hashchange", function hashchange() {
  var that = d3.select(this).on("hashchange", null);
  navigateTo(+location.hash.substring(1));
  that.on("hashchange", hashchange);
});

d3.select(window).on("keydown", function() {
    switch (d3.event.keyCode) {
      case 39: // right arrow
      case 34: { // page down
        //navigateTo(curIndex + 1);
        navigateForward();
        break;
      }
      case 37: // left arrow
      case 33: { // page up
        //navigateTo(curIndex - 1);
        navigateBack();
        break;
      }
      case 36: { // home
        //navigateTo(0);
        navigateToStart();
        break;
      }
      case 35: { // end
        //navigateTo(slides.length-1);
        navigateToEnd();
        break;
      }
      case 38: { // Up
        // Surely a way to d3 this, but don't know it at the moment
        if (document.getElementById('active').contentWindow.up != null) {
            document.getElementById('active').contentWindow.up();
        }
        break;
      }
      case 40: { // Down
        // Surely a way to d3 this, but don't know it at the moment
        if (document.getElementById('active').contentWindow.down != null) {
            document.getElementById('active').contentWindow.down();
        }
        break;
      }
      case 32: // space
        // Surely a way to d3 this, but don't know it at the moment
        if (document.getElementById('active').contentWindow.down != null) {
            document.getElementById('active').contentWindow.down(true);
        } else {
            navigateForward();
        }
        break;
      case 8: // backspace
        // Surely a way to d3 this, but don't know it at the moment
        if (document.getElementById('active').contentWindow.up != null) {
            document.getElementById('active').contentWindow.up(true);
        } else {
            navigateBack();
        }
        break;
      case 48: { // 0 key, pop up menu
        if (!visible) {
          d3.selectAll("#menu").style("display", "block");
          visible = true;
        } else {
          d3.selectAll("#menu").style("display", "none");
          visible = false;
        }
        break;
      }
      default: return;
    }
    d3.event.preventDefault();
});

var resize = function() {
  d3.select("body").style("margin-top", (window.innerHeight - 768) / 2 + "px");
};

var navigateToEnd = function() {
    navigateTo(slides.length-1);
};

var navigateToStart = function() {
    navigateTo(0);
}

var navigateForward = function() {
    navigateTo(curIndex + 1);
}

var navigateBack = function() {
    navigateTo(curIndex - 1);
}

var navigateTo = function(slide) {
    slide = Number(slide);
    curIndex = slide > slides.length - 1 ? 0 : slide;
    curIndex = curIndex < 0 ? slides.length - 1 : curIndex;
    var nextIndex = curIndex + 1 >= slides.length ? 0 : curIndex + 1;
    var prevIndex = curIndex - 1 >= 0 ? curIndex - 1 : slides.length - 1;

    d3.select('.current').select('iframe').attr('id','');

    d3.select('.previous').classed('previous',false);
    d3.select('.next').classed('next',false);
    d3.select('.current').classed('current',false);
    d3.select('#frame-'+prevIndex).classed('previous',true);
    d3.select('#frame-'+curIndex).classed('current',true);
    d3.select('#frame-'+nextIndex).classed('next',true);

    d3.select('.current').select('iframe').attr('id','active');

    if (document.getElementById('active').contentWindow.start != null) {
        document.getElementById('active').contentWindow.start();
    }

    document.getElementById("navigator").selectedIndex = curIndex;
    document.getElementById('active').contentWindow.focus();

    location.hash = curIndex;
    d3.selectAll("#menu").style("display", "none");
    visible = false;
}

resize();

if (location.hash !== "") {
  navigateTo(+location.hash.substring(1));
} else {
  navigateTo(0);
}
