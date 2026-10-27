import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRIMARY_PAGES, SITE } from '../data/meta.js'
import { stats } from '../data/index.js'
import Icon from './Icon.jsx'
import { Modal } from './ui.jsx'

export default function SiteFooter({ pageNo = '02', total = '04', pageLabel = '总览', pageKey = 'overview' }) {
  const [aboutOpen, setAboutOpen] = useState(false)
  const index = PRIMARY_PAGES.findIndex((p) => p.key === pageKey)
  const prev = index > 0 ? PRIMARY_PAGES[index - 1] : null
  const next = index >= 0 && index < PRIMARY_PAGES.length - 1 ? PRIMARY_PAGES[index + 1] : null

  return (
    <>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <button type="button" className="footer-archive" onClick={() => setAboutOpen(true)} aria-label="打开关于与修订记录">
            <span>明日方舟 · 剧情档案</span>
          </button>

          <span className="footer-meta">
            内容截止 {SITE.contentCutoff} · 修订 {SITE.buildRevision}
          </span>

          <button type="button" className="footer-link" onClick={() => setAboutOpen(true)}>
            关于与修订记录
          </button>

          <div className="pager" aria-label="页面翻页">
            {prev ? (
              <Link to={prev.to} className="pager-arrow" aria-label={`上一页：${prev.cn}`}>
                <Icon name="chevronLeft" size={13} />
              </Link>
            ) : (
              <span className="pager-arrow is-disabled" aria-hidden="true">
                <Icon name="chevronLeft" size={13} />
              </span>
            )}
            <span className="pager-current">{pageNo}</span>
            <span className="pager-bar" aria-hidden="true" />
            <span className="pager-total">{total}</span>
            <span className="pager-label">{pageLabel}</span>
            {next ? (
              <Link to={next.to} className="pager-arrow" aria-label={`下一页：${next.cn}`}>
                <Icon name="chevronRight" size={13} />
              </Link>
            ) : (
              <span className="pager-arrow is-disabled" aria-hidden="true">
                <Icon name="chevronRight" size={13} />
              </span>
            )}
          </div>
        </div>
      </footer>

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="关于本站" eyebrow="ABOUT / CHANGELOG" size="lg">
        <div className="about-grid">
          <section>
            <h3>定位</h3>
            <p>
              非官方剧情档案站。保留四个主页面的分页浏览、巴别塔转场与官方风格导航，用独立页面承载剧情播放器、关系图谱、泰拉地图与干员档案。
            </p>
            <p className="muted">
              与鹰角网络及《明日方舟》官方无隶属关系。首页 CG 与总览主视觉保留图片来源；其余占位图、曲目与示例逐句脚本仍用于演示。
            </p>
          </section>
          <section>
            <h3>资料规模（当前演示数据）</h3>
            <ul className="stat-list">
              <li><span>故事</span><strong>{stats.stories}</strong></li>
              <li><span>剧情片段</span><strong>{stats.segments}</strong></li>
              <li><span>逐句脚本片段</span><strong>{stats.scripted}</strong></li>
              <li><span>人物 / 干员形态</span><strong>{stats.people} / {stats.forms}</strong></li>
              <li><span>正式关系连线</span><strong>{stats.relations}</strong></li>
              <li><span>地点标点</span><strong>{stats.locations}</strong></li>
              <li><span>设定词条</span><strong>{stats.entries}</strong></li>
            </ul>
          </section>
        </div>

        <h3 className="about-h3">修订记录</h3>
        <ol className="revision-list">
          {SITE.revisions.map((rev) => (
            <li key={rev.version}>
              <div className="revision-head">
                <span className="revision-version">v{rev.version}</span>
                <span className="revision-date">{rev.date}</span>
              </div>
              <ul>
                {rev.notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <h3 className="about-h3">来源与使用说明</h3>
        <ul className="source-list">
          {SITE.dataNotes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
        <div className="official-links">
          {SITE.officialLinks.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer noopener">
              {l.label}
              <Icon name="external" size={13} />
            </a>
          ))}
        </div>

        <p className="about-foot">
          <Link to="/home">返回首页</Link>
          <span>·</span>
          <Link to="/overview">进入总览</Link>
        </p>
      </Modal>
    </>
  )
}
