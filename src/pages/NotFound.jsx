import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page notfound">
      <span className="notfound-code">404</span>
      <h1>档案页不存在</h1>
      <p>
        这条编号没有对应的资料。可能是链接过期、资料已合并到其他词条，或该片段尚未导入。
      </p>
      <div className="notfound-actions">
        <Link to="/home" className="btn btn-primary">返回首页</Link>
        <Link to="/overview" className="btn btn-ghost">进入总览</Link>
      </div>
    </div>
  )
}
