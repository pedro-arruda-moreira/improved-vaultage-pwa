// workaround for sjcl
function define(ignored, sjcl) {
  window.sjcl = sjcl();
}
// self hosted mode / use basic mode
const href = document.location.href;
if(href && href.indexOf('self_contained=true') > -1) {
    window.__self_contained=true;
}
if(href && href.indexOf('use_basic=true') > -1) {
    window.__use_basic=true;
}
// online crypto support
if(localStorage.getItem('crypto_type') == null) {
  if(href && href.indexOf('crypto_type=online') > -1) {
    localStorage.setItem('crypto_type', 'online');
  } else {
    localStorage.setItem('crypto_type', 'offline');
  }
}
// desktop mode
if(localStorage.getItem('desktop') == null) {
  if(href && href.indexOf('desktop=true') > -1) {
    localStorage.setItem('desktop', 'true');
  } else {
    localStorage.setItem('desktop', 'false');
  }
}