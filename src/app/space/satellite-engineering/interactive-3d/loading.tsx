import LoadingScreen from "@/components/satellite-explorer/ui/LoadingScreen";
import theme from "@/components/satellite-explorer/theme.module.css";

// Shown during client-side navigation to the route, before the page arrives.
export default function Loading() {
  return (
    <div className={theme.theme}>
      <LoadingScreen />
    </div>
  );
}
