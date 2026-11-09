"use client";
import { LoaderCircle, Search, X } from "lucide-react";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import clsx from "clsx";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as ToastPrimitive from "@radix-ui/react-toast";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
export function Button({
  variant = "primary",
  loading,
  children,
  className,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
}) {
  return (
    <button
      className={clsx("ui-button", `ui-${variant}`, className)}
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
export function IconButton({
  label,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      className="ui-icon-button"
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}
export function Select(p: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="ui-input" {...p} />;
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
  return <div className="ui-skeleton" role="status" aria-label="Loading" />;
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
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="ui-kbd">{children}</kbd>;
}
export function Avatar({ src, fallback }: { src?: string; fallback: string }) {
  return (
    <AvatarPrimitive.Root className="ui-avatar">
      <AvatarPrimitive.Image src={src} alt="" />
      <AvatarPrimitive.Fallback>{fallback}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
export function Tabs({
  items,
}: {
  items: { value: string; label: string; content: ReactNode }[];
}) {
  return (
    <TabsPrimitive.Root defaultValue={items[0]?.value}>
      <TabsPrimitive.List className="ui-tabs">
        {items.map((i) => (
          <TabsPrimitive.Trigger key={i.value} value={i.value}>
            {i.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((i) => (
        <TabsPrimitive.Content
          className="ui-tab-content"
          key={i.value}
          value={i.value}
        >
          {i.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="ui-tooltip" sideOffset={6}>
            {label}
            <TooltipPrimitive.Arrow className="ui-tooltip-arrow" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
export function Dialog({
  trigger,
  title,
  children,
}: {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="ui-overlay" />
        <DialogPrimitive.Content className="ui-dialog">
          <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="ui-description">
            Review this information before continuing.
          </DialogPrimitive.Description>
          {children}
          <DialogPrimitive.Close asChild>
            <IconButton label="Close dialog">
              <X size={16} />
            </IconButton>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function Sheet({
  trigger,
  title,
  children,
}: {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="ui-overlay" />
        <DialogPrimitive.Content className="ui-sheet">
          <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="ui-description">
            Additional controls
          </DialogPrimitive.Description>
          {children}
          <DialogPrimitive.Close asChild>
            <IconButton label="Close sheet">
              <X size={16} />
            </IconButton>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function Toast({
  open,
  onOpenChange,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
}) {
  return (
    <ToastPrimitive.Provider>
      <ToastPrimitive.Root
        className="ui-toast"
        open={open}
        onOpenChange={onOpenChange}
      >
        <ToastPrimitive.Title>{title}</ToastPrimitive.Title>
        <ToastPrimitive.Close aria-label="Dismiss">
          <X size={14} />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport className="ui-toast-viewport" />
    </ToastPrimitive.Provider>
  );
}
