import styles from "./page.module.css";
import Link from "next/link";

export const metadata = {
  title: "Developer Portal | EV.ENGINEER™",
  description: "SDK categories, open-source references, mapping ecosystems, and engineering tools for AV developers.",
};

export default function DeveloperPortalPage() {
  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      <header style={{ marginBottom: "64px" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "16px" }}>Developer Portal</h1>
        <p style={{ fontSize: "1.2rem", color: "var(--color-text-secondary)", maxWidth: "800px" }}>
          Curated reference hub for the AV developer ecosystem. Connect with open-source platforms, SDKs, and enterprise toolchains.
        </p>
      </header>

      <div className={styles.hubGrid}>
        
        {/* Sidebar Navigation */}
        <div className={styles.sidebar}>
          <div className={`${styles.sidebarLink} ${styles.active}`}>Open-Source Stacks</div>
          <div className={styles.sidebarLink}>Compute & ML SDKs</div>
          <div className={styles.sidebarLink}>Mapping & Localization</div>
          <div className={styles.sidebarLink}>Cloud & Fleet Platforms</div>
        </div>

        {/* Content Area */}
        <div className={styles.content}>
          
          {/* Category: Open Source */}
          <section>
            <h2 className={styles.categoryTitle}>Open-Source Stacks</h2>
            <div className={styles.cardGrid}>
              <div className={`glass-panel ${styles.resourceCard}`}>
                <div className={styles.resourceHeader}>
                  <span className={styles.resourceTitle}>ROS 2 (Robot Operating System)</span>
                  <span className={styles.resourceType}>Middleware</span>
                </div>
                <p className={styles.resourceDesc}>The standard communication middleware for robotic applications, providing publish-subscribe DDS routing.</p>
                <a href="https://docs.ros.org/en/jazzy/index.html" target="_blank" rel="noreferrer" className={styles.resourceLink}>View Documentation &rarr;</a>
              </div>
              
              <div className={`glass-panel ${styles.resourceCard}`}>
                <div className={styles.resourceHeader}>
                  <span className={styles.resourceTitle}>Autoware</span>
                  <span className={styles.resourceType}>Full Stack</span>
                </div>
                <p className={styles.resourceDesc}>The world's leading open-source software project for autonomous driving, built on top of ROS 2.</p>
                <a href="https://github.com/autowarefoundation/autoware" target="_blank" rel="noreferrer" className={styles.resourceLink}>GitHub Repository &rarr;</a>
              </div>
              
              <div className={`glass-panel ${styles.resourceCard}`}>
                <div className={styles.resourceHeader}>
                  <span className={styles.resourceTitle}>Apollo (Baidu)</span>
                  <span className={styles.resourceType}>Platform</span>
                </div>
                <p className={styles.resourceDesc}>A high performance, flexible architecture accelerating the development, testing, and deployment of AVs.</p>
                <a href="https://github.com/ApolloAuto/apollo" target="_blank" rel="noreferrer" className={styles.resourceLink}>GitHub Repository &rarr;</a>
              </div>
            </div>
          </section>

          {/* Category: Compute */}
          <section>
            <h2 className={styles.categoryTitle}>Compute & ML SDKs</h2>
            <div className={styles.cardGrid}>
              <div className={`glass-panel ${styles.resourceCard}`}>
                <div className={styles.resourceHeader}>
                  <span className={styles.resourceTitle}>NVIDIA DriveWorks</span>
                  <span className={styles.resourceType}>SDK</span>
                </div>
                <p className={styles.resourceDesc}>Middleware and algorithms for autonomous vehicle development targeting the DRIVE AGX platform.</p>
                <a href="https://developer.nvidia.com/drive/driveworks" target="_blank" rel="noreferrer" className={styles.resourceLink}>NVIDIA Developer &rarr;</a>
              </div>
              <div className={`glass-panel ${styles.resourceCard}`}>
                <div className={styles.resourceHeader}>
                  <span className={styles.resourceTitle}>TensorRT</span>
                  <span className={styles.resourceType}>Library</span>
                </div>
                <p className={styles.resourceDesc}>High-performance deep learning inference optimizer and runtime for edge deployment.</p>
                <a href="https://developer.nvidia.com/tensorrt" target="_blank" rel="noreferrer" className={styles.resourceLink}>Documentation &rarr;</a>
              </div>
            </div>
          </section>

          {/* Category: Mapping */}
          <section>
            <h2 className={styles.categoryTitle}>Mapping & Localization</h2>
            <div className={styles.cardGrid}>
              <div className={`glass-panel ${styles.resourceCard}`}>
                <div className={styles.resourceHeader}>
                  <span className={styles.resourceTitle}>Lanelet2</span>
                  <span className={styles.resourceType}>Framework</span>
                </div>
                <p className={styles.resourceDesc}>A highly capable map framework for automated driving. Used natively by Autoware architecture.</p>
                <a href="https://github.com/fzi-forschungszentrum-informatik/Lanelet2" target="_blank" rel="noreferrer" className={styles.resourceLink}>GitHub Repository &rarr;</a>
              </div>
              <div className={`glass-panel ${styles.resourceCard}`}>
                <div className={styles.resourceHeader}>
                  <span className={styles.resourceTitle}>Cartographer (Google)</span>
                  <span className={styles.resourceType}>SLAM</span>
                </div>
                <p className={styles.resourceDesc}>System that provides real-time simultaneous localization and mapping (SLAM) in 2D and 3D across multiple platforms.</p>
                <a href="https://github.com/cartographer-project/cartographer" target="_blank" rel="noreferrer" className={styles.resourceLink}>GitHub Repository &rarr;</a>
              </div>
            </div>
          </section>

          {/* Category: Cloud */}
          <section>
            <h2 className={styles.categoryTitle}>Cloud & Fleet Platforms</h2>
            <div className={styles.cardGrid}>
              <div className={`glass-panel ${styles.resourceCard}`}>
                <div className={styles.resourceHeader}>
                  <span className={styles.resourceTitle}>AWS IoT FleetWise</span>
                  <span className={styles.resourceType}>Cloud API</span>
                </div>
                <p className={styles.resourceDesc}>Helps collect, transform, and transfer vehicle data to the cloud in near-real-time for analysis.</p>
                <a href="https://aws.amazon.com/iot-fleetwise/" target="_blank" rel="noreferrer" className={styles.resourceLink}>AWS Documentation &rarr;</a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
