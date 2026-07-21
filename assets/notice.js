/* 首次访问提示
   勾选「不再提示」并点击「明 白」后写入 localStorage，此后不再弹出。
   未勾选则每次访问都提示。 */
(function () {
  var KEY = 'gqr-notice-ack';

  try {
    if (localStorage.getItem(KEY) === '1') return;
  } catch (e) {
    /* 隐私模式等禁用 localStorage 时，正常弹出，只是无法记住 */
  }

  function build() {
    if (document.getElementById('gqr-notice')) return;

    var wrap = document.createElement('div');
    wrap.id = 'gqr-notice';
    wrap.className = 'nt-mask';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'nt-title');
    wrap.innerHTML =
      '<div class="nt-box">' +
        '<div class="nt-hd" id="nt-title">访 问 提 示</div>' +
        '<div class="nt-bd">' +
          '<p>本站为<b>个人网站</b>，由个人建设与维护，' +
          '与任何机构、组织、政党均<b>无关联</b>，不代表任何机构立场。</p>' +
          '<p>站内文章、图片及一切内容均为个人创作，仅供浏览，不构成任何形式的公告、声明或建议。</p>' +
          '<p>继续访问本站，即表示您已阅读并认可上述说明。</p>' +
          '<label class="nt-chk">' +
            '<input type="checkbox" id="nt-never"> 不再提示' +
          '</label>' +
        '</div>' +
        '<div class="nt-ft"><button type="button" id="nt-ok">明 白</button></div>' +
      '</div>';

    document.body.appendChild(wrap);
    document.documentElement.classList.add('nt-lock');

    var btn = document.getElementById('nt-ok');
    var chk = document.getElementById('nt-never');

    function close() {
      if (chk.checked) {
        try { localStorage.setItem(KEY, '1'); } catch (e) {}
      }
      wrap.remove();
      document.documentElement.classList.remove('nt-lock');
    }

    btn.addEventListener('click', close);

    // 键盘：回车/空格确认，Esc 等同于「明白」
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      // 焦点锁在弹窗内
      if (e.key === 'Tab') {
        var f = [chk, btn];
        var i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    });

    btn.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
