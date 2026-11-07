import { LoaderCircle, Search } from "lucide-react";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import clsx from "clsx";
export function Button({
  variant = "primary",
  loading,
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
}) {
  return (
    <button
      className={clsx("ui-button", `ui-${variant}`)}
      disabled={loading || p.disabled}
      {...p}
    >
      {loading && <LoaderCircle className="spin" size={15} />} {children}
    </button>
  );
}
export function Input(p: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="ui-input" {...p} />;
}
export const SearchInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function SearchInput(p, ref) {
  return (
    <label className="ui-search">
      <Search size={15} />
      <input ref={ref} {...p} />
    </label>
  );
});
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "error";
}) {
  return <span className={`ui-badge ui-badge-${tone}`}>{children}</span>;
}
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`ui-panel ${className}`}>{children}</section>;
}
export function Skeleton() {
  return <div className="ui-skeleton" aria-label="Loading" />;
}
export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Panel className="ui-state">
      <strong>{title}</strong>
      <p>{body}</p>
    </Panel>
  );
}
export function ErrorState({ title, body }: { title: string; body: string }) {
  return (
    <Panel className="ui-state ui-error">
      <strong>{title}</strong>
      <p>{body}</p>
    </Panel>
  );
}
