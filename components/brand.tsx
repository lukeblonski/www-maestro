import { PRODUCT_NAME } from "@/lib/content";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="30"
      height="30"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 25V13c0-4 3-6 6-6s6 2 6 6v12M16 25V13c0-4 3-6 6-6s6 2 6 6v12"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path d="M4 19h24" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}
export function Brand() {
  return (
    <span className="brand">
      <BrandMark />
      <span>{PRODUCT_NAME.toLowerCase()}</span>
      <span className="brand-period" aria-hidden="true">
        .
      </span>
    </span>
  );
}
