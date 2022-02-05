// workaround for sjcl
function define(ignored, sjcl) {
  window.sjcl = sjcl();
}
(function() {
  var params = new URLSearchParams(window.location.search);
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
  // disable text selection
  window.document.addEventListener('selectstart', function(e) {
    function isAllowedTag(e) {
      if(!e.tagName) {
        return false;
      }
      var tagName = e.tagName.toLowerCase();
      return tagName == 'input' || tagName == 'textarea';
    }
    var elem = e.srcElement;
    if(!isAllowedTag(elem)) {
      e.preventDefault();
      return false;
    }
  })
}());