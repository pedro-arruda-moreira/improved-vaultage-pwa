// workaround for sjcl
function define(ignored, sjcl) {
  window.sjcl = sjcl();
}
(function() {
  params = new URLSearchParams(window.location.search);
  function detectFeature(name, defaultValue) {
    if(localStorage.getItem(name) == null) {
      if(params.get(name)) {
        localStorage.setItem(name, params.get(name));
      } else {
        localStorage.setItem(name, defaultValue);
      }
    }
  }
  // self hosted mode
  detectFeature('self_contained', 'false');
  // use basic mode
  detectFeature('use_basic', 'null');
  // online crypto support
  detectFeature('crypto_type', 'offline');
  // desktop mode
  detectFeature('desktop', 'false');
}());