import SatelliteExplorer from "@/components/satellite-explorer/SatelliteExplorer";
import theme from "@/components/satellite-explorer/theme.module.css";
import { manrope, inter } from "../../fonts";
import spaceTheme from "../../spaceTheme.module.css";

// Route shell: Space fonts and tokens plus the explorer theme. The client
// entry decides between the desktop 3D application and the compact page.
export default function SatelliteExplorerPage() {
  return (
    <div className={`${spaceTheme.theme} ${theme.theme} ${manrope.variable} ${inter.variable}`}>
      <SatelliteExplorer />
    </div>
  );
}
