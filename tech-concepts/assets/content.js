/* ============================================================
   tech-concepts 内容组件交互（栏目共享）
   目前职责：codeblock 一键复制——只复制命令行（.t-cmd），
   不带回显（.t-out）与注释（.t-cmt），贴进终端即可跑。
   纯原生 JS，无依赖。
   ============================================================ */
(function () {
  'use strict';
  document.querySelectorAll('.codeblock').forEach(function (block) {
    var btn = block.querySelector('.copy');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var cmds = Array.prototype.map.call(
        block.querySelectorAll('.t-cmd'),
        function (el) { return el.textContent.trim(); }
      ).filter(Boolean);
      var text = cmds.length ? cmds.join('\n') : (block.querySelector('pre') || block).textContent.trim();
      var done = function () {
        var old = btn.textContent;
        btn.textContent = '已复制'; btn.classList.add('done');
        setTimeout(function () { btn.textContent = old; btn.classList.remove('done'); }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { fallback(text, done); });
      } else { fallback(text, done); }
    });
  });
  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* 复制失败静默 */ }
    document.body.removeChild(ta);
  }
})();
