"use client";
// The beachhead ICP — a hypothesis to validate — its tiers, segment
// dimensions and the buyer map.
import { BUYER_ROLES, ICP_HYPOTHESIS, ICP_TIERS, SEGMENT_DIMENSIONS } from "../data/market";
import { Badge, EvidenceBadge } from "../ui/badges";
import { List, Panel, ViewHeader } from "../ui/controls";
import css from "../workspace.module.css";

export default function IcpView() {
  return (
    <div>
      <ViewHeader eyebrow="Market" title="ICP & Buyer Map" lede="Start narrow. Contact accounts with different intensity by tier, and map every role that can say yes or no." />

      <Panel title="Beachhead ICP" kicker="Initial hypothesis" tone="accent" actions={<EvidenceBadge level="assumption" />}>
        <p className={css.quote}>{ICP_HYPOTHESIS}</p>
        <p className={css.blockNote}>Teach yourself to prove or disprove it: Days 6, 7, 41 and 47.</p>
      </Panel>

      <div className={css.tierGrid}>
        {ICP_TIERS.map((tier) => (
          <Panel key={tier.tier} title={`Tier ${tier.tier} — ${tier.name}`} kicker="Tier">
            <p className={css.blockNote}>{tier.effort}</p>
            <List items={tier.signals} />
          </Panel>
        ))}
      </div>

      <Panel title="Segment by" kicker="Dimensions">
        <div className={css.chipRow}>
          {SEGMENT_DIMENSIONS.map((dimension) => (
            <Badge key={dimension}>{dimension}</Badge>
          ))}
        </div>
      </Panel>

      <Panel title="Buyer map" kicker="Decision-making unit">
        <ol className={css.buyerChain} aria-label="User to procurement">
          {BUYER_ROLES.map((role) => (
            <li key={role.id}>{role.role}</li>
          ))}
        </ol>
        <ul className={css.cardList}>
          {BUYER_ROLES.map((role) => (
            <li key={role.id} className={css.miniCard}>
              <h4 className={css.miniTitle}>{role.role}</h4>
              <p className={css.blockNote}>Often: {role.likely}</p>
              <p>
                <strong>Cares about:</strong> {role.cares}
              </p>
              <p>
                <strong>Fears:</strong> {role.fears}
              </p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
