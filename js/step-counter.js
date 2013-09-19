var update_counter = function(step,cir) {
    d3.select('#inner-step-counter').transition().duration(750).attr('r',cir(step));
}

var insert_step_counter = function(size) { 
    var svg = d3.select('#slide').append('svg')
        .attr('id','step-counter')
        .attr('width',size)
        .attr('height',size);
    svg.append('circle')
        .attr('id','outer-step-counter')
        .attr('cx',size/2)
        .attr('cy',size/2)
        .attr('r',size/2);
    svg.append('circle')
        .attr('id','inner-step-counter')
        .attr('cx',size/2)
        .attr('cy',size/2)
        .attr('r',size/2);
}
