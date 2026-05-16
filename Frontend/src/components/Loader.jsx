import { RotatingLines } from "react-loader-spinner";
import { useStoreContext } from "../contextApi/ContextApi";

function Loader() {
  const { theme } = useStoreContext();
  const stroke = theme === "dark" ? "#60a5fa" : "#2563eb";

  return (
    <div className="flex h-[min(480px,calc(100vh-14rem))] w-full flex-col items-center justify-center gap-3 text-lx-muted">
      <RotatingLines
        visible
        height="56"
        width="56"
        color={stroke}
        strokeWidth="4"
        animationDuration="0.75"
        ariaLabel="Loading"
      />
      <span className="text-sm font-medium text-lx-muted">Loading dashboard…</span>
    </div>
  );
}

export default Loader;
