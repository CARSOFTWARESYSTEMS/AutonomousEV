import LoadingScreen from "@/components/uflight-3d/ui/LoadingScreen";
import theme from "@/components/uflight-3d/theme.module.css";

// Shown during client-side navigation to the route, before the page arrives.
export default function Loading() {
  return (
    <div className={theme.theme}>
      <LoadingScreen />
    </div>
  );
}
