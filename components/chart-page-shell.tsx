import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import type { Defaults } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { merge } from "lodash";
import { PropsWithChildren, ReactElement, useLayoutEffect } from "react";
import { defaults } from "chart.js";
import { useThemeContext, Theme } from "./theme-context";

Chart.register(
  ChartDataLabels,
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  BarController,
  DoughnutController,
  LineController,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
);

export function ChartPageShell({
  children,
}: PropsWithChildren<{}>): ReactElement {
  const { theme } = useThemeContext();

  useLayoutEffect(() => {
    const isDark = theme === Theme.DARK;

    merge(defaults, {
      color: isDark ? "#E5E7EB" : "#6B7280",
      scale: {
        grid: {
          borderColor: isDark ? "#1F2937" : "#E5E7EB",
          color: (line, _) =>
            line.scale.axis === "y" && line.tick.value === 0
              ? "#9CA3AF"
              : isDark
              ? "#1F2937"
              : "#E5E7EB",
        },
      },
      plugins: {
        tooltip: {
          backgroundColor: isDark ? "#374151" : "#374151",
          bodyColor: isDark ? "#E5E7EB" : "white",
          multiKeyBackground: isDark ? "#E5E7EB" : "white",
          titleColor: isDark ? "#E5E7EB" : "white",
        },
      },
    } as Defaults);
  }, [theme]);
  return <>{children}</>;
}
