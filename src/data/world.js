/**
 * 世界观设定（六章）
 * 资料名称统一为《大地巡旅：〈明日方舟〉官方世界观设定集》。
 * 设定书带有世界内记录者与批注者的视角，涉及观点与未知事实时保留该视角。
 */

export const worldChapters = [
  {
    id: 1,
    no: 'CHAPTER 01',
    name: '源石 天灾 矿石病',
    en: 'ORIGINIUM',
    lead: '从一块矿石开始：源石如何成为泰拉的能源、灾祸与疾病。',
  },
  {
    id: 2,
    no: 'CHAPTER 02',
    name: '泰拉科技',
    en: 'TERRA TECHNOLOGY',
    lead: '移动城市、源石技术与工业体系，如何塑造了这个世界的政治地图。',
  },
  {
    id: 3,
    no: 'CHAPTER 03',
    name: '泰拉生物',
    en: 'TERRA BIOLOGY',
    lead: '常见生物、巨兽与海嗣：哪些能被理解，哪些只能被记录。',
  },
  {
    id: 4,
    no: 'CHAPTER 04',
    name: '泰拉种族',
    en: 'RACES',
    lead: '种族、国籍与组织是三种不同的分类，不能互相替代。',
  },
  {
    id: 5,
    no: 'CHAPTER 05',
    name: '国家和地区',
    en: 'NATIONS & REGIONS',
    lead: '从维多利亚到卡兹戴尔：国家的历史、治理与社会结构。',
  },
  {
    id: 6,
    no: 'CHAPTER 06',
    name: '组织',
    en: 'ORGANIZATIONS',
    lead: '医疗、科研、企业与武装组织，以及它们之间纠缠的目标。',
  },
]

const entry = (data) => ({
  status: 'draft',
  updated: '2026-10-25',
  ...data,
})

