/* 익명 방문 통계: 쿠키·개인정보 없이 페이지 보기, 머문 시간, 버튼 클릭만 기록합니다. */
(function () {
  var URL_ = 'https://gedciexihkuslkfizxem.supabase.co/rest/v1/page_events';
  var KEY = 'sb_publishable_U8N5wL8xredROMn_XyS78w_e72PPFO1';
  var page = (document.currentScript && document.currentScript.getAttribute('data-page')) || 'home';

  function rid() {
    var s = '';
    try { var a = new Uint8Array(12); crypto.getRandomValues(a); for (var i = 0; i < a.length; i++) s += ('0' + a[i].toString(16)).slice(-2); }
    catch (e) { s = (Date.now().toString(36) + Math.random().toString(36).slice(2)).slice(0, 24); }
    return s;
  }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  // 같은 탭 안에서만 이어지는 임시 번호 (탭을 닫으면 사라짐)
  var sid = store('yg_sid');
  if (!sid) { sid = rid(); store('yg_sid', sid); }

  // 유입 경로: 주소의 ?src= 값을 탭 안에서 유지
  var src = null;
  try { src = new URLSearchParams(location.search).get('src'); } catch (e) {}
  if (src) { src = src.slice(0, 30); store('yg_src', src); } else { src = store('yg_src'); }

  var device = (Math.min(screen.width || 9999, window.innerWidth || 9999) < 768) ? 'mobile' : 'desktop';

  function send(event, value, keepalive) {
    try {
      fetch(URL_, {
        method: 'POST', keepalive: !!keepalive,
        headers: { 'apikey': KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ session_id: sid, page: page, event: event, src: src || null, value: value == null ? null : value, device: device })
      }).catch(function () {});
    } catch (e) {}
  }
  window.ygTrack = send;

  send('view');

  // 머문 시간: 화면을 보고 있는 동안만 셈. 10초·30초·1분·2분·5분·10분에 한 번씩 기록 (가장 큰 값이 그 방문의 체류 시간)
  var seen = 0, last = Date.now(), visible = !document.hidden;
  var marks = [10, 30, 60, 120, 300, 600], mi = 0;
  function tick() {
    var now = Date.now();
    if (visible) seen += (now - last) / 1000;
    last = now;
    while (mi < marks.length && seen >= marks[mi]) { send('leave', marks[mi]); mi++; }
  }
  setInterval(tick, 2000);
  document.addEventListener('visibilitychange', function () {
    tick(); visible = !document.hidden;
    if (document.hidden && seen >= 3) send('leave', Math.min(Math.round(seen), 86400), true);
  });

  // 버튼 클릭
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (h.indexOf('tel:') === 0) send('click_tel', null, true);
    else if (h.indexOf('sms:') === 0) send('click_sms', null, true);
    else if (h.indexOf('apply.html') === 0) send('click_apply', null, true);
    else if (h.indexOf('map.naver.com') > -1) send('click_map', null, true);
  }, true);
})();
