import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            EV.<span>ENGINEER™</span>
          </Link>
          <p className={styles.description}>
            Production-grade training, technical concepts, simulation-driven learning, and engineering consulting for Autonomous EV systems.
          </p>
        </div>
        
        <div className={styles.column}>
          <div className={styles.columnTitle}>Company</div>
          <Link href="/about" className={styles.link}>About Us</Link>
          <Link href="/corporate-training" className={styles.link}>Corporate Training</Link>
          <Link href="/consulting" className={styles.link}>Consulting</Link>
          <Link href="/contact" className={styles.link}>Contact</Link>
        </div>

        <div className={styles.column}>
          <div className={styles.columnTitle}>Resources</div>
          <Link href="/av-concepts" className={styles.link}>AV Concepts</Link>
          <Link href="/simulations" className={styles.link}>AV Simulations</Link>
          <Link href="/developer-portal" className={styles.link}>Developer Portal</Link>
          <Link href="/challenges" className={styles.link}>Challenges</Link>
          <a href="https://itelematics.com/public/iTelematics-FrequentlyAskedQuestions.pdf" target="_blank" rel="noopener noreferrer" className={styles.link}>FAQ (Internship)</a>
        </div>

        <div className={styles.column}>
          <div className={styles.columnTitle}>Contact</div>
          <div className={styles.contactInfo}>
            <span>iTelematics Software Private Limited</span>
            <span>info@iTelematics.com</span>
            <span>+91 91082 06147</span>
            <span>Bhoganahalli, Bangalore - 560103, India</span>
          </div>
        </div>
      </div>
      
      <div className="container">
        <div className={styles.bottom}>
          <div>&copy; {new Date().getFullYear()} iTelematics&reg;. All rights reserved.</div>
          <div>Designed for Engineering Excellence</div>
        </div>
      </div>
    </footer>
  );
}
