import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Icon from "../assets/favicon.svg"

const sections = ['home', 'explore', 'engine']

function Navbar() {
  const [active, setActive] = useState('home')
  const location = useLocation()
  const navigate = useNavigate()
  const onHomepage = location.pathname === '/' || !['/signin', '/signup', '/login'].includes(location.pathname)
  const onAuthPage = ['/signin', '/signup', '/login'].includes(location.pathname)

  useEffect(() => {
    if (!onHomepage) return
    const observers = sections.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { threshold: 0.5 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [onHomepage])

  const goToSection = (id: string) => {
    if (onHomepage) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(`/#${id}`)
      // after navigation, scroll to the section
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
  }

  return (
    <>
      <div className="nav">
        <div className="mage-icon">
          <Link to="/"><img src={Icon} /></Link>
        </div>
        <div className="list">
          <ul>
            {sections.map(id => (
              <li key={id}>
                <a onClick={() => goToSection(id)} className={onHomepage && active === id ? 'active' : ''} style={{ cursor: 'pointer' }}>
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="login-btn">
          {onAuthPage && location.pathname === '/signup' ? (
            <Link to="/signin">Log In</Link>
          ) : onAuthPage && location.pathname !== '/signup' ? (
            <Link to="/signup">Sign Up</Link>
          ) : (
            <Link to="/signin">Log In</Link>
          )}
        </div>
      </div>
    </>
  )
}
export default Navbar
