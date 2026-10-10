/* 灵感表 · 阶段三：深化界面（详情面板编辑 + 构思框架 + 五态流转 + 标签/元信息） */
(function () {
  'use strict';

  /* ---------- 图标库（内联 SVG） ---------- */
  var ICONS = {
    list: '<path d="M9 6h12M9 12h12M9 18h12M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
    star: '<path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9L12 3z"/>',
    bulb: '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 1 3.7 10.7c-.6.5-.9 1.1-.9 1.8v.5H9.2v-.5c0-.7-.3-1.3-.9-1.8A6 6 0 0 1 12 3z"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    checkCircle: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
    archive: '<rect x="3.5" y="4" width="17" height="5" rx="1"/><path d="M5 9v10h14V9"/><path d="M10 13h4"/>',
    inbox: '<path d="M4 13.5L6 5h12l2 8.5V19H4z"/><path d="M4 13.5h4.5l1 2h5l1-2H20"/>',
    pen: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z"/><path d="M14.5 6.5l3 3"/>',
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>',
    moon: '<path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z"/>',
    sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>',
    check: '<path d="M4.5 12.5l5 5 10-11"/>',
    file: '<path d="M6.5 3.5h7l4 4v13h-11z"/><path d="M13.5 3.5v4h4"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    external: '<path d="M14 5h5v5"/><path d="M19 5l-8 8"/><path d="M19 14v5H5V5h5"/>',
    chevDown: '<path d="M6 9l6 6 6-6"/>',
    chevRight: '<path d="M9 6l6 6-6 6"/>',
    trash: '<path d="M4 7h16"/><path d="M9.5 7V4.5h5V7"/><path d="M6.5 7l1 13h9l1-13"/><path d="M10 11v5M14 11v5"/>',
    download: '<path d="M12 4v11"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M5 19h14"/>',
    upload: '<path d="M12 20V9"/><path d="M7.5 13.5L12 9l4.5 4.5"/><path d="M5 4h14"/>'
  };

  function icon(name, size, filled) {
    return '<svg width="' + (size || 18) + '" height="' + (size || 18) +
      '" viewBox="0 0 24 24" fill="' + (filled ? 'currentColor' : 'none') +
      '" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS[name] || '') + '</svg>';
  }

  /* ---------- 定义 ---------- */
  var SMART_VIEWS = [
    { id: 'all', name: '全部', icon: 'list', color: '#0078d4' },
    { id: 'important', name: '重要', icon: 'star', color: '#e8a33d' },
    { id: 'new', name: '新灵感', icon: 'bulb', color: '#3b78e7' },
    { id: 'todo', name: '待推进', icon: 'flag', color: '#d97706' },
    { id: 'doing', name: '进行中', icon: 'clock', color: '#0f9d8f' },
    { id: 'done', name: '已完结', icon: 'checkCircle', color: '#4f9e6c' },
    { id: 'dropped', name: '已废弃', icon: 'archive', color: '#8a8886' }
  ];

  var STATUS = {
    new: { label: '新灵感', color: '#3b78e7' },
    todo: { label: '待推进', color: '#d97706' },
    doing: { label: '进行中', color: '#0f9d8f' },
    done: { label: '已完结', color: '#4f9e6c' },
    dropped: { label: '已废弃', color: '#8a8886' }
  };

  var SORTS = [
    { id: 'createdAt', label: '创建时间' },
    { id: 'updatedAt', label: '更新时间' },
    { id: 'manual', label: '手动' }
  ];

  var el = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  function fmtTs(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return (d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  var state = {
    view: { type: 'smart', id: 'all' },
    theme: 'light',
    openId: null,
    sortBy: 'createdAt',
    batch: null,
    query: ''
  };

  /* ---------- 阶段五：全局搜索 ---------- */
  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function highlight(text, q) {
    var safe = esc(text);
    if (!q) return safe;
    return safe.replace(new RegExp(escapeRegExp(esc(q)), 'gi'), function (m) {
      return '<mark class="hit">' + m + '</mark>';
    });
  }
  /* 命中范围：标题 / 备注 / 构思框架 / 步骤 / 任务书 / 计划任务 / 标签 / 参考链接 / 已完成小结 / 废弃原因 */
  function ideaMatches(idea, q) {
    var hay = [idea.title, idea.note, idea.core, idea.why, idea.risks,
      idea.doneSummary, idea.dropReason, (idea.tags || []).join(' ')];
    var b = idea.brief;
    if (b) hay.push(b.goal, b.scope, b.milestones, b.acceptance);
    (idea.steps || []).forEach(function (s) { hay.push(s.text); });
    if (idea.plan && idea.plan.tasks) {
      idea.plan.tasks.forEach(function (t) {
        hay.push(t.heading);
        (t.items || []).forEach(function (x) { hay.push(x.text); });
      });
    }
    if (idea.research && idea.research.refs) {
      idea.research.refs.forEach(function (r) { hay.push(r.title, r.url); });
    }
    return hay.filter(Boolean).join(' ').toLowerCase().indexOf(q) >= 0;
  }
  /* URL 白名单，防 javascript: 等伪协议注入 */
  function safeUrl(u) {
    var s = String(u || '');
    return /^(https?:\/\/|mailto:)/i.test(s) ? s : '#';
  }

  /* ---------- 数据初始化 ---------- */
  Store.load();
  state.sortBy = Store.settings().sortBy || 'createdAt';

  /* ---------- 主题 ---------- */
  function applyTheme(t, persist) {
    state.theme = t;
    document.documentElement.setAttribute('data-theme', t);
    var btn = el('themeToggle');
    btn.innerHTML = icon(t === 'light' ? 'moon' : 'sun', 18);
    btn.title = t === 'light' ? '切换到暗色主题' : '切换到亮色主题';
    if (persist) Store.setSetting('theme', t);
  }
  (function initTheme() {
    var saved = Store.settings().theme;
    var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (sysDark ? 'dark' : 'light'), false);
  })();
  el('exportBtn').innerHTML = icon('download', 18);
  el('importBtn').innerHTML = icon('upload', 18);
  el('themeToggle').addEventListener('click', function () {
    applyTheme(state.theme === 'light' ? 'dark' : 'light', true);
  });

  /* ---------- 视图数据 ---------- */
  function currentIdeas() {
    var all = Store.ideas();
    var q = state.query.trim().toLowerCase();
    if (q) {
      /* 搜索为全局：忽略当前视图 */
      arr = all.filter(function (i) { return ideaMatches(i, q); });
      if (state.sortBy === 'createdAt') arr.sort(function (a, b) { return b.createdTs - a.createdTs; });
      else if (state.sortBy === 'updatedAt') arr.sort(function (a, b) { return b.updatedTs - a.updatedTs; });
      return arr;
    }
    var arr;
    if (state.view.type === 'group') arr = all.filter(function (i) { return i.groupId === state.view.id; });
    else if (state.view.id === 'all') arr = all.slice();
    else if (state.view.id === 'important') arr = all.filter(function (i) { return i.starred; });
    else arr = all.filter(function (i) { return i.status === state.view.id; });
    if (state.sortBy === 'createdAt') arr.sort(function (a, b) { return b.createdTs - a.createdTs; });
    else if (state.sortBy === 'updatedAt') arr.sort(function (a, b) { return b.updatedTs - a.updatedTs; });
    return arr;
  }
  function countFor(type, id) {
    var all = Store.ideas();
    if (type === 'group') return all.filter(function (i) { return i.groupId === id; }).length;
    if (id === 'all') return all.length;
    if (id === 'important') return all.filter(function (i) { return i.starred; }).length;
    return all.filter(function (i) { return i.status === id; }).length;
  }
  function accentFor(view) {
    if (view.type === 'group') {
      var g = Store.findGroup(view.id);
      return g ? g.color : '#0078d4';
    }
    var v = SMART_VIEWS.filter(function (x) { return x.id === view.id; })[0];
    return v ? v.color : '#0078d4';
  }
  function titleFor(view) {
    if (view.type === 'group') {
      var g = Store.findGroup(view.id);
      return g ? g.name : '';
    }
    var v = SMART_VIEWS.filter(function (x) { return x.id === view.id; })[0];
    return v ? v.name : '';
  }

  /* ---------- 侧边栏 ---------- */
  function renderSidebar() {
    el('smartLists').innerHTML = SMART_VIEWS.map(function (v) {
      var c = countFor('smart', v.id);
      var active = state.view.type === 'smart' && state.view.id === v.id;
      return '<div class="nav-item' + (active ? ' active' : '') + '" data-type="smart" data-id="' + v.id + '">' +
        '<span class="nav-icon" style="color:' + v.color + '">' + icon(v.icon) + '</span>' +
        '<span class="nav-label">' + v.name + '</span>' +
        (c ? '<span class="count">' + c + '</span>' : '') +
        '</div>';
    }).join('');

    el('groupList').innerHTML = Store.groups().map(function (g) {
      var c = countFor('group', g.id);
      var active = state.view.type === 'group' && state.view.id === g.id;
      return '<div class="nav-item' + (active ? ' active' : '') + '" data-type="group" data-id="' + g.id + '">' +
        '<span class="nav-icon" style="color:' + g.color + '">' + icon(g.icon) + '</span>' +
        '<span class="nav-label">' + esc(g.name) + '</span>' +
        (c ? '<span class="count">' + c + '</span>' : '') +
        '</div>';
    }).join('');
  }

  /* 新建分组（内联输入） */
  var NEW_GROUP_HTML = null;
  function startNewGroup() {
    var btn = el('newGroupBtn');
    if (!NEW_GROUP_HTML) NEW_GROUP_HTML = btn.innerHTML;
    btn.innerHTML = '<input id="newGroupInput" type="text" placeholder="分组名称，回车确认" />';
    var inp = el('newGroupInput');
    inp.focus();
    var done = false;
    function finish(name) {
      if (done) return;
      done = true;
      btn.innerHTML = NEW_GROUP_HTML;
      if (name) {
        Store.addGroup(name);
        renderSidebar();
      }
    }
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); finish(inp.value.trim()); }
      else if (e.key === 'Escape') finish('');
    });
    inp.addEventListener('blur', function () { finish(inp.value.trim()); });
  }
  el('newGroupBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    startNewGroup();
  });

  /* 分组重命名（双击侧栏分组名） */
  function startGroupRename(id) {
    var label = document.querySelector('.nav-item[data-id="' + id + '"] .nav-label');
    var g = Store.findGroup(id);
    if (!label || !g) return;
    var input = document.createElement('input');
    input.className = 'inline-input';
    input.value = g.name;
    label.replaceWith(input);
    input.focus();
    input.select();
    var done = false;
    function commit() {
      if (done) return;
      done = true;
      var v = input.value.trim();
      if (v && v !== g.name) Store.renameGroup(id, v);
      renderSidebar();
      renderList();
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      else if (e.key === 'Escape') { done = true; renderSidebar(); }
    });
    input.addEventListener('blur', commit);
  }

  /* ---------- 列表 ---------- */
  function renderSortBar() {
    var s = SORTS.filter(function (x) { return x.id === state.sortBy; })[0] || SORTS[0];
    el('sortBtn').textContent = '排序：' + s.label;
    el('sortHint').textContent = state.sortBy === 'manual' ? '拖拽条目调整顺序' : '';
  }
  el('sortBtn').addEventListener('click', function () {
    var idx = 0;
    for (var k = 0; k < SORTS.length; k++) if (SORTS[k].id === state.sortBy) idx = k;
    var next = SORTS[(idx + 1) % SORTS.length];
    state.sortBy = next.id;
    Store.setSetting('sortBy', next.id);
    renderSortBar();
    renderList();
  });

  /* B3：步骤/计划进度，回写到列表 */
  function ideaProgress(i) {
    var items = null;
    if (i.status === 'doing' && i.plan && i.plan.tasks) {
      items = [];
      i.plan.tasks.forEach(function (t) { (t.items || []).forEach(function (x) { items.push(x); }); });
    } else if (i.steps && i.steps.length) items = i.steps;
    if (!items || !items.length) return null;
    var done = 0;
    items.forEach(function (x) { if (x.done) done++; });
    return { done: done, total: items.length };
  }

  function renderList() {
    var ideas = currentIdeas();
    var q = state.query.trim();
    if (q) {
      el('listTitle').textContent = '搜索「' + q + '」';
      el('listSubtitle').textContent = '匹配 ' + ideas.length + ' 条灵感';
      el('mainArea').style.setProperty('--accent', '#0078d4');
    } else {
      el('mainArea').style.setProperty('--accent', accentFor(state.view));
      el('listTitle').textContent = titleFor(state.view);
      el('listSubtitle').textContent = new Date().toLocaleDateString('zh-CN', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
      });
    }
    var clearBtn = el('searchClear');
    if (clearBtn) clearBtn.hidden = !state.query;
    el('quickAddInput').placeholder = state.view.type === 'group' && !q
      ? '添加灵感到「' + titleFor(state.view) + '」'
      : '添加灵感（Ctrl+N）';

    var manual = state.sortBy === 'manual' && !state.batch;
    var batchMode = !!state.batch;
    el('ideaList').innerHTML = ideas.length ? ideas.map(function (i) {
      var st = STATUS[i.status] || STATUS.new;
      var p = ideaProgress(i);
      var sel = batchMode && !!state.batch.ids[i.id];
      return '<div class="idea-item' + (i.status === 'done' ? ' done' : '') + (i.status === 'dropped' ? ' dropped' : '') + (sel ? ' selected' : '') + '"' +
        (manual ? ' draggable="true"' : '') + ' data-id="' + i.id + '">' +
        (batchMode
          ? '<span class="checkbox' + (sel ? ' batch-on' : '') + '">' + icon('check', 11) + '</span>'
          : '<span class="checkbox" data-action="check">' + icon('check', 11) + '</span>') +
        '<span class="idea-title">' + highlight(i.title, state.query.trim()) + '</span>' +
        (p ? '<span class="list-progress" title="步骤进度">' + p.done + '/' + p.total + '</span>' : '') +
        '<span class="status-dot" title="' + st.label + '" style="background:' + st.color + '"></span>' +
        '<button class="star-btn' + (i.starred ? ' starred' : '') + '" data-action="star" title="标记为重要">' + icon('star', 16, i.starred) + '</button>' +
        '</div>';
    }).join('') : emptyHtml(q);
    renderBatchBar();
  }
  function emptyHtml(q) {
    if (q) {
      return '<div class="empty-state">' + icon('sparkle', 36) +
        '<p>没有命中「' + esc(q) + '」的灵感</p>' +
        '<p class="empty-sub">已搜索标题、备注、构思框架、步骤、任务书与计划任务</p></div>';
    }
    return '<div class="empty-state">' + icon('sparkle', 36) + '<p>这里还没有灵感</p></div>';
  }

  /* ---------- C1：批量流转 ---------- */
  function enterBatch() {
    state.batch = { ids: {} };
    renderBatchBar();
    renderList();
  }
  function exitBatch() {
    state.batch = null;
    renderBatchBar();
    renderList();
  }
  function toggleBatchSel(id) {
    if (!state.batch) return;
    if (state.batch.ids[id]) delete state.batch.ids[id];
    else state.batch.ids[id] = true;
    renderBatchBar();
    renderList();
  }
  function renderBatchBar() {
    var bar = el('batchBar');
    var btn = el('batchToggle');
    if (!state.batch) {
      bar.classList.remove('show');
      bar.innerHTML = '';
      btn.classList.remove('on');
      return;
    }
    btn.classList.add('on');
    var n = 0;
    for (var k in state.batch.ids) if (state.batch.ids.hasOwnProperty(k) && Store.findIdea(k)) n++;
    bar.classList.add('show');
    bar.innerHTML = '<span class="batch-count">已选 ' + n + ' 项</span>' +
      Object.keys(STATUS).map(function (k) {
        return '<button class="batch-status" data-bstatus="' + k + '" style="--c:' + STATUS[k].color + '" title="流转为「' + STATUS[k].label + '」">' + STATUS[k].label + '</button>';
      }).join('') +
      '<button class="batch-done" id="batchExit">完成</button>';
  }
  function applyBatchStatus(k) {
    if (!state.batch) return;
    var ids = [];
    for (var key in state.batch.ids) if (state.batch.ids.hasOwnProperty(key) && Store.findIdea(key)) ids.push(key);
    if (!ids.length) { showToast('请先点选要流转的灵感'); return; }
    ids.forEach(function (id) {
      Store.updateIdea(id, { status: k, doneAt: k === 'done' ? Store.nowStr() : '' });
    });
    exitBatch();
    renderSidebar();
    renderList();
    showToast('已流转 ' + ids.length + ' 条为「' + STATUS[k].label + '」');
  }
  el('batchToggle').addEventListener('click', function () {
    if (state.batch) exitBatch();
    else enterBatch();
  });
  el('batchBar').addEventListener('click', function (e) {
    var bs = e.target.closest('[data-bstatus]');
    if (bs) { applyBatchStatus(bs.getAttribute('data-bstatus')); return; }
    if (e.target.closest('#batchExit')) exitBatch();
  });

  /* 快速添加（A1）：回车或点击加号 */
  function doQuickAdd() {
    var inp = el('quickAddInput');
    var v = inp.value.trim();
    if (!v) { inp.focus(); return; }
    var gid = state.view.type === 'group' ? state.view.id : 'inbox';
    Store.addIdea(v, gid);
    inp.value = '';
    renderSidebar();
    renderList();
    inp.focus();
  }
  el('quickAddInput').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    doQuickAdd();
  });
  el('quickAddBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    doQuickAdd();
  });

  /* 行内重命名（右键菜单触发） */
  function startRename(id) {
    var t = document.querySelector('.idea-item[data-id="' + id + '"] .idea-title');
    var idea = Store.findIdea(id);
    if (!t || !idea) return;
    var input = document.createElement('input');
    input.className = 'inline-input';
    input.value = idea.title;
    t.replaceWith(input);
    input.focus();
    input.select();
    var done = false;
    function commit() {
      if (done) return;
      done = true;
      var v = input.value.trim();
      if (v && v !== idea.title) Store.updateIdea(id, { title: v });
      renderList();
      syncPanel(id);
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      else if (e.key === 'Escape') { done = true; renderList(); }
    });
    input.addEventListener('blur', commit);
  }

  /* ================================================================
     详情面板（阶段三 · 模块 B）
     ================================================================ */

  function section(title, body) {
    return '<section class="section"><h3 class="section-title">' + title + '</h3><div class="section-body">' + body + '</div></section>';
  }
  function kv(label, value) {
    return '<div class="kv"><div class="kv-label">' + label + '</div><div class="kv-value">' +
      (value ? esc(value) : '<span class="placeholder">待补充</span>') + '</div></div>';
  }
  function editableKv(label, field, value, ph) {
    return '<div class="kv"><div class="kv-label">' + label + '</div>' +
      '<textarea class="kv-input" data-field="' + field + '" rows="2" placeholder="' + ph + '">' +
      esc(value) + '</textarea></div>';
  }

  function openIdea() { return state.openId ? Store.findIdea(state.openId) : null; }

  function autoResize(t) {
    t.style.height = 'auto';
    t.style.height = t.scrollHeight + 'px';
  }

  /* ---------- B2：防抖自动保存 ---------- */
  var debMap = {};
  function debounce(key, fn, ms) {
    if (debMap[key]) clearTimeout(debMap[key].t);
    debMap[key] = {
      fn: fn,
      t: setTimeout(function () {
        var rec = debMap[key];
        delete debMap[key];
        if (rec) rec.fn();
      }, ms == null ? 500 : ms)
    };
  }
  function flushDebounce() {
    for (var k in debMap) {
      if (!debMap.hasOwnProperty(k)) continue;
      clearTimeout(debMap[k].t);
      var fn = debMap[k].fn;
      delete debMap[k];
      fn();
    }
  }
  function saveField(id, field, value) {
    var idea = Store.findIdea(id);
    if (!idea) return;
    var p = {};
    var parts = field.split('.');
    if (parts.length === 2) {
      /* 嵌套字段（brief.goal 等，C3 任务书） */
      var obj = idea[parts[0]] ? JSON.parse(JSON.stringify(idea[parts[0]])) : {};
      if ((obj[parts[1]] || '') === value) return;
      obj[parts[1]] = value;
      p[parts[0]] = obj;
    } else {
      if ((idea[field] || '') === value) return;
      p[field] = value;
    }
    Store.updateIdea(id, p);
    renderList();
    renderMetaRow();
  }

  /* ---------- B4：五态流转 ---------- */
  function changeStatus(k) {
    var idea = openIdea();
    if (!idea || idea.status === k) return;
    flushDebounce();
    var patch = { status: k };
    if (k === 'done') patch.doneAt = Store.nowStr();
    else patch.doneAt = '';
    Store.updateIdea(idea.id, patch);
    renderSidebar();
    renderList();
    var fresh = Store.findIdea(idea.id);
    if (fresh) renderPanel(fresh);
  }
  function renderStatusRow() {
    var idea = openIdea();
    if (!idea || !el('statusRow')) return;
    el('statusRow').innerHTML = Object.keys(STATUS).map(function (k) {
      var s = STATUS[k];
      return '<span class="status-chip' + (idea.status === k ? ' on' : '') + '" data-status="' + k + '" style="--c:' + s.color + '" title="流转为「' + s.label + '」">' +
        '<span class="sc-dot" style="background:' + (idea.status === k ? '#fff' : s.color) + '"></span>' + s.label +
        '</span>';
    }).join('');
  }

  /* ---------- B5：标签（编辑 + 建议） ---------- */
  function renderTagRow() {
    var idea = openIdea();
    if (!idea || !el('tagRow')) return;
    var tags = idea.tags || [];
    var cur = {};
    tags.forEach(function (t) { cur[t] = 1; });
    var html = tags.map(function (t, idx) {
      return '<span class="tag-chip editable" data-action="del-tag" data-idx="' + idx + '" title="点击移除">' + esc(t) + ' ×</span>';
    }).join('');
    html += '<span class="tag-add"><input id="tagAdd" placeholder="+ 标签" title="输入标签，回车添加" /></span>';
    var sugg = Store.allTags().filter(function (u) { return !cur[u.tag]; }).slice(0, 4);
    if (sugg.length) {
      html += '<span class="tag-sugg">建议</span>' + sugg.map(function (u) {
        return '<span class="sm-chip" data-action="add-tag" data-tag="' + esc(u.tag) + '" title="已被使用 ' + u.count + ' 次，点击添加">' + esc(u.tag) + '</span>';
      }).join('');
    }
    el('tagRow').innerHTML = html;
  }
  function addTag(tag) {
    var idea = openIdea();
    if (!idea || !tag) return;
    var tags = (idea.tags || []).slice();
    if (tags.indexOf(tag) < 0) tags.push(tag);
    Store.updateIdea(idea.id, { tags: tags });
    renderTagRow();
    var inp = el('tagAdd');
    if (inp) inp.focus();
  }
  function removeTag(idx) {
    var idea = openIdea();
    if (!idea) return;
    var tags = (idea.tags || []).slice();
    tags.splice(idx, 1);
    Store.updateIdea(idea.id, { tags: tags });
    renderTagRow();
    var inp = el('tagAdd');
    if (inp) inp.focus();
  }

  /* ---------- B3：构思框架 · 步骤清单 ---------- */
  function renderStepsBox() {
    var idea = openIdea();
    if (!idea || !el('stepsBox')) return;
    var steps = idea.steps || [];
    var done = steps.filter(function (s) { return s.done; }).length;
    el('stepsCount').textContent = steps.length ? done + '/' + steps.length : '';
    el('stepsBox').innerHTML = steps.map(function (s, idx) {
      return '<div class="step-item' + (s.done ? ' done' : '') + '" draggable="true" data-idx="' + idx + '">' +
        '<span class="drag-handle" title="拖拽排序">⋮⋮</span>' +
        '<span class="checkbox sm" data-action="toggle-step" data-idx="' + idx + '" title="切换完成">' + icon('check', 10) + '</span>' +
        '<span class="step-text" title="双击编辑">' + esc(s.text) + '</span>' +
        '<button class="step-del" data-action="del-step" data-idx="' + idx + '" title="删除步骤">×</button>' +
        '</div>';
    }).join('') + '<input class="step-add" id="stepAdd" placeholder="添加步骤，回车确认" />';
  }
  function updateSteps(fn) {
    var idea = openIdea();
    if (!idea) return;
    var steps = (idea.steps || []).map(function (s) { return { text: s.text, done: s.done }; });
    fn(steps);
    Store.updateIdea(idea.id, { steps: steps });
    renderStepsBox();
    renderList();
  }
  function editStepText(span) {
    var row = span.closest('.step-item');
    var idea = openIdea();
    if (!row || !idea) return;
    var idx = +row.getAttribute('data-idx');
    var step = (idea.steps || [])[idx];
    if (!step) return;
    var input = document.createElement('input');
    input.className = 'inline-input step-edit';
    input.value = step.text;
    span.replaceWith(input);
    input.focus();
    input.select();
    var done = false;
    function commit() {
      if (done) return;
      done = true;
      var v = input.value.trim();
      if (v && v !== step.text) updateSteps(function (steps) { steps[idx].text = v; });
      else renderStepsBox();
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      else if (e.key === 'Escape') { done = true; renderStepsBox(); }
    });
    input.addEventListener('blur', commit);
  }

  /* ---------- 计划任务勾选（进行中） ---------- */
  function updatePlan(fn) {
    var idea = openIdea();
    if (!idea || !idea.plan) return;
    var plan = JSON.parse(JSON.stringify(idea.plan));
    fn(plan);
    Store.updateIdea(idea.id, { plan: plan });
    renderExtra();
    renderList();
  }

  /* ---------- C3：从构思框架生成任务书初稿 ---------- */
  function genBrief() {
    var idea = openIdea();
    if (!idea) return;
    var b = idea.brief ? JSON.parse(JSON.stringify(idea.brief)) : {};
    var steps = idea.steps || [];
    var filled = 0;
    if (!b.goal && (idea.core || idea.title)) { b.goal = idea.core || idea.title; filled++; }
    if (!b.scope && idea.why) { b.scope = '围绕动机推进：' + idea.why; filled++; }
    if (!b.milestones && steps.length) { b.milestones = steps.map(function (s) { return s.text; }).join(' → '); filled++; }
    if (!b.acceptance) {
      b.acceptance = steps.length ? '「怎么做」' + steps.length + ' 个步骤全部完成' : '构思框架四区块填写完整';
      filled++;
    }
    if (!filled) { showToast('任务书四项均已填写，未做改动'); return; }
    Store.updateIdea(idea.id, { brief: b });
    renderExtra();
    showToast('已生成初稿：填充 ' + filled + ' 个空缺项，可继续编辑');
  }

  /* ---------- C4：MD 计划书解析（本地，不上传） ---------- */
  function parseMdPlan(text) {
    var lines = String(text).split(/\r?\n/);
    var sections = [];
    var cur = null;
    var found = 0;
    lines.forEach(function (line) {
      var h = line.match(/^#{1,4}\s+(.+?)\s*#*\s*$/);
      if (h) {
        cur = { heading: h[1], items: [], collapsed: false };
        sections.push(cur);
        return;
      }
      var t = line.match(/^(\s*)(?:[-*+]|\d+\.)\s+\[([ xX])\]\s+(.+?)\s*$/);
      if (t) {
        found++;
        if (!cur) { cur = { heading: '未分组任务', items: [], collapsed: false }; sections.push(cur); }
        var indent = t[1].replace(/\t/g, '  ').length;
        cur.items.push({ text: t[3], done: t[2].toLowerCase() === 'x', level: Math.min(Math.floor(indent / 2), 3) });
      }
    });
    return { tasks: sections, found: found };
  }

  /* ---------- C5：重新导入时合并，保留已勾选与折叠状态 ---------- */
  function mergePlan(parsed, oldPlan) {
    if (!oldPlan || !oldPlan.tasks) return parsed;
    var doneMap = {};
    var collapsedMap = {};
    oldPlan.tasks.forEach(function (sec) {
      collapsedMap[sec.heading] = !!sec.collapsed;
      (sec.items || []).forEach(function (it) {
        doneMap[sec.heading + '\u0001' + it.text] = !!it.done;
      });
    });
    parsed.tasks.forEach(function (sec) {
      sec.collapsed = !!collapsedMap[sec.heading];
      (sec.items || []).forEach(function (it) {
        var k = sec.heading + '\u0001' + it.text;
        if (Object.prototype.hasOwnProperty.call(doneMap, k)) it.done = doneMap[k] || it.done;
      });
    });
    return parsed;
  }

  /* 隐藏的文件选择框 */
  var mdFileInput = (function () {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.md,.markdown,.txt';
    inp.style.display = 'none';
    document.body.appendChild(inp);
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      inp.value = '';
      if (f) importMd(f);
    });
    return inp;
  })();

  function importMd(file) {
    var idea = openIdea();
    if (!idea) return;
    if (!/\.(md|markdown|txt)$/i.test(file.name)) {
      window.alert('仅支持 .md / .markdown / .txt 文件');
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var cur = openIdea();
      if (!cur) return;
      var parsed = parseMdPlan(reader.result);
      if (!parsed.found) {
        window.alert('未在「' + file.name + '」中识别到任务清单。\n需要包含 - [ ] 或 - [x] 格式的任务行。');
        return;
      }
      parsed = mergePlan(parsed, cur.plan);
      parsed.fileName = file.name;
      parsed.importedAt = Store.nowStr();
      Store.updateIdea(cur.id, { plan: parsed });
      renderExtra();
      renderList();
      showToast('已导入「' + file.name + '」：' + parsed.found + ' 个任务，勾选状态已合并');
    };
    reader.onerror = function () {
      window.alert('文件读取失败，请重试');
    };
    reader.readAsText(file, 'UTF-8');
  }

  /* ---------- B6：参考链接 + 状态专属区块 ---------- */
  function setVerdict(v) {
    var idea = openIdea();
    if (!idea) return;
    var r = idea.research || {};
    var verdict = (r.verdict === v) ? '' : v;
    Store.updateIdea(idea.id, { research: { verdict: verdict, refs: (r.refs || []).slice() } });
    renderExtra();
  }
  function addRef(url) {
    var idea = openIdea();
    if (!idea || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    var host = url;
    try { host = new URL(url).hostname; } catch (e) {}
    var r = idea.research || {};
    var refs = (r.refs || []).slice();
    refs.push({ title: host, url: url });
    Store.updateIdea(idea.id, { research: { verdict: r.verdict || '', refs: refs } });
    renderExtra();
    var inp = el('refAdd');
    if (inp) inp.focus();
  }
  function removeRef(idx) {
    var idea = openIdea();
    if (!idea) return;
    var r = idea.research || {};
    var refs = (r.refs || []).slice();
    refs.splice(idx, 1);
    Store.updateIdea(idea.id, { research: { verdict: r.verdict || '', refs: refs } });
    renderExtra();
  }

  function renderExtra() {
    var idea = openIdea();
    if (!idea || !el('extraBox')) return;
    var q = encodeURIComponent(idea.title);
    var html = '';

    if (idea.status === 'new') {
      var r = idea.research || {};
      var refs = (r.refs || []).map(function (ref, idx) {
        return '<div class="ref-row">' +
          '<a class="ref-item" href="' + esc(safeUrl(ref.url)) + '" target="_blank" rel="noopener">' + icon('external', 13) + ' ' + esc(ref.title) + '</a>' +
          '<button class="ref-del" data-action="del-ref" data-idx="' + idx + '" title="移除链接">×</button>' +
          '</div>';
      }).join('');
      var vd = r.verdict || '';
      html = section('联网调研 · 查重',
        '<p class="section-desc">先查一查有没有类似项目，再决定是否推进。</p>' +
        '<div class="search-engines">' +
        '<a class="engine-btn" href="https://www.bing.com/search?q=' + q + '" target="_blank" rel="noopener">必应</a>' +
        '<a class="engine-btn" href="https://www.baidu.com/s?wd=' + q + '" target="_blank" rel="noopener">百度</a>' +
        '<a class="engine-btn" href="https://github.com/search?q=' + q + '" target="_blank" rel="noopener">GitHub</a>' +
        '<a class="engine-btn" href="https://www.zhihu.com/search?q=' + q + '" target="_blank" rel="noopener">知乎</a>' +
        '</div>' +
        '<div class="chips" data-group="verdict">' +
        '<span class="chip' + (vd === 'dup' ? ' on' : '') + '" data-v="dup">重复</span>' +
        '<span class="chip' + (vd === 'similar' ? ' on' : '') + '" data-v="similar">近似</span>' +
        '<span class="chip' + (vd === 'blank' ? ' on' : '') + '" data-v="blank">空白</span>' +
        '</div>' +
        '<div class="ref-list">' + (refs || '<span class="placeholder">暂无参考链接</span>') +
        '<input class="ref-add" id="refAdd" placeholder="粘贴参考链接，回车记录" /></div>');
    }

    else if (idea.status === 'todo') {
      var b = idea.brief || {};
      html = section('任务书',
        '<button class="gen-btn" data-action="gen-brief" title="用构思框架四区块的内容填充空缺项">' + icon('sparkle', 13) + ' 从构思框架生成初稿</button>' +
        editableKv('目标', 'brief.goal', b.goal, '要达成什么？') +
        editableKv('范围', 'brief.scope', b.scope, '做什么、不做什么？') +
        editableKv('里程碑', 'brief.milestones', b.milestones, '关键节点，用 → 分隔') +
        editableKv('验收标准', 'brief.acceptance', b.acceptance, '怎样算完成？'));
    }

    else if (idea.status === 'doing') {
      if (idea.plan && idea.plan.tasks) {
        var all = [];
        idea.plan.tasks.forEach(function (t) { (t.items || []).forEach(function (x) { all.push(x); }); });
        var dn = all.filter(function (x) { return x.done; }).length;
        var pct = all.length ? Math.round(dn / all.length * 100) : 0;
        var tree = idea.plan.tasks.map(function (t, h) {
          var items = t.items || [];
          var secDone = items.filter(function (x) { return x.done; }).length;
          var head = '<div class="plan-heading" data-action="toggle-collapse" data-h="' + h + '" title="折叠 / 展开">' +
            '<span class="chev">' + icon(t.collapsed ? 'chevRight' : 'chevDown', 12) + '</span>' +
            esc(t.heading) +
            '<span class="plan-sec-count">' + secDone + '/' + items.length + '</span></div>';
          var body = t.collapsed ? '' : items.map(function (it, ii) {
            return '<div class="step-item' + (it.done ? ' done' : '') + '" data-action="toggle-plan" data-h="' + h + '" data-i="' + ii + '" style="padding-left:' + ((it.level || 0) * 18) + 'px">' +
              '<span class="checkbox sm">' + icon('check', 10) + '</span>' +
              '<span class="step-text">' + esc(it.text) + '</span></div>';
          }).join('');
          return head + body;
        }).join('');
        html = section('计划进度',
          '<div class="plan-file">' + icon('file', 14) + ' <span>' + esc(idea.plan.fileName) + '</span>' +
          '<span class="plan-date">导入于 ' + esc(idea.plan.importedAt) + '</span></div>' +
          '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="progress-num">' + dn + ' / ' + all.length + ' 已完成 · ' + pct + '%</div>' +
          '<div class="plan-tree">' + tree + '</div>' +
          '<button class="import-btn" data-action="import-md" title="重新导入同一文档时，已勾选状态会自动合并保留">' + icon('file', 16) + ' 重新导入 .md（合并保留勾选）</button>');
      } else {
        html = section('计划进度',
          '<p class="section-desc">导入 .md 项目计划书，本地解析标题与任务清单（不上传文件）。</p>' +
          '<button class="import-btn" data-action="import-md">' + icon('file', 16) + ' 导入 .md 计划书</button>');
      }
    }

    else if (idea.status === 'done') {
      html = section('完结信息',
        kv('完结时间', idea.doneAt) +
        editableKv('成果小结', 'doneSummary', idea.doneSummary, '这次做成了什么？'));
    }

    else if (idea.status === 'dropped') {
      html = section('废弃记录',
        editableKv('废弃原因', 'dropReason', idea.dropReason, '为什么放弃？留个记录，方便日后回头再看'));
    }

    el('extraBox').innerHTML = html;
  }

  /* ---------- B6：元信息 ---------- */
  function renderMetaRow() {
    var idea = openIdea();
    if (!idea || !el('metaRow')) return;
    var group = Store.findGroup(idea.groupId);
    el('metaRow').innerHTML =
      '<span>分组：' + (group ? esc(group.name) : '—') + '</span>' +
      '<span>创建：' + fmtTs(idea.createdTs) + '</span>' +
      '<span>更新：' + fmtTs(idea.updatedTs) + '</span>' +
      (idea.statusChangedTs ? '<span>状态变更：' + fmtTs(idea.statusChangedTs) + '</span>' : '');
  }

  /* ---------- 面板骨架（B1） ---------- */
  function renderPanel(idea) {
    var group = Store.findGroup(idea.groupId);
    el('detailPanel').style.setProperty('--accent', group ? group.color : '#0078d4');

    el('panelContent').innerHTML =
      '<div class="panel-top">' +
      '<button class="icon-btn" id="panelClose" title="返回列表">' + icon('arrowLeft', 18) + '</button>' +
      '<div class="panel-actions">' +
      '<button class="icon-btn star-btn' + (idea.starred ? ' starred' : '') + '" data-action="pstar" title="标记为重要">' + icon('star', 17, idea.starred) + '</button>' +
      '<button class="icon-btn del-btn" id="panelDelete" title="删除灵感">' + icon('trash', 17) + '</button>' +
      '</div>' +
      '</div>' +
      '<textarea class="panel-title" id="pTitle" data-field="title" rows="1" placeholder="灵感标题">' + esc(idea.title) + '</textarea>' +
      '<div class="status-row" id="statusRow"></div>' +
      '<div class="panel-badges" id="tagRow"></div>' +
      '<textarea class="panel-note" data-field="note" rows="3" placeholder="添加备注">' + esc(idea.note) + '</textarea>' +
      section('构思框架',
        editableKv('核心想法', 'core', idea.core, '一句话说清这个灵感') +
        editableKv('为什么值得做', 'why', idea.why, '动机 / 价值 / 谁会受益') +
        '<div class="kv"><div class="kv-label">怎么做 <span class="steps-count" id="stepsCount"></span></div><div id="stepsBox"></div></div>' +
        editableKv('风险与疑问', 'risks', idea.risks, '有什么担心的地方？')) +
      '<div id="extraBox"></div>' +
      '<div class="meta-row" id="metaRow"></div>';

    renderStatusRow();
    renderTagRow();
    renderStepsBox();
    renderExtra();
    renderMetaRow();
    autoResize(el('pTitle'));
  }

  function openDetail(id) {
    flushDebounce();
    var idea = Store.findIdea(id);
    if (!idea) return;
    state.openId = id;
    renderPanel(idea);
    el('detailPanel').classList.add('open');
    el('panelBackdrop').classList.add('show');
  }
  function closeDetail() {
    flushDebounce();
    state.openId = null;
    el('detailPanel').classList.remove('open');
    el('panelBackdrop').classList.remove('show');
  }
  /* B1：列表侧改动时同步刷新面板 */
  function syncPanel(id) {
    if (state.openId !== id) return;
    flushDebounce();
    var idea = Store.findIdea(id);
    if (idea) renderPanel(idea);
    else closeDetail();
  }

  /* ---------- 面板事件（委托到 panelContent） ---------- */
  var pc = el('panelContent');

  /* B2：输入 → 防抖保存 */
  pc.addEventListener('input', function (e) {
    var t = e.target;
    var field = t.getAttribute && t.getAttribute('data-field');
    if (!field || !state.openId) return;
    if (t.classList.contains('panel-title') || t.classList.contains('kv-input')) autoResize(t);
    var id = state.openId;
    var v = t.value;
    debounce('field-' + field + '-' + id, function () {
      var val = v;
      if (field === 'title') val = v.trim();
      if (field === 'title' && !val) return;
      saveField(id, field, val);
    });
  });

  /* B2：失焦 → 立即保存 */
  pc.addEventListener('focusout', function (e) {
    var t = e.target;
    var field = t.getAttribute && t.getAttribute('data-field');
    if (!field || !state.openId) return;
    var idea = openIdea();
    if (!idea) return;
    var val = field === 'title' ? t.value.trim() : t.value;
    if (field === 'title' && !val) { t.value = idea.title; return; }
    saveField(idea.id, field, val);
  });

  /* 回车行为：标题失焦 / 步骤、标签、链接快速添加 */
  pc.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var t = e.target;
    if (t.id === 'pTitle' || t.classList.contains('panel-title')) {
      e.preventDefault();
      t.blur();
    } else if (t.id === 'stepAdd') {
      e.preventDefault();
      var v = t.value.trim();
      if (v) updateSteps(function (steps) { steps.push({ text: v, done: false }); });
      var sa = el('stepAdd');
      if (sa) sa.focus();
    } else if (t.id === 'tagAdd') {
      e.preventDefault();
      addTag(t.value.trim());
    } else if (t.id === 'refAdd') {
      e.preventDefault();
      addRef(t.value.trim());
    }
  });

  /* 点击：状态流转 / 步骤 / 标签 / 链接 / 查重结论 / 计划勾选 */
  pc.addEventListener('click', function (e) {
    if (!state.openId) return;

    var vc = e.target.closest('.chip[data-v]');
    if (vc && vc.parentElement && vc.parentElement.getAttribute('data-group') === 'verdict') {
      setVerdict(vc.getAttribute('data-v'));
      return;
    }

    var sc = e.target.closest('.status-chip');
    if (sc) {
      changeStatus(sc.getAttribute('data-status'));
      return;
    }

    var tg = e.target.closest('[data-action]');
    if (!tg) return;
    var act = tg.getAttribute('data-action');
    var idx = tg.getAttribute('data-idx');

    if (act === 'toggle-step') {
      updateSteps(function (steps) { steps[+idx].done = !steps[+idx].done; });
    } else if (act === 'del-step') {
      updateSteps(function (steps) { steps.splice(+idx, 1); });
    } else if (act === 'del-tag') {
      removeTag(+idx);
    } else if (act === 'add-tag') {
      addTag(tg.getAttribute('data-tag'));
    } else if (act === 'del-ref') {
      removeRef(+idx);
    } else if (act === 'toggle-plan') {
      var h = +tg.getAttribute('data-h');
      var ii = +tg.getAttribute('data-i');
      updatePlan(function (plan) {
        var items = plan.tasks[h] && plan.tasks[h].items;
        if (items && items[ii]) items[ii].done = !items[ii].done;
      });
    } else if (act === 'toggle-collapse') {
      var hc = +tg.getAttribute('data-h');
      updatePlan(function (plan) {
        if (plan.tasks[hc]) plan.tasks[hc].collapsed = !plan.tasks[hc].collapsed;
      });
    } else if (act === 'gen-brief') {
      genBrief();
    } else if (act === 'import-md') {
      mdFileInput.click();
    }
  });

  /* 双击步骤文本 → 行内编辑 */
  pc.addEventListener('dblclick', function (e) {
    var st = e.target.closest('.step-text');
    if (st && st.closest('.step-item[data-idx]')) editStepText(st);
  });

  /* 步骤拖拽排序（B3） */
  var stepDragIdx = -1;
  function clearStepMarks() {
    var els = pc.querySelectorAll('.step-item.drop-before');
    for (var i = 0; i < els.length; i++) els[i].classList.remove('drop-before');
  }
  pc.addEventListener('dragstart', function (e) {
    var it = e.target.closest('.step-item[data-idx]');
    if (!it) return;
    stepDragIdx = +it.getAttribute('data-idx');
    it.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', ''); } catch (err) {}
  });
  pc.addEventListener('dragend', function () {
    stepDragIdx = -1;
    clearStepMarks();
    var d = pc.querySelector('.step-item.dragging');
    if (d) d.classList.remove('dragging');
  });
  pc.addEventListener('dragover', function (e) {
    if (stepDragIdx < 0) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    clearStepMarks();
    var it = e.target.closest('.step-item[data-idx]');
    if (it && +it.getAttribute('data-idx') !== stepDragIdx) it.classList.add('drop-before');
  });
  pc.addEventListener('drop', function (e) {
    if (stepDragIdx < 0) return;
    e.preventDefault();
    var it = e.target.closest('.step-item[data-idx]');
    var before = it ? +it.getAttribute('data-idx') : -1;
    var from = stepDragIdx;
    stepDragIdx = -1;
    if (before === from) { renderStepsBox(); return; }
    updateSteps(function (steps) {
      var item = steps.splice(from, 1)[0];
      if (before < 0) steps.push(item);
      else steps.splice(before, 0, item);
    });
  });

  /* ---------- 阶段五：搜索交互 ---------- */
  el('searchInput').addEventListener('input', function () {
    var v = this.value;
    debounce('search', function () {
      state.query = v;
      renderList();
    }, 200);
  });
  el('searchInput').addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      clearSearch();
    }
  });
  function clearSearch() {
    state.query = '';
    el('searchInput').value = '';
    renderList();
  }
  el('searchClear').addEventListener('click', function () { clearSearch(); });

  /* ---------- 阶段五：JSON 备份导出 / 导入 ---------- */
  function fileStamp() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }
  function exportBackup() {
    var payload = Store.snapshot();
    payload.exportedAt = new Date().toISOString();
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '灵感表备份-' + fileStamp() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    showToast('已导出备份文件');
  }

  var backupInput = (function () {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json,application/json';
    inp.style.display = 'none';
    document.body.appendChild(inp);
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      inp.value = '';
      if (f) importBackup(f);
    });
    return inp;
  })();

  function importBackup(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var obj = null;
      try { obj = JSON.parse(String(reader.result)); }
      catch (e) { window.alert('备份文件解析失败，请确认是本应用导出的 JSON'); return; }
      if (!obj || !Array.isArray(obj.ideas) || !Array.isArray(obj.groups)) {
        window.alert('备份文件格式不正确：缺少 groups / ideas 字段');
        return;
      }
      var overwrite = window.confirm(
        '检测到备份：' + obj.groups.length + ' 个分组 / ' + obj.ideas.length + ' 条灵感\n\n' +
        '确定 = 覆盖现有全部数据\n取消 = 合并导入（保留现有数据，按更新时间取新）');
      var res;
      if (overwrite) {
        res = Store.replaceAll(obj);
        if (!res) { window.alert('覆盖导入失败'); return; }
        showToast('已覆盖导入：' + res.ideas + ' 条灵感 / ' + res.groups + ' 个分组');
      } else {
        res = Store.mergeImport(obj);
        if (!res) { window.alert('合并导入失败'); return; }
        showToast('已合并导入：新增 ' + res.ideasAdded + ' 条、更新 ' + res.ideasUpdated + ' 条、新增分组 ' + res.groupsAdded + ' 个');
      }
      closeDetail();
      state.batch = null;
      state.query = '';
      el('searchInput').value = '';
      state.sortBy = Store.settings().sortBy || 'createdAt';
      var savedTheme = Store.settings().theme;
      if (savedTheme) applyTheme(savedTheme, false);
      renderSidebar();
      renderSortBar();
      renderList();
    };
    reader.onerror = function () { window.alert('文件读取失败，请重试'); };
    reader.readAsText(file, 'UTF-8');
  }
  el('exportBtn').addEventListener('click', exportBackup);
  el('importBtn').addEventListener('click', function () { backupInput.click(); });

  /* ---------- 阶段五：窄屏抽屉 ---------- */
  function isNarrow() {
    return window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  }
  function openNav() {
    el('sidebar').classList.add('open');
    el('navBackdrop').classList.add('show');
  }
  function closeNav() {
    el('sidebar').classList.remove('open');
    el('navBackdrop').classList.remove('show');
  }
  el('menuBtn').addEventListener('click', function () {
    if (el('sidebar').classList.contains('open')) closeNav();
    else openNav();
  });
  el('navBackdrop').addEventListener('click', closeNav);

  /* ---------- 删除 + 撤销 ---------- */
  var toastTimer = null;
  function showUndoToast(text, onUndo) {
    var t = el('undoToast');
    t.innerHTML = esc(text) + '<button id="undoBtn">撤销</button>';
    t.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    el('undoBtn').onclick = function () {
      t.classList.remove('show');
      if (toastTimer) clearTimeout(toastTimer);
      onUndo();
    };
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 5000);
  }
  /* 轻提示（无撤销按钮） */
  function showToast(text) {
    var t = el('undoToast');
    t.innerHTML = esc(text);
    t.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  function deleteWithUndo(id) {
    if (state.openId === id) closeDetail();
    var rec = Store.removeIdea(id);
    if (!rec) return;
    renderSidebar();
    renderList();
    showUndoToast('已删除「' + rec.idea.title + '」', function () {
      Store.restoreIdea(rec);
      renderSidebar();
      renderList();
    });
  }

  /* ---------- 右键菜单 ---------- */
  var ctxMenu = null;
  function closeCtx() {
    if (ctxMenu) {
      if (ctxMenu.parentNode) ctxMenu.parentNode.removeChild(ctxMenu);
      ctxMenu = null;
    }
  }
  function showCtx(x, y, items) {
    closeCtx();
    var m = document.createElement('div');
    m.className = 'ctx-menu';
    var html = '';
    items.forEach(function (it, i) {
      if (it.header) html += '<div class="ctx-header">' + esc(it.header) + '</div>';
      else if (it.divider) html += '<div class="ctx-divider"></div>';
      else html += '<div class="ctx-item' + (it.danger ? ' danger' : '') + (it.disabled ? ' disabled' : '') +
        '" data-i="' + i + '">' + esc(it.label) + '</div>';
    });
    m.innerHTML = html;
    document.body.appendChild(m);
    var r = m.getBoundingClientRect();
    m.style.left = Math.max(4, Math.min(x, window.innerWidth - r.width - 8)) + 'px';
    m.style.top = Math.max(4, Math.min(y, window.innerHeight - r.height - 8)) + 'px';
    m.addEventListener('click', function (e) {
      var t = e.target.closest('.ctx-item');
      if (!t) return;
      var it = items[+t.getAttribute('data-i')];
      if (!it || it.disabled) return;
      closeCtx();
      it.action();
    });
    ctxMenu = m;
  }

  function ideaCtx(x, y, id) {
    var idea = Store.findIdea(id);
    if (!idea) return;
    var items = [
      { label: '重命名', action: function () { startRename(id); } },
      { header: '流转状态' }
    ];
    Object.keys(STATUS).forEach(function (k) {
      if (k === idea.status) return;
      items.push({
        label: '→ ' + STATUS[k].label,
        action: function () {
          var patch = { status: k, doneAt: k === 'done' ? Store.nowStr() : '' };
          Store.updateIdea(id, patch);
          renderSidebar();
          renderList();
          syncPanel(id);
        }
      });
    });
    items.push({ header: '移动到分组' });
    Store.groups().forEach(function (g) {
      if (g.id !== idea.groupId) {
        items.push({
          label: g.name,
          action: function () {
            Store.moveIdea(id, g.id);
            renderSidebar();
            renderList();
            syncPanel(id);
          }
        });
      }
    });
    items.push({ divider: true });
    items.push({ label: '删除', danger: true, action: function () { deleteWithUndo(id); } });
    showCtx(x, y, items);
  }

  function groupCtx(x, y, id) {
    var g = Store.findGroup(id);
    if (!g) return;
    var items = [{ label: '重命名分组', action: function () { startGroupRename(id); } }];
    if (id === 'inbox') {
      items.push({ label: '收集箱不可删除', disabled: true });
    } else {
      items.push({
        label: '删除分组（灵感移入收集箱）',
        danger: true,
        action: function () {
          Store.deleteGroup(id);
          if (state.view.type === 'group' && state.view.id === id) state.view = { type: 'smart', id: 'all' };
          renderSidebar();
          renderList();
          if (state.openId) syncPanel(state.openId);
        }
      });
    }
    showCtx(x, y, items);
  }

  document.addEventListener('contextmenu', function (e) {
    var item = e.target.closest('.idea-item');
    if (item) {
      e.preventDefault();
      ideaCtx(e.clientX, e.clientY, item.getAttribute('data-id'));
      return;
    }
    var nav = e.target.closest('.nav-item');
    if (nav && nav.getAttribute('data-type') === 'group') {
      e.preventDefault();
      groupCtx(e.clientX, e.clientY, nav.getAttribute('data-id'));
    }
  });

  /* ---------- 列表拖拽排序（手动模式） ---------- */
  var dragId = null;
  function clearDropMarks() {
    var els = el('ideaList').querySelectorAll('.drop-before');
    for (var i = 0; i < els.length; i++) els[i].classList.remove('drop-before');
  }
  (function initDnD() {
    var list = el('ideaList');
    list.addEventListener('dragstart', function (e) {
      if (state.sortBy !== 'manual' || state.batch) { e.preventDefault(); return; }
      var it = e.target.closest('.idea-item');
      if (!it) return;
      dragId = it.getAttribute('data-id');
      it.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', dragId); } catch (err) {}
    });
    list.addEventListener('dragend', function () {
      dragId = null;
      clearDropMarks();
      var d = list.querySelector('.dragging');
      if (d) d.classList.remove('dragging');
    });
    list.addEventListener('dragover', function (e) {
      if (!dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      clearDropMarks();
      var it = e.target.closest('.idea-item');
      if (it && it.getAttribute('data-id') !== dragId) it.classList.add('drop-before');
    });
    list.addEventListener('drop', function (e) {
      if (!dragId) return;
      e.preventDefault();
      var it = e.target.closest('.idea-item');
      Store.reorder(dragId, it ? it.getAttribute('data-id') : null);
      dragId = null;
      renderList();
    });
  })();

  /* ---------- 全局事件 ---------- */
  document.addEventListener('click', function (e) {
    if (ctxMenu && !e.target.closest('.ctx-menu')) closeCtx();
    if (e.target.closest('.inline-input')) return;

    if (e.target.closest('#panelClose')) { closeDetail(); return; }

    var pstar = e.target.closest('[data-action="pstar"]');
    if (pstar) {
      var on = pstar.classList.toggle('starred');
      pstar.innerHTML = icon('star', 17, on);
      if (state.openId) {
        Store.updateIdea(state.openId, { starred: on });
        renderSidebar();
        renderList();
      }
      return;
    }

    var delBtn = e.target.closest('#panelDelete');
    if (delBtn) {
      if (!delBtn.classList.contains('confirm')) {
        delBtn.classList.add('confirm');
        delBtn.innerHTML = icon('check', 16);
        delBtn.title = '再次点击确认删除';
        setTimeout(function () {
          delBtn.classList.remove('confirm');
          delBtn.innerHTML = icon('trash', 17);
          delBtn.title = '删除灵感';
        }, 3000);
      } else {
        var delId = state.openId;
        deleteWithUndo(delId);
      }
      return;
    }

    var nav = e.target.closest('.nav-item');
    if (nav) {
      state.view = { type: nav.getAttribute('data-type'), id: nav.getAttribute('data-id') };
      if (state.query) { state.query = ''; el('searchInput').value = ''; }
      if (isNarrow()) closeNav();
      renderSidebar();
      renderList();
      return;
    }

    var item = e.target.closest('.idea-item');
    if (item) {
      var id = item.getAttribute('data-id');

      if (state.batch) {
        toggleBatchSel(id);
        return;
      }

      if (e.target.closest('[data-action="check"]')) {
        var idea = Store.findIdea(id);
        if (idea) {
          var nowDone = idea.status !== 'done';
          var patch = { status: nowDone ? 'done' : 'new' };
          if (nowDone) patch.doneAt = Store.nowStr();
          else patch.doneAt = '';
          Store.updateIdea(id, patch);
        }
        renderSidebar();
        renderList();
        syncPanel(id);
        return;
      }

      var star = e.target.closest('[data-action="star"]');
      if (star) {
        var sidea = Store.findIdea(id);
        if (sidea) Store.updateIdea(id, { starred: !sidea.starred });
        renderSidebar();
        renderList();
        syncPanel(id);
        return;
      }

      openDetail(id);
    }
  });

  document.addEventListener('dblclick', function (e) {
    var nav = e.target.closest('.nav-item');
    if (nav && nav.getAttribute('data-type') === 'group') {
      startGroupRename(nav.getAttribute('data-id'));
    }
  });

  el('panelBackdrop').addEventListener('click', closeDetail);
  /* ---------- 阶段五：键盘快捷键 ----------
     / 聚焦搜索 · Ctrl+N 新建灵感 · Ctrl+K 搜索 · Ctrl+E 导出备份 · Esc 关闭/清空 */
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    var typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
    var mod = e.ctrlKey || e.metaKey;

    if (mod && (e.key === 'n' || e.key === 'N')) {
      e.preventDefault();
      el('quickAddInput').focus();
      return;
    }
    if (mod && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      el('searchInput').focus();
      el('searchInput').select();
      return;
    }
    if (mod && (e.key === 'e' || e.key === 'E')) {
      e.preventDefault();
      exportBackup();
      return;
    }
    if (e.key === '/' && !typing) {
      e.preventDefault();
      el('searchInput').focus();
      return;
    }
    if (e.key === 'Escape') {
      if (t === el('searchInput') && state.query) {
        clearSearch();
        return;
      }
      closeCtx();
      closeDetail();
      if (state.batch) exitBatch();
      if (isNarrow()) closeNav();
    }
  });

  /* ---------- 启动 ---------- */
  renderSidebar();
  renderSortBar();
  renderList();
  el('quickAddInput').focus();
})();
