import { Icon } from "./Icon";

export function MetricCard({ label, value, icon, tone = "green" }: { label: string; value: string; icon: string; tone?: string }) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <Icon name={icon} />
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  );
}
