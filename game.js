/* 云海仙途 — 修仙升级放置页游 */
(function () {
  'use strict';

  var SAVE_KEY = 'xiuxian-online-save-v1';
  var OFFLINE_CAP_HOURS = 8;
  var OFFLINE_RATE = 0.5;

  // 境界：每境需层层攀升，圆满后渡雷劫突破大境界
  var REALMS = [
    { name: '炼气', layers: 9, req: 120, stone: 4 },
    { name: '筑基', layers: 6, req: 900, stone: 14 },
    { name: '金丹', layers: 6, req: 7200, stone: 48 },
    { name: '元婴', layers: 5, req: 62000, stone: 160 },
    { name: '化神', layers: 5, req: 540000, stone: 520 },
    { name: '炼虚', layers: 4, req: 4.8e6, stone: 1700 },
    { name: '合体', layers: 4, req: 4.2e7, stone: 5400 },
    { name: '大乘', layers: 3, req: 3.8e8, stone: 17000 },
    { name: '渡劫', layers: 3, req: 3.4e9, stone: 52000 },
    { name: '仙人', layers: 1, req: 3.0e10, stone: 160000 },
    { name: '大罗仙', layers: 3, req: 2.4e11, stone: 480000 },
    { name: '大罗金仙', layers: 3, req: 2.0e12, stone: 1.5e6 },
    { name: '仙帝', layers: 1, req: 1.8e13, stone: 4.5e6 }
  ];

  // 开局随机灵根
  var ROOTS = [
    { id: 'metal', name: '金灵根', desc: '锋锐无匹，剑意大增。', atk: 0.18, weight: 22 },
    { id: 'wood', name: '木灵根', desc: '生机绵长，吐纳更快。', qi: 0.10, pill: 0.10, weight: 22 },
    { id: 'water', name: '水灵根', desc: '水性至柔，灵气充沛。', qi: 0.18, weight: 22 },
    { id: 'fire', name: '火灵根', desc: '性烈如火，暴击更盛。', crit: 0.06, atk: 0.05, weight: 18 },
    { id: 'earth', name: '土灵根', desc: '厚土载物，灵石更丰。', stone: 0.20, weight: 12 },
    { id: 'heaven', name: '天灵根', desc: '万中无一，诸法皆通。', qi: 0.12, atk: 0.12, crit: 0.03, weight: 3 },
    { id: 'chaos', name: '混沌灵根', desc: '传说之根，气运加身。', qi: 0.20, atk: 0.20, crit: 0.06, stone: 0.20, weight: 1 }
  ];

  // 境界神通：到境界自动解锁，直接并入数值并改变战斗表现
  var RE_SKILLS = [
    { realm: 1, name: '御剑突刺', desc: '每三次攻击追加一道额外飞剑。', atk: 0.05, every: 3 },
    { realm: 2, name: '三昧真火', desc: '攻击附带真火，剑意 +20%。', atk: 0.20 },
    { realm: 3, name: '元婴合击', desc: '元婴同出，攻击段数 +1。', hits: 1 },
    { realm: 4, name: '神识锁定', desc: '神识笼罩，暴击 +10%。', crit: 0.10 },
    { realm: 5, name: '虚空挪移', desc: '身形如电，出剑更快。', speed: 0.15 },
    { realm: 6, name: '法天象地', desc: '身化山岳，剑意 +35%。', atk: 0.35 },
    { realm: 7, name: '大乘佛光', desc: '佛光普照，灵气 +25%。', qi: 0.25 },
    { realm: 8, name: '雷劫加身', desc: '以身引雷，渡劫 +12%。', breakthrough: 12 },
    { realm: 9, name: '仙气护体', desc: '仙气绵长，离线收益 +25%。', offline: 0.25 },
    { realm: 10, name: '大罗天音', desc: '天音涤荡，全属性 +15%。', all: 0.15 },
    { realm: 11, name: '金仙不灭', desc: '金仙之躯，灵气与灵石 +35%。', qi: 0.35, stone: 0.35 },
    { realm: 12, name: '仙帝帝威', desc: '帝威加身，暴击伤害翻倍。', critDamage: 1.0 }
  ];

  // 师徒主线任务链
  var MAIN_QUESTS = [
    { id: 'm1', name: '拜入师门', desc: '打坐吐纳 30 次', goal: 30, kind: 'clicks', reward: { stones: 120, contribution: 20, pills: { 'qi-pill': 1 } } },
    { id: 'm2', name: '师尊传法', desc: '参悟任意功法 3 次', goal: 3, kind: 'techs', reward: { stones: 260, contribution: 30 } },
    { id: 'm3', name: '初次历练', desc: '斩杀妖兽 10 只', goal: 10, kind: 'kills', reward: { stones: 320, contribution: 40, pills: { 'break-pill': 1 } } },
    { id: 'm4', name: '开采灵矿', desc: '挖矿 15 次', goal: 15, kind: 'mines', reward: { stones: 480, contribution: 40, pillars: {} } },
    { id: 'm5', name: '筑基之试', desc: '突破至筑基境', goal: 1, kind: 'realm', reward: { stones: 900, contribution: 60, outfits: ['cloth'] } },
    { id: 'm6', name: '师妹同行', desc: '与师妹互动 5 次', goal: 5, kind: 'sister', reward: { stones: 1200, contribution: 80, pills: { 'spirit-pill': 1 } } },
    { id: 'm7', name: '金丹大道', desc: '突破至金丹境', goal: 2, kind: 'realm', reward: { stones: 3600, contribution: 120, outfits: ['armor'] } },
    { id: 'm8', name: '斩妖立威', desc: '斩杀妖兽 60 只', goal: 60, kind: 'kills', reward: { stones: 7200, contribution: 150 } },
    { id: 'm9', name: '元婴离体', desc: '突破至元婴境', goal: 3, kind: 'realm', reward: { stones: 16000, contribution: 200, outfits: ['sword'] } },
    { id: 'm10', name: '妖王试炼', desc: '击败 3 位妖王', goal: 3, kind: 'boss', reward: { stones: 42000, contribution: 260, pills: { 'wombo-pill': 2 } } },
    { id: 'm11', name: '化神登阶', desc: '突破至化神境', goal: 4, kind: 'realm', reward: { stones: 120000, contribution: 320, outfits: ['alchemy'] } },
    { id: 'm12', name: '仙途问鼎', desc: '突破至仙人境', goal: 9, kind: 'realm', reward: { stones: 2600000, contribution: 600, outfits: ['immortal'] } }
  ];

  // 历练支线：同时挂 3 个，完成即刷新
  var SIDE_QUESTS = [
    { id: 's-kills', name: '清剿妖患', desc: '斩杀妖兽 {goal} 只', base: 12, kind: 'kills', reward: { stones: 260, contribution: 25 } },
    { id: 's-boss', name: '讨伐妖王', desc: '击败妖王 {goal} 位', base: 1, kind: 'boss', reward: { stones: 900, contribution: 60, pills: { 'break-pill': 1 } } },
    { id: 's-mine', name: '开采矿脉', desc: '挖矿 {goal} 次', base: 10, kind: 'mines', reward: { stones: 320, contribution: 30, ore: 4 } },
    { id: 's-clicks', name: '闭关苦修', desc: '打坐 {goal} 次', base: 80, kind: 'clicks', reward: { stones: 220, contribution: 20, ore: 2 } },
    { id: 's-sister', name: '同门切磋', desc: '与师妹互动 {goal} 次', base: 3, kind: 'sister', reward: { stones: 380, contribution: 45 } },
    { id: 's-tech', name: '参悟妙法', desc: '参悟功法 {goal} 次', base: 4, kind: 'techs', reward: { stones: 520, contribution: 35, ore: 3 } }
  ];

  var SISTER_ACTIONS = [
    { id: 'gift', name: '赠礼', cost: 400, favor: 6, contribution: 15, desc: '花 400 灵石送她一支玉簪。', result: '师妹收下玉簪，眉眼弯弯。' },
    { id: 'talk', name: '论道', cost: 0, favor: 2, contribution: 8, cooldown: 45, desc: '与她论道，双方都有所得。', result: '一番论道，你受益良多。' },
    { id: 'spar', name: '切磋', cost: 0, favor: 4, contribution: 18, qi: 0.35, desc: '与她过招，损耗灵气但精进剑意。', result: '一场切磋，剑意更凝。' },
    { id: 'trip', name: '结伴历练', cost: 0, favor: 8, contribution: 30, cooldown: 120, stones: 0.6, desc: '结伴下山历练，收获颇丰。', result: '同游归来，收获满满。' }
  ];

  var FAVOR_TIERS = [
    { favor: 20, name: '同门之谊', qi: 0.03 },
    { favor: 40, name: '相知相惜', qi: 0.06, atk: 0.05 },
    { favor: 70, name: '同心道侣', qi: 0.10, atk: 0.10, crit: 0.05 },
    { favor: 100, name: '生死与共', qi: 0.18, atk: 0.18, crit: 0.08, stone: 0.15 }
  ];

  var LAYER_NAMES = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

  var TECHS = [
    {
      id: 'array', name: '聚灵阵', icon: 'icon_qi.png',
      desc: '引天地灵气入洞府，持续提升每秒灵气。',
      cost: function (lv) { return Math.floor(12 * Math.pow(1.75, lv)); },
      effect: function (lv) { return '+' + (lv * 0.6).toFixed(1) + ' 灵气/秒'; }
    },
    {
      id: 'breath', name: '吐纳术', icon: 'icon_break.png',
      desc: '打坐时吐纳更精纯，提升每次打坐所得灵气。',
      cost: function (lv) { return Math.floor(16 * Math.pow(1.7, lv)); },
      effect: function (lv) { return '打坐 +' + (1 + lv) + ' 灵气'; }
    },
    {
      id: 'sword', name: '御剑术', icon: 'icon_sword.png',
      desc: '以剑意斩妖，提高每次御剑攻击的伤害。',
      cost: function (lv) { return Math.floor(20 * Math.pow(1.72, lv)); },
      effect: function (lv) { return '剑意 ' + (5 + lv * 4); }
    },
    {
      id: 'ward', name: '护身法阵', icon: 'icon_shield.png',
      desc: '法阵自行运转，安稳地持续产出灵石。',
      cost: function (lv) { return Math.floor(30 * Math.pow(1.8, lv)); },
      effect: function (lv) { return '+' + (lv * 0.5).toFixed(1) + ' 灵石/秒'; }
    },
    {
      id: 'alchemy', name: '炼丹术', icon: 'icon_pill.png',
      desc: '降低炼丹所需的灵石与灵气。',
      cost: function (lv) { return Math.floor(40 * Math.pow(1.9, lv)); },
      effect: function (lv) { return '丹药花费 -' + Math.min(60, lv * 5) + '%'; }
    },
    {
      id: 'insight', name: '悟道', icon: 'icon_thunder.png',
      desc: '心境通明，提高渡雷劫的成功率。',
      cost: function (lv) { return Math.floor(60 * Math.pow(1.95, lv)); },
      effect: function (lv) { return '突破 +' + (lv * 3) + '%'; }
    },
    {
      id: 'heart', name: '心剑合一', icon: 'icon_wind.png',
      desc: '剑随心走，可让飞剑自行斩妖（自动攻击）。',
      cost: function (lv) { return Math.floor(120 * Math.pow(2.1, lv)); },
      effect: function (lv) { return lv > 0 ? '自动攻击 每 ' + (1.6 - Math.min(0.9, lv * 0.15)).toFixed(2) + ' 秒' : '未开启'; }
    },
    {
      id: 'root', name: '灵根淬炼', icon: 'icon_mountain.png',
      desc: '重塑五行灵根，整体提升灵气产出。',
      cost: function (lv) { return Math.floor(240 * Math.pow(2.0, lv)); },
      effect: function (lv) { return '灵气产出 +' + (lv * 8) + '%'; }
    },
    {
      id: 'sense', name: '神识', icon: 'icon_talisman.png',
      desc: '神识愈强，出手越容易击中要害。',
      cost: function (lv) { return Math.floor(180 * Math.pow(1.9, lv)); },
      effect: function (lv) { return '暴击 ' + Math.round(critChance(lv) * 100) + '%'; }
    },
    {
      id: 'formation', name: '剑阵', icon: 'icon_sword.png',
      desc: '布下剑阵，每次出手多飞出一道飞剑。',
      cost: function (lv) { return Math.floor(420 * Math.pow(2.1, lv)); },
      effect: function (lv) { return '每击 ' + (1 + lv) + ' 段'; }
    },
    {
      id: 'escape', name: '遁术', icon: 'icon_wind.png',
      desc: '遁法通玄，离山闭关时收益更高。',
      cost: function (lv) { return Math.floor(320 * Math.pow(1.95, lv)); },
      effect: function (lv) { return '离线收益 ' + Math.round(offlineRate(lv) * 100) + '%'; }
    },
    {
      id: 'enlighten', name: '天机', icon: 'icon_time.png',
      desc: '参透天机，即便不出手也会自行吐纳。',
      cost: function (lv) { return Math.floor(900 * Math.pow(2.2, lv)); },
      effect: function (lv) { return lv > 0 ? '自动吐纳 每 ' + (1.8 - Math.min(1.0, lv * 0.2)).toFixed(1) + ' 秒' : '未开启'; }
    },
    {
      id: 'pillcraft', name: '丹道', icon: 'icon_cauldron.png',
      desc: '丹道精进，所有丹药效果大幅提升。',
      cost: function (lv) { return Math.floor(560 * Math.pow(2.05, lv)); },
      effect: function (lv) { return '丹药效果 +' + (lv * 20) + '%'; }
    }
  ];

  var PILLS = [
    {
      id: 'qi-pill', name: '聚气丹', icon: 'icon_pill.png',
      desc: '服下后立刻获得相当于 40 秒的灵气。',
      cost: function () { return { stones: 10, qi: 60 }; }
    },
    {
      id: 'break-pill', name: '破障丹', icon: 'icon_break.png',
      desc: '下一轮雷劫成功率 +15%，可叠加三次。',
      cost: function () { return { stones: 35, qi: 200 }; }
    },
    {
      id: 'spirit-pill', name: '凝神丹', icon: 'icon_cauldron.png',
      desc: '服下后 60 秒内灵气产出翻倍。',
      cost: function () { return { stones: 60, qi: 500 }; }
    },
    {
      id: 'clear-pill', name: '太清丹', icon: 'icon_talisman.png',
      desc: '服下后 60 秒内暴击率翻倍。',
      cost: function () { return { stones: 90, qi: 900 }; }
    },
    {
      id: 'wombo-pill', name: '悟道丹', icon: 'icon_thunder.png',
      desc: '服下后立刻获得当前层所需修为的 35%。',
      cost: function () { return { stones: 140, qi: 1600 }; }
    },
    {
      id: 'treasure-pill', name: '聚宝丹', icon: 'icon_chest.png',
      desc: '服下后立刻获得相当于 60 秒产出的灵石。',
      cost: function () { return { stones: 80, qi: 700 }; }
    }
  ];

  var ACHIEVEMENTS = [
    { id: 'first', name: '初入仙途', desc: '第一次打坐吐纳', qi: 0.02, atk: 0, check: function () { return state.records.totalClicks >= 1; } },
    { id: 'clicks300', name: '勤修不辍', desc: '累计打坐 300 次', qi: 0.04, atk: 0, check: function () { return state.records.totalClicks >= 300; } },
    { id: 'kills10', name: '初试锋芒', desc: '累计斩妖 10 只', qi: 0, atk: 0.04, check: function () { return state.records.totalKills >= 10; } },
    { id: 'kills100', name: '斩妖百只', desc: '累计斩妖 100 只', qi: 0, atk: 0.08, check: function () { return state.records.totalKills >= 100; } },
    { id: 'boss1', name: '妖王伏诛', desc: '击败第一位妖王', qi: 0.03, atk: 0.10, check: function () { return state.bossKills >= 1; } },
    { id: 'boss5', name: '镇妖尊者', desc: '击败五位妖王', qi: 0.05, atk: 0.12, check: function () { return state.bossKills >= 5; } },
    { id: 'realm3', name: '金丹大道', desc: '修炼到金丹境', qi: 0.06, atk: 0, check: function () { return state.realm >= 2; } },
    { id: 'realm6', name: '炼虚之境', desc: '修炼到炼虚境', qi: 0.12, atk: 0.05, check: function () { return state.realm >= 5; } },
    { id: 'sect', name: '宗门中人', desc: '拜入任意宗门', qi: 0.03, atk: 0, check: function () { return !!state.sect.id; } },
    { id: 'daily', name: '日课圆满', desc: '一天内领完 4 件日课', qi: 0.05, atk: 0, check: function () { return state.dailyDone; } },
    { id: 'lifetime', name: '道行千里', desc: '累计修为达到 10 万', qi: 0.10, atk: 0, check: function () { return state.records.lifetime >= 100000; } },
    { id: 'lifetime2', name: '道行万载', desc: '累计修为达到 1 亿', qi: 0.20, atk: 0.10, check: function () { return state.records.lifetime >= 1e8; } }
  ];

  var EVENTS = [
    {
      id: 'rain', tag: '天象', title: '灵雨降世', text: '乌云化雨，山间灵气骤然浓郁。',
      choices: [
        { label: '运功吸纳', hint: '获得大量灵气', run: function () { var g = Math.max(30, qiPerSec() * 45); state.qi += g; return '灵气 +' + fmt(g); } },
        { label: '汲取灵泉', hint: '换成灵石', run: function () { var g = Math.max(20, stonesPerSec() * 60 + 25 + state.realm * 18); state.stones += g; return '灵石 +' + fmt(g); } }
      ]
    },
    {
      id: 'cave', tag: '机缘', title: '山中古洞', text: '岩壁上露出一座荒废洞府，石门半开。',
      choices: [
        { label: '入洞探查', hint: '可能得丹药，也可能受伤', run: function () { if (Math.random() < 0.65) { var pill = PILLS[Math.floor(Math.random() * PILLS.length)].id; state.pills[pill] = (state.pills[pill] || 0) + 1; return '寻得一枚丹药'; } var lose = Math.floor(state.xiuwei * 0.18); state.xiuwei -= lose; return '触动禁制，修为 -' + fmt(lose); } },
        { label: '绕道而行', hint: '稳妥获得修为', run: function () { var g = Math.max(40, qiPerSec() * 30); gainXiuwei(g); return '修为 +' + fmt(g); } }
      ]
    },
    {
      id: 'raid', tag: '危难', title: '妖兽袭山', text: '一头妖王带着妖气逼近洞府。',
      choices: [
        { label: '迎战', hint: '立刻与妖王一战', run: function () { state.beastHp = 0; state.forceBoss = true; return '妖王已至，动手吧'; } },
        { label: '闭门静守', hint: '损失少许修为换取灵石', run: function () { var lose = Math.floor(state.xiuwei * 0.06); state.xiuwei -= lose; state.stones += 60 + state.realm * 40; return '灵石 +' + fmt(60 + state.realm * 40); } }
      ]
    },
    {
      id: 'wanderer', tag: '人情', title: '过路散修', text: '一位散修在洞府外盘桓，似有所求。',
      choices: [
        { label: '交换心得', hint: '得到修为', run: function () { var g = Math.max(60, qiPerSec() * 40); gainXiuwei(g); return '修为 +' + fmt(g); } },
        { label: '赠以灵石', hint: '消耗灵石换宗门贡献', run: function () { var cost = Math.min(state.stones, 80 + state.realm * 50); state.stones -= cost; state.sect.contribution += 25; return '贡献 +25（耗费灵石 ' + fmt(cost) + '）'; } }
      ]
    },
    {
      id: 'demon', tag: '心劫', title: '心魔滋生', text: '闭关日久，潜意识里的杂念凝成心魔。',
      choices: [
        { label: '以剑斩之', hint: '耗费灵气，换来大量修为', run: function () { var cost = Math.min(state.qi, qiPerSec() * 40 + 50); state.qi -= cost; var g = Math.max(80, qiPerSec() * 70); gainXiuwei(g); return '修为 +' + fmt(g); } },
        { label: '静心调息', hint: '小幅收益但更稳', run: function () { var g = Math.max(25, qiPerSec() * 18); gainXiuwei(g); return '修为 +' + fmt(g); } }
      ]
    },
    {
      id: 'thunder', tag: '天象', title: '天雷淬体', text: '一道紫色雷光落在峰顶，正好可以借来淬炼肉身。',
      choices: [
        { label: '引雷淬体', hint: '损失修为，短时增伤', run: function () { var lose = Math.floor(state.xiuwei * 0.1); state.xiuwei -= lose; state.buffs.critBoost = 90; return '九十息内暴击翻倍（修为 -' + fmt(lose) + '）'; } },
        { label: '远远观望', hint: '收集雷石', run: function () { state.stones += 120 + state.realm * 60; return '灵石 +' + fmt(120 + state.realm * 60); } }
      ]
    },
    {
      id: 'market', tag: '世俗', title: '坊市开张', text: '山下坊市热闹，丹药与符箓都有买卖。',
      choices: [
        { label: '买些药材', hint: '花灵石换丹药', run: function () { var cost = Math.min(state.stones, 70 + state.realm * 30); state.stones -= cost; var pill = ['qi-pill', 'break-pill', 'spirit-pill'][Math.floor(Math.random() * 3)]; state.pills[pill] = (state.pills[pill] || 0) + 1; return '得一枚丹药（耗费灵石 ' + fmt(cost) + '）'; } },
        { label: '卖几张符箓', hint: '换成灵石', run: function () { state.stones += 140 + state.realm * 55; return '灵石 +' + fmt(140 + state.realm * 55); } }
      ]
    },
    {
      id: 'ruin', tag: '机缘', title: '前辈遗府', text: '云海深处现出一座上古修士的遗府。',
      choices: [
        { label: '破阵而入', hint: '消耗灵气，收获灵石', run: function () { var cost = Math.min(state.qi, qiPerSec() * 50); state.qi -= cost; var g = Math.max(150, stonesPerSec() * 120 + 150 + state.realm * 90); state.stones += g; return '灵石 +' + fmt(g); } },
        { label: '焚香祭拜', hint: '得到宗门贡献与修为', run: function () { state.sect.contribution += 40; var g = Math.max(60, qiPerSec() * 35); gainXiuwei(g); return '贡献 +40，修为 +' + fmt(g); } }
      ]
    }
  ];

  var BEASTS = [
    { name: '灰皮妖狼', hp: 45, stones: 8, xiuwei: 30 },
    { name: '赤鳞蛟', hp: 220, stones: 30, xiuwei: 200 },
    { name: '黑风魔修', hp: 1200, stones: 120, xiuwei: 1400 },
    { name: '幽泉鬼将', hp: 6800, stones: 480, xiuwei: 9600 },
    { name: '陨铁傀儡', hp: 39000, stones: 1900, xiuwei: 68000 },
    { name: '上古天魔', hp: 230000, stones: 7600, xiuwei: 480000 }
  ];

  var DAILY_QUESTS = [
    { id: 'clicks', name: '晨课吐纳', desc: '打坐吐纳 200 次', goal: 200, stones: 150, pills: {} },
    { id: 'kills', name: '斩妖历练', desc: '斩杀妖兽 30 只', goal: 30, stones: 220, pills: {} },
    { id: 'layers', name: '精进不休', desc: '提升修为层次 5 次', goal: 5, stones: 180, pills: { 'qi-pill': 1 } },
    { id: 'pills', name: '炼丹服食', desc: '服用丹药 3 次', goal: 3, stones: 120, pills: { 'break-pill': 1 } }
  ];

  var SECTS = [
    { id: 'qingyun', name: '青云宗', motto: '以气御法，厚积薄发', perk: '灵气产出 +15%' },
    { id: 'taixu', name: '太虚剑派', motto: '剑意通神，一往无前', perk: '剑意 +20%' },
    { id: 'danxia', name: '丹霞谷', motto: '丹火不熄，药石通玄', perk: '炼丹花费 -15%' }
  ];

  var SECT_RANKS = [
    { name: '外门弟子', cost: 0, perk: '尚无加护' },
    { name: '内门弟子', cost: 120, perk: '灵气 +5%' },
    { name: '真传弟子', cost: 420, perk: '灵气 +10%、剑意 +5%' },
    { name: '执法长老', cost: 1400, perk: '灵气 +18%、剑意 +10%' },
    { name: '一宗之主', cost: 3600, perk: '灵气 +30%、剑意 +20%、丹药 -10%' }
  ];

  var RIVAL_NAMES = [
    '青莲剑仙', '玄霜道人', '碧海童子', '焚天老祖', '无相僧',
    '白鹿真君', '沧海钓叟', '落霞剑姬', '枯木禅师', '紫霄雷尊',
    '寒山客', '雨师妾', '铁笛书生', '玉衡仙子', '石鼓樵夫',
    '浮屠刀客', '清微道人', '赤松子', '望舒月娥', '孤鸿子'
  ];

  var RIVALS = RIVAL_NAMES.map(function (name, index) {
    return {
      name: name,
      base: 2000 * Math.pow(2.15, index),
      rate: 0.03 + (index % 5) * 0.015
    };
  });

  // 衣冠：服装 + 法宝 + 灵宠
  var OUTFITS = [
    {
      id: 'dao', name: '青云道袍', rarity: '凡品', file: 'assets/hero.png',
      desc: '青云宗制式道袍，朴素却便于行走。',
      qi: 0, atk: 0, crit: 0, pill: 0,
      unlock: { type: 'default' }
    },
    {
      id: 'cloth', name: '青衫布衣', rarity: '凡品', file: 'assets/outfits/cloth.png',
      desc: '山下集市买来的粗布短打，轻便利落。',
      qi: 0.03, atk: 0.02, crit: 0, pill: 0,
      unlock: { type: 'stones', value: 260 }
    },
    {
      id: 'armor', name: '玄铁战甲', rarity: '良品', file: 'assets/outfits/armor.png',
      desc: '玄铁锻造的战甲，护住要害，也压得住性子。',
      qi: 0.05, atk: 0.08, crit: 0, pill: 0,
      unlock: { type: 'stones', value: 1400 }
    },
    {
      id: 'sword', name: '太虚剑装', rarity: '良品', file: 'assets/outfits/sword.png',
      desc: '太虚剑派的束袖剑装，抬手即是剑势。',
      qi: 0.04, atk: 0.12, crit: 0.03, pill: 0,
      unlock: { type: 'realm', value: 1 }
    },
    {
      id: 'alchemy', name: '丹霞法袍', rarity: '上品', file: 'assets/outfits/alchemy.png',
      desc: '丹霞谷法袍，袖口绣丹炉纹，炼丹事半功倍。',
      qi: 0.08, atk: 0.02, crit: 0.02, pill: 0.15,
      unlock: { type: 'stones', value: 7200 }
    },
    {
      id: 'demonic', name: '幽月魔袍', rarity: '上品', file: 'assets/outfits/demonic.png',
      desc: '来路不明的魔道衣袍，气息阴冷，极增杀伤。',
      qi: 0.06, atk: 0.18, crit: 0.08, pill: 0,
      unlock: { type: 'boss', value: 5 }
    },
    {
      id: 'immortal', name: '仙尊云袍', rarity: '仙品', file: 'assets/outfits/immortal.png',
      desc: '传说中飞升者所着的云纹仙袍，周身云气流转。',
      qi: 0.25, atk: 0.20, crit: 0.10, pill: 0.10,
      unlock: { type: 'realm', value: 4 }
    }
  ];

  var EQUIP_SLOTS = [
    {
      id: 'sword', name: '法剑', icon: 'icon_sword.png',
      items: [
        { id: 'sword-1', name: '青锋剑', cost: 500, atk: 0.12, desc: '剑意 +12%' },
        { id: 'sword-2', name: '赤霄剑', cost: 4200, atk: 0.28, desc: '剑意 +28%' },
        { id: 'sword-3', name: '斩月剑', cost: 32000, atk: 0.55, desc: '剑意 +55%' }
      ]
    },
    {
      id: 'robe', name: '法衣', icon: 'icon_shield.png',
      items: [
        { id: 'robe-1', name: '素纱法衣', cost: 600, qi: 0.10, desc: '灵气 +10%' },
        { id: 'robe-2', name: '云纹法衣', cost: 5200, qi: 0.22, desc: '灵气 +22%' },
        { id: 'robe-3', name: '星罗天衣', cost: 38000, qi: 0.45, desc: '灵气 +45%' }
      ]
    },
    {
      id: 'crown', name: '道冠', icon: 'icon_mountain.png',
      items: [
        { id: 'crown-1', name: '木簪', cost: 700, crit: 0.03, desc: '暴击 +3%' },
        { id: 'crown-2', name: '紫玉冠', cost: 6400, crit: 0.06, desc: '暴击 +6%' },
        { id: 'crown-3', name: '太清冠', cost: 46000, crit: 0.10, desc: '暴击 +10%' }
      ]
    },
    {
      id: 'talisman', name: '护符', icon: 'icon_talisman.png',
      items: [
        { id: 'talisman-1', name: '聚灵石符', cost: 800, stone: 0.15, desc: '灵石 +15%' },
        { id: 'talisman-2', name: '藏风玉符', cost: 7000, stone: 0.30, desc: '灵石 +30%' },
        { id: 'talisman-3', name: '乾坤宝符', cost: 52000, stone: 0.60, desc: '灵石 +60%' }
      ]
    }
  ];

  var PETS = [
    {
      id: 'fox', name: '雪狐', rarity: '良品', icon: 'icon_water.png',
      desc: '灵动的雪狐，会替你叼来灵气。',
      qi: 0.06, atk: 0.05, auto: 3200, autoDamage: 0.6,
      unlock: { type: 'stones', value: 900 }
    },
    {
      id: 'crane', name: '青鸾', rarity: '上品', icon: 'icon_wind.png',
      desc: '青鸾振翅，剑势随之加速。',
      qi: 0.05, atk: 0.14, auto: 2600, autoDamage: 1.0,
      unlock: { type: 'stones', value: 8800 }
    },
    {
      id: 'turtle', name: '玄龟', rarity: '上品', icon: 'icon_mountain.png',
      desc: '玄龟沉稳，护你渡劫，也助你闭关。',
      qi: 0.10, atk: 0.04, auto: 4200, autoDamage: 0.8, offline: 0.15, breakthrough: 5,
      unlock: { type: 'boss', value: 3 }
    }
  ];

  var WEATHERS = [
    { id: 'clear', name: '晴空', desc: '天光正好，无额外加成。', qi: 0, atk: 0, crit: 0 },
    { id: 'rain', name: '灵雨', desc: '灵雨滋润，灵气产出 +20%。', qi: 0.20, atk: 0, crit: 0 },
    { id: 'wind', name: '罡风', desc: '罡风激荡，剑意 +15%。', qi: 0, atk: 0.15, crit: 0 },
    { id: 'storm', name: '紫电', desc: '雷云蕴电，暴击 +5%。', qi: 0.05, atk: 0.05, crit: 0.05 }
  ];

  var SOUNDS = {
    click: 'assets/sfx/sfx_cultivate.mp3',
    attack: 'assets/sfx/sfx_attack.mp3',
    win: 'assets/sfx/sfx_win.mp3',
    levelup: 'assets/sfx/sfx_levelup.mp3',
    thunder: 'assets/sfx/sfx_thunder.mp3'
  };

  var MUSIC_SRC = 'assets/bgm.mp3';
  var HERO_ANIM = 'assets/hero_idle.webp';
  var HERO_ATTACK = 'assets/hero_attack.webp';
  var heroAnimReady = false;
  var heroAttackReady = false;
  var attackFrameTimer = null;

  var state = null;
  var ui = {};
  var audio = { enabled: true, cache: {}, music: null, musicStarted: false };

  function now() { return Date.now(); }

  function realm() { return REALMS[Math.min(state.realm, REALMS.length - 1)]; }

  function techLevel(id) { return state.techs[id] || 0; }

  function qiPerSec() {
    var base = 1.2 * realmScale();
    var mult = state.buffs.qiMult > 0 ? 2 : 1;
    return base * (1 + techLevel('array') * 0.12) * mult * sectQiMult()
      * (1 + techLevel('root') * 0.08) * (1 + achBonuses().qi) * (1 + gearBonus().qi)
      * (1 + rootBonus().qi) * (1 + skillBonus().qi);
  }

  function stonesPerSec() {
    return 0.7 * realmScale() * (1 + techLevel('ward') * 0.20)
      * (1 + gearBonus().stone) * (1 + rootBonus().stone) * (1 + skillBonus().stone);
  }

  function clickGain() {
    return (1 + techLevel('breath')) * (1 + state.realm * 0.5);
  }

  function attackPower() {
    return Math.round((5 + techLevel('sword') * 4 + state.realm * 6)
      * sectAttackMult() * (1 + achBonuses().atk) * (1 + gearBonus().atk)
      * (1 + rootBonus().atk + skillBonus().atk + favorBonus().atk));
  }

  function autoInterval() {
    var lv = techLevel('heart');
    if (lv <= 0) return 0;
    return Math.max(350, (1.6 - Math.min(0.9, lv * 0.15)) * 1000 * (1 - skillBonus().speed));
  }

  function breakthroughChance() {
    var base = 62 + techLevel('insight') * 3 + state.buffs.breakBonus
      + gearBonus().breakthrough + skillBonus().breakthrough;
    base -= Math.min(28, state.realm * 3);
    return Math.max(12, Math.min(96, base));
  }

  function layerRequirement() {
    var r = realm();
    var scale = Math.pow(1.35, state.layer - 1);
    return Math.floor(r.req * scale);
  }

  function pillCostOf(pill) {
    var c = pill.cost();
    var discount = (1 - Math.min(0.6, techLevel('alchemy') * 0.05)) * sectPillMult();
    return { stones: Math.ceil(c.stones * discount), qi: Math.ceil(c.qi * discount) };
  }

  function sectQiMult() {
    var rankBonus = [0, 0.05, 0.10, 0.18, 0.30];
    var mult = 1 + (rankBonus[state.sect.rank] || 0);
    if (state.sect.id === 'qingyun') mult += 0.15;
    return mult;
  }

  function sectAttackMult() {
    var rankBonus = [0, 0, 0.05, 0.10, 0.20];
    var mult = 1 + (rankBonus[state.sect.rank] || 0);
    if (state.sect.id === 'taixu') mult += 0.20;
    return mult;
  }

  function sectPillMult() {
    var mult = 1;
    if (state.sect.id === 'danxia') mult -= 0.15;
    if (state.sect.rank >= 4) mult -= 0.10;
    return Math.max(0.4, mult);
  }

  function playerScore() {
    return state.records.lifetime;
  }

  function critChance(levelOverride) {
    var lv = typeof levelOverride === 'number' ? levelOverride : techLevel('sense');
    var base = 0.05 + lv * 0.03 + state.realm * 0.005 + gearBonus().crit
      + rootBonus().crit + skillBonus().crit + favorBonus().crit;
    if (state.buffs.critBoost > 0) base *= 2;
    return Math.max(0.05, Math.min(0.65, base));
  }

  function currentOutfit() {
    return OUTFITS.filter(function (item) { return item.id === state.outfit; })[0] || OUTFITS[0];
  }

  function currentWeather() {
    return WEATHERS.filter(function (item) { return item.id === state.weather; })[0] || WEATHERS[0];
  }

  function currentPet() {
    return PETS.filter(function (item) { return item.id === state.pet; })[0] || null;
  }

  function equipBonus() {
    var total = { qi: 0, atk: 0, crit: 0, stone: 0 };
    EQUIP_SLOTS.forEach(function (slot) {
      var itemId = state.equipment[slot.id];
      if (!itemId) return;
      var item = slot.items.filter(function (entry) { return entry.id === itemId; })[0];
      if (!item) return;
      total.qi += item.qi || 0;
      total.atk += item.atk || 0;
      total.crit += item.crit || 0;
      total.stone += item.stone || 0;
    });
    return total;
  }

  function gearBonus() {
    var outfit = currentOutfit();
    var weather = currentWeather();
    var pet = currentPet();
    var equip = equipBonus();
    return {
      qi: outfit.qi + weather.qi + equip.qi + (pet ? pet.qi : 0) + (state.isNight ? 0.10 : 0),
      atk: outfit.atk + weather.atk + equip.atk + (pet ? pet.atk : 0),
      crit: outfit.crit + weather.crit + equip.crit,
      stone: equip.stone,
      pill: outfit.pill,
      offline: pet && pet.offline ? pet.offline : 0,
      breakthrough: pet && pet.breakthrough ? pet.breakthrough : 0
    };
  }

  function realmScale() {
    return Math.pow(7.6, state.realm);
  }

  function currentRoot() {
    return ROOTS.filter(function (item) { return item.id === state.root; })[0] || null;
  }

  function rootBonus() {
    var root = currentRoot();
    return {
      qi: root && root.qi ? root.qi : 0,
      atk: root && root.atk ? root.atk : 0,
      crit: root && root.crit ? root.crit : 0,
      stone: root && root.stone ? root.stone : 0,
      pill: 0
    };
  }

  function unlockedSkills() {
    return RE_SKILLS.filter(function (skill) { return state.realm >= skill.realm; });
  }

  function skillBonus() {
    var total = { qi: 0, atk: 0, crit: 0, stone: 0, hits: 0, speed: 0, offline: 0, breakthrough: 0, critDamage: 0 };
    unlockedSkills().forEach(function (skill) {
      if (skill.all) {
        total.qi += skill.all;
        total.atk += skill.all;
        total.crit += skill.all * 0.3;
      }
      total.qi += skill.qi || 0;
      total.atk += skill.atk || 0;
      total.crit += skill.crit || 0;
      total.stone += skill.stone || 0;
      total.hits += skill.hits || 0;
      total.speed += skill.speed || 0;
      total.offline += skill.offline || 0;
      total.breakthrough += skill.breakthrough || 0;
      total.critDamage += skill.critDamage || 0;
    });
    return total;
  }

  function favorBonus() {
    var total = { qi: 0, atk: 0, crit: 0, stone: 0 };
    FAVOR_TIERS.forEach(function (tier) {
      if (state.sister.favor < tier.favor) return;
      total.qi += tier.qi || 0;
      total.atk += tier.atk || 0;
      total.crit += tier.crit || 0;
      total.stone += tier.stone || 0;
    });
    return total;
  }

  function currentFavorTier() {
    var name = '泛泛之交';
    FAVOR_TIERS.forEach(function (tier) {
      if (state.sister.favor >= tier.favor) name = tier.name;
    });
    return name;
  }

  function techCost(tech, lv) {
    return Math.max(10, Math.floor(tech.cost(lv) * Math.pow(5.0, state.realm)));
  }

  function critMultiplier() {
    return (1.8 + state.realm * 0.05) * (1 + skillBonus().critDamage);
  }

  function hitCount() {
    return 1 + techLevel('formation') + skillBonus().hits;
  }

  function offlineRate(levelOverride) {
    var lv = typeof levelOverride === 'number' ? levelOverride : techLevel('escape');
    return Math.min(1.5, OFFLINE_RATE + lv * 0.06 + gearBonus().offline + skillBonus().offline);
  }

  function autoCultivateInterval() {
    var lv = techLevel('enlighten');
    if (lv <= 0) return 0;
    return (1.8 - Math.min(1.0, lv * 0.2)) * 1000;
  }

  function pillPower() {
    return 1 + techLevel('pillcraft') * 0.2 + gearBonus().pill;
  }

  function achBonuses() {
    var qi = 0;
    var atk = 0;
    ACHIEVEMENTS.forEach(function (item) {
      if (state.achievements.indexOf(item.id) >= 0) {
        qi += item.qi;
        atk += item.atk;
      }
    });
    return { qi: qi, atk: atk };
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function ensureDaily() {
    var key = todayKey();
    if (state.daily.date === key) return false;
    state.daily = { date: key, progress: {}, claimed: {} };
    return true;
  }

  function bumpDaily(id, amount) {
    if (!id) return;
    state.daily.progress[id] = (state.daily.progress[id] || 0) + (amount || 1);
  }

  function gainXiuwei(amount) {
    state.xiuwei += amount;
    state.records.lifetime += amount;
  }

  function beastForState() {
    var idx = Math.min(BEASTS.length - 1, state.realm + Math.floor(state.layer / 4));
    var b = BEASTS[idx];
    var isBoss = state.forceBoss || state.sinceBoss >= 9;
    // 血量跟着玩家当前输出走，保证任何阶段都是 5 秒左右的节奏；
    // 奖励跟着"当前层所需修为"走，保证战斗收益不会被数值膨胀甩开。
    var dps = playerDpsEstimate();
    var seconds = 5.0 + state.realm * 0.12;
    var maxHp = Math.max(30, Math.floor(dps * seconds * (1 + state.layer * 0.05)));
    var req = layerRequirement();
    var stones = Math.max(4, Math.floor(req * (0.015 + b.stones * 0.00002)));
    var xiuwei = Math.max(8, Math.floor(req * (0.025 + b.xiuwei * 0.00002)));
    if (isBoss) {
      maxHp = Math.floor(maxHp * 2.0);
      stones *= 8;
      xiuwei *= 8;
    }
    return {
      name: (isBoss ? '妖王 · ' : '') + b.name,
      boss: isBoss,
      maxHp: maxHp,
      stones: stones,
      xiuwei: xiuwei
    };
  }

  function playerDpsEstimate() {
    var attack = attackPower();
    var hits = hitCount();
    var crit = critChance();
    var interval = Math.max(0.35, (autoInterval() || 1000) / 1000);
    return attack * hits * (1 + crit * (critMultiplier() - 1)) / interval;
  }

  function fmt(n) {
    n = Math.floor(n);
    if (n < 1000) return String(n);
    var units = ['', '万', '亿', '兆', '京'];
    var i = 0;
    var v = n;
    while (v >= 10000 && i < units.length - 1) { v /= 10000; i++; }
    return (v >= 100 ? v.toFixed(0) : v.toFixed(v >= 10 ? 1 : 2)) + units[i];
  }

  function defaultState() {
    return {
      realm: 0,
      layer: 1,
      qi: 0,
      xiuwei: 0,
      stones: 30,
      pills: { 'qi-pill': 0, 'break-pill': 0, 'spirit-pill': 0 },
      techs: {},
      buffs: { breakBonus: 0, qiMult: 0, critBoost: 0 },
      beastHp: 0,
      beastKills: 0,
      bossKills: 0,
      sinceBoss: 0,
      forceBoss: false,
      achievements: [],
      dailyDone: false,
      outfits: ['dao'],
      outfit: 'dao',
      equipment: {},
      pets: [],
      pet: '',
      weather: 'clear',
      isNight: false,
      root: '',
      ore: 0,
      mine: { depth: 1, miners: 0, progress: 0 },
      counters: { techs: 0, mines: 0, sister: 0, pills: 0, breakthroughs: 0 },
      main: { index: 0 },
      side: { active: [] },
      sister: { favor: 0, interactions: 0, lastTalk: 0, lastTrip: 0 },
      autoBattle: true,
      breakthroughs: 0,
      failures: 0,
      clickCount: 0,
      playTime: 0,
      daily: { date: '', progress: {}, claimed: {} },
      sect: { id: '', rank: 0, contribution: 0 },
      records: { lifetime: 0, totalKills: 0, totalClicks: 0, totalBreakthroughs: 0, maxRealm: 0 },
      tutorialDone: false,
      log: [],
      lastTick: now(),
      createdAt: now()
    };
  }

  function addLog(text, tone) {
    state.log.unshift({ t: now(), text: text, tone: tone || '' });
    if (state.log.length > 60) state.log.length = 60;
    renderLog();
    renderMiniLog();
  }

  /* ---------------- 存档 ---------------- */

  function save() {
    state.lastTick = now();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      ui.saveHint.textContent = '已存档 · ' + new Date().toLocaleTimeString('zh-CN');
    } catch (e) {
      ui.saveHint.textContent = '存档失败（浏览器限制）';
    }
  }

  function load() {
    var raw = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { raw = null; }
    if (!raw) { state = defaultState(); return null; }
    try {
      var data = JSON.parse(raw);
      state = Object.assign(defaultState(), data);
      state.buffs = Object.assign({ breakBonus: 0, qiMult: 0, critBoost: 0 }, data.buffs || {});
      state.pills = Object.assign({ 'qi-pill': 0, 'break-pill': 0, 'spirit-pill': 0 }, data.pills || {});
      state.sect = Object.assign({ id: '', rank: 0, contribution: 0 }, data.sect || {});
      state.daily = Object.assign({ date: '', progress: {}, claimed: {} }, data.daily || {});
      state.records = Object.assign(
        { lifetime: 0, totalKills: 0, totalClicks: 0, totalBreakthroughs: 0, maxRealm: 0 },
        data.records || {}
      );
      state.equipment = Object.assign({}, data.equipment || {});
      state.mine = Object.assign({ depth: 1, miners: 0, progress: 0 }, data.mine || {});
      state.counters = Object.assign(
        { techs: 0, mines: 0, sister: 0, pills: 0, breakthroughs: 0 },
        data.counters || {}
      );
      state.main = Object.assign({ index: 0 }, data.main || {});
      state.side = Object.assign({ active: [] }, data.side || {});
      state.sister = Object.assign(
        { favor: 0, interactions: 0, lastTalk: 0, lastTrip: 0 },
        data.sister || {}
      );
      state.outfits = Array.isArray(data.outfits) && data.outfits.length ? data.outfits : ['dao'];
      state.pets = Array.isArray(data.pets) ? data.pets : [];
      if (state.outfits.indexOf('dao') < 0) state.outfits.unshift('dao');
      if (OUTFITS.every(function (item) { return item.id !== state.outfit; })) state.outfit = 'dao';
    } catch (e) {
      state = defaultState();
      return null;
    }
    var elapsed = Math.max(0, (now() - (state.lastTick || now())) / 1000);
    var capped = Math.min(elapsed, OFFLINE_CAP_HOURS * 3600);
    if (capped < 30) return null;
    var rate = offlineRate();
    var gainQi = qiPerSec() * capped * rate;
    var gainStones = stonesPerSec() * capped * rate;
    state.qi += gainQi;
    state.stones += gainStones;
    return {
      seconds: capped,
      qi: gainQi,
      stones: gainStones
    };
  }

  /* ---------------- 音效 ---------------- */

  function playSound(key) {
    if (!audio.enabled) return;
    var src = SOUNDS[key];
    if (!src) return;
    try {
      if (!audio.cache[key]) {
        var a = new Audio(src);
        a.preload = 'auto';
        a.volume = key === 'thunder' ? 0.5 : 0.35;
        audio.cache[key] = a;
      }
      var node = audio.cache[key];
      node.currentTime = 0;
      var p = node.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) { /* 音效缺失时静默降级 */ }
  }

  function startMusic() {
    if (!audio.enabled || audio.musicStarted) return;
    audio.musicStarted = true;
    try {
      var track = new Audio(MUSIC_SRC);
      track.loop = true;
      track.volume = 0.28;
      audio.music = track;
      var p = track.play();
      if (p && p.catch) p.catch(function () { audio.musicStarted = false; });
    } catch (e) { audio.musicStarted = false; }
  }

  function setAudioEnabled(enabled) {
    audio.enabled = enabled;
    if (audio.music) {
      try {
        if (enabled) { audio.music.play().catch(function () {}); }
        else { audio.music.pause(); }
      } catch (e) { /* ignore */ }
    }
    ui.soundToggle.classList.toggle('off', !enabled);
    ui.soundToggle.textContent = enabled ? '♪' : '×';
  }

  /* ---------------- 渲染 ---------------- */

  function applyRealmArt() {
    var src = state.realm >= 3 ? 'assets/bg_cloudpeak.png' : 'assets/bg_mountain.png';
    if (ui.bgImage.getAttribute('src') !== src) {
      ui.bgImage.setAttribute('src', src);
    }
    var beastSrc = state.realm >= 3 ? 'assets/beast_alt.png' : 'assets/beast.png';
    if (ui.beastImage.getAttribute('src') !== beastSrc) {
      ui.beastImage.setAttribute('src', beastSrc);
    }
  }

  function setupHeroAnimation() {
    var candidates = ['assets/hero_idle.webp', 'assets/hero_idle.gif'];
    var index = 0;
    function tryNext() {
      if (index >= candidates.length) return;
      var probe = new Image();
      probe.onload = function () {
        heroAnimReady = candidates[index] === HERO_ANIM;
        applyHeroArt();
        var attackProbe = new Image();
        attackProbe.onload = function () { heroAttackReady = true; };
        attackProbe.src = HERO_ATTACK;
      };
      probe.onerror = function () { index++; tryNext(); };
      probe.src = candidates[index];
    }
    tryNext();
  }

  function applyHeroArt() {
    if (!ui.heroImage) return;
    var outfit = currentOutfit();
    if (outfit.id === 'dao' && heroAnimReady) {
      ui.heroImage.setAttribute('src', HERO_ANIM);
    } else {
      ui.heroImage.setAttribute('src', outfit.file);
    }
  }

  function playAttackFx() {
    if (state.outfit === 'dao' && heroAttackReady) {
      ui.heroImage.setAttribute('src', HERO_ATTACK);
      if (attackFrameTimer) clearTimeout(attackFrameTimer);
      attackFrameTimer = setTimeout(applyHeroArt, 820);
    } else {
      ui.heroImage.classList.remove('attack');
      void ui.heroImage.offsetWidth;
      ui.heroImage.classList.add('attack');
      setTimeout(function () { ui.heroImage.classList.remove('attack'); }, 360);
    }
    ui.slashFx.classList.remove('on');
    void ui.slashFx.offsetWidth;
    ui.slashFx.classList.add('on');
  }

  function spawnSparks(container, x, y, count, spread) {
    if (!container) return;
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'spark';
      var angle = Math.random() * Math.PI * 2;
      var dist = (spread || 46) * (0.5 + Math.random());
      el.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      el.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(1) + 'px');
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      container.appendChild(el);
      (function (node) { setTimeout(function () { node.remove(); }, 760); })(el);
    }
  }

  function spawnDamageNumber(text, crit, slot) {
    if (!ui.dmgLayer) return;
    var el = document.createElement('div');
    el.className = 'float-text ' + (crit ? 'crit' : 'hurt-num');
    el.textContent = text;
    var rect = ui.dmgLayer.getBoundingClientRect();
    var index = slot || 0;
    el.style.left = (rect.width * 0.5 + (index % 3) * 34 - 34 + Math.random() * 12) + 'px';
    el.style.top = (rect.height * 0.14 + (index % 4) * 21 + Math.random() * 8) + 'px';
    ui.dmgLayer.appendChild(el);
    setTimeout(function () { el.remove(); }, 1100);
  }

  function spawnRipple(x, y) {
    if (!ui.fxLayer) return;
    var el = document.createElement('div');
    el.className = 'ripple';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    ui.fxLayer.appendChild(el);
    setTimeout(function () { el.remove(); }, 800);
  }

  function levelUpSweep() {
    if (!ui.stage) return;
    var el = document.createElement('div');
    el.className = 'levelup-sweep';
    ui.stage.appendChild(el);
    setTimeout(function () { el.remove(); }, 900);
  }

  function renderTop() {
    var r = realm();
    applyRealmArt();
    ui.realmName.textContent = r.name;
    ui.realmLayer.textContent = (LAYER_NAMES[state.layer - 1] || String(state.layer)) + '层';
    ui.qiValue.textContent = fmt(display.ready ? display.qi : state.qi);
    ui.stoneValue.textContent = fmt(display.ready ? display.stones : state.stones);
  }

  function renderProgress() {
    var req = layerRequirement();
    var pct = Math.max(0, Math.min(100, (state.xiuwei / req) * 100));
    ui.progressFill.style.width = pct.toFixed(1) + '%';
    ui.progressValue.textContent = fmt(display.ready ? display.xiuwei : state.xiuwei) + ' / ' + fmt(req);
    ui.progressLabel.textContent = state.layer >= realm().layers ? '修为圆满 · 可渡雷劫' : '修为';
    ui.qiRate.textContent = '灵气 ' + qiPerSec().toFixed(1) + ' / 秒';
    ui.stoneRate.textContent = '灵石 ' + stonesPerSec().toFixed(1) + ' / 秒';
    ui.cultivateGain.textContent = '+' + fmt(clickGain()) + ' 灵气';

    var full = state.layer >= realm().layers && state.xiuwei >= req;
    ui.breakthroughBtn.classList.toggle('hidden', !full);
    ui.progressFill.classList.toggle('full', state.layer >= realm().layers && state.xiuwei >= req * 0.999);
    if (full) {
      ui.btChance.textContent = '成功率 ' + breakthroughChance().toFixed(0) + '%';
      ui.breakthroughBtn.querySelector('.bt-text').textContent =
        state.realm >= REALMS.length - 1 ? '飞升在即' : '突破 · 渡雷劫';
    }
  }

  function renderBattle() {
    var b = beastForState();
    if (!state.beastHp || state.beastHp > b.maxHp) state.beastHp = b.maxHp;
    ui.beastName.textContent = b.name;
    ui.beastHpText.textContent = fmt(state.beastHp) + ' / ' + fmt(b.maxHp);
    ui.beastHpFill.style.width = ((state.beastHp / b.maxHp) * 100).toFixed(1) + '%';
    ui.beastImage.classList.toggle('boss', !!b.boss);
    ui.bossTag.classList.toggle('hidden', !b.boss);
    ui.attackPower.textContent = '剑意 ' + attackPower()
      + ' · ' + hitCount() + ' 段 · 暴击 ' + Math.round(critChance() * 100) + '%';
    if (b.boss) {
      ui.battleLog.textContent = '妖王现身，血量与奖励都是寻常妖兽的数倍。';
    }
    ui.autoBtn.textContent = '自动：' + (state.autoBattle && techLevel('heart') > 0 ? '开' : '关');
    ui.autoBtn.classList.toggle('on', state.autoBattle && techLevel('heart') > 0);
  }

  function renderAchievements() {
    if (!ui.achList) return;
    ui.achList.innerHTML = ACHIEVEMENTS.map(function (item) {
      var owned = state.achievements.indexOf(item.id) >= 0;
      return '<span class="' + (owned ? 'owned' : '') + '" title="' + item.desc + '">'
        + (owned ? '★ ' : '☆ ') + item.name
        + '<em>' + achBonusText(item) + '</em></span>';
    }).join('');
    if (ui.achCount) {
      ui.achCount.textContent = '已解锁 ' + state.achievements.length + ' / ' + ACHIEVEMENTS.length;
    }
  }

  function renderSkills() {
    var previous = {};
    Array.prototype.forEach.call(ui.skillList.querySelectorAll('.card'), function (card) {
      previous[card.dataset.id] = card.querySelector('.card-title .lv').textContent;
    });
    ui.skillList.innerHTML = '';
    TECHS.forEach(function (tech) {
      var lv = techLevel(tech.id);
      var cost = techCost(tech, lv);
      var card = document.createElement('div');
      card.className = 'card';
      card.dataset.id = tech.id;
      var canBuy = state.stones >= cost;
      card.innerHTML =
        '<img src="assets/icons/' + tech.icon + '" alt="" onerror="this.style.display=\'none\'" />' +
        '<div class="card-body">' +
          '<div class="card-title"><span>' + tech.name + '</span><span class="lv">' + lv + ' 层</span></div>' +
          '<div class="card-desc">' + tech.desc + '</div>' +
          '<div class="card-foot">' +
            '<span class="cost' + (canBuy ? '' : ' short') + '">灵石 ' + fmt(cost) + ' · 当前 ' + tech.effect(lv) + '</span>' +
            '<button data-need-stones="' + cost + '"' + (canBuy ? '' : 'disabled') + '>参悟</button>' +
          '</div>' +
        '</div>';
      card.querySelector('button').addEventListener('click', function () { upgradeTech(tech.id); });
      ui.skillList.appendChild(card);
    });
  }

  function renderPills() {
    ui.pillList.innerHTML = '';
    PILLS.forEach(function (pill) {
      var cost = pillCostOf(pill);
      var canBuy = state.stones >= cost.stones && state.qi >= cost.qi;
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<img src="assets/icons/' + pill.icon + '" alt="" onerror="this.style.display=\'none\'" />' +
        '<div class="card-body">' +
          '<div class="card-title"><span>' + pill.name + '</span><span class="lv">存量 ' + (state.pills[pill.id] || 0) + '</span></div>' +
          '<div class="card-desc">' + pill.desc + '</div>' +
          '<div class="card-foot">' +
            '<span class="cost' + (canBuy ? '' : ' short') + '">灵石 ' + fmt(cost.stones) + ' · 灵气 ' + fmt(cost.qi) + '</span>' +
            '<button data-need-stones="' + cost.stones + '" data-need-qi="' + cost.qi + '"' + (canBuy ? '' : 'disabled') + '>炼制</button>' +
          '</div>' +
          '<div class="card-foot" style="margin-top:6px">' +
            '<span class="cost">' + (pill.id === 'break-pill'
              ? '当前雷劫加成 +' + state.buffs.breakBonus + '%'
              : pill.id === 'spirit-pill'
                ? (state.buffs.qiMult > 0 ? '双倍灵气进行中' : '未服用')
                : '即刻获得灵气') + '</span>' +
            '<button class="use" ' + ((state.pills[pill.id] || 0) > 0 ? '' : 'disabled') + '>服用</button>' +
          '</div>' +
        '</div>';
      card.querySelector('button').addEventListener('click', function () { craftPill(pill.id); });
      card.querySelector('button.use').addEventListener('click', function () { usePill(pill.id); });
      ui.pillList.appendChild(card);
    });
  }

  function renderStats() {
    var minutes = Math.floor(state.playTime / 60);
    var sectLabel = state.sect.id
      ? (SECTS.filter(function (s) { return s.id === state.sect.id; })[0].name + ' · ' + SECT_RANKS[state.sect.rank].name)
      : '尚未入宗';
    ui.statsBox.innerHTML =
      '<div>境界 <b>' + realm().name + (LAYER_NAMES[state.layer - 1] || state.layer) + '层</b></div>' +
      '<div>道行 <b>' + fmt(state.records.lifetime) + '</b></div>' +
      '<div>灵根 <b>' + (currentRoot() ? currentRoot().name : '未测') + '</b></div>' +
      '<div>宗门 <b>' + sectLabel + '</b></div>' +
      '<div>贡献 <b>' + fmt(state.sect.contribution) + '</b></div>' +
      '<div>灵矿 <b>' + fmt(state.ore) + '</b></div>' +
      '<div>矿脉 <b>第 ' + state.mine.depth + ' 层 · 矿工 ' + state.mine.miners + '</b></div>' +
      '<div>突破 <b>' + state.breakthroughs + ' 次</b></div>' +
      '<div>斩妖 <b>' + state.records.totalKills + ' 只</b></div>' +
      '<div>打坐 <b>' + state.records.totalClicks + ' 次</b></div>' +
      '<div>雷劫失手 <b>' + state.failures + ' 次</b></div>' +
      '<div>修行时长 <b>' + minutes + ' 分钟</b></div>';
  }

  function renderDaily() {
    var claimedCount = DAILY_QUESTS.filter(function (q) { return state.daily.claimed[q.id]; }).length;
    ui.dailyDate.textContent = state.daily.date;
    ui.dailyProgress.textContent = '已领 ' + claimedCount + ' / ' + DAILY_QUESTS.length;
    ui.questList.innerHTML = '';
    DAILY_QUESTS.forEach(function (quest) {
      var progress = Math.min(quest.goal, state.daily.progress[quest.id] || 0);
      var claimed = !!state.daily.claimed[quest.id];
      var ready = progress >= quest.goal && !claimed;
      var rewardText = '灵石 ' + fmt(quest.stones);
      Object.keys(quest.pills).forEach(function (pillId) {
        var pill = PILLS.filter(function (p) { return p.id === pillId; })[0];
        rewardText += ' · ' + (pill ? pill.name : pillId) + ' ×' + quest.pills[pillId];
      });
      var card = document.createElement('div');
      card.className = 'card quest' + (claimed ? ' done' : '');
      card.innerHTML =
        '<div class="card-body">' +
          '<div class="card-title"><span>' + quest.name + '</span><span class="lv">' +
            (claimed ? '已领' : progress + ' / ' + quest.goal) + '</span></div>' +
          '<div class="card-desc">' + quest.desc + ' · 奖励 ' + rewardText + '</div>' +
          '<div class="quest-bar"><i style="width:' + ((progress / quest.goal) * 100).toFixed(1) + '%"></i></div>' +
          '<div class="card-foot">' +
            '<span class="cost">' + (claimed ? '明日再来' : (ready ? '可领取' : '进行中')) + '</span>' +
            '<button class="claim" ' + (ready ? '' : 'disabled') + '>领取</button>' +
          '</div>' +
        '</div>';
      card.querySelector('button').addEventListener('click', function () { claimQuest(quest.id); });
      ui.questList.appendChild(card);
    });
  }

  function claimQuest(id) {
    var quest = DAILY_QUESTS.filter(function (q) { return q.id === id; })[0];
    var progress = state.daily.progress[id] || 0;
    if (!quest || progress < quest.goal || state.daily.claimed[id]) return;
    state.daily.claimed[id] = true;
    if (DAILY_QUESTS.every(function (q) { return state.daily.claimed[q.id]; })) {
      state.dailyDone = true;
    }
    state.stones += quest.stones;
    Object.keys(quest.pills).forEach(function (pillId) {
      state.pills[pillId] = (state.pills[pillId] || 0) + quest.pills[pillId];
    });
    playSound('win');
    addLog('完成日课「' + quest.name + '」，得灵石 ' + fmt(quest.stones) + '。', 'good');
    toast('日课完成 · ' + quest.name);
    renderDaily();
    renderPills();
    renderTop();
  }

  function renderSect() {
    if (!state.sect.id) {
      ui.sectCard.innerHTML =
        '<h3>尚未入宗</h3>' +
        '<div class="motto">择一门派，可得长久加护；贡献可换职位。</div>' +
        '<div class="sect-choice"></div>';
      var wrap = ui.sectCard.querySelector('.sect-choice');
      SECTS.forEach(function (sect) {
        var button = document.createElement('button');
        button.innerHTML = sect.name + '<span>' + sect.motto + ' · ' + sect.perk + '</span>';
        button.addEventListener('click', function () { joinSect(sect.id); });
        wrap.appendChild(button);
      });
      return;
    }
    var sect = SECTS.filter(function (s) { return s.id === state.sect.id; })[0];
    var rank = SECT_RANKS[state.sect.rank];
    var next = SECT_RANKS[state.sect.rank + 1];
    var canRank = next && state.sect.contribution >= next.cost;
    ui.sectCard.innerHTML =
      '<h3>' + sect.name + ' · ' + rank.name + '</h3>' +
      '<div class="motto">' + sect.motto + '</div>' +
      '<div class="sect-meta">' +
        '宗门加护：<b>' + sect.perk + '</b><br>' +
        '职位加护：<b>' + rank.perk + '</b><br>' +
        '宗门贡献：<b>' + fmt(state.sect.contribution) + '</b><br>' +
        (next ? '下个职位：<b>' + next.name + '</b>（需贡献 ' + fmt(next.cost) + '）' : '已登宗主之位') +
      '</div>' +
      '<div class="sect-actions">' +
        '<button class="btn primary" id="rankUpBtn" ' + (canRank ? '' : 'disabled') + '>晋升职位</button>' +
        '<button class="btn ghost" id="leaveSectBtn">脱离宗门</button>' +
      '</div>';
    ui.sectCard.querySelector('#rankUpBtn').addEventListener('click', promoteSect);
    ui.sectCard.querySelector('#leaveSectBtn').addEventListener('click', leaveSect);
  }

  function joinSect(id) {
    var sect = SECTS.filter(function (s) { return s.id === id; })[0];
    if (!sect) return;
    state.sect = { id: id, rank: 0, contribution: state.sect.contribution || 0 };
    playSound('levelup');
    addLog('你拜入【' + sect.name + '】，得加护：' + sect.perk + '。', 'good');
    toast('已入 ' + sect.name);
    renderSect();
    renderStats();
    renderProgress();
    renderBattle();
  }

  function promoteSect() {
    var next = SECT_RANKS[state.sect.rank + 1];
    if (!next || state.sect.contribution < next.cost) return;
    state.sect.contribution -= next.cost;
    state.sect.rank++;
    playSound('levelup');
    addLog('宗门晋升，你成为【' + SECT_RANKS[state.sect.rank].name + '】。', 'good');
    toast('晋升 · ' + SECT_RANKS[state.sect.rank].name);
    renderSect();
    renderStats();
    renderProgress();
    renderBattle();
  }

  function leaveSect() {
    if (!confirm('脱离宗门将失去职位与全部贡献，确定吗？')) return;
    var oldName = SECTS.filter(function (s) { return s.id === state.sect.id; })[0].name;
    state.sect = { id: '', rank: 0, contribution: 0 };
    addLog('你离开了【' + oldName + '】，贡献与职位尽数散尽。', 'warn');
    renderSect();
    renderStats();
    renderProgress();
    renderBattle();
  }

  function renderRank() {
    var days = Math.max(0, (now() - state.createdAt) / 86400000);
    var rows = RIVALS.map(function (rival) {
      return { name: rival.name, score: Math.floor(rival.base * Math.pow(1 + rival.rate, days)) };
    });
    var mine = { name: '你', score: Math.floor(playerScore()), me: true };
    rows.push(mine);
    rows.sort(function (a, b) { return b.score - a.score; });
    var myRank = rows.indexOf(mine) + 1;
    var html = rows.slice(0, 8).map(function (row, index) {
      return '<div class="rank-row' + (row.me ? ' me' : '') + '">' +
        '<span class="rk">' + (index + 1) + '</span>' +
        '<span class="nm">' + row.name + '</span>' +
        '<span class="sc">' + fmt(row.score) + '</span></div>';
    }).join('');
    if (myRank > 8) {
      html += '<div class="rank-row"><span class="rk">…</span><span class="nm">…</span><span class="sc">…</span></div>';
      html += '<div class="rank-row me"><span class="rk">' + myRank + '</span>' +
        '<span class="nm">你</span><span class="sc">' + fmt(mine.score) + '</span></div>';
    }
    ui.rankList.innerHTML = html;
    ui.rankNote.textContent = '你目前位列第 ' + myRank + ' / ' + rows.length +
      ' 位。榜单为本地推演：众修士的道行随天数增长，道行即累计修为。';
  }

  function renderLog() {
    ui.logBox.innerHTML = state.log.map(function (entry) {
      var time = new Date(entry.t).toLocaleTimeString('zh-CN', { hour12: false });
      return '<div class="' + entry.tone + '">[' + time + '] ' + entry.text + '</div>';
    }).join('');
  }

  function renderLadder() {
    ui.realmLadder.innerHTML = REALMS.map(function (item, index) {
      var cls = index === state.realm ? 'current' : (index < state.realm ? 'done' : '');
      return '<span class="' + cls + '">' + item.name + '</span>';
    }).join('');
  }

  function renderMiniLog() {
    ui.miniLog.innerHTML = state.log.slice(0, 5).map(function (entry) {
      var time = new Date(entry.t).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
      return '<div class="' + entry.tone + '">' + time + ' · ' + entry.text + '</div>';
    }).join('');
  }

  function toast(text) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    ui.toastLayer.appendChild(el);
    setTimeout(function () { el.remove(); }, 2000);
  }

  function floatText(x, y, text, color) {
    var el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    if (color) el.style.color = color;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    ui.floatLayer.appendChild(el);
    setTimeout(function () { el.remove(); }, 1100);
  }

  function spawnParticle() {
    var el = document.createElement('div');
    el.className = 'particle';
    el.style.left = (20 + Math.random() * 60) + '%';
    el.style.bottom = (20 + Math.random() * 40) + '%';
    el.style.animationDuration = (2.6 + Math.random() * 1.8) + 's';
    ui.particles.appendChild(el);
    setTimeout(function () { el.remove(); }, 4600);
  }

  function showModal(title, body, choices) {
    ui.modalTitle.textContent = title;
    ui.modalBody.textContent = body;
    ui.modalChoices.innerHTML = '';
    if (choices && choices.length) {
      ui.modalChoices.classList.remove('hidden');
      ui.modalOk.classList.add('hidden');
      choices.forEach(function (choice) {
        var button = document.createElement('button');
        button.innerHTML = '<strong>' + choice.label + '</strong>';
        button.addEventListener('click', function () {
          var result = choice.run();
          ui.modal.classList.add('hidden');
          if (result) {
            toast(result);
            addLog(result, 'warn');
          }
          checkLayerUp();
          renderAll();
          save();
        });
        ui.modalChoices.appendChild(button);
      });
    } else {
      ui.modalChoices.classList.add('hidden');
      ui.modalOk.classList.remove('hidden');
    }
    ui.modal.classList.remove('hidden');
  }

  /* ---------------- 随机事件与道号 ---------------- */

  var eventTimer = 0;
  var eventCooldown = 70;

  function scheduleEvent() {
    eventCooldown = 80 + Math.random() * 70;
  }

  function maybeTriggerEvent(dt) {
    eventTimer += dt;
    if (eventTimer < eventCooldown) return;
    if (tut.active || !ui.modal.classList.contains('hidden')) {
      eventTimer = eventCooldown - 10;
      return;
    }
    eventTimer = 0;
    scheduleEvent();
    var event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    var lines = event.choices.map(function (choice, index) {
      return (index + 1) + '. ' + choice.label + ' —— ' + (choice.hint || '');
    }).join('\n');
    showModal('【' + event.tag + '】' + event.title, event.text + '\n\n' + lines, event.choices);
  }

  function achBonusText(item) {
    var parts = [];
    if (item.qi) parts.push('灵气 +' + Math.round(item.qi * 100) + '%');
    if (item.atk) parts.push('剑意 +' + Math.round(item.atk * 100) + '%');
    return parts.join('、') || '无加成';
  }

  function showAchBanner(item) {
    if (!ui.achLayer) return;
    var el = document.createElement('div');
    el.className = 'ach-banner';
    el.innerHTML =
      '<img src="assets/icons/icon_chest.png" alt="" onerror="this.style.display=\'none\'" />' +
      '<div class="ach-body">' +
        '<span class="ach-kicker">解锁道号</span>' +
        '<span class="ach-name">' + item.name + '</span>' +
        '<span class="ach-bonus">' + achBonusText(item) + '</span>' +
      '</div>';
    ui.achLayer.appendChild(el);
    setTimeout(function () { el.remove(); }, 4800);
  }

  function checkAchievements() {
    var unlocked = false;
    ACHIEVEMENTS.forEach(function (item) {
      if (state.achievements.indexOf(item.id) >= 0) return;
      if (!item.check()) return;
      state.achievements.push(item.id);
      unlocked = true;
      showAchBanner(item);
      addLog('解锁道号「' + item.name + '」（' + achBonusText(item) + '）。', 'good');
      playSound('levelup');
    });
    if (unlocked) {
      renderAchievements();
      renderProgress();
      renderBattle();
      renderStats();
      save();
    }
  }

  /* ---------------- 衣冠：服装 / 法宝 / 灵宠 ---------------- */

  function outfitBonusText(outfit) {
    var parts = [];
    if (outfit.qi) parts.push('灵气 +' + Math.round(outfit.qi * 100) + '%');
    if (outfit.atk) parts.push('剑意 +' + Math.round(outfit.atk * 100) + '%');
    if (outfit.crit) parts.push('暴击 +' + Math.round(outfit.crit * 100) + '%');
    if (outfit.pill) parts.push('丹药效果 +' + Math.round(outfit.pill * 100) + '%');
    return parts.length ? parts.join('、') : '无属性加成';
  }

  function outfitUnlockText(outfit) {
    var unlock = outfit.unlock;
    if (unlock.type === 'default') return '初始装扮';
    if (unlock.type === 'stones') return fmt(unlock.value) + ' 灵石';
    if (unlock.type === 'realm') return REALMS[unlock.value].name + '境';
    if (unlock.type === 'boss') return '斩妖王 ' + unlock.value + ' 位';
    return '';
  }

  function unlockOutfit(id) {
    var outfit = OUTFITS.filter(function (item) { return item.id === id; })[0];
    if (!outfit || state.outfits.indexOf(id) >= 0) return;
    var unlock = outfit.unlock;
    if (unlock.type === 'stones') {
      if (state.stones < unlock.value) { toast('灵石不足'); return; }
      state.stones -= unlock.value;
    } else if (unlock.type === 'realm') {
      if (state.realm < unlock.value) { toast('需 ' + REALMS[unlock.value].name + ' 境'); return; }
    } else if (unlock.type === 'boss') {
      if (state.bossKills < unlock.value) { toast('需斩 ' + unlock.value + ' 位妖王'); return; }
    } else {
      return;
    }
    state.outfits.push(id);
    playSound('win');
    addLog('得【' + outfit.name + '】（' + outfit.rarity + '）：' + outfitBonusText(outfit) + '。', 'good');
    toast('获得 ' + outfit.name);
    renderOutfit();
    renderStats();
  }

  function wearOutfit(id) {
    if (state.outfits.indexOf(id) < 0) { toast('尚未拥有'); return; }
    if (state.outfit === id) return;
    state.outfit = id;
    playSound('levelup');
    addLog('换上【' + currentOutfit().name + '】。', 'good');
    flashHero();
    applyHeroArt();
    renderOutfit();
    renderProgress();
    renderBattle();
    renderStats();
    save();
  }

  function flashHero() {
    if (!ui.heroImage) return;
    ui.heroImage.classList.remove('switching');
    void ui.heroImage.offsetWidth;
    ui.heroImage.classList.add('switching');
    setTimeout(function () { ui.heroImage.classList.remove('switching'); }, 650);
  }

  function outfitCard(outfit) {
    var owned = state.outfits.indexOf(outfit.id) >= 0;
    var equipped = state.outfit === outfit.id;
    var card = document.createElement('div');
    card.className = 'outfit-card' + (owned ? ' owned' : ' locked') + (equipped ? ' equipped' : '');
    card.innerHTML =
      '<img src="' + outfit.file + '" alt="" onerror="this.style.display=\'none\'" />' +
      '<span class="name">' + outfit.name + '</span>' +
      '<span class="tagline">' + (equipped ? '已穿戴' : (owned ? '点击穿戴' : outfitUnlockText(outfit))) + '</span>';
    card.addEventListener('click', function () {
      if (equipped) { toast('已经穿着了'); return; }
      if (owned) wearOutfit(outfit.id);
      else unlockOutfit(outfit.id);
      renderOutfit();
      renderWardrobe();
    });
    return card;
  }

  function renderOutfit() {
    if (!ui.outfitCurrent) return;
    var outfit = currentOutfit();
    var gear = gearBonus();
    ui.gearBonusText.textContent = '总加成 灵气 +' + Math.round(gear.qi * 100) + '% · 剑意 +'
      + Math.round(gear.atk * 100) + '% · 暴击 +' + Math.round(gear.crit * 100) + '%';
    ui.outfitCurrent.innerHTML =
      '<img src="' + outfit.file + '" alt="" onerror="this.style.display=\'none\'" />' +
      '<div class="oc-body">' +
        '<h3>' + outfit.name + '</h3>' +
        '<span class="rarity">' + outfit.rarity + '</span>' +
        '<p>' + outfit.desc + '</p>' +
        '<div class="bonus">' + outfitBonusText(outfit) + '</div>' +
      '</div>';
    ui.outfitCount.textContent = state.outfits.length + ' / ' + OUTFITS.length;
    ui.outfitGrid.innerHTML = '';
    OUTFITS.forEach(function (item) { ui.outfitGrid.appendChild(outfitCard(item)); });
  }

  function renderWardrobe() {
    if (!ui.wardrobeGrid) return;
    ui.wardrobeGrid.innerHTML = '';
    OUTFITS.forEach(function (item) { ui.wardrobeGrid.appendChild(outfitCard(item)); });
  }

  function buyEquipment(slotId, itemId) {
    var slot = EQUIP_SLOTS.filter(function (entry) { return entry.id === slotId; })[0];
    if (!slot) return;
    var item = slot.items.filter(function (entry) { return entry.id === itemId; })[0];
    if (!item || state.equipment[slotId] === itemId) return;
    if (state.stones < item.cost) { toast('灵石不足'); return; }
    state.stones -= item.cost;
    state.equipment[slotId] = itemId;
    playSound('win');
    addLog('祭炼【' + item.name + '】（' + item.desc + '）。', 'good');
    toast('已佩戴 ' + item.name);
    renderEquipment();
    renderOutfit();
    renderProgress();
    renderBattle();
    renderTop();
    save();
  }

  function renderEquipment() {
    if (!ui.equipList) return;
    ui.equipList.innerHTML = '';
    EQUIP_SLOTS.forEach(function (slot) {
      var currentId = state.equipment[slot.id];
      var current = slot.items.filter(function (item) { return item.id === currentId; })[0];
      var card = document.createElement('div');
      card.className = 'card equip-card';
      var lines = slot.items.map(function (item) {
        var has = currentId === item.id;
        return '<span class="' + (has ? 'has' : '') + '">' + item.name + ' · ' + item.desc + ' · ' + fmt(item.cost) + '</span>';
      }).join('');
      var buttons = slot.items.map(function (item) {
        var has = currentId === item.id;
        var can = state.stones >= item.cost;
        return '<button data-slot="' + slot.id + '" data-item="' + item.id + '" data-need-stones="' + item.cost + '"' +
          (has ? ' data-locked="1"' : '') +
          (has || !can ? ' disabled' : '') + '>' + (has ? '已佩戴' : '祭炼 ' + fmt(item.cost)) + '</button>';
      }).join('');
      card.innerHTML =
        '<img src="assets/icons/' + slot.icon + '" alt="" onerror="this.style.display=\'none\'" />' +
        '<div class="card-body">' +
          '<div class="card-title"><span>' + slot.name + '</span><span class="lv">' +
            (current ? current.name : '未佩戴') + '</span></div>' +
          '<div class="equip-lines">' + lines + '</div>' +
          '<div class="equip-btns">' + buttons + '</div>' +
        '</div>';
      Array.prototype.forEach.call(card.querySelectorAll('button'), function (button) {
        button.addEventListener('click', function () {
          buyEquipment(button.getAttribute('data-slot'), button.getAttribute('data-item'));
        });
      });
      ui.equipList.appendChild(card);
    });
  }

  function petBonusText(pet) {
    var parts = [];
    if (pet.qi) parts.push('灵气 +' + Math.round(pet.qi * 100) + '%');
    if (pet.atk) parts.push('剑意 +' + Math.round(pet.atk * 100) + '%');
    if (pet.offline) parts.push('离线 +' + Math.round(pet.offline * 100) + '%');
    if (pet.breakthrough) parts.push('渡劫 +' + pet.breakthrough + '%');
    if (pet.auto) parts.push('每 ' + (pet.auto / 1000).toFixed(1) + ' 秒助战');
    return parts.join('、');
  }

  function unlockPet(id) {
    var pet = PETS.filter(function (item) { return item.id === id; })[0];
    if (!pet || state.pets.indexOf(id) >= 0) return;
    var unlock = pet.unlock;
    if (unlock.type === 'stones') {
      if (state.stones < unlock.value) { toast('灵石不足'); return; }
      state.stones -= unlock.value;
    } else if (unlock.type === 'boss') {
      if (state.bossKills < unlock.value) { toast('需斩 ' + unlock.value + ' 位妖王'); return; }
    } else {
      return;
    }
    state.pets.push(id);
    state.pet = id;
    playSound('win');
    addLog('收服灵宠【' + pet.name + '】：' + petBonusText(pet) + '。', 'good');
    toast('收服 ' + pet.name);
    renderPets();
    renderOutfit();
    renderProgress();
    renderBattle();
    save();
  }

  function selectPet(id) {
    if (state.pets.indexOf(id) < 0) { unlockPet(id); return; }
    state.pet = state.pet === id ? '' : id;
    playSound('click');
    addLog(state.pet === id ? '唤出灵宠【' + currentPet().name + '】。' : '让灵宠回洞府休息。', 'warn');
    renderPets();
    renderOutfit();
    renderProgress();
    renderBattle();
    save();
  }

  function renderPets() {
    if (!ui.petList) return;
    ui.petList.innerHTML = '';
    PETS.forEach(function (pet) {
      var owned = state.pets.indexOf(pet.id) >= 0;
      var active = state.pet === pet.id;
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<img src="assets/icons/' + pet.icon + '" alt="" onerror="this.style.display=\'none\'" />' +
        '<div class="card-body">' +
          '<div class="card-title"><span>' + pet.name + '</span><span class="lv">' + pet.rarity + '</span></div>' +
          '<div class="card-desc">' + pet.desc + '　' + petBonusText(pet) + '</div>' +
          '<div class="card-foot">' +
            '<span class="cost">' + (owned ? (active ? '出战中' : '待命') : outfitUnlockText(pet)) + '</span>' +
            '<button ' + (!owned && pet.unlock.type === 'stones' && state.stones < pet.unlock.value ? 'disabled' : '') + '>' +
            (owned ? (active ? '收起' : '出战') : '收服') + '</button>' +
          '</div>' +
        '</div>';
      card.querySelector('button').addEventListener('click', function () {
        if (owned) selectPet(pet.id);
        else unlockPet(pet.id);
      });
      ui.petList.appendChild(card);
    });
  }

  /* ---------------- 天象与昼夜 ---------------- */

  function applyWeatherVisual() {
    if (!ui.weatherLayer || !ui.app) return;
    ui.app.classList.toggle('night', !!state.isNight);
    ui.weatherLayer.innerHTML = '';
    if (state.weather === 'rain') {
      var rain = document.createElement('div');
      rain.className = 'rain';
      ui.weatherLayer.appendChild(rain);
    } else if (state.weather === 'wind') {
      var wind = document.createElement('div');
      wind.className = 'wind';
      ui.weatherLayer.appendChild(wind);
    } else if (state.weather === 'storm') {
      var storm = document.createElement('div');
      storm.className = 'storm';
      ui.weatherLayer.appendChild(storm);
    }
    renderWeatherChip();
  }

  function renderWeatherChip() {
    if (!ui.weatherChip) return;
    var weather = currentWeather();
    ui.weatherChip.textContent = weather.name + ' · ' + (state.isNight ? '夜' : '昼');
    ui.weatherChip.title = weather.desc;
  }

  function rollWeather() {
    var pool = ['clear', 'rain', 'wind', 'storm', 'clear'];
    var next = pool[Math.floor(Math.random() * pool.length)];
    state.weather = next;
    var weather = currentWeather();
    applyWeatherVisual();
    if (next !== 'clear') {
      addLog('天象转为【' + weather.name + '】：' + weather.desc, 'warn');
      toast('天象 · ' + weather.name);
    }
    renderProgress();
  }

  function updateDayNight() {
    var hour = new Date().getHours();
    var night = hour >= 19 || hour < 6;
    if (night === state.isNight) return;
    state.isNight = night;
    applyWeatherVisual();
    renderProgress();
    if (night) addLog('日入月升，夜间灵气更盛（灵气 +10%）。', 'warn');
  }

  /* ---------------- 灵根 ---------------- */

  function rollRoot(forced) {
    var total = ROOTS.reduce(function (sum, root) { return sum + root.weight; }, 0);
    if (!forced) {
      var roll = Math.random() * total;
      var acc = 0;
      for (var i = 0; i < ROOTS.length; i++) {
        acc += ROOTS[i].weight;
        if (roll <= acc) return ROOTS[i].id;
      }
    }
    return ROOTS[Math.floor(Math.random() * ROOTS.length)].id;
  }

  function ensureRoot() {
    if (state.root && currentRoot()) return false;
    state.root = rollRoot();
    return true;
  }

  function rerollRootCost() {
    var times = state.counters.rerolls || 0;
    return Math.max(500, Math.floor(stonesPerSec() * (240 + times * 120)));
  }

  function rerollRoot() {
    var cost = rerollRootCost();
    if (state.stones < cost) { toast('灵石不足（需 ' + fmt(cost) + '）'); return; }
    state.stones -= cost;
    state.counters.rerolls = (state.counters.rerolls || 0) + 1;
    var before = currentRoot() ? currentRoot().name : '';
    state.root = rollRoot();
    var after = currentRoot().name;
    playSound('levelup');
    addLog('洗髓换根：' + before + ' → ' + after + '。', 'good');
    toast('换根 · ' + after);
    renderRoot();
    renderProgress();
    renderBattle();
    save();
  }

  function renderRoot() {
    if (!ui.rootCard) return;
    var root = currentRoot();
    if (!root) { ui.rootCard.innerHTML = ''; return; }
    var bonus = [];
    if (root.qi) bonus.push('灵气 +' + Math.round(root.qi * 100) + '%');
    if (root.atk) bonus.push('剑意 +' + Math.round(root.atk * 100) + '%');
    if (root.crit) bonus.push('暴击 +' + Math.round(root.crit * 100) + '%');
    if (root.stone) bonus.push('灵石 +' + Math.round(root.stone * 100) + '%');
    ui.rootCard.innerHTML =
      '<div class="root-line"><span class="root-name">' + root.name + '</span>' +
      '<span class="root-desc">' + root.desc + '</span></div>' +
      '<div class="root-bonus">' + (bonus.join('、') || '无加成') + '</div>' +
      '<div class="card-foot"><span class="cost">洗髓换根：灵石 ' + fmt(rerollRootCost()) + '</span>' +
      '<button id="rerollRootBtn" data-need-stones="' + rerollRootCost() + '"' +
      (state.stones >= rerollRootCost() ? '' : ' disabled') + '>换根</button></div>';
    var button = ui.rootCard.querySelector('#rerollRootBtn');
    if (button) button.addEventListener('click', rerollRoot);
  }

  /* ---------------- 挖矿 ---------------- */

  function mineYield() {
    return stonesPerSec() * (2.5 + state.mine.depth * 0.4);
  }

  function mineOnce(silent) {
    var stones = mineYield();
    state.stones += stones;
    state.counters.mines = (state.counters.mines || 0) + 1;
    var oreChance = Math.min(0.75, state.mine.depth * 0.05);
    var gotOre = 0;
    if (Math.random() < oreChance) {
      gotOre = 1 + Math.floor(Math.random() * (1 + Math.floor(state.mine.depth / 4)));
      state.ore += gotOre;
    }
    if (!silent && ui.stage) {
      var rect = ui.stage.getBoundingClientRect();
      playSound('click');
      spawnRipple(rect.width / 2, 170);
      floatText(rect.width / 2 - 46, 196, '+' + fmt(stones) + ' 灵石', '#f0d68a');
      if (gotOre) floatText(rect.width / 2 + 40, 214, '+' + gotOre + ' 灵矿', '#9fd8ff');
      spawnSparks(ui.fxLayer, rect.width / 2, 176, 8, 42);
    }
    return { stones: stones, ore: gotOre };
  }

  function deepenCost() {
    return {
      stones: Math.max(800, Math.floor(stonesPerSec() * (140 + state.mine.depth * 40))),
      ore: 2 + state.mine.depth * 2
    };
  }

  function deepenMine() {
    var cost = deepenCost();
    if (state.stones < cost.stones || state.ore < cost.ore) { toast('灵石或灵矿不足'); return; }
    state.stones -= cost.stones;
    state.ore -= cost.ore;
    state.mine.depth++;
    playSound('win');
    addLog('矿脉深入至第 ' + state.mine.depth + ' 层，灵石与灵矿产出提升。', 'good');
    toast('矿脉深化至 ' + state.mine.depth + ' 层');
    renderMine();
    renderTop();
    save();
  }

  function minerCost() {
    return Math.max(1200, Math.floor(stonesPerSec() * 200 * Math.pow(1.55, state.mine.miners)));
  }

  function hireMiner() {
    var cost = minerCost();
    if (state.stones < cost) { toast('灵石不足'); return; }
    state.stones -= cost;
    state.mine.miners++;
    playSound('win');
    addLog('雇得矿工，现有 ' + state.mine.miners + ' 名。', 'good');
    toast('矿工 +1');
    renderMine();
    renderTop();
    save();
  }

  function renderMine() {
    if (!ui.mineCard) return;
    var cost = deepenCost();
    var miner = minerCost();
    ui.mineCard.innerHTML =
      '<img src="assets/icons/icon_mountain.png" alt="" onerror="this.style.display=\'none\'" />' +
      '<div class="card-body">' +
        '<div class="card-title"><span>灵矿脉 · 第 ' + state.mine.depth + ' 层</span>' +
        '<span class="lv">灵矿 ' + fmt(state.ore) + '</span></div>' +
        '<div class="card-desc">每次开采可得 ' + fmt(mineYield()) + ' 灵石，约 '
        + Math.round(Math.min(0.75, state.mine.depth * 0.05) * 100) + '% 概率产出灵矿。矿工 '
        + state.mine.miners + ' 名会自动开采。</div>' +
        '<div class="card-foot">' +
          '<span class="cost">矿工 ' + state.mine.miners + ' 名（自动开采）</span>' +
          '<button id="mineBtn">开采</button>' +
        '</div>' +
        '<div class="equip-btns" style="margin-top:8px">' +
          '<button id="deepenBtn" data-need-stones="' + cost.stones + '" data-need-ore="' + cost.ore + '"' +
            (state.stones >= cost.stones && state.ore >= cost.ore ? '' : ' disabled') + '>深化 ' +
            fmt(cost.stones) + ' 灵石 + ' + cost.ore + ' 灵矿</button>' +
          '<button id="hireBtn" data-need-stones="' + miner + '"' + (state.stones >= miner ? '' : ' disabled') + '>雇矿工 ' + fmt(miner) + '</button>' +
        '</div>' +
      '</div>';
    ui.mineCard.querySelector('#mineBtn').addEventListener('click', function () {
      mineOnce(false);
      renderMine();
      renderTop();
    });
    ui.mineCard.querySelector('#deepenBtn').addEventListener('click', deepenMine);
    ui.mineCard.querySelector('#hireBtn').addEventListener('click', hireMiner);
  }

  /* ---------------- 师徒主线 / 历练支线 ---------------- */

  function questValue(kind) {
    if (kind === 'clicks') return state.records.totalClicks;
    if (kind === 'kills') return state.records.totalKills;
    if (kind === 'boss') return state.bossKills;
    if (kind === 'mines') return state.counters.mines || 0;
    if (kind === 'techs') return state.counters.techs || 0;
    if (kind === 'sister') return state.sister.interactions || 0;
    if (kind === 'pills') return state.counters.pills || 0;
    if (kind === 'realm') return state.realm;
    return 0;
  }

  function mainQuest() {
    return MAIN_QUESTS[state.main.index] || null;
  }

  function mainQuestProgress() {
    var quest = mainQuest();
    if (!quest) return { quest: null, progress: 0, goal: 0, done: false };
    if (state.main.base === undefined || state.main.base === null) {
      state.main.base = questValue(quest.kind);
    }
    var progress = Math.max(0, questValue(quest.kind) - state.main.base);
    return {
      quest: quest,
      progress: Math.min(quest.goal, progress),
      goal: quest.goal,
      done: progress >= quest.goal
    };
  }

  function grantRewards(reward) {
    if (!reward) return [];
    var got = [];
    if (reward.stones) { var stones = reward.stones * realmScale() * 0.02; state.stones += stones; got.push('灵石 ' + fmt(stones)); }
    if (reward.contribution) { state.sect.contribution += reward.contribution; got.push('贡献 ' + reward.contribution); }
    if (reward.ore) { state.ore += reward.ore; got.push('灵矿 ' + reward.ore); }
    if (reward.pills) {
      Object.keys(reward.pills).forEach(function (pillId) {
        state.pills[pillId] = (state.pills[pillId] || 0) + reward.pills[pillId];
        var pill = PILLS.filter(function (p) { return p.id === pillId; })[0];
        got.push((pill ? pill.name : pillId) + ' ×' + reward.pills[pillId]);
      });
    }
    if (reward.outfits) {
      reward.outfits.forEach(function (outfitId) {
        if (state.outfits.indexOf(outfitId) >= 0) return;
        state.outfits.push(outfitId);
        var outfit = OUTFITS.filter(function (o) { return o.id === outfitId; })[0];
        got.push('服装「' + (outfit ? outfit.name : outfitId) + '」');
      });
    }
    return got;
  }

  function claimMainQuest() {
    var info = mainQuestProgress();
    if (!info.quest || !info.done) { toast('任务尚未完成'); return; }
    var got = grantRewards(info.quest.reward);
    playSound('win');
    addLog('完成师徒任务「' + info.quest.name + '」，得 ' + got.join('、') + '。', 'good');
    toast('师徒任务完成 · ' + info.quest.name);
    state.main.index++;
    var next = mainQuest();
    state.main.base = next ? questValue(next.kind) : 0;
    if (!next) addLog('师徒主线已尽，师尊言你已可独行天下。', 'warn');
    renderQuests();
    renderProgress();
    renderOutfit();
    renderTop();
    save();
  }

  function sideGoal(def) {
    return Math.max(1, Math.round(def.base * (1 + state.realm * 0.9)));
  }

  function refreshSideQuests() {
    if (!state.side.active) state.side.active = [];
    while (state.side.active.length < 3) {
      var used = state.side.active.map(function (item) { return item.id; });
      var pool = SIDE_QUESTS.filter(function (def) { return used.indexOf(def.id) < 0; });
      if (!pool.length) break;
      var def = pool[Math.floor(Math.random() * pool.length)];
      state.side.active.push({
        id: def.id,
        kind: def.kind,
        goal: sideGoal(def),
        base: questValue(def.kind)
      });
    }
  }

  function sideDef(id) {
    return SIDE_QUESTS.filter(function (def) { return def.id === id; })[0];
  }

  function sideProgress(item) {
    var progress = Math.max(0, questValue(item.kind) - item.base);
    return { progress: Math.min(item.goal, progress), goal: item.goal, done: progress >= item.goal };
  }

  function claimSideQuest(id) {
    var index = (state.side.active || []).map(function (item) { return item.id; }).indexOf(id);
    if (index < 0) return;
    var item = state.side.active[index];
    var info = sideProgress(item);
    if (!info.done) { toast('历练尚未完成'); return; }
    var def = sideDef(id);
    var reward = Object.assign({}, def.reward);
    if (reward.stones) reward.stones = Math.round(reward.stones * (1 + state.realm * 0.85));
    var got = grantRewards(reward);
    playSound('win');
    addLog('历练「' + def.name + '」完成，得 ' + got.join('、') + '。', 'good');
    toast('历练完成 · ' + def.name);
    state.side.active.splice(index, 1);
    refreshSideQuests();
    renderQuests();
    renderProgress();
    save();
  }

  /* ---------------- 师妹互动 ---------------- */

  function sisterCooldownLeft(action) {
    var stamp = action.id === 'talk' ? state.sister.lastTalk : state.sister.lastTrip;
    if (!action.cooldown) return 0;
    var left = action.cooldown - (now() / 1000 - (stamp || 0));
    return left > 0 ? Math.ceil(left) : 0;
  }

  function doSisterAction(id) {
    var action = SISTER_ACTIONS.filter(function (item) { return item.id === id; })[0];
    if (!action) return;
    var left = sisterCooldownLeft(action);
    if (left > 0) { toast('她需要休息 ' + left + ' 秒'); return; }
    if (action.cost && state.stones < action.cost) { toast('灵石不足'); return; }
    if (action.cost) state.stones -= action.cost;
    state.sister.favor = Math.min(100, state.sister.favor + action.favor);
    state.sister.interactions = (state.sister.interactions || 0) + 1;
    state.counters.sister = (state.counters.sister || 0) + 1;
    state.sect.contribution += action.contribution;
    var detail = [];
    if (action.qi) {
      var qiGain = qiPerSec() * action.qi * 60;
      state.qi += qiGain;
      gainXiuwei(qiGain * 0.7);
      detail.push('修为 +' + fmt(qiGain * 0.7));
    }
    if (action.stones) {
      var stoneGain = stonesPerSec() * action.stones * 60 * 3;
      state.stones += stoneGain;
      detail.push('灵石 +' + fmt(stoneGain));
    }
    if (action.id === 'talk') state.sister.lastTalk = now() / 1000;
    if (action.id === 'trip') state.sister.lastTrip = now() / 1000;
    playSound('levelup');
    addLog(action.result + '（好感 +' + action.favor + '，贡献 +' + action.contribution
      + (detail.length ? '，' + detail.join('，') : '') + '）', 'good');
    toast('师妹 · ' + action.name);
    checkLayerUp();
    renderSister();
    renderProgress();
    renderBattle();
    renderStats();
    save();
  }

  function renderSister() {
    if (!ui.sisterCard) return;
    var favor = state.sister.favor || 0;
    var tier = currentFavorTier();
    var buttons = SISTER_ACTIONS.map(function (action) {
      var left = sisterCooldownLeft(action);
      var disabled = left > 0 || (action.cost && state.stones < action.cost);
      return '<button data-action="' + action.id + '" data-need-stones="' + (action.cost || 0) + '"' +
        (left > 0 ? ' data-locked="1"' : '') + (disabled ? ' disabled' : '') + '>' +
        action.name + (left > 0 ? ' ' + left + 's' : (action.cost ? ' ' + fmt(action.cost) : '')) + '</button>';
    }).join('');
    ui.sisterCard.innerHTML =
      '<img src="assets/junior_sister.png" alt="" onerror="this.style.display=\'none\'" />' +
      '<div class="card-body">' +
        '<div class="card-title"><span>师妹 · 苏青瑶</span><span class="lv">' + tier + '</span></div>' +
        '<div class="quest-bar"><i style="width:' + favor + '%"></i></div>' +
        '<div class="card-desc">好感 ' + favor + ' / 100 · 共互动 ' + (state.sister.interactions || 0) + ' 次</div>' +
        '<div class="equip-btns">' + buttons + '</div>' +
      '</div>';
    Array.prototype.forEach.call(ui.sisterCard.querySelectorAll('button'), function (button) {
      button.addEventListener('click', function () { doSisterAction(button.getAttribute('data-action')); });
    });
    if (ui.sisterFavor) ui.sisterFavor.textContent = tier + ' · 好感 ' + favor;
  }

  function renderSkillTree() {
    if (!ui.skillTree) return;
    if (ui.skillTreeCount) {
      ui.skillTreeCount.textContent = '已解锁 ' + unlockedSkills().length + ' / ' + RE_SKILLS.length;
    }
    ui.skillTree.innerHTML = RE_SKILLS.map(function (skill) {
      var owned = state.realm >= skill.realm;
      return '<span class="' + (owned ? 'owned' : '') + '" title="' + skill.desc + '">'
        + (owned ? '★ ' : '☆ ') + skill.name
        + '<em>' + REALMS[skill.realm].name + '境</em></span>';
    }).join('');
  }

  function renderQuests() {
    if (!ui.mainQuestCard) return;
    refreshSideQuests();
    var info = mainQuestProgress();
    if (ui.mainQuestCount) {
      ui.mainQuestCount.textContent = state.main.index + ' / ' + MAIN_QUESTS.length + ' 章';
    }
    if (info.quest) {
      ui.mainQuestCard.innerHTML =
        '<div class="card-body">' +
          '<div class="card-title"><span>' + info.quest.name + '</span>' +
          '<span class="lv">第 ' + (state.main.index + 1) + ' / ' + MAIN_QUESTS.length + ' 章</span></div>' +
          '<div class="card-desc">' + info.quest.desc + '</div>' +
          '<div class="quest-bar"><i style="width:' + ((info.progress / info.goal) * 100).toFixed(1) + '%"></i></div>' +
          '<div class="card-foot">' +
            '<span class="cost">' + info.progress + ' / ' + info.goal + (info.done ? ' · 可领取' : '') + '</span>' +
            '<button class="claim" id="claimMainBtn"' + (info.done ? '' : ' disabled') + '>领赏</button>' +
          '</div>' +
        '</div>';
      ui.mainQuestCard.querySelector('#claimMainBtn').addEventListener('click', claimMainQuest);
    } else {
      ui.mainQuestCard.innerHTML =
        '<div class="card-body">' +
          '<div class="card-title"><span>师徒主线已尽</span><span class="lv">圆满</span></div>' +
          '<div class="card-desc">师尊已认可你的道途，往后自行历练。</div>' +
        '</div>';
    }
    ui.sideList.innerHTML = (state.side.active || []).map(function (item) {
      var def = sideDef(item.id);
      var prog = sideProgress(item);
      var reward = def.reward;
      var rewardText = [];
      if (reward.stones) rewardText.push('灵石 ' + fmt(Math.round(reward.stones * (1 + state.realm * 0.85))));
      if (reward.contribution) rewardText.push('贡献 ' + reward.contribution);
      if (reward.ore) rewardText.push('灵矿 ' + reward.ore);
      if (reward.pills) {
        Object.keys(reward.pills).forEach(function (pillId) {
          var pill = PILLS.filter(function (p) { return p.id === pillId; })[0];
          rewardText.push((pill ? pill.name : pillId) + ' ×' + reward.pills[pillId]);
        });
      }
      return '<div class="card quest">' +
        '<div class="card-body">' +
          '<div class="card-title"><span>' + def.name + '</span><span class="lv">' + prog.progress + ' / ' + prog.goal + '</span></div>' +
          '<div class="card-desc">' + def.desc.replace('{goal}', prog.goal) + ' · 奖励 ' + rewardText.join('、') + '</div>' +
          '<div class="quest-bar"><i style="width:' + ((prog.progress / prog.goal) * 100).toFixed(1) + '%"></i></div>' +
          '<div class="card-foot"><span class="cost">' + (prog.done ? '可领取' : '进行中') + '</span>' +
          '<button class="claim" data-side="' + item.id + '"' + (prog.done ? '' : ' disabled') + '>领赏</button></div>' +
        '</div>' +
      '</div>';
    }).join('');
    Array.prototype.forEach.call(ui.sideList.querySelectorAll('button[data-side]'), function (button) {
      button.addEventListener('click', function () { claimSideQuest(button.getAttribute('data-side')); });
    });
  }

  /* ---------------- 玩法逻辑 ---------------- */

  function doCultivate(event) {
    var gain = clickGain();
    state.qi += gain;
    gainXiuwei(gain * 1.15);
    state.clickCount++;
    state.records.totalClicks++;
    bumpDaily('clicks');
    playSound('click');
    var rect = ui.stage.getBoundingClientRect();
    var x = event && event.clientX ? event.clientX - rect.left : rect.width / 2;
    var y = event && event.clientY ? event.clientY - rect.top : 120;
    floatText(x, y, '+' + fmt(gain) + ' 灵气');
    spawnRipple(x, y);
    for (var i = 0; i < 2; i++) spawnParticle();
    checkLayerUp();
  }

  function checkLayerUp() {
    var req = layerRequirement();
    if (state.xiuwei < req) return;
    if (state.layer < realm().layers) {
      state.xiuwei -= req;
      state.layer++;
      bumpDaily('layers');
      state.sect.contribution += 3;
      playSound('levelup');
      levelUpSweep();
      spawnSparks(ui.fxLayer, ui.fxLayer.getBoundingClientRect().width / 2, 150, 14, 60);
      addLog('修为精进，升至 ' + realm().name + (LAYER_NAMES[state.layer - 1] || state.layer) + '层。', 'good');
      toast(realm().name + (LAYER_NAMES[state.layer - 1] || state.layer) + '层');
      renderSkills();
      renderPills();
      renderBattle();
    } else {
      state.xiuwei = req; // 圆满，等待突破
    }
  }

  function upgradeTech(id) {
    var tech = TECHS.filter(function (t) { return t.id === id; })[0];
    var lv = techLevel(id);
    var cost = techCost(tech, lv);
    if (state.stones < cost) { toast('灵石不足'); return; }
    state.stones -= cost;
    state.techs[id] = lv + 1;
    state.counters.techs = (state.counters.techs || 0) + 1;
    playSound('levelup');
    addLog('参悟《' + tech.name + '》至 ' + (lv + 1) + ' 层。', 'good');
    renderSkills();
    renderPills();
    renderBattle();
    renderProgress();
  }

  function craftPill(id) {
    var pill = PILLS.filter(function (p) { return p.id === id; })[0];
    var cost = pillCostOf(pill);
    if (state.stones < cost.stones || state.qi < cost.qi) { toast('材料不足'); return; }
    state.stones -= cost.stones;
    state.qi -= cost.qi;
    state.pills[id] = (state.pills[id] || 0) + 1;
    playSound('click');
    addLog('炼成一颗' + pill.name + '。', 'good');
    renderPills();
  }

  function usePill(id) {
    if ((state.pills[id] || 0) <= 0) return;
    state.pills[id]--;
    state.counters.pills = (state.counters.pills || 0) + 1;
    if (id === 'qi-pill') {
      var gain = qiPerSec() * 40 * pillPower();
      state.qi += gain;
      gainXiuwei(gain);
      addLog('服下聚气丹，灵气暴涨 ' + fmt(gain) + '。', 'good');
      playSound('levelup');
      checkLayerUp();
    } else if (id === 'break-pill') {
      var bonus = Math.round(15 * pillPower());
      state.buffs.breakBonus = Math.min(60, state.buffs.breakBonus + bonus);
      addLog('服下破障丹，雷劫成功率 +' + bonus + '%（当前 +' + state.buffs.breakBonus + '%）。', 'good');
      playSound('levelup');
    } else if (id === 'spirit-pill') {
      state.buffs.qiMult = Math.round(60 * pillPower());
      addLog('服下凝神丹，六十息内灵气翻倍。', 'good');
      playSound('levelup');
    } else if (id === 'clear-pill') {
      state.buffs.critBoost = Math.round(60 * pillPower());
      addLog('服下太清丹，六十息内暴击率翻倍。', 'good');
      playSound('levelup');
    } else if (id === 'wombo-pill') {
      var need = layerRequirement() * 0.35 * pillPower();
      gainXiuwei(need);
      addLog('服下悟道丹，修为骤增 ' + fmt(need) + '。', 'good');
      playSound('levelup');
      checkLayerUp();
    } else if (id === 'treasure-pill') {
      var treasure = Math.max(30, stonesPerSec() * 60 * pillPower());
      state.stones += treasure;
      addLog('服下聚宝丹，灵石 +' + fmt(treasure) + '。', 'good');
      playSound('levelup');
    }
    bumpDaily('pills');
    renderPills();
    renderProgress();
  }

  function attack() {
    var b = beastForState();
    if (!state.beastHp || state.beastHp > b.maxHp) state.beastHp = b.maxHp;
    var hits = hitCount();
    var total = 0;
    var crit = false;
    var damages = [];
    for (var i = 0; i < hits; i++) {
      var isCrit = Math.random() < critChance();
      if (isCrit) crit = true;
      var hitDamage = attackPower() * (0.85 + Math.random() * 0.3) * (isCrit ? critMultiplier() : 1);
      damages.push({ value: hitDamage, crit: isCrit });
      total += hitDamage;
    }
    state.beastHp -= total;
    playSound('attack');
    ui.beastImage.classList.remove('hurt');
    void ui.beastImage.offsetWidth;
    ui.beastImage.classList.add('hurt');
    playAttackFx();
    if (hits > 1) {
      spawnDamageNumber((crit ? '暴击 ' : '') + '×' + hits + ' -' + fmt(total), crit);
    } else {
      spawnDamageNumber((crit ? '暴击 ' : '') + '-' + fmt(total), crit);
    }
    if (crit) {
      ui.stage.classList.remove('shake-soft');
      void ui.stage.offsetWidth;
      ui.stage.classList.add('shake-soft');
      setTimeout(function () { ui.stage.classList.remove('shake-soft'); }, 520);
    }
    ui.battleLog.textContent = (hits > 1 ? hits + ' 道飞剑齐出，' : '飞剑斩出 ')
      + (crit ? '暴击 ' : '') + fmt(total) + ' 点伤害。';
    if (state.beastHp <= 0) {
      state.beastKills++;
      state.records.totalKills++;
      state.sect.contribution += 1;
      bumpDaily('kills');
      state.stones += b.stones;
      gainXiuwei(b.xiuwei);
      playSound('win');
      ui.beastImage.classList.add('dead');
      var combatRect = ui.dmgLayer.getBoundingClientRect();
      spawnSparks(ui.dmgLayer, combatRect.width * 0.22, combatRect.height * 0.5,
        b.boss ? 22 : 12, b.boss ? 72 : 46);
      if (b.boss) {
        state.bossKills++;
        state.sinceBoss = 0;
        state.forceBoss = false;
        var dropIndex = Math.floor(Math.random() * 4);
        var dropId = ['qi-pill', 'break-pill', 'spirit-pill', 'clear-pill'][dropIndex];
        state.pills[dropId] = (state.pills[dropId] || 0) + 1;
        var dropPill = PILLS.filter(function (p) { return p.id === dropId; })[0];
        addLog('妖王伏诛！得灵石 ' + fmt(b.stones) + '、修为 ' + fmt(b.xiuwei) +
          '，并掉落' + (dropPill ? dropPill.name : '丹药') + '。', 'good');
        ui.battleLog.textContent = '妖王伏诛，额外掉落丹药！';
      } else {
        state.sinceBoss++;
        addLog('斩落' + b.name + '，得灵石 ' + fmt(b.stones) + '、修为 ' + fmt(b.xiuwei) + '。', 'good');
        ui.battleLog.textContent = '妖兽伏诛，灵石 +' + fmt(b.stones) + '。';
      }
      setTimeout(function () {
        ui.beastImage.classList.remove('dead');
        state.beastHp = beastForState().maxHp;
        renderBattle();
      }, 620);
      checkLayerUp();
      renderBattle();
    } else {
      renderBattle();
    }
  }

  function doBreakthrough() {
    if (state.layer < realm().layers || state.xiuwei < layerRequirement()) return;
    var chance = breakthroughChance();
    var roll = Math.random() * 100;
    ui.thunderLayer.classList.add('flash');
    ui.stage.classList.add('shake');
    playSound('thunder');
    setTimeout(function () {
      ui.thunderLayer.classList.remove('flash');
      ui.stage.classList.remove('shake');
    }, 2400);

    addLog('引动雷劫，天云翻涌……', 'warn');

    setTimeout(function () {
      if (roll <= chance) {
        state.realm = Math.min(REALMS.length - 1, state.realm + 1);
        state.layer = 1;
        state.xiuwei = 0;
        state.breakthroughs++;
        state.records.totalBreakthroughs++;
        state.records.maxRealm = Math.max(state.records.maxRealm, state.realm);
        state.sect.contribution += 30;
        state.buffs.breakBonus = 0;
        playSound('levelup');
        var name = realm().name;
        addLog('雷劫散去，成功突破至【' + name + '】境！', 'good');
        toast('突破成功 · ' + name + '境');
        showModal('突破成功', '雷云散尽，你已踏入【' + name + '】境。\n\n下一个目标：' + name + '一层圆满。');
        state.beastHp = beastForState().maxHp;
      } else {
        state.failures++;
        var lose = Math.floor(state.xiuwei * 0.45);
        state.xiuwei -= lose;
        state.buffs.breakBonus = 0;
        playSound('thunder');
        addLog('雷劫难挡，突破失败，修为损失 ' + fmt(lose) + '。', 'bad');
        toast('突破失败 · 修为受损');
      }
      renderSkills();
      renderPills();
      renderProgress();
      renderBattle();
      renderStats();
      renderLadder();
      renderDaily();
      renderSect();
      renderRank();
      save();
    }, 1500);
  }

  function toggleAuto() {
    if (techLevel('heart') <= 0) { toast('需先参悟「心剑合一」'); return; }
    state.autoBattle = !state.autoBattle;
    renderBattle();
  }

  /* ---------------- 主循环 ---------------- */

  var accumulator = 0;
  var autoTimer = 0;
  var saveTimer = 0;
  var cultivateTimer = 0;
  var achTimer = 0;
  var petTimer = 0;
  var weatherTimer = 0;
  var dayTimer = 0;
  var mineTimer = 0;
  var display = { qi: 0, stones: 0, xiuwei: 0, ready: false };

  // 修复：灵石/灵气变化时，购买类按钮的禁用状态此前不会刷新，
  // 导致攒够灵石后「参悟」按钮仍然是灰的，看起来像卡住。
  function refreshAffordability() {
    var buttons = document.querySelectorAll('[data-need-stones]');
    Array.prototype.forEach.call(buttons, function (button) {
      if (button.getAttribute('data-locked') === '1') return;
      var needStones = Number(button.getAttribute('data-need-stones') || 0);
      var needQi = Number(button.getAttribute('data-need-qi') || 0);
      var needOre = Number(button.getAttribute('data-need-ore') || 0);
      var ok = state.stones >= needStones && state.qi >= needQi && state.ore >= needOre;
      if (button.disabled === ok) button.disabled = !ok;
      var costEl = button.parentElement ? button.parentElement.querySelector('.cost') : null;
      if (costEl) costEl.classList.toggle('short', !ok);
    });
  }

  function tweenNumber(key, target, dt) {
    if (!display.ready) {
      display[key] = target;
      return target;
    }
    var current = display[key];
    var diff = target - current;
    if (Math.abs(diff) <= Math.max(0.6, Math.abs(target) * 0.002)) {
      display[key] = target;
      return target;
    }
    display[key] = current + diff * Math.min(1, dt * 5.5);
    return display[key];
  }

  function tick(dt) {
    state.playTime += dt;

    state.qi += qiPerSec() * dt;
    gainXiuwei(qiPerSec() * dt * 1.15);
    state.stones += stonesPerSec() * dt;

    if (state.buffs.qiMult > 0) state.buffs.qiMult = Math.max(0, state.buffs.qiMult - dt);
    if (state.buffs.critBoost > 0) state.buffs.critBoost = Math.max(0, state.buffs.critBoost - dt);

    checkLayerUp();

    var autoCultivate = autoCultivateInterval();
    if (autoCultivate > 0) {
      cultivateTimer += dt * 1000;
      if (cultivateTimer >= autoCultivate) {
        cultivateTimer = 0;
        doCultivate(null);
      }
    }

    if (state.autoBattle && techLevel('heart') > 0) {
      var interval = autoInterval() / 1000;
      autoTimer += dt;
      if (autoTimer >= interval) {
        autoTimer = 0;
        attack();
      }
    } else {
      autoTimer = 0;
    }

    maybeTriggerEvent(dt);
    achTimer += dt;
    if (achTimer > 0.6) {
      achTimer = 0;
      checkAchievements();
    }

    var pet = currentPet();
    if (pet && pet.auto > 0) {
      petTimer += dt * 1000;
      if (petTimer >= pet.auto) {
        petTimer = 0;
        var target = beastForState();
        if (!state.beastHp || state.beastHp > target.maxHp) state.beastHp = target.maxHp;
        var petDamage = attackPower() * pet.autoDamage;
        state.beastHp -= petDamage;
        spawnDamageNumber('灵宠 -' + fmt(petDamage), false, 2);
        if (state.beastHp <= 0) {
          state.beastHp = Math.min(1, target.maxHp * 0.01);
        }
        renderBattle();
      }
    }

    if (state.mine.miners > 0) {
      mineTimer += dt * state.mine.miners * 0.1;
      var guard = 0;
      while (mineTimer >= 1 && guard < 40) {
        mineTimer -= 1;
        guard++;
        mineOnce(true);
      }
    }

    weatherTimer += dt;
    if (weatherTimer > 190) {
      weatherTimer = 0;
      rollWeather();
    }
    dayTimer += dt;
    if (dayTimer > 45) {
      dayTimer = 0;
      updateDayNight();
    }

    display.qi = tweenNumber('qi', state.qi, dt);
    display.stones = tweenNumber('stones', state.stones, dt);
    display.xiuwei = tweenNumber('xiuwei', state.xiuwei, dt);
    display.ready = true;

    accumulator += dt;
    if (accumulator > 0.5) {
      accumulator = 0;
      renderTop();
      renderProgress();
      renderStats();
      refreshAffordability();
      var questPanel = document.getElementById('panel-quests');
      if (questPanel && !questPanel.classList.contains('hidden')) renderQuests();
      var minePanel = document.getElementById('panel-cultivate');
      if (minePanel && !minePanel.classList.contains('hidden')) renderMine();
      var sisterPanel = document.getElementById('panel-grotto');
      if (sisterPanel && !sisterPanel.classList.contains('hidden')) renderSister();
    }

    if (Math.random() < dt * 1.6) spawnParticle();

    saveTimer += dt;
    if (saveTimer > 10) { saveTimer = 0; save(); }
  }

  function loop(ts) {
    if (!loop.last) loop.last = ts;
    var dt = Math.min(1, (ts - loop.last) / 1000);
    loop.last = ts;
    tick(dt);
    requestAnimationFrame(loop);
  }

  /* ---------------- 初始化 ---------------- */

  function bindTabs() {
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab.dataset.tab);
      });
    });
  }

  function activateTab(name) {
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (tab) {
      tab.classList.toggle('active', tab.dataset.tab === name);
    });
    ['cultivate', 'skills', 'gear', 'pills', 'quests', 'grotto'].forEach(function (item) {
      document.getElementById('panel-' + item).classList.toggle('hidden', item !== name);
    });
  }

  /* ---------------- 新手教程 ---------------- */

  var TUTORIAL = [
    { tab: 'cultivate', target: '#stage', title: '你的洞府', text: '这里是云海仙山之巅。顶栏显示境界、灵气与灵石，主角会随时间自行打坐，关掉页面也会按五成效率累计（最多八小时）。' },
    { tab: 'cultivate', target: '#cultivateBtn', title: '第一步：打坐吐纳', text: '轻点这个按钮（电脑上也可以按空格键）获得灵气，灵气会同时转化为修为。下方还有「灵矿脉」，开采可以直接换灵石。' },
    { tab: 'cultivate', target: '#progressFill', title: '修为与突破', text: '修为条满了会自动提升一层。把当前境界的层数修满，屏幕上会出现「突破 · 渡雷劫」，渡劫成功就进入下一个大境界，失败会损失部分修为。' },
    { tab: 'cultivate', target: '#combatPanel', title: '斩妖历练', text: '点「御剑攻击」，或者直接点妖兽。击杀可拿灵石和修为；境界越高，妖兽越强也越值钱。参悟「心剑合一」后还能自动出剑。' },
    { tab: 'skills', target: '#skillList', title: '功法', text: '灵石在这里参悟功法：聚灵阵提高每秒灵气，御剑术提高剑意，悟道提高渡劫成功率，护身法阵让你持续获得灵石。' },
    { tab: 'pills', target: '#pillList', title: '丹药', text: '丹药用来应急：聚气丹立刻补灵气，破障丹让下一轮渡劫更容易成功，凝神丹让六十息内灵气翻倍。' },
    { tab: 'gear', target: '#outfitGrid', title: '衣冠 · 换装与法宝', text: '这里可以换衣服、祭炼法宝、收服灵宠。不同装扮给不同加成（灵气 / 剑意 / 暴击），点场景里的主角形象也能直接打开衣柜。' },
    { tab: 'quests', target: '#mainQuestCard', title: '师徒主线与历练', text: '师徒主线按章节推进，完成一章领一次灵石、贡献，部分章节还送服装；下面的历练支线完成一条就补一条；再往下是每日日课。' },
    { tab: 'grotto', target: '#sectCard', title: '宗门', text: '拜入一个门派可以得到长期加护：青云宗加灵气、太虚剑派加剑意、丹霞谷省炼丹钱。斩妖和突破会积攒贡献，贡献能换职位。' },
    { tab: 'grotto', target: '#sisterCard', title: '师妹 · 苏青瑶', text: '与师妹赠礼、论道、切磋、结伴历练，可以提升好感与宗门贡献；好感达到门槛会解锁永久加成。再往下是宗门、天榜、道号与存档。' },
    { tab: 'grotto', target: '#rankList', title: '天榜、道号与存档', text: '天榜按「道行」排名；道号达成条件即解锁，给永久加成。修行途中会随机跳出「机缘」「危难」事件，不同选择结果不同。存档在你自己的浏览器里，换设备不同步。想再看一遍教程，点「重看新手教程」。' }
  ];

  var tut = { active: false, index: 0, raised: [], focused: null };

  function raiseAboveDim(el) {
    var chain = [];
    var node = el;
    while (node && node !== document.body) {
      chain.push(node);
      node = node.parentElement;
    }
    chain.forEach(function (item) {
      if (item.dataset.tutPos === undefined) {
        item.dataset.tutPos = item.style.position || '';
        item.dataset.tutZ = item.style.zIndex || '';
      }
      item.style.position = 'relative';
      item.style.zIndex = '65';
    });
    tut.raised = chain;
  }

  function lowerDim() {
    if (tut.focused) {
      tut.focused.classList.remove('tut-focus');
      tut.focused = null;
    }
    tut.raised.forEach(function (item) {
      item.style.position = item.dataset.tutPos || '';
      item.style.zIndex = item.dataset.tutZ || '';
      delete item.dataset.tutPos;
      delete item.dataset.tutZ;
    });
    tut.raised = [];
  }

  function showTutorialStep() {
    lowerDim();
    var step = TUTORIAL[tut.index];
    activateTab(step.tab);
    var el = document.querySelector(step.target);
    if (el) {
      raiseAboveDim(el);
      el.classList.add('tut-focus');
      tut.focused = el;
      if (el.scrollIntoView) {
        try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { el.scrollIntoView(); }
      }
    }
    ui.tutTitle.textContent = step.title;
    ui.tutText.textContent = step.text;
    ui.tutDots.innerHTML = TUTORIAL.map(function (item, index) {
      return '<i class="' + (index === tut.index ? 'on' : '') + '"></i>';
    }).join('');
    ui.tutPrev.style.visibility = tut.index === 0 ? 'hidden' : 'visible';
    ui.tutNext.textContent = tut.index === TUTORIAL.length - 1 ? '开始修行' : '下一步';
    ui.tutDim.classList.remove('hidden');
    ui.tutTip.classList.remove('hidden');
  }

  function startTutorial() {
    tut.active = true;
    tut.index = 0;
    showTutorialStep();
  }

  function endTutorial(silent) {
    if (!tut.active && silent) return;
    tut.active = false;
    lowerDim();
    if (ui.tutDim) ui.tutDim.classList.add('hidden');
    if (ui.tutTip) ui.tutTip.classList.add('hidden');
    if (!silent) {
      state.tutorialDone = true;
      save();
      toast('教程结束，开始修行吧');
    }
  }

  function tutorialNext() {
    if (tut.index >= TUTORIAL.length - 1) {
      endTutorial(false);
      return;
    }
    tut.index++;
    showTutorialStep();
  }

  function tutorialPrev() {
    if (tut.index === 0) return;
    tut.index--;
    showTutorialStep();
  }

  function init() {
    ui = {
      app: document.getElementById('app'),
      bgImage: document.getElementById('bgImage'),
      heroImage: document.getElementById('heroImage'),
      realmName: document.getElementById('realmName'),
      realmLayer: document.getElementById('realmLayer'),
      qiValue: document.getElementById('qiValue'),
      stoneValue: document.getElementById('stoneValue'),
      stage: document.getElementById('stage'),
      particles: document.getElementById('particles'),
      floatLayer: document.getElementById('floatLayer'),
      progressLabel: document.getElementById('progressLabel'),
      progressValue: document.getElementById('progressValue'),
      progressFill: document.getElementById('progressFill'),
      qiRate: document.getElementById('qiRate'),
      stoneRate: document.getElementById('stoneRate'),
      cultivateGain: document.getElementById('cultivateGain'),
      breakthroughBtn: document.getElementById('breakthroughBtn'),
      btChance: document.getElementById('btChance'),
      beastImage: document.getElementById('beastImage'),
      slashFx: document.getElementById('slashFx'),
      dmgLayer: document.getElementById('dmgLayer'),
      fxLayer: document.getElementById('fxLayer'),
      achLayer: document.getElementById('achLayer'),
      bossTag: document.getElementById('bossTag'),
      weatherLayer: document.getElementById('weatherLayer'),
      weatherChip: document.getElementById('weatherChip'),
      beastName: document.getElementById('beastName'),
      beastHpFill: document.getElementById('beastHpFill'),
      beastHpText: document.getElementById('beastHpText'),
      attackPower: document.getElementById('attackPower'),
      battleLog: document.getElementById('battleLog'),
      autoBtn: document.getElementById('autoBtn'),
      skillList: document.getElementById('skillList'),
      pillList: document.getElementById('pillList'),
      statsBox: document.getElementById('statsBox'),
      logBox: document.getElementById('logBox'),
      realmLadder: document.getElementById('realmLadder'),
      miniLog: document.getElementById('miniLog'),
      dailyDate: document.getElementById('dailyDate'),
      dailyProgress: document.getElementById('dailyProgress'),
      questList: document.getElementById('questList'),
      sectCard: document.getElementById('sectCard'),
      rankList: document.getElementById('rankList'),
      rankNote: document.getElementById('rankNote'),
      achList: document.getElementById('achList'),
      achCount: document.getElementById('achCount'),
      outfitCurrent: document.getElementById('outfitCurrent'),
      outfitGrid: document.getElementById('outfitGrid'),
      outfitCount: document.getElementById('outfitCount'),
      gearBonusText: document.getElementById('gearBonusText'),
      equipList: document.getElementById('equipList'),
      petList: document.getElementById('petList'),
      mineCard: document.getElementById('mineCard'),
      rootCard: document.getElementById('rootCard'),
      sisterCard: document.getElementById('sisterCard'),
      skillTree: document.getElementById('skillTree'),
      mainQuestCard: document.getElementById('mainQuestCard'),
      sideList: document.getElementById('sideList'),
      mainQuestCount: document.getElementById('mainQuestCount'),
      skillTreeCount: document.getElementById('skillTreeCount'),
      sisterFavor: document.getElementById('sisterFavor'),
      wardrobe: document.getElementById('wardrobe'),
      wardrobeGrid: document.getElementById('wardrobeGrid'),
      wardrobeClose: document.getElementById('wardrobeClose'),
      tutDim: document.getElementById('tutDim'),
      tutTip: document.getElementById('tutTip'),
      tutTitle: document.getElementById('tutTitle'),
      tutText: document.getElementById('tutText'),
      tutDots: document.getElementById('tutDots'),
      tutNext: document.getElementById('tutNext'),
      tutPrev: document.getElementById('tutPrev'),
      tutSkip: document.getElementById('tutSkip'),
      saveHint: document.getElementById('saveHint'),
      toastLayer: document.getElementById('toastLayer'),
      modal: document.getElementById('modal'),
      modalTitle: document.getElementById('modalTitle'),
      modalBody: document.getElementById('modalBody'),
      modalOk: document.getElementById('modalOk'),
      modalChoices: document.getElementById('modalChoices'),
      soundToggle: document.getElementById('soundToggle'),
      thunderLayer: document.getElementById('thunderLayer')
    };

    var offline = load();
    var freshDay = ensureDaily();
    if (ensureRoot()) {
      var root = currentRoot();
      addLog('你天生【' + root.name + '】：' + root.desc, 'good');
    }
    if (!state.log.length) {
      addLog('你于云海仙山之巅结庐，自此踏上仙途。', 'warn');
    }
    if (freshDay && state.log.length > 1) {
      addLog('新的一日，日课已刷新。', 'warn');
    }

    bindTabs();
    document.getElementById('cultivateBtn').addEventListener('click', doCultivate);
    ui.breakthroughBtn.addEventListener('click', doBreakthrough);
    document.getElementById('attackBtn').addEventListener('click', attack);
    ui.beastImage.addEventListener('click', attack);
    ui.autoBtn.addEventListener('click', toggleAuto);
    document.getElementById('saveBtn').addEventListener('click', function () { save(); toast('已存档'); });
    document.getElementById('resetBtn').addEventListener('click', function () {
      if (confirm('确定转世重修？当前进度将全部清空。')) {
        try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
        state = defaultState();
        addLog('你散尽修为，重入轮回，自炼气境重新开始。', 'warn');
        renderAll();
      }
    });
    document.getElementById('tutorialBtn').addEventListener('click', function () { startTutorial(); });
    ui.heroImage.classList.add('tapable');
    ui.heroImage.addEventListener('click', function () {
      renderWardrobe();
      ui.wardrobe.classList.remove('hidden');
    });
    ui.wardrobeClose.addEventListener('click', function () { ui.wardrobe.classList.add('hidden'); });
    ui.wardrobe.addEventListener('click', function (event) {
      if (event.target === ui.wardrobe) ui.wardrobe.classList.add('hidden');
    });
    ui.tutNext.addEventListener('click', tutorialNext);
    ui.tutPrev.addEventListener('click', tutorialPrev);
    ui.tutSkip.addEventListener('click', function () { endTutorial(false); });
    ui.modalOk.addEventListener('click', function () { ui.modal.classList.add('hidden'); });
    ui.soundToggle.addEventListener('click', function () {
      setAudioEnabled(!audio.enabled);
    });
    ['pointerdown', 'keydown'].forEach(function (evt) {
      window.addEventListener(evt, startMusic, { once: true });
    });
    window.addEventListener('keydown', function (e) {
      if (e.code === 'Space') { e.preventDefault(); doCultivate(null); }
      if (e.code === 'Enter' && !ui.breakthroughBtn.classList.contains('hidden')) doBreakthrough();
    });
    window.addEventListener('beforeunload', save);
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) save();
    });

    state.beastHp = beastForState().maxHp;
    renderAll();
    setupHeroAnimation();
    updateDayNight();
    applyWeatherVisual();

    if (!state.tutorialDone && location.hash !== '#autotest') {
      setTimeout(function () {
        if (!state.tutorialDone && !tut.active) startTutorial();
      }, 700);
    }

    if (location.hash === '#preview' || location.hash === '#autotest') {
      window.__xiuxian = {
        state: state,
        renderAll: renderAll,
        addStones: function (amount) { state.stones += amount; renderAll(); },
        spawnBoss: function () { state.forceBoss = true; state.beastHp = 0; renderBattle(); },
        triggerEvent: function () { eventTimer = eventCooldown; maybeTriggerEvent(0.1); }
      };
    }

    if (offline && offline.seconds > 60) {
      var minutes = Math.floor(offline.seconds / 60);
      addLog('闭关 ' + minutes + ' 分钟，归来时灵气充盈。', 'good');
      showModal('闭关归来', '你静修了约 ' + minutes + ' 分钟（离线按五成结算）。\n\n灵气 +' + fmt(offline.qi) +
        '\n灵石 +' + fmt(offline.stones));
    }

    requestAnimationFrame(loop);
  }

  function renderAll() {
    renderTop();
    renderProgress();
    renderLadder();
    renderMiniLog();
    renderSkills();
    renderPills();
    renderOutfit();
    renderEquipment();
    renderPets();
    renderWeatherChip();
    renderMine();
    renderRoot();
    renderSister();
    renderSkillTree();
    renderQuests();
    renderDaily();
    renderSect();
    renderRank();
    renderAchievements();
    renderBattle();
    renderStats();
    renderLog();
  }

  /* ---------------- 冒烟自测（仅 #autotest 时启用） ---------------- */

  function runAutotest() {
    endTutorial(true);
    var report = { steps: [] };
    function step(name, value) { report.steps.push(name + '=' + value); }

    var qi0 = state.qi;
    for (var i = 0; i < 60; i++) doCultivate(null);
    step('cultivate_qi_gain', (state.qi - qi0) > 0);
    step('click_count', state.clickCount);
    step('xiuwei', state.xiuwei > 0);

    state.stones += 5000;
    upgradeTech('array');
    upgradeTech('sword');
    step('array_lv', techLevel('array'));
    step('sword_lv', techLevel('sword'));
    step('qi_per_sec', qiPerSec().toFixed(2));
    step('attack_power', attackPower());

    for (var j = 0; j < 40; j++) attack();
    step('kills', state.beastKills);
    step('stones_after_farm', state.stones);

    craftPill('qi-pill');
    step('pills', JSON.stringify(state.pills));
    usePill('qi-pill');
    usePill('break-pill');

    state.stones += 8000;
    upgradeTech('insight');
    step('insight_lv', techLevel('insight'));
    step('break_chance', breakthroughChance().toFixed(0));

    state.stones += 20000;
    upgradeTech('sense');
    upgradeTech('formation');
    upgradeTech('root');
    upgradeTech('enlighten');
    step('sense_lv', techLevel('sense'));
    step('crit_chance', Math.round(critChance() * 100));
    step('hit_count', hitCount());
    step('qi_per_sec_with_root', qiPerSec().toFixed(2));
    step('auto_cultivate_ms', autoCultivateInterval());

    state.forceBoss = true;
    state.beastHp = 0;
    for (var k = 0; k < 400 && state.forceBoss; k++) attack();
    step('boss_kills', state.bossKills);

    eventTimer = eventCooldown;
    maybeTriggerEvent(0.1);
    step('event_modal_open', !ui.modal.classList.contains('hidden'));
    step('event_choice_buttons', ui.modalChoices.querySelectorAll('button').length);
    var eventChoice = ui.modalChoices.querySelector('button');
    if (eventChoice) eventChoice.click();
    step('event_modal_closed', ui.modal.classList.contains('hidden'));

    checkAchievements();
    step('achievements', state.achievements.length);

    state.pills['clear-pill'] = 1;
    usePill('clear-pill');
    step('crit_boost_active', state.buffs.critBoost > 0);
    state.pills['treasure-pill'] = 1;
    usePill('treasure-pill');
    step('pill_kinds', Object.keys(state.pills).length);

    step('root', currentRoot() ? currentRoot().name : 'none');
    var stonesBeforeMine = state.stones;
    var mineResult = mineOnce(true);
    step('mine_gain', mineResult.stones > 0 && state.stones > stonesBeforeMine);
    step('mine_counter', state.counters.mines);

    state.stones += 5e6;
    state.ore += 60;
    var depthBefore = state.mine.depth;
    deepenMine();
    step('mine_depth', state.mine.depth === depthBefore + 1);
    hireMiner();
    step('miners', state.mine.miners);

    state.main.index = 0;
    state.main.base = questValue('clicks');
    for (var q = 0; q < 40; q++) doCultivate(null);
    var mainInfo = mainQuestProgress();
    step('main_ready', mainInfo.done);
    var contributeBefore = state.sect.contribution;
    claimMainQuest();
    step('main_index', state.main.index);
    step('main_reward_contribution', state.sect.contribution > contributeBefore);

    refreshSideQuests();
    step('side_count', state.side.active.length);
    var sideItem = state.side.active[0];
    sideItem.base = questValue(sideItem.kind) - sideItem.goal;
    var stonesBeforeSide = state.stones;
    claimSideQuest(sideItem.id);
    step('side_refilled', state.side.active.length === 3);
    step('side_reward_stones', state.stones > stonesBeforeSide);

    state.stones += 20000;
    var favorBefore = state.sister.favor;
    doSisterAction('gift');
    step('sister_favor_up', state.sister.favor > favorBefore);
    step('sister_bonus_qi', Math.round(favorBonus().qi * 100));

    var balance = [];
    state.forceBoss = false;
    state.sinceBoss = 0;
    for (var br = 0; br <= 12; br++) {
      state.realm = br;
      state.layer = Math.max(1, Math.floor(REALMS[br].layers / 2));
      var dpsNow = playerDpsEstimate();
      var beastNow = beastForState();
      balance.push(REALMS[br].name + ':' + (beastNow.maxHp / dpsNow).toFixed(1));
    }
    step('kill_seconds_by_realm', balance.join(' '));
    state.realm = 12;
    step('top_realm', realm().name);
    step('skills_unlocked', unlockedSkills().length + '/' + RE_SKILLS.length);
    step('skill_atk_bonus', Math.round(skillBonus().atk * 100));
    step('skill_crit_damage', Math.round(skillBonus().critDamage * 100));
    state.realm = 0;
    state.layer = 1;

    state.stones += 9000;
    unlockOutfit('cloth');
    wearOutfit('cloth');
    step('outfit_equipped', state.outfit);
    step('outfit_owned', state.outfits.length);
    buyEquipment('sword', 'sword-1');
    step('equip_sword', state.equipment.sword);
    unlockPet('fox');
    step('pet_active', state.pet);
    step('gear_qi_bonus', Math.round(gearBonus().qi * 100));
    step('gear_atk_bonus', Math.round(gearBonus().atk * 100));
    rollWeather();
    step('weather', currentWeather().name);
    step('is_night', state.isNight);

    state.layer = realm().layers;
    state.xiuwei = layerRequirement();
    renderProgress();
    step('breakthrough_button_visible', !ui.breakthroughBtn.classList.contains('hidden'));
    step('realm_before', realm().name);

    doBreakthrough();

    setTimeout(function () {
      step('realm_after', realm().name);
      step('layer_after', state.layer);
      step('breakthroughs', state.breakthroughs);
      step('failures', state.failures);

      save();
      var raw = localStorage.getItem(SAVE_KEY);
      step('save_bytes', raw ? raw.length : 0);
      step('bg_src', ui.bgImage.getAttribute('src'));
      step('log_entries', state.log.length);

      var pre = document.createElement('pre');
      pre.id = 'autotest';
      pre.textContent = 'AUTOTEST ' + report.steps.join(' | ');
      document.body.appendChild(pre);
    }, 2200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init();
      if (location.hash === '#autotest') runAutotest();
    });
  } else {
    init();
    if (location.hash === '#autotest') runAutotest();
  }
})();
