// workaround for sjcl
function define(ignored, sjcl) {
  window.sjcl = sjcl();
}
(function() {
  function createSalt() {
    let salt = '';
    for(let i = 0; i < 25; i++) {
      salt += Math.random();
    }
    return salt;
  }
  var params = new URLSearchParams(window.location.search);
  function detectFeature(name, defaultValue) {
    if(localStorage.getItem(name) == null) {
      if(params.get(name)) {
        localStorage.setItem(name, params.get(name));
        return params.get(name);
      }
      localStorage.setItem(name, defaultValue);
      return defaultValue;
    }
    return localStorage.getItem(name);
  }
  // self hosted mode
  detectFeature('self_contained', 'false');
  // use basic mode
  detectFeature('use_basic', 'null');
  // online crypto support
  detectFeature('crypto_type', 'offline');
  // desktop mode
  detectFeature('desktop', 'false');
  // config cache
  detectFeature('config_cache', 'false');
  // auto create new vault
  detectFeature('auto_create', 'false');
  // online crypto path
  detectFeature('online_crypto_path', './api/crypto');
  // offline mode
  if (detectFeature('offline_enabled', 'false') == 'true') {
    // offline salt
    detectFeature('offline_salt', createSalt());
  }
  // disable text selection
  window.document.addEventListener('selectstart', function(e) {
    function isAllowedTag(el) {
      if(!el.tagName) {
        return false;
      }
      var tagName = el.tagName.toLowerCase();
      return tagName == 'input' || tagName == 'textarea';
    }
    var elem = e.srcElement;
    if(!isAllowedTag(elem)) {
      e.preventDefault();
      return false;
    }
  })
}());