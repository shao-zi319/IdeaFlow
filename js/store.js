/* 灵感表 · 数据层：Store（localStorage 持久化 + 首次种子数据 + CRUD） */
var Store = (function () {
  'use strict';

  var KEY = 'idea-board-store-v1';
  var HOUR = 3600000;
  var PALETTE = ['#0f7b6c', '#2564cf', '#8661c5', '#c74277', '#d97706', '#0f9d8f', '#b0548f', '#5c2e91'];
  var GROUP_ICONS = ['bulb', 'pen', 'home', 'flag', 'archive', 'inbox'];

  var data = null;
  var saveWarned = false;

  function uid(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }
  function nowStr() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return (d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* ---------- 首次使用种子数据 ---------- */
  var SEED_GROUPS = [
    { id: 'inbox', name: '收集箱', color: '#0f7b6c', icon: 'inbox' },
    { id: 'g-product', name: '产品点子', color: '#2564cf', icon: 'bulb' },
    { id: 'g-writing', name: '写作素材', color: '#8661c5', icon: 'pen' },
    { id: 'g-life', name: '生活妙想', color: '#c74277', icon: 'home' }
  ];

  var SEED_IDEAS = [
    {
      id: 'i1', groupId: 'g-product', status: 'new', starred: true, seedAgo: 9,
      title: '给灵感表加一个周报生成器',
      note: '每周日晚上自动汇总，把一周的灵感动态浓缩成一页回顾。',
      core: '把每周新增、推进、完结的灵感自动浓缩成一页可分享的周报。',
      why: '回顾成本极低，还能顺手分享出去收集反馈。',
      steps: [
        { text: '确定周报结构：新增 / 推进 / 完结 / 搁置', done: true },
        { text: '写汇总模板与文案', done: false },
        { text: '支持导出为图片', done: false }
      ],
      risks: '信息太干没人看，需要加一点亮点提炼。',
      tags: ['自动生成', '回顾'],
      research: {
        verdict: '',
        refs: [{ title: 'Todoist Weekly Review 官方指南', url: 'https://todoist.com/productivity-methods/weekly-review' }]
      }
    },
    {
      id: 'i2', groupId: 'g-writing', status: 'new', starred: false, seedAgo: 26,
      title: '写一篇「通勤路上的十分钟」',
      note: '',
      core: '记录通勤碎片时间里观察到的人与事。',
      why: '题材真实、人人有共鸣，容易写。',
      steps: [
        { text: '通勤时记 10 条素材', done: false },
        { text: '挑 3 条展开成段落', done: false }
      ],
      risks: '容易写成流水账。',
      tags: ['随笔'],
      research: { verdict: '', refs: [] }
    },
    {
      id: 'i3', groupId: 'g-life', status: 'new', starred: false, seedAgo: 34,
      title: '阳台小番茄自浇灌方案',
      note: '出差三天没人浇水是最大痛点。',
      core: '用医用输液管 + 矿泉水瓶做一个滴灌装置。',
      why: '成本 10 块钱以内，解决出门几天植物没人管。',
      steps: [
        { text: '买输液管和止水夹', done: false },
        { text: '测试滴速', done: false }
      ],
      risks: '滴速不好控制，可能淹死或旱死。',
      tags: [],
      research: { verdict: '', refs: [] }
    },
    {
      id: 'i4', groupId: 'g-product', status: 'todo', starred: true, seedAgo: 160,
      title: '做一个 DNS 一键切换小工具',
      note: '改 hosts 太麻烦了。',
      core: '菜单栏小图标，点一下在几组 DNS 预设间切换。',
      why: '自己每周都要用，顺手做给更多人。',
      steps: [
        { text: '调研系统 API', done: true },
        { text: '画菜单交互原型', done: false }
      ],
      risks: '不同系统权限处理麻烦。',
      tags: ['工具'],
      brief: {
        goal: '三步以内完成 DNS 切换',
        scope: '桌面端，仅 IPv4 公共 DNS 预设',
        milestones: '原型 → 可用版 → 打包发布',
        acceptance: '切换生效无需重启浏览器'
      }
    },
    {
      id: 'i5', groupId: 'g-writing', status: 'todo', starred: false, seedAgo: 200,
      title: '「100 个没用但有趣的冷知识」选题库',
      note: '',
      core: '攒够 100 条冷知识，做成系列内容。',
      why: '素材型内容可持续产出，不容易断更。',
      steps: [
        { text: '先攒 20 条验证可行性', done: true },
        { text: '确定呈现形式（图文 / 短视频）', done: false }
      ],
      risks: '版权与事实核查成本。',
      tags: ['系列'],
      brief: {
        goal: '完成 100 条冷知识的采集与核实',
        scope: '只做中文互联网可核实的条目',
        milestones: '20 条试点 → 50 条过半 → 100 条成库',
        acceptance: '每条都有可靠来源链接'
      }
    },
    {
      id: 'i6', groupId: 'inbox', status: 'todo', starred: false, seedAgo: 141,
      title: '研究本地优先软件的数据同步方案',
      note: '灵感表以后要做多端同步，先调研。',
      core: '搞清 CRDT 与 last-write-wins 的适用边界。',
      why: '为灵感表 v2 的云同步选型。',
      steps: [{ text: '读 CRDT 入门材料', done: false }],
      risks: '纯理论看得头疼。',
      tags: ['调研'],
      brief: {
        goal: '产出一份选型结论笔记',
        scope: '仅关注离线优先场景',
        milestones: '概念 → 方案对比 → 结论',
        acceptance: '能回答「灵感表该用哪种」'
      }
    },
    {
      id: 'i7', groupId: 'g-product', status: 'doing', starred: true, seedAgo: 0.5,
      title: '灵感表（本项目）',
      note: '仿微软 To Do 的灵感管理应用，正在按计划书推进。',
      core: '先捕捉、后深化、再推进的三级灵感管理工具。',
      why: '自己的痛点：灵感记完就丢，没有地方管到落地。',
      steps: [
        { text: '完成计划书', done: true },
        { text: '阶段一：静态骨架', done: true }
      ],
      risks: '范围蔓延，功能越加越多。',
      tags: ['进行中'],
      plan: {
        fileName: '灵感表项目计划书.md',
        importedAt: '10-10 09:00',
        tasks: [
          {
            heading: '阶段一 · 奠基（D1–D3）',
            items: [
              { text: '项目初始化与目录结构', done: true },
              { text: 'CSS 变量主题系统', done: true },
              { text: '侧栏 / 列表 / 详情静态布局', done: true }
            ]
          },
          {
            heading: '阶段二 · 速记核心（D4–D7）',
            items: [
              { text: '数据层与 localStorage', done: true },
              { text: '快速添加与列表操作', done: true },
              { text: '智能视图与分组管理', done: true },
              { text: '删除撤销与排序', done: true }
            ]
          },
          {
            heading: '阶段三 · 深化界面（D8–D11）',
            items: [
              { text: '详情面板编辑与自动保存', done: true },
              { text: '构思框架与步骤清单', done: true },
              { text: '五态流转与标签元信息', done: true }
            ]
          },
          {
            heading: '阶段四 · 项目管线（D12–D16）',
            items: [
              { text: '联网调研助手与查重结论', done: true },
              { text: '任务书编辑与一键生成初稿', done: true },
              { text: 'MD 计划导入与任务树', done: true },
              { text: '进度跟踪与批量流转', done: true }
            ]
          },
          {
            heading: '阶段五 · 打磨发布（D17–D20）',
            items: [
              { text: '全局搜索与命中高亮', done: true },
              { text: 'JSON 备份导出 / 导入', done: true },
              { text: '暗色调优、响应式与快捷键', done: true },
              { text: '全流程回归与发布 v1.0', done: false }
            ]
          }
        ]
      }
    },
    {
      id: 'i8', groupId: 'g-life', status: 'doing', starred: false, seedAgo: 480,
      title: '整理全屋数据线并贴标签',
      note: '',
      core: '所有线材分类收纳，标签注明用途。',
      why: '每次找线都翻箱倒柜十分钟。',
      steps: [],
      risks: '',
      tags: ['收纳'],
      plan: {
        fileName: '数据线整理计划.md',
        importedAt: '10-02 09:00',
        tasks: [
          {
            heading: '客厅电视区',
            items: [
              { text: '拔下所有线拍照记录', done: true },
              { text: '贴标签', done: true }
            ]
          },
          {
            heading: '书房桌面',
            items: [
              { text: '淘汰闲置的 Micro-USB 线', done: false },
              { text: '理线器固定', done: false }
            ]
          }
        ]
      }
    },
    {
      id: 'i9', groupId: 'g-writing', status: 'done', starred: false, seedAgo: 590,
      title: '把博客评论区迁移到 giscus',
      note: '',
      core: '用 GitHub Discussions 承载博客评论。',
      why: '旧的评论服务要关停了。',
      steps: [
        { text: '开通 Discussions', done: true },
        { text: '嵌入 giscus 组件', done: true },
        { text: '旧评论归档', done: true }
      ],
      risks: '',
      tags: ['博客'],
      doneAt: '09-15',
      doneSummary: '评论零丢失，加载速度还快了。'
    },
    {
      id: 'i10', groupId: 'g-life', status: 'dropped', starred: false, seedAgo: 1400,
      title: '自制拿铁拉花练习计划',
      note: '',
      core: '每天早上练一杯，30 天会心形。',
      why: '',
      steps: [],
      risks: '',
      tags: [],
      dropReason: '家里没有打奶泡的机器，投入产出比太低，先搁置。'
    }
  ];

  function defaultData() {
    var now = Date.now();
    var ideas = SEED_IDEAS.map(function (d) {
      var c = JSON.parse(JSON.stringify(d));
      var ago = (c.seedAgo || 0) * HOUR;
      delete c.seedAgo;
      c.createdTs = now - ago;
      c.updatedTs = now - ago;
      return c;
    });
    return {
      version: 1,
      groups: JSON.parse(JSON.stringify(SEED_GROUPS)),
      ideas: ideas,
      settings: { theme: '', sortBy: 'createdAt' }
    };
  }

  /* ---------- 读写 ---------- */
  function load() {
    if (data) return data;
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (raw) { try { data = JSON.parse(raw); } catch (e) { data = null; } }
    if (!data || !Array.isArray(data.groups) || !Array.isArray(data.ideas)) {
      data = defaultData();
      save();
    }
    if (!data.settings) data.settings = { theme: '', sortBy: 'createdAt' };
    return data;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      if (!saveWarned) {
        saveWarned = true;
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('数据保存失败：本地存储不可用或空间已满，本次操作不会被记住。');
        }
      }
    }
  }

  /* ---------- 分组 ---------- */
  function groups() { return data.groups; }
  function findGroup(id) {
    for (var i = 0; i < data.groups.length; i++) if (data.groups[i].id === id) return data.groups[i];
    return null;
  }
  function addGroup(name) {
    var g = {
      id: uid('g'),
      name: name,
      color: PALETTE[data.groups.length % PALETTE.length],
      icon: GROUP_ICONS[data.groups.length % GROUP_ICONS.length]
    };
    data.groups.push(g);
    save();
    return g;
  }
  function renameGroup(id, name) {
    var g = findGroup(id);
    if (g && name) { g.name = name; save(); }
  }
  function deleteGroup(id) {
    if (id === 'inbox') return false;
    data.ideas.forEach(function (i) { if (i.groupId === id) i.groupId = 'inbox'; });
    data.groups = data.groups.filter(function (g) { return g.id !== id; });
    save();
    return true;
  }

  /* ---------- 灵感 ---------- */
  function ideas() { return data.ideas; }
  function findIdea(id) {
    for (var i = 0; i < data.ideas.length; i++) if (data.ideas[i].id === id) return data.ideas[i];
    return null;
  }
  function addIdea(title, groupId) {
    var idea = {
      id: uid('i'),
      groupId: groupId || 'inbox',
      title: title,
      note: '',
      status: 'new',
      starred: false,
      steps: [],
      why: '',
      risks: '',
      tags: [],
      research: { verdict: '', refs: [] },
      createdTs: Date.now(),
      updatedTs: Date.now()
    };
    data.ideas.unshift(idea);
    save();
    return idea;
  }
  function updateIdea(id, patch) {
    var idea = findIdea(id);
    if (!idea) return;
    for (var k in patch) if (patch.hasOwnProperty(k)) idea[k] = patch[k];
    idea.updatedTs = Date.now();
    if (patch.status !== undefined) idea.statusChangedTs = Date.now();
    save();
  }
  function removeIdea(id) {
    for (var i = 0; i < data.ideas.length; i++) {
      if (data.ideas[i].id === id) {
        var rec = { idea: data.ideas.splice(i, 1)[0], index: i };
        save();
        return rec;
      }
    }
    return null;
  }
  function restoreIdea(rec) {
    if (!rec) return;
    var idx = Math.min(rec.index, data.ideas.length);
    data.ideas.splice(idx, 0, rec.idea);
    save();
  }
  function moveIdea(id, groupId) {
    if (findGroup(groupId)) updateIdea(id, { groupId: groupId });
  }
  function reorder(draggedId, beforeId) {
    if (draggedId === beforeId) return;
    var arr = data.ideas;
    var from = -1;
    for (var i = 0; i < arr.length; i++) if (arr[i].id === draggedId) { from = i; break; }
    if (from < 0) return;
    var item = arr.splice(from, 1)[0];
    var to = -1;
    if (beforeId) {
      for (var j = 0; j < arr.length; j++) if (arr[j].id === beforeId) { to = j; break; }
    }
    if (to < 0) arr.push(item);
    else arr.splice(to, 0, item);
    save();
  }

  /* ---------- 标签（B5：跨灵感聚合，用于建议） ---------- */
  function allTags() {
    var map = {};
    data.ideas.forEach(function (i) {
      (i.tags || []).forEach(function (t) {
        if (!t) return;
        map[t] = (map[t] || 0) + 1;
      });
    });
    var arr = [];
    for (var k in map) if (map.hasOwnProperty(k)) arr.push({ tag: k, count: map[k] });
    arr.sort(function (a, b) { return b.count - a.count; });
    return arr;
  }

  /* ---------- 设置 ---------- */
  function settings() { return data.settings; }
  function setSetting(k, v) { data.settings[k] = v; save(); }

  /* ---------- 备份（阶段五） ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function snapshot() { return clone(data); }

  function isValidBackup(obj) {
    return !!(obj && Array.isArray(obj.ideas) && Array.isArray(obj.groups));
  }

  /* 覆盖导入：整份数据替换 */
  function replaceAll(obj) {
    if (!isValidBackup(obj)) return null;
    data = {
      version: 1,
      groups: clone(obj.groups),
      ideas: clone(obj.ideas),
      settings: (obj.settings && typeof obj.settings === 'object')
        ? clone(obj.settings) : { theme: '', sortBy: 'createdAt' }
    };
    if (!findGroup('inbox')) {
      data.groups.unshift({ id: 'inbox', name: '收集箱', color: '#0f7b6c', icon: 'inbox' });
    }
    save();
    return { ideas: data.ideas.length, groups: data.groups.length };
  }

  /* 合并导入：按 id 去重，同一条以更新时间较新者为准 */
  function mergeImport(obj) {
    if (!isValidBackup(obj)) return null;
    var stat = { ideasAdded: 0, ideasUpdated: 0, groupsAdded: 0 };
    obj.groups.forEach(function (g) {
      if (g && g.id && !findGroup(g.id)) { data.groups.push(clone(g)); stat.groupsAdded++; }
    });
    var existing = {};
    data.ideas.forEach(function (i) { existing[i.id] = true; });
    obj.ideas.forEach(function (i) {
      if (!i || !i.id) return;
      if (!existing[i.id]) {
        data.ideas.push(clone(i));
        stat.ideasAdded++;
        return;
      }
      var cur = findIdea(i.id);
      if (!cur) return;
      if ((i.updatedTs || 0) > (cur.updatedTs || 0)) {
        for (var k in i) if (i.hasOwnProperty(k)) cur[k] = clone(i[k]);
        stat.ideasUpdated++;
      }
    });
    save();
    return stat;
  }

  function reset() {
    data = null;
    try { localStorage.removeItem(KEY); } catch (e) {}
    load();
  }

  return {
    load: load, save: save,
    groups: groups, findGroup: findGroup, addGroup: addGroup,
    renameGroup: renameGroup, deleteGroup: deleteGroup,
    ideas: ideas, findIdea: findIdea, addIdea: addIdea,
    updateIdea: updateIdea, removeIdea: removeIdea, restoreIdea: restoreIdea,
    moveIdea: moveIdea, reorder: reorder,
    settings: settings, setSetting: setSetting,
    allTags: allTags,
    snapshot: snapshot, replaceAll: replaceAll, mergeImport: mergeImport,
    nowStr: nowStr, reset: reset
  };
})();
