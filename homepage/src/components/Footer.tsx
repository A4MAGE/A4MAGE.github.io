import Icon from "../assets/favicon.svg"

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <img src={Icon} className="footer-icon" />
        <span className="footer-name">MAGE</span>
      </div>
      <div className="footer-links">
        <a href="https://github.com/bsiscoe/MAGE/" target="_blank" rel="noreferrer">GitHub</a>
        <a href="mailto:contact@mageplatform.com">Email us</a>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} MAGE</p>
    </footer>
  )
}

export default Footer
