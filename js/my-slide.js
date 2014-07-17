maxStep = typeof maxStep !== 'undefined' ? maxStep : 0;
step = typeof step !== 'undefined' ? step : 0;

up = typeof up !== 'undefined' ? up : function(prevSlide) {
    prevSlide = typeof prevSlide !== 'undefined' ? prevSlide : false;

    if (step === 0) {
        if (prevSlide) window.parent.navigateBack();
    } else {
        step = step > 0 ? step-1 : 0;
        update();
    }
};

down = typeof down !== 'undefined' ? down : function(nextSlide) {
    nextSlide = typeof nextSlide !== 'undefined' ? nextSlide : false;

    if (step < maxStep) {
        step = step < maxStep ? step+1 : maxStep;
        update();
    } else {
        if (nextSlide) window.parent.navigateForward();
    }
};

d3.select(window).on("keydown", function() {
    switch (d3.event.keyCode) {
      case 39: // right arrow
      case 34: { // page down
        window.parent.navigateForward();
        break;
      }
      case 37: // left arrow
      case 33: { // page up
        window.parent.navigateBack();
        break;
      }
      case 36: { // home
        window.parent.navigateToStart();
        break;
      }
      case 35: { // end
        window.parent.navigateToEnd();
        break;
      }
      case 38: { // Up
        if (typeof up == 'function') {
            up();
        }
        break;
      }
      case 40: { // Down
        if (typeof up == 'function') {
            down();
        }
        break;
      }
      case 32: { // space
        if (typeof down == 'function') {
            down(true);
        } else {
            window.parent.navigateForward();
        }
        break;
      }
      case 8: { // backspace
        if (typeof up == 'function') {
            up(true);
        } else {
            window.parent.navigateBack();
        }
        break;
      }
      case 72:
        window.parent.$('#helpModal').show();
        break;
      case 48: { // 0 key, pop up menu (Probably a show function)
        break;
      }
      default: return;
    }
    d3.event.preventDefault();
});

