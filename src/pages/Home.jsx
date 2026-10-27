import {useEffect, useState} from 'react'
import BabelIntro from '../components/BabelIntro.jsx'
import {readSession, writeSession} from '../lib/storage.js'

export default function Home() {
  const [auto] = useState(() => !readSession('intro-seen', false))
  useEffect(() => {writeSession('intro-seen', true)}, [])
  return <div className="home-page"><BabelIntro auto={auto}/></div>
}
