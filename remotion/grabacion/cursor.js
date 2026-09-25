(function(){const go=()=>{
// Cursor visible dentro de la página (el screencast no pinta el del sistema).
if (!document.getElementById('__cur')) {
  const c = document.createElement('div');
  c.id = '__cur';
  c.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M4 2l15 11-6.5 1.2L16 21l-2.8 1.3-3.4-6.8L4 19z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  Object.assign(c.style, {position:'fixed', left:'640px', top:'800px', zIndex:2147483647, pointerEvents:'none', transition:'transform .12s', filter:'drop-shadow(0 2px 3px rgba(0,0,0,.3))'});
  document.documentElement.appendChild(c);
  addEventListener('mousemove', e => { c.style.left = e.clientX - 4 + 'px'; c.style.top = e.clientY - 2 + 'px'; }, true);
  addEventListener('mousedown', () => c.style.transform = 'scale(.8)', true);
  addEventListener('mouseup', () => c.style.transform = '', true);
}

}; if(document.body) go(); else addEventListener('DOMContentLoaded', go);})();