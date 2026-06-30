export function Icon({ name, label }: { name: string; label?: string }) {
  return (
    <span className="material-symbols-outlined icon" aria-label={label} aria-hidden={label ? undefined : true}>
      {name}
    </span>
  );
}
