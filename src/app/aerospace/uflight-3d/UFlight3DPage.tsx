import { Inter, Manrope } from "next/font/google";
import UFlightExplorer from "@/components/uflight-3d/UFlightExplorer";
import theme from "@/components/uflight-3d/theme.module.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-uflight-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-uflight-inter",
});

// Route shell: fonts and tokens. The client entry decides between the desktop
// 3D application and the overview page.
export default function UFlight3DPage() {
  return (
    <div className={`${theme.theme} ${manrope.variable} ${inter.variable}`}>
      <UFlightExplorer />
    </div>
  );
}
