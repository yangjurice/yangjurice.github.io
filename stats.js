// 익명 방문 통계 (쿠키·개인정보 없음). 탭을 닫으면 사라지는 임시 번호로만 한 번의 방문을 묶습니다.
(function () {
  var URL_ = 'https://gedciexihkuslkfizxem.supabase.co/rest/v1/page_events';
  var KEY = 'sb_publishable_U8N5wL8xredROMn_XyS78w_e72PPFO1';
  var page = document.documentElement.getAttribute('data-page') || 'home';

  function store(k, v) {
    try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; }
  }
  var sid = store('yj_sid');
  if (!sid) {
    sid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
    store('yj_sid', sid);
  }
  var src = '';
  try { src = (new URLSearchParams(location.search).get('src') || '').slice(0, 30); } catch (e) {}
  if (src) store('yj_src', src); else src = store('yj_src') || 'direct';
  var w = Math.min(window.screen ? screen.width : 1024, window.innerWidth || 1024);
  var device = w < 600 ? 'mobile' : (w < 1024 ? 'tablet' : 'desktop');

  function row(event, value) {
    return { session_id: sid, page: page, event: event, src: src, device: device,
      value: value == null ? null : Math.max(0, Math.min(86400, Math.round(value))) };
  }
  function post(body) {
    try {
      fetch(URL_, {
        method: 'POST', keepalive: true,
        headers: { 'apikey': KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify(body)
      }).catch(function () {});
    } catch (e) {}
  }
  function send(event, value) { post(row(event, value)); }
  window.yjStat = send;

  send('view');

  // 머문 시간(화면이 보이는 동안만, 초) + 어디까지 내려 봤는지(%)
  var visibleSince = document.visibilityState === 'visible' ? Date.now() : 0;
  var spent = 0, maxScroll = 0, sentLeave = false;
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.round((window.scrollY / h) * 100) : 100;
    if (p > maxScroll) maxScroll = Math.min(100, p);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function leave() {
    if (visibleSince) { spent += Date.now() - visibleSince; visibleSince = 0; }
    if (sentLeave) return;
    sentLeave = true;
    post([row('leave', spent / 1000), row('scroll', maxScroll)]);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') leave();
    else if (!sentLeave) visibleSince = Date.now();
  });
  window.addEventListener('pagehide', leave);

  // 버튼 클릭
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (h.indexOf('tel:') === 0) send('click_tel');
    else if (h.indexOf('sms:') === 0) send('click_sms');
    else if (h.indexOf('apply.html') === 0) send('click_apply');
    else if (h.indexOf('map.naver.com') !== -1) send('click_map');
  }, true);

  // 신청서 작성 시작
  var form = document.getElementById('inq');
  if (form) {
    var started = false;
    form.addEventListener('focusin', function () {
      if (!started) { started = true; send('form_start'); }
    });
  }
})();
