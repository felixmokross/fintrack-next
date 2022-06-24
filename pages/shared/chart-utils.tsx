import {
  ArcElement,
  BarController,
  BarElement,
  CartesianScaleOptions,
  CategoryScale,
  ChartDataset,
  Chart as ChartJS,
  ChartOptions,
  ChartType,
  DoughnutController,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { merge } from "lodash";
import { useEffect, useReducer, useRef } from "react";
import { ChartProps, Chart } from "react-chartjs-2";
import { ChartJSOrUndefined } from "react-chartjs-2/dist/types";
import { darkThemePreference, isDarkTheme } from "./theme-utils";

ChartJS.register(
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

export function getLineDatasetStyle(): Partial<ChartDataset<"line">> {
  return {
    fill: true,
    tension: 0.3,
    borderColor: "#3B82F6",
    pointBorderColor: "#3B82F6",
    pointBackgroundColor: "#3B82F6",
    backgroundColor: "rgba(59,130,246,0.2)", // #3B82F6 20%
  };
}

export function getDefaultCartesianOptions(
  chartType: SupportedChartType
): ChartOptions<ChartType> {
  const isDark = isDarkTheme();
  const cartesianScaleOptions = getDefaultCartesianScaleOptions();
  return {
    color: isDark ? "#E5E7EB" : "#6B7280",
    scales:
      chartType === "doughnut"
        ? undefined // doughnut charts don't show a grid
        : {
            // the default scale IDs are specific to cartesian charts
            x: cartesianScaleOptions,
            y: cartesianScaleOptions,
          },
    plugins: {
      tooltip: {
        backgroundColor: isDark ? "#374151" : "#374151",
        bodyColor: isDark ? "#E5E7EB" : "white",
        multiKeyBackground: isDark ? "#E5E7EB" : "white",
        titleColor: isDark ? "#E5E7EB" : "white",
      },
    },
  };
}

function getDefaultCartesianScaleOptions() {
  const isDark = isDarkTheme();
  return {
    grid: {
      borderColor: isDark ? "#1F2937" : "#E5E7EB",
      color: (line, _) =>
        line.scale.axis === "y" && line.tick.value === 0
          ? "#9CA3AF"
          : isDark
          ? "#1F2937"
          : "#E5E7EB",
    },
  } as CartesianScaleOptions;
}

export function FintrackChart<TChartType extends SupportedChartType>({
  type,
  options,
  ...rest
}: FintrackChartProps<TChartType>) {
  const chartRef = useRef<ChartJSOrUndefined<TChartType>>(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    const dtp = darkThemePreference();
    dtp.addEventListener("change", handleDarkThemeChange);

    return () => {
      dtp.removeEventListener("change", handleDarkThemeChange);
    };

    function handleDarkThemeChange(e: MediaQueryListEvent) {
      forceUpdate();
    }
  }, []);

  return (
    <Chart
      {...rest}
      type={type}
      ref={chartRef}
      options={merge({}, getDefaultCartesianOptions(type), options)}
    />
  );
}

export type FintrackChartProps<TChartType extends SupportedChartType> = Omit<
  ChartProps<TChartType>,
  "type"
> & {
  type: TChartType;
};

export type SupportedChartType = "line" | "doughnut" | "bar";
