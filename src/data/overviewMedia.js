/**
 * 总览主视觉：来自 Arknights Terra Wiki 的官方活动档案图
 * 图片下载后存放在 public/assets/overview/，按故事 id 对应。
 * 未收录的故事保留 Scene 程序化场景作为兜底。
 */

const BASE = (import.meta.env?.BASE_URL ?? '/')
const img = (id) => `${BASE}assets/overview/${id}.webp`
const wiki = (page) => `https://arknights.wiki.gg/wiki/${page}`

const entry = (id, page, kind = 'wide') => ({
  image: img(id),
  page: wiki(page),
  kind,
  credit: 'Arknights Terra Wiki',
})

export const overviewMedia = {
  'main-00': entry('main-00', 'Prologue'),
  'main-01': entry('main-01', 'Episode_01'),
  'main-02': entry('main-02', 'Episode_02'),
  'main-03': entry('main-03', 'Episode_03'),
  'main-04': entry('main-04', 'Episode_04'),
  'main-05': entry('main-05', 'Episode_05'),
  'main-06': entry('main-06', 'Episode_06'),
  'main-07': entry('main-07', 'Episode_07'),
  'main-08': entry('main-08', 'Episode_08'),
  'main-09': entry('main-09', 'Episode_09'),
  'main-10': entry('main-10', 'Episode_10'),
  'main-11': entry('main-11', 'Episode_11'),
  'main-12': entry('main-12', 'Episode_12'),
  'main-13': entry('main-13', 'Episode_13'),

  'sid-01': entry('sid-01', "Grani_and_the_Knights%27_Treasure", 'portrait'),
  'sid-02': entry('sid-02', 'Heart_of_Surging_Flame', 'portrait'),
  'sid-04': entry('sid-04', 'Darknights_Memoir', 'portrait'),
  'sid-05': entry('sid-05', 'Under_Tides', 'portrait'),
  'sid-06': entry('sid-06', 'Stultifera_Navis', 'portrait'),
  'sid-07': entry('sid-07', 'Near_Light', 'portrait'),
  'sid-09': entry('sid-09', 'Lone_Trail', 'portrait'),
  'sid-10': entry('sid-10', 'Invitation_to_Wine', 'portrait'),
  'sid-12': entry('sid-12', 'Children_of_Ursus', 'portrait'),
  'sid-14': entry('sid-14', 'Babel_(event)', 'portrait'),
  'sid-03': {image:img('sid-03'),page:'https://ak.hypergryph.com/news/2019114364.html',kind:'wide',credit:'明日方舟官网'},
  'sid-08': {image:img('sid-08'),page:'https://ak.hypergryph.com/news/2021120792.html',kind:'wide',credit:'明日方舟官网'},
  'sid-11': {image:img('sid-11'),page:'https://ak.hypergryph.com/news/2023013981.html',kind:'wide',credit:'明日方舟官网'},
  'sid-13': {image:img('sid-13'),page:'https://ak.hypergryph.com/news/2022103870.html',kind:'wide',credit:'明日方舟官网'},
  'col-01': {image:img('col-01'),page:'https://ak.hypergryph.com/news/2020097786.html',kind:'wide',credit:'明日方舟官网'},
  'col-02': {image:img('col-02'),page:'https://ak.hypergryph.com/news/2023065294.html',kind:'wide',credit:'明日方舟官网'},
  'col-03': {image:img('col-03'),page:'https://ak.hypergryph.com/news/2023115129.html',kind:'wide',credit:'明日方舟官网'},
  'col-04': {image:img('col-04'),page:'https://ak.hypergryph.com/news/2021039884.html',kind:'wide',credit:'明日方舟官网'},
}
