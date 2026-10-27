/**
 * 人物关系
 * 每条正式连线都能查到说明、有效时间、出处与确定程度。
 * 「共同出场」只支持 story 类型，不自动生成亲属或师承关系。
 */

export const relationTypes = {
  affiliation: { label: '所属', color: '#3f7f8f', dash: '' },
  former: { label: '曾所属', color: '#7d868f', dash: '5 4' },
  kin: { label: '亲属', color: '#c9a35c', dash: '' },
  mentor: { label: '师承', color: '#8fa3c8', dash: '2 3' },
  ally: { label: '合作', color: '#42DDE5', dash: '' },
  conflict: { label: '冲突', color: '#c2705a', dash: '7 4' },
  story: { label: '剧情关联', color: '#6f7d89', dash: '1 4' },
}

const edge = (id, a, b, type, since, until, note, source, certainty = 'inferred', spoiler = 1) => ({
  id,
  a,
  b,
  type,
  since,
  until,
  note,
  source,
  certainty,
  spoiler,
})

export const relations = [
  edge('r01', 'amiya', 'doctor', 'story', 1096, null, '在切尔诺伯格共同行动，博士作为指挥官加入罗德岛。', '序章《黑暗时代·上》', 'stated', 0),
  edge('r02', 'amiya', 'kaltsit', 'mentor', 1096, null, '凯尔希长期担任阿米娅的导师与监护人之一。', '主线序章至第八章对话', 'stated', 0),
  edge('r03', 'kaltsit', 'doctor', 'story', 1091, 1096, '巴别塔时期已有交集；具体共事范围与结束时间待核对。', 'SideStory《巴别塔》', 'inferred', 2),
  edge('r04', 'amiya', 'w', 'conflict', 1096, null, '多次在切尔诺伯格与伦蒂尼姆交手，立场对立但存在临时合作。', '主线第一、八章', 'stated', 1),
  edge('r05', 'w', 'talulah', 'former', 1096, 1098, 'W 曾隶属整合运动，最终背离塔露拉。', '主线第八章', 'stated', 1),
  edge('r06', 'talulah', 'chen', 'kin', 1097, null, '姐妹关系，剧情内长期未被公开，属高风险剧透线索。', '主线第六章相关对话', 'inferred', 2),
  edge('r07', 'talulah', 'patriot', 'ally', 1096, 1098, '整合运动内部的军事合作关系。', '主线第七、八章', 'stated', 1),
  edge('r08', 'patriot', 'frostnova', 'kin', 1096, 1098, '父女关系，在第七至八章间揭示。', '主线第七章', 'stated', 2),
  edge('r09', 'frostnova', 'amiya', 'conflict', 1097, 1098, '龙门与切尔诺伯格期间的直接交战。', '主线第五至六章', 'stated', 1),
  edge('r10', 'chen', 'hoshiguma', 'ally', 1097, null, '龙门近卫局的长期搭档。', '主线第二至五章', 'stated', 0),
  edge('r11', 'texas', 'exusiai', 'ally', 1097, null, '企鹅物流同僚，多次共同执行委托。', 'SideStory《喧闹法则》', 'stated', 0),
  edge('r12', 'texas', 'lappland', 'conflict', 1099, null, '叙拉古旧识，关系以追杀与试探为主。', 'SideStory《叙拉古人》', 'stated', 1),
  edge('r13', 'exusiai', 'mostima', 'ally', 1097, null, '拉特兰旧识，现各自行动。', 'SideStory《愚人号》', 'inferred', 1),
  edge('r14', 'silverash', 'pramanix', 'kin', 1098, null, '兄妹关系，政见与信仰立场分歧明显。', 'SideStory《风雪过境》', 'stated', 0),
  edge('r15', 'ifrit', 'saria', 'mentor', 1099, null, '塞雷娅负责监视并保护伊芙利特。', 'SideStory《孤星》', 'inferred', 1),
  edge('r16', 'ifrit', 'silence', 'ally', 1099, null, '赫默参与伊芙利特的治疗与观察。', 'SideStory《孤星》', 'stated', 1),
  edge('r17', 'saria', 'silence', 'former', 1099, null, '莱茵生命时期的前同事。', 'SideStory《孤星》', 'stated', 0),
  edge('r18', 'skadi', 'specter', 'ally', 1098, null, '深海猎人同僚，在盐风城重新会合。', 'SideStory《覆潮之下》', 'stated', 1),
  edge('r19', 'skadi', 'gladia', 'ally', 1098, null, '同属深海猎人队伍。', 'SideStory《愚人号》', 'stated', 1),
  edge('r20', 'specter', 'gladia', 'ally', 1098, null, '同队，但记忆与信任均不完整。', 'SideStory《愚人号》', 'inferred', 2),
  edge('r21', 'shining', 'near', 'ally', 1098, null, '使徒同僚，共同游历泰拉。', 'SideStory《长夜临光》', 'inferred', 0),
  edge('r22', 'mudrock', 'talulah', 'former', 1096, 1098, '泥岩小队曾隶属整合运动，后脱离。', 'SideStory《乌萨斯的孩子们》', 'inferred', 2),
  edge('r23', 'rosmontis', 'amiya', 'ally', 1097, null, '罗德岛精英干员与领袖之间的协作。', '主线第八章', 'stated', 0),
  edge('r24', 'blaze', 'amiya', 'ally', 1097, null, '罗德岛精英干员，多次掩护阿米娅行动。', '主线第六至八章', 'stated', 0),
  edge('r25', 'nian', 'ling', 'kin', 1099, null, '「岁」的十二分之一，同源而独立。', 'SideStory《将进酒》', 'inferred', 2),
  edge('r26', 'nian', 'dusk', 'kin', 1099, null, '同属「岁」，长期互有争执。', 'SideStory《将进酒》', 'inferred', 2),
  edge('r27', 'ling', 'dusk', 'kin', 1099, null, '同源关系，立场与生活方式差异极大。', 'SideStory《将进酒》', 'inferred', 2),
  edge('r28', 'dusk', 'chongyue', 'kin', 1099, null, '同属「岁」的兄弟姐妹。', 'SideStory《登临意》', 'inferred', 2),
  edge('r29', 'chongyue', 'nian', 'kin', 1099, null, '同源关系，见面时以旧称相称。', 'SideStory《登临意》', 'inferred', 2),
  edge('r30', 'elysium', 'thorns', 'ally', 1098, null, '伊比利亚出身的罗德岛干员，行动中多次配合。', 'SideStory《覆潮之下》', 'inferred', 0),
  edge('r31', 'myrtle', 'amiya', 'story', 1097, null, '罗德岛干员与领袖的日常关联，非亲属或师承。', '主线第五章', 'inferred', 0),
  edge('r32', 'hellagur', 'patriot', 'conflict', 1098, null, '乌萨斯内战的旧识，最终在雪原上兵刃相向。', '主线第七章', 'stated', 2),
  edge('r33', 'kaltsit', 'w', 'conflict', 1091, 1096, '巴别塔崩解期间结下的对立。', 'SideStory《生于黑夜》', 'inferred', 2),
  edge('r34', 'rosmontis', 'doctor', 'ally', 1098, null, '在切尔诺伯格行动中由博士指挥。', '主线第八章', 'inferred', 1),
  edge('r35', 'mudrock', 'amiya', 'ally', 1098, null, '泥岩小队脱离整合运动后与罗德岛接触。', '主线第八章', 'inferred', 2),
  edge('r36', 'near', 'hellagur', 'story', 1096, null, '骑兵与猎人事件中的短暂交集，不对应亲属或师承。', 'SideStory《骑兵与猎人》', 'inferred', 1),
  edge('r37', 'blaze', 'rosmontis', 'ally', 1098, null, '同为罗德岛精英干员，共同参与切尔诺伯格行动。', '主线第八章', 'inferred', 0),
  edge('r38', 'doctor', 'w', 'story', 1096, null, '在切尔诺伯格与伦蒂尼姆多次接触，动机未明。', '主线第一、八章', 'inferred', 2),
  edge('r39', 'chen', 'siege', 'story', 1098, null, '维多利亚与龙门线索交汇处的短暂接触。', '主线第九章', 'inferred', 2),
  edge('r40', 'skadi', 'thorns', 'story', 1098, null, '伊比利亚调查期间的同行关系。', 'SideStory《愚人号》', 'inferred', 1),
]

/** 取某位人物的全部连线 */
export function relationsForPerson(id) {
  return relations.filter((r) => r.a === id || r.b === id)
}

/** 对方人物 id */
export function otherEnd(rel, id) {
  return rel.a === id ? rel.b : rel.a
}
