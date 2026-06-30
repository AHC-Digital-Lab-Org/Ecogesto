import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, postJson } from "../lib/api";
import { number } from "../lib/format";
import { Icon } from "../components/Icon";
import { MetricCard } from "../components/MetricCard";
import type { Badge, BadgeAward, PointsBalance, Reward, RewardRedemption } from "../lib/types";

type BadgeData = {
  points: PointsBalance;
  earned: BadgeAward[];
  available: Badge[];
};

type RewardData = {
  points: PointsBalance;
  rewards: Reward[];
  redemptions: RewardRedemption[];
};

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export function Recognition() {
  const queryClient = useQueryClient();
  const badges = useQuery({ queryKey: ["badges"], queryFn: () => api<BadgeData>("/insignias") });
  const rewards = useQuery({ queryKey: ["rewards"], queryFn: () => api<RewardData>("/recompensas") });
  const recalculateBadges = useMutation({
    mutationFn: () => postJson<{ issued: BadgeAward[] }>("/insignias/recalcular", {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["badges"] })
  });
  const redeemReward = useMutation({
    mutationFn: (rewardId: string) => postJson<RewardRedemption>(`/recompensas/${rewardId}/canjear`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    }
  });

  if (badges.error || rewards.error) {
    return (
      <section className="section">
        <h1>Reconocimientos</h1>
        <div className="error">Entra con alias para ver tus insignias y recompensas.</div>
      </section>
    );
  }
  if (!badges.data || !rewards.data) {
    return (
      <section className="section">
        <h1>Reconocimientos</h1>
        <div className="panel">Cargando reconocimientos...</div>
      </section>
    );
  }

  const points = rewards.data.points;

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Reconocimientos</span>
          <h1>Insignias y recompensas sin pagos</h1>
        </div>
        <button className="ghost-button" onClick={() => recalculateBadges.mutate()} disabled={recalculateBadges.isPending}>
          <Icon name="workspace_premium" /> Recalcular insignias
        </button>
      </div>

      <div className="points-band">
        <div>
          <span className="eyebrow">Saldo EcoGestos</span>
          <strong>{number(points.available)} puntos</strong>
        </div>
        <div className="pill-row">
          <span>{number(points.earned)} ganados</span>
          <span>{number(points.spent)} canjeados</span>
          <span>{number(points.badgePoints)} por insignias</span>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Insignias emitidas" value={number(badges.data.earned.length)} icon="workspace_premium" />
        <MetricCard label="Insignias disponibles" value={number(badges.data.available.length)} icon="military_tech" />
        <MetricCard label="Recompensas activas" value={number(rewards.data.rewards.length)} icon="redeem" />
        <MetricCard label="Canjes solicitados" value={number(rewards.data.redemptions.length)} icon="task_alt" />
      </div>

      <div className="section-heading">
        <div>
          <span className="eyebrow">Open Badges</span>
          <h2>Insignias emitidas</h2>
        </div>
      </div>
      <div className="badge-grid">
        {badges.data.earned.map((award) => (
          <article className="badge-card" key={award.id}>
            <img src={`${API_BASE}/openbadges/badges/${award.badge.id}/image.svg`} alt="" />
            <div>
              <h3>{award.badge.name}</h3>
              <p>{award.badge.description}</p>
              <a className="text-link" href={`${API_BASE}/openbadges/assertions/${award.id}`} target="_blank" rel="noreferrer">
                Ver assertion Open Badge
              </a>
            </div>
          </article>
        ))}
        {badges.data.available.map((badge) => (
          <article className="badge-card locked" key={badge.id}>
            <img src={`${API_BASE}/openbadges/badges/${badge.id}/image.svg`} alt="" />
            <div>
              <h3>{badge.name}</h3>
              <p>{badge.criteria}</p>
              <span className="status-pill">Pendiente</span>
            </div>
          </article>
        ))}
      </div>

      <div className="section-heading">
        <div>
          <span className="eyebrow">Recompensas</span>
          <h2>Catálogo base sin pasarela</h2>
        </div>
      </div>
      <div className="reward-grid">
        {rewards.data.rewards.map((reward) => (
          <article className="reward-card" key={reward.id}>
            <div className="reward-head">
              <Icon name={reward.rewardType === "digital" ? "download" : reward.rewardType === "servicio" ? "support_agent" : "how_to_vote"} />
              <span className="status-pill">{reward.provider}</span>
            </div>
            <h3>{reward.name}</h3>
            <p>{reward.description}</p>
            <div className="reward-meta">
              <strong>{number(reward.pointsRequired)} puntos</strong>
              <span>{reward.stockLeft === null ? "Sin límite" : `${reward.stockLeft} disponibles`}</span>
            </div>
            {reward.terms ? <p className="muted">{reward.terms}</p> : null}
            <button
              className="primary-button"
              disabled={!reward.canRedeem || redeemReward.isPending}
              onClick={() => redeemReward.mutate(reward.id)}
            >
              <Icon name="redeem" /> Canjear
            </button>
          </article>
        ))}
      </div>

      {rewards.data.redemptions.length > 0 ? (
        <div className="table-panel" tabIndex={0}>
          <h2>Canjes</h2>
          <table>
            <thead>
              <tr>
                <th>Recompensa</th>
                <th>Puntos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rewards.data.redemptions.map((redemption) => (
                <tr key={redemption.id}>
                  <td>{rewards.data.rewards.find((reward) => reward.id === redemption.rewardId)?.name ?? redemption.rewardId}</td>
                  <td>{number(redemption.pointsSpent)}</td>
                  <td><span className="status-pill">{redemption.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
