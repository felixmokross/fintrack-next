import { cn } from "./classnames";

export default function TextSkeleton({
  length = TextSkeletonLength.MEDIUM,
}: TextSkeletonProps) {
  return (
    <span
      className={cn(
        "inline-block h-full animate-pulse bg-gray-100 dark:bg-gray-800",
        {
          "w-20": length === TextSkeletonLength.EXTRA_SHORT,
          "w-32": length === TextSkeletonLength.SHORT,
          "w-48": length === TextSkeletonLength.MEDIUM,
          "w-64": length === TextSkeletonLength.LONG,
          "w-80": length === TextSkeletonLength.EXTRA_LONG,
        }
      )}
    >
      &nbsp;
    </span>
  );
}

export interface TextSkeletonProps {
  length: TextSkeletonLength;
}

export enum TextSkeletonLength {
  EXTRA_SHORT = "EXTRA_SHORT",
  SHORT = "SHORT",
  MEDIUM = "MEDIUM",
  LONG = "LONG",
  EXTRA_LONG = "EXTRA_LONG",
}
