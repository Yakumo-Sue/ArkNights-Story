/**
 * 全站元信息
 * 站点为非官方同人档案，所有资源与资料均标注来源与核对状态。
 */

export const SITE = {
  name: '罗德岛剧情档案',
  nameEn: 'RHODES ISLAND STORY ARCHIVE',
  subtitle: '泰拉剧情档案',
  subtitleEn: 'STORIES ACROSS TERRA',
  disclaimer: '非官方剧情档案',
  // 内容截止日期与修订记录（需求：页面显示内容截止日期与修订记录）
  contentCutoff: '2026-10-25',
  buildRevision: '0.9.3-demo',
  revisions: [
    {
      version: '0.9.3',
      date: '2026-10-27',
      notes: [
        '取消全站剧透模式与阅读遮罩，导航、移动菜单和页脚不再提供模式设置；旧偏好不会影响显示。',
        '时间轴改为按阶段聚合的竖线，点击后局部拉宽并展开剧情圆点；下方显示该阶段全部剧情名称，与封面和概览同步。',
        '跨年片段进入所有相关阶段，年代未定独立保留；补齐8张官方活动封面，当前32个故事都有可追溯的本地封面。',
      ],
    },
    {
      version: '0.9.2',
      date: '2026-10-27',
      notes: [
        '首页背景改为 15-15「拒绝哀悼」行动后决战群像 60_i11_2L/2R，横屏连续、窄屏分两排展示原始完整画面。',
        '首页标题更新为「明日方舟 / ARKNIGHTS」，导航左侧使用国服官网原始透明 SVG Logo。',
      ],
    },
    {
      version: '0.9.1',
      date: '2026-10-27',
      notes: [
        '首页采用主线 15-4 行动后 CG 60_i17，保留图片出处与核心人物群像说明。',
        '开场改为统一时钟、资源解码后播放；径向裂纹与缓存镜片通过三维旋转和透视投影散开，支持跳过、重播、后台暂停及减少动态效果。',
        '四主页面统一滚轮手势：累计小幅滚动、每次手势只翻一页；长文先滚动，时间轴、输入控件和弹窗保持独立交互。',
      ],
    },
    {
      version: '0.9.0',
      date: '2026-10-26',
      notes: [
        '按《需求与视觉方案 V1.1》搭建 P0 基础版本：四主页面、双排序时间轴、剧情播放器、图谱、地图、干员、六章设定、音乐与图集入口。',
        '时间轴、关系、地图、设定数据统一为一份资料多视图结构，剧情播放器逐句脚本仅导入示例片段。',
      ],
    },
    {
      version: '0.8.2',
      date: '2026-10-25',
      notes: ['剧情底稿整理至 688 个叙事单元；73 组主线与 SideStory 展开为 943 组剧情节点（导入候选）。'],
    },
    {
      version: '0.8.0',
      date: '2026-10-20',
      notes: ['完成六章设定目录与首批词条结构；补充来源与最后核对日期字段。'],
    },
  ],
  dataNotes: [
    '本站为玩家整理的非官方档案，与鹰角网络及《明日方舟》官方无隶属关系。',
    '首页 CG 与总览主视觉保留来源；其余演示剧情脚本、曲目与占位图仍为结构示例。',
    '所有时间标签区分「明示 / 推定 / 未定」；未标注明示的年代均按剧情关系推定，可点击标签查看依据。',
  ],
  officialLinks: [
    { label: '明日方舟官网', href: 'https://ak.hypergryph.com/' },
    { label: 'PRTS 剧情一览', href: 'https://prts.wiki/w/剧情一览' },
    { label: '塞壬唱片', href: 'https://monster-siren.hypergryph.com/' },
    { label: '大地巡旅（PRTS 书目）', href: 'https://prts.wiki/w/大地巡旅' },
  ],
}

// 四个主页面：导航顺序、地址、页码
export const PRIMARY_PAGES = [
  { key: 'home', to: '/home', en: 'INDEX', cn: '首页', no: '01' },
  { key: 'overview', to: '/overview', en: 'OVERVIEW', cn: '总览', no: '02' },
  { key: 'world', to: '/world', en: 'WORLD', cn: '设定', no: '03' },
  { key: 'more', to: '/more', en: 'MORE', cn: '其他', no: '04' },
]

export const CERTAINTY_LABEL = {
  stated: '明示',
  inferred: '推定',
  unknown: '未定',
}

export const CERTAINTY_HINT = {
  stated: '来源直接给出时间',
  inferred: '编辑据事件关系得到区间',
  unknown: '暂无足够依据，保留候选区间',
}

export const DATA_STATUS = {
  demo: { label: '示例数据', tone: 'warn' },
  draft: { label: '待核对', tone: 'warn' },
  verified: { label: '已核对', tone: 'ok' },
}