export const worldEntries = [
  entry({
    id: 'originium',
    chapter: 1,
    index: 1,
    name: '源石',
    en: 'ORIGINIUM',
    illustration: 'crystal',
    lead: '源石是泰拉广泛存在的矿物与能源，也是天灾与矿石病的源头。它既是工业文明的地基，也是这个世界的长期伤口。',
    sections: [
      {
        heading: '概念与分布',
        body: '源石以结晶形态存在于地脉与地表，遇特定条件会活性化并释放能量。各国的能源、交通与军事体系都建立在对它的开采与转化上。',
        spoiler: 0,
      },
      {
        heading: '双重性质',
        body: '同一块源石可以点亮一座城市，也可以让整片街区变成感染区。泰拉社会对源石的态度，本质上是对「代价由谁承担」的长期回避。',
        spoiler: 1,
      },
      {
        heading: '深层真相',
        body: '部分剧情暗示源石的起源与泰拉的生命形态、乃至更古老的文明有关。本站不把推测写成结论，相关线索应结合剧情原文与出处阅读。',
        spoiler: 2,
      },
    ],
    related: {
      stories: ['main-00', 'sid-09', 'main-12'],
      people: ['amiya', 'kaltsit', 'saria'],
      locations: ['columbia', 'ursus', 'kazdel'],
    },
    source: {
      text: '《大地巡旅：〈明日方舟〉官方世界观设定集》第一章；游戏内剧情多处',
      page: '版次与页码待核对',
      refs: ['https://prts.wiki/w/泰拉词库'],
    },
  }),
  entry({
    id: 'originium-arts',
    chapter: 1,
    index: 2,
    name: '源石技艺',
    en: 'ORIGINIUM ARTS',
    illustration: 'crystal',
    lead: '通过源石与自身神经系统的结合操控能量、物质或感知的技术统称。施术者通常被称为术师，代价与天赋同时存在。',
    sections: [
      {
        heading: '运作方式',
        body: '术师借助源石触媒或自身结晶化组织引导源石能量，表现为火焰、重力、冰霜、念力等。技艺的稳定性与施术者的健康状况直接相关。',
        spoiler: 0,
      },
      {
        heading: '社会地位',
        body: '在莱塔尼亚等国，术师身份带来阶层优势；在乌萨斯等地，术师则被纳入军事管制。技艺从来不是纯粹的技术问题。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['sid-09', 'main-01', 'main-06'],
      people: ['ifrit', 'amiya', 'talulah', 'nian'],
      locations: ['leithanien', 'ursus'],
    },
    source: { text: '《大地巡旅》第一章；干员档案与剧情', page: '待核对', refs: [] },
  }),
  entry({
    id: 'catastrophe',
    chapter: 1,
    index: 3,
    name: '天灾',
    en: 'CATASTROPHE',
    illustration: 'storm',
    lead: '周期性的极端灾害，常伴随源石活性化与地形改变。天灾迫使移动城市不断迁移，也制造了大量感染者与难民。',
    sections: [
      {
        heading: '类型与预警',
        body: '天灾表现为风暴、地震、源石雨等多种形式，各国依靠观测站与天灾信使提前疏散。预警能力差距直接决定了伤亡规模。',
        spoiler: 0,
      },
      {
        heading: '灾后城市',
        body: '切尔诺伯格是天灾后城市命运的典型案例：航线被迫改变，城区被放弃，感染者与难民在废墟中形成新的秩序。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['main-00', 'main-08'],
      people: ['amiya', 'doctor'],
      locations: ['chernobog', 'ursus'],
    },
    source: { text: '《大地巡旅》第一章；主线序章与第八章', page: '待核对', refs: [] },
  }),
  entry({
    id: 'oripathy',
    chapter: 1,
    index: 4,
    name: '矿石病',
    en: 'ORIPATHY',
    illustration: 'crystal-dark',
    lead: '源石在人体内结晶化引起的疾病。感染者的体表会出现源石结晶，并逐渐丧失身体机能，社会歧视往往比病症更早杀死他们。',
    sections: [
      {
        heading: '病程与传染',
        body: '矿石病不通过日常接触传播，但感染者死亡后结晶化会形成新的感染源。这一特性被大量用于制造恐惧与隔离政策。',
        spoiler: 0,
      },
      {
        heading: '感染者处境',
        body: '各国的处理方式从收容、隔离到强制劳动不等。罗德岛的医疗方案无法根治，只能延缓病程。',
        spoiler: 1,
      },
      {
        heading: '剧情中的关键病例',
        body: '多位主要角色的病程与选择构成主线的情感核心，相关病程和人物选择可结合对应剧情阅读。',
        spoiler: 2,
      },
    ],
    related: {
      stories: ['main-00', 'main-06', 'sid-12'],
      people: ['amiya', 'frostnova', 'ifrit', 'mudrock'],
      locations: ['ursus', 'lungmen', 'columbia'],
    },
    source: { text: '《大地巡旅》第一章；主线多章', page: '待核对', refs: [] },
  }),

  entry({
    id: 'mobile-city',
    chapter: 2,
    index: 1,
    name: '移动城市',
    en: 'MOBILE CITY',
    illustration: 'city-industrial',
    lead: '建立在大规模源石引擎上的可移动城市，是天灾环境下最有效的生存方案，也是国家实力的直接体现。',
    sections: [
      {
        heading: '结构与运作',
        body: '城市依靠底层履带或浮空结构迁移，航线由观测站与导航机构协调。维护成本极高，只有强国与大型企业能够长期负担。',
        spoiler: 0,
      },
      {
        heading: '政治含义',
        body: '能移动的城市意味着可以放弃土地、也可以进入他国境内。移动能力因此成为外交与军事谈判中的筹码。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['main-00', 'main-09'],
      people: ['kaltsit'],
      locations: ['chernobog', 'londinium', 'ursus'],
    },
    source: { text: '《大地巡旅》第二章', page: '待核对', refs: [] },
  }),
  entry({
    id: 'energy-transport',
    chapter: 2,
    index: 2,
    name: '能源与交通',
    en: 'ENERGY & TRANSPORT',
    illustration: 'factory',
    lead: '源石精炼产物支撑了泰拉的能源网络；陆行舰、铁路与信使系统则决定了信息与物资能走多远。',
    sections: [
      {
        heading: '能源结构',
        body: '高纯度源石制品能量密度极高，但提炼与运输风险同样高。能源价格直接影响到感染者政策与边境冲突。',
        spoiler: 0,
      },
      {
        heading: '信使与物流',
        body: '在通讯不稳定的地区，信使承担了银行、邮局与情报站的三重职能。企鹅物流这类组织因此拥有超出商业的影响力。',
        spoiler: 0,
      },
    ],
    related: {
      stories: ['sid-03'],
      people: ['texas', 'exusiai', 'elysium'],
      locations: ['lungmen', 'columbia'],
    },
    source: { text: '《大地巡旅》第二章；SideStory《喧闹法则》', page: '待核对', refs: [] },
  }),
  entry({
    id: 'weapons',
    chapter: 2,
    index: 3,
    name: '武器与装备',
    en: 'WEAPONS & EQUIPMENT',
    illustration: 'factory',
    lead: '泰拉的武装在冷兵器与源石器械之间形成独特混合：剑与盾仍然有效，术师与弩炮则改变了战场距离。',
    sections: [
      {
        heading: '装备体系',
        body: '干员的装备按职能划分，重装、狙击、术师之间依靠配合而非单一优势取胜。装备维护依赖源石技术与专业工匠。',
        spoiler: 0,
      },
      {
        heading: '限制与代价',
        body: '高强度源石装备会加重使用者负担，长期作战的干员往往需要医疗介入。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['sid-09', 'main-10'],
      people: ['saria', 'blaze', 'rosmontis'],
      locations: ['columbia', 'victoria'],
    },
    source: { text: '《大地巡旅》第二章；干员档案', page: '待核对', refs: [] },
  }),
  entry({
    id: 'communications',
    chapter: 2,
    index: 4,
    name: '通讯与信息',
    en: 'COMMUNICATION',
    illustration: 'tower',
    lead: '源石干扰使远距离通讯极不稳定，各国依赖中继站、信使与加密文书。信息差常常比兵力差更致命。',
    sections: [
      {
        heading: '技术条件',
        body: '城市内部依靠有线与短波网络，跨区域通讯需要中继塔。天灾与源石活动会直接切断链路。',
        spoiler: 0,
      },
      {
        heading: '情报与审查',
        body: '主要国家都设有情报机构，对感染者相关信息进行管控。档案是否公开，本身就是一种政治表态。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['main-09', 'sid-09'],
      people: ['kaltsit', 'silence'],
      locations: ['victoria', 'columbia'],
    },
    source: { text: '《大地巡旅》第二章', page: '待核对', refs: [] },
  }),

  entry({
    id: 'wildlife',
    chapter: 3,
    index: 1,
    name: '泰拉生物',
    en: 'WILDLIFE',
    illustration: 'forest',
    lead: '泰拉的生态与源石高度耦合。常见动植物多数可被常规理解，但少数存在无法用现有分类解释。',
    sections: [
      {
        heading: '常见生态',
        body: '不同气候带的生物差异显著，源石污染区域会出现变异个体。猎人依靠经验而非教科书辨识危险。',
        spoiler: 0,
      },
      {
        heading: '分类的边界',
        body: '海嗣、巨兽与「邪魔」并不共享同一套解释框架，档案将它们分别处理，避免用一个标签覆盖不同性质。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['col-02', 'sid-05'],
      people: ['skadi', 'specter'],
      locations: ['sami', 'aegir'],
    },
    source: { text: '《大地巡旅》第三章', page: '待核对', refs: [] },
  }),
  entry({
    id: 'seaborn',
    chapter: 3,
    index: 2,
    name: '海嗣',
    en: 'SEABORN',
    illustration: 'sea',
    lead: '来自海洋的存在，能侵蚀、同化生物并共享意识。伊比利亚的封闭与深海猎人的存在都与它们直接相关。',
    sections: [
      {
        heading: '性质',
        body: '海嗣以群体形式行动，个体可被改造为新的形态。它们对陆地的扩展并非单纯的捕食，更像一种无法沟通的「归化」。',
        spoiler: 1,
      },
      {
        heading: '应对方式',
        body: '伊比利亚依靠宗教与封锁，深海猎人依靠猎杀。两种方式都以牺牲为代价，且都未能真正解决问题。',
        spoiler: 2,
      },
    ],
    related: {
      stories: ['sid-05', 'sid-06'],
      people: ['skadi', 'specter', 'gladia'],
      locations: ['iberia', 'aegir', 'iberia-sea'],
    },
    source: { text: '《大地巡旅》第三章；SideStory《覆潮之下》《愚人号》', page: '待核对', refs: ['https://prts.wiki/w/泰拉大典:地理'] },
  }),
  entry({
    id: 'colossus',
    chapter: 3,
    index: 3,
    name: '巨兽',
    en: 'COLOSSUS',
    illustration: 'mountain',
    lead: '体型与寿命都超出常规认知的生物，常与地方信仰、部族禁忌绑定。萨米的森林是相关记录最集中的地区。',
    sections: [
      {
        heading: '记录方式',
        body: '巨兽很少被直接观测，档案多来自猎人证词与灾害记录。不同部族对同一头巨兽的称呼可能完全不同。',
        spoiler: 0,
      },
      {
        heading: '与人的关系',
        body: '部分聚落以供奉换取安全，另一些则以猎杀证明成年。这类关系不应被简化为「信仰」或「迷信」。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['col-02'],
      people: [],
      locations: ['sami'],
    },
    source: { text: '《大地巡旅》第三章；故事集《眠于树影之中》', page: '待核对', refs: [] },
  }),
  entry({
    id: 'fiends',
    chapter: 3,
    index: 4,
    name: '邪魔',
    en: 'FIENDS',
    illustration: 'dark',
    lead: '在极北与深海记录中出现的高危存在，相关档案大多被封锁。其性质在不同来源之间互相矛盾，暂无统一定义。',
    sections: [
      {
        heading: '已知记录',
        body: '邪魔与常规生物的分类不兼容，接触者常出现认知与记忆异常。相关记录可结合对应的北境剧情阅读。',
        spoiler: 2,
      },
      {
        heading: '编辑说明',
        body: '本站不合并互相矛盾的来源，保留「记录者观点」与「后续揭示」两层，读者可自行判断。',
        spoiler: 2,
      },
    ],
    related: {
      stories: ['col-02', 'main-13'],
      people: [],
      locations: ['sami'],
    },
    source: { text: '《大地巡旅》第三章；未确认条目', page: '待核对', refs: [] },
  }),

  entry({
    id: 'races',
    chapter: 4,
    index: 1,
    name: '种族概述',
    en: 'RACES',
    illustration: 'people',
    lead: '泰拉存在大量具有动物特征的种族，种族、国籍与组织是三套独立分类。把它们混为一谈会直接破坏检索与关系判断。',
    sections: [
      {
        heading: '分类原则',
        body: '种族描述生理与部分文化倾向，国籍描述政治归属，组织描述当前立场。人物可以同时是某国公民、某组织成员与某个种族。',
        spoiler: 0,
      },
      {
        heading: '常见误解',
        body: '「某族都如何」的说法在资料中多来自世界内偏见，不应作为事实引用。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['main-02', 'sid-12'],
      people: ['chen', 'texas', 'silverash'],
      locations: ['yan', 'siracusa', 'kjerag'],
    },
    source: { text: '《大地巡旅》第四章；PRTS 泰拉词库', page: '待核对', refs: [] },
  }),
  entry({
    id: 'felines',
    chapter: 4,
    index: 2,
    name: '菲林',
    en: 'FELINE',
    illustration: 'people',
    lead: '分布最广的种族之一，多数具有猫科特征。菲林并不对应单一文化，跨国分布使其社会身份差异极大。',
    sections: [
      {
        heading: '特征与文化',
        body: '感官灵敏、耳部与尾部特征明显。菲林在谢拉格、维多利亚、乌萨斯均有重要人物，不能以国籍反推种族。',
        spoiler: 0,
      },
      {
        heading: '资料注意',
        body: '「菲林善于战斗」等描述属世界内刻板印象，档案仅作为观点保留。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['sid-08', 'main-06'],
      people: ['silverash', 'pramanix', 'kaltsit', 'blaze', 'hellagur'],
      locations: ['kjerag', 'ursus'],
    },
    source: { text: '《大地巡旅》第四章', page: '待核对', refs: [] },
  }),
  entry({
    id: 'lupo',
    chapter: 4,
    index: 3,
    name: '鲁珀',
    en: 'LUPO',
    illustration: 'people',
    lead: '具有犬狼特征的种族，在叙拉古与玻利瓦尔较为集中。家族文化与鲁珀身份常被外人混淆。',
    sections: [
      {
        heading: '社会分布',
        body: '叙拉古的家族体系与鲁珀传统有关，但家族成员并不限于鲁珀。把家族等同于种族是错误的简化。',
        spoiler: 0,
      },
      {
        heading: '代表人物',
        body: '德克萨斯与拉普兰德同为鲁珀，却分属完全不同的立场与生活。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['sid-13', 'sid-03'],
      people: ['texas', 'lappland'],
      locations: ['siracusa', 'bolivar'],
    },
    source: { text: '《大地巡旅》第四章；SideStory《叙拉古人》', page: '待核对', refs: [] },
  }),
  entry({
    id: 'sarkaz',
    chapter: 4,
    index: 4,
    name: '萨卡兹',
    en: 'SARKAZ',
    illustration: 'people-dark',
    lead: '长期遭受歧视与战争的种族，卡兹戴尔的分裂使「萨卡兹」既是一个族群称谓，也是一组互相冲突的政治身份。',
    sections: [
      {
        heading: '历史处境',
        body: '萨卡兹的故土多次被外部势力介入，王庭与部族之间的分裂延续至今。对萨卡兹的敌意是泰拉最普遍的偏见之一。',
        spoiler: 1,
      },
      {
        heading: '内部差异',
        body: '萨卡兹内部存在不同族群与立场，既有整合运动的激进派，也有使徒这样的流浪者，不能以单一标签概括。',
        spoiler: 1,
      },
      {
        heading: '王庭与巴别塔',
        body: '涉及王庭、魔王与巴别塔的线索，可通过下方关联剧情与人物档案继续阅读。',
        spoiler: 2,
      },
    ],
    related: {
      stories: ['sid-04', 'sid-14', 'main-10'],
      people: ['w', 'shining', 'mudrock'],
      locations: ['kazdel', 'londinium'],
    },
    source: { text: '《大地巡旅》第四章；SideStory《生于黑夜》', page: '待核对', refs: [] },
  }),

  entry({
    id: 'victoria-country',
    chapter: 5,
    index: 1,
    name: '维多利亚',
    en: 'VICTORIA',
    illustration: 'city-industrial',
    lead: '西部工业强国，蒸汽、议会与殖民地记忆共同构成国家底色。王位危机之后，伦蒂尼姆成为泰拉最危险的城市之一。',
    sections: [
      {
        heading: '历史与治理',
        body: '维多利亚依靠工业革命与海外扩张崛起，议会与贵族共享权力。王室权威衰退后，各方势力开始争夺合法性。',
        spoiler: 1,
      },
      {
        heading: '社会与感染者',
        body: '工厂区集中了大量感染者劳工，政策上的宽容与执行中的隔离同时存在。塔拉的独立情绪进一步削弱中央控制。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['main-09', 'main-10', 'main-11'],
      people: ['siege', 'chen'],
      locations: ['londinium', 'tara'],
    },
    source: { text: '《大地巡旅》第五章；主线第九至十三章', page: '待核对', refs: [] },
  }),
  entry({
    id: 'ursus-country',
    chapter: 5,
    index: 2,
    name: '乌萨斯',
    en: 'URSUS',
    illustration: 'snow-city',
    lead: '北方帝国，以军功、皇权与矿场维系秩序。对感染者的强硬政策使其成为整合运动最直接的招募来源。',
    sections: [
      {
        heading: '国家结构',
        body: '乌萨斯的军功贵族与皇权长期互相依赖，边境军区拥有相当自主权。移动城市与矿场构成国家经济骨架。',
        spoiler: 1,
      },
      {
        heading: '感染者政策',
        body: '感染者被集中管理并用于高风险劳动。切尔诺伯格事件后，这套体系的裂缝被彻底暴露。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['main-00', 'main-07', 'sid-12'],
      people: ['patriot', 'hellagur', 'talulah'],
      locations: ['ursus', 'chernobog', 'ursus-border'],
    },
    source: { text: '《大地巡旅》第五章；主线第七、八章', page: '待核对', refs: [] },
  }),
  entry({
    id: 'yan-country',
    chapter: 5,
    index: 3,
    name: '大炎',
    en: 'YAN',
    illustration: 'yan',
    lead: '东方帝国，官僚制度成熟，对源石与特殊存在的管理极为严格。内地、边关与沿海特别行政区差异显著。',
    sections: [
      {
        heading: '治理结构',
        body: '大炎通过科举式选拔维持官僚体系，中央对地方的控制强于多数国家。龙门享有特殊政策。',
        spoiler: 0,
      },
      {
        heading: '「岁」与源石',
        body: '大炎将「岁」相关事务视为需要长期处理的问题，相关机构与档案并不对外公开。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['sid-10', 'sid-11', 'main-02'],
      people: ['nian', 'ling', 'dusk', 'chongyue', 'chen'],
      locations: ['yan', 'lungmen', 'yumen', 'shangshu'],
    },
    source: { text: '《大地巡旅》第五章；SideStory《将进酒》《登临意》', page: '待核对', refs: [] },
  }),
  entry({
    id: 'kazdel-country',
    chapter: 5,
    index: 4,
    name: '卡兹戴尔',
    en: 'KAZDEL',
    illustration: 'ruins',
    lead: '萨卡兹的故土，也是泰拉最难被地图固定的地区之一。国境、王庭与部族的边界在文献中反复变化。',
    sections: [
      {
        heading: '地理与政治',
        body: '卡兹戴尔长期处于分裂状态，外部势力的介入使统一进程反复中断。地图只标出大致区域。',
        spoiler: 1,
      },
      {
        heading: '巴别塔的痕迹',
        body: '巴别塔曾在此活动，其失败与特蕾西娅之死是理解当代萨卡兹政治的关键。',
        spoiler: 2,
      },
    ],
    related: {
      stories: ['sid-04', 'sid-14'],
      people: ['w', 'shining', 'mudrock'],
      locations: ['kazdel'],
    },
    source: { text: '《大地巡旅》第五章；SideStory《巴别塔》', page: '待核对', refs: [] },
  }),

  entry({
    id: 'rhodes-org',
    chapter: 6,
    index: 1,
    name: '罗德岛',
    en: 'RHODES ISLAND',
    illustration: 'ark',
    lead: '以陆行舰为基地的医疗与研究组织，同时承担救援、护送与武装行动。对外保持非国家身份，实际影响力已超出组织规模。',
    sections: [
      {
        heading: '性质与目标',
        body: '罗德岛的核心目标是为感染者提供医疗与生存空间。为实现这一点，它必须在各国之间保持可谈判的关系，也因此不断做出妥协。',
        spoiler: 0,
      },
      {
        heading: '内部结构',
        body: '医疗部门、行动组与精英干员构成主要架构。凯尔希负责医疗与战略，阿米娅担任公开领袖。',
        spoiler: 0,
      },
      {
        heading: '与巴别塔的关系',
        body: '罗德岛继承自巴别塔的网络，但两者在目标与手段上并不相同。',
        spoiler: 2,
      },
    ],
    related: {
      stories: ['main-00', 'main-08', 'sid-14'],
      people: ['amiya', 'doctor', 'kaltsit', 'blaze', 'rosmontis'],
      locations: ['rhodes-island', 'chernobog'],
    },
    source: { text: '《大地巡旅》第六章；主线及干员档案', page: '待核对', refs: [] },
  }),
  entry({
    id: 'babel-org',
    chapter: 6,
    index: 2,
    name: '巴别塔',
    en: 'BABEL',
    illustration: 'tower-dark',
    lead: '已解散的组织，罗德岛的前身之一。它的理想、内部分裂与最终崩解，是理解多位主要角色动机的前提。',
    sections: [
      {
        heading: '历史',
        body: '巴别塔在卡兹戴尔战争后期建立，试图为萨卡兹与感染者寻找新的可能。特蕾西娅之死后组织迅速瓦解。',
        spoiler: 2,
      },
      {
        heading: '成员与遗产',
        body: '凯尔希、W 与博士都与巴别塔有直接关系。罗德岛继承了其医疗网络，但公开否认继承其政治目标。',
        spoiler: 2,
      },
    ],
    related: {
      stories: ['sid-14', 'sid-04'],
      people: ['kaltsit', 'w', 'doctor'],
      locations: ['kazdel'],
    },
    source: { text: '《大地巡旅》第六章；SideStory《巴别塔》', page: '待核对', refs: [] },
  }),
  entry({
    id: 'reunion-org',
    chapter: 6,
    index: 3,
    name: '整合运动',
    en: 'REUNION',
    illustration: 'fire',
    lead: '由感染者组成的武装运动，以推翻压迫性秩序为目标。组织松散、派系林立，在切尔诺伯格与龙门达到力量顶点后迅速分裂。',
    sections: [
      {
        heading: '目标与手段',
        body: '整合运动以武装斗争回应感染者政策，成员构成复杂，既有理想主义者也有纯粹的复仇者。',
        spoiler: 1,
      },
      {
        heading: '内部裂痕',
        body: '塔露拉、爱国者、霜星与泥岩小队之间存在明显分歧，这些分歧在第八章后彻底爆发。',
        spoiler: 2,
      },
    ],
    related: {
      stories: ['main-01', 'main-07', 'main-08', 'sid-12'],
      people: ['talulah', 'patriot', 'frostnova', 'w', 'mudrock'],
      locations: ['chernobog', 'ursus-border', 'lungmen'],
    },
    source: { text: '《大地巡旅》第六章；主线第一至八章', page: '待核对', refs: [] },
  }),
  entry({
    id: 'rhine-org',
    chapter: 6,
    index: 4,
    name: '莱茵生命',
    en: 'RHINE LAB',
    illustration: 'lab',
    lead: '哥伦比亚的科研企业，业务覆盖源石技术、生命科学与防卫装备。实验伦理问题与企业权力是其主要争议点。',
    sections: [
      {
        heading: '研究方向',
        body: '莱茵生命在源石与人体结合领域投入巨大，伊芙利特的案例说明其研究边界长期缺乏有效监督。',
        spoiler: 1,
      },
      {
        heading: '关键人物',
        body: '塞雷娅、赫默与伊芙利特的关系构成孤星事件的情感核心，也暴露了企业内部的权力结构。',
        spoiler: 2,
      },
    ],
    related: {
      stories: ['sid-09'],
      people: ['ifrit', 'saria', 'silence'],
      locations: ['columbia'],
    },
    source: { text: '《大地巡旅》第六章；SideStory《孤星》', page: '待核对', refs: [] },
  }),
  entry({
    id: 'penguin-org',
    chapter: 6,
    index: 5,
    name: '企鹅物流',
    en: 'PENGUIN LOGISTICS',
    illustration: 'city-night',
    lead: '龙门起家的物流与佣兵组织，业务范围从快递延伸到武装押运。成员关系松散，却有一套自己的规矩。',
    sections: [
      {
        heading: '业务与立场',
        body: '企鹅物流不参与政治表态，只对委托与同伴负责。这种中立使其能在多方之间长期存活。',
        spoiler: 0,
      },
      {
        heading: '成员',
        body: '能天使、德克萨斯与拉普兰德的交集大多发生在这家公司的委托之中。',
        spoiler: 1,
      },
    ],
    related: {
      stories: ['sid-03', 'sid-13'],
      people: ['exusiai', 'texas', 'lappland'],
      locations: ['lungmen', 'siracusa'],
    },
    source: { text: '《大地巡旅》第六章；SideStory《喧闹法则》', page: '待核对', refs: [] },
  }),
]

export const entriesByChapter = (chapterId) => worldEntries.filter((e) => e.chapter === chapterId)
export const entryById = Object.fromEntries(worldEntries.map((e) => [e.id, e]))
