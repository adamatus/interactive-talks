d3.select(window).on("keydown", function() {
    switch (d3.event.keyCode) {
      case 39: // right arrow
      case 32: // space
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
        if (typeof up == 'function')
        {
            up();
        }
        break;
      }
      case 40: { // Down
        if (typeof up == 'function')
        {
            down();
        }
        break;
      }
      case 48: { // 0 key, pop up menu (Probably a show function)
        break;
      }
      default: return;
    }
    d3.event.preventDefault();
});
