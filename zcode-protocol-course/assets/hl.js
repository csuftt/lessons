/* ============================================================
   zcode-protocol-course 专用代码块增强
   1) 语言探测（JSON-RPC 帧 / Python / 注释混合）
   2) 轻量语法高亮（复用全站 tok-* 配色，含深色模式）
   3) 自动包上 .codeblock 壳（macOS 三色点 + 语言标签）
   仅处理本课程 <pre><code>，失败时保底为纯文本，不炸页面。
   ============================================================ */
(function () {
  'use strict';

  var PY_KW = new Set(['import', 'from', 'def', 'return', 'for', 'in', 'if', 'elif', 'else',
    'while', 'with', 'as', 'None', 'True', 'False', 'not', 'and', 'or', 'class', 'lambda',
    'try', 'except', 'finally', 'print', 'threading', 'json', 'os']);

  function detectLang(src) {
    if (/^\s*(import|from)\s+\w+/m.test(src) || /^\s*def\s+\w+/m.test(src) ||
        /subprocess|Popen|os\.environ|threading\./.test(src)) return 'python';
    if (/"method"|"result"|"params"|"sessionId"|"id":/.test(src)) return 'json';
    if (/"[^"]+"\s*:/.test(src)) return 'json';   /* 兜底：任意 "key": 形态的 JSON 值块 */
    if (/^\s*(#|\/\/)/m.test(src)) return 'mixed';
    return 'text';
  }

  var LANG_NAME = { json: 'JSON-RPC 帧', python: 'Python', mixed: '配置 / 帧片段', text: '文本' };

  /* 逐字符扫描，输出 [{cls,text}]；用 DOM API 重建，天然转义 */
  function tokenize(src, lang) {
    var out = [], i = 0, n = src.length, buf = '';
    function flush() { if (buf) { out.push({ cls: '', text: buf }); buf = ''; } }
    function push(cls, text) { flush(); out.push({ cls: cls, text: text }); }
    while (i < n) {
      var c = src[i];
      /* 注释：# 任意位置；// 仅在行首或空白后（避免吃掉 https://） */
      if (c === '#' || (c === '/' && src[i + 1] === '/' && (i === 0 || /\s/.test(src[i - 1])))) {
        var j = src.indexOf('\n', i); if (j === -1) j = n;
        push('tok-com', src.slice(i, j)); i = j; continue;
      }
      /* 字符串（JSON 里后跟 : 的判为 key） */
      if (c === '"' || c === "'") {
        var k = i + 1;
        while (k < n) {
          if (src[k] === '\\') { k += 2; continue; }
          if (src[k] === c) { k++; break; }
          if (src[k] === '\n') break;
          k++;
        }
        var m = k; while (m < n && (src[m] === ' ' || src[m] === '\t')) m++;
        var cls = (lang === 'json' && src[m] === ':') ? 'tok-key' : 'tok-str';
        push(cls, src.slice(i, k)); i = k; continue;
      }
      /* 数字（前面是边界符才认，防止吃进标识符） */
      if (/[0-9]/.test(c) && (i === 0 || /[\s,:=[(+\-]/.test(src[i - 1]))) {
        var d = i;
        while (d < n && /[0-9a-fA-Fx._]/.test(src[d])) d++;
        if (d < n && /[A-Za-z]/.test(src[d])) { buf += src[i]; i++; continue; }
        push('tok-num', src.slice(i, d)); i = d; continue;
      }
      /* 关键字（仅 Python 语境） */
      if (/[A-Za-z_]/.test(c)) {
        var e = i;
        while (e < n && /[A-Za-z0-9_]/.test(src[e])) e++;
        var word = src.slice(i, e);
        if (lang === 'python' && PY_KW.has(word)) push('tok-key', word);
        else buf += word;
        i = e; continue;
      }
      buf += c; i++;
    }
    flush();
    return out;
  }

  function highlight(codeEl, lang) {
    var toks = tokenize(codeEl.textContent, lang);
    codeEl.textContent = '';
    toks.forEach(function (t) {
      if (t.cls) {
        var s = document.createElement('span');
        s.className = t.cls; s.textContent = t.text;
        codeEl.appendChild(s);
      } else {
        codeEl.appendChild(document.createTextNode(t.text));
      }
    });
  }

  function decorate(pre, lang) {
    var shell = document.createElement('div'); shell.className = 'codeblock';
    var head = document.createElement('div'); head.className = 'code-head';
    var label = document.createElement('span'); label.className = 'lang';
    label.textContent = LANG_NAME[lang] || 'CODE';
    var dots = document.createElement('div'); dots.className = 'dots';
    for (var i = 0; i < 3; i++) dots.appendChild(document.createElement('i'));
    head.appendChild(label); head.appendChild(dots);
    pre.parentNode.insertBefore(shell, pre);
    shell.appendChild(head); shell.appendChild(pre);
  }

  function init() {
    var blocks = document.querySelectorAll('pre > code');
    Array.prototype.forEach.call(blocks, function (code) {
      var pre = code.parentElement;
      if (!pre || pre.closest('.codeblock')) return;   /* 已包壳 */
      if (code.querySelector('span')) return;          /* 已有手工高亮 */
      var lang = detectLang(code.textContent);
      if (lang !== 'text') {
        try { highlight(code, lang); } catch (e) { /* 高亮失败保底纯文本 */ }
      }
      decorate(pre, lang);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
