export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-content">
          <span className="footer-copy">
            © {year} Jacob Molnia
            <span className="footer-note"> · built with too much coffee · Worcester, MA</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
