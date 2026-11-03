
export function StatusMessage({
  type,
  title,
  message,
}: {
  type: "error" | "success";
  title?: string;
  message: string;
}) {
  return (
    <div className={`alert alert-${type}`} role={type === "error" ? "alert" : "status"}>
      {title && <strong>{title}</strong>}
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({ children }: { children: string }) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state-icon" aria-hidden="true">
        ◇
      </span>
      <p>{children}</p>
    </div>
  );
}

export function LoadingState({ message }: { message: string }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
