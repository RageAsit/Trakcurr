export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-stone-200 ${className}`}
      style={style}
    />
  );
}
