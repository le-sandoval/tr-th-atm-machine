// Reusable left/right menu option, label + connector, for the on-screen side button menu.
type Side = 'left' | 'right';

interface AtmMenuOptionProps {
  side: Side;
  label: string;
  visible: boolean;
}

export function AtmMenuOption({ side, label, visible }: AtmMenuOptionProps) {
  const connectorBase = `atm-menu-connector atm-menu-connector--${side}`;
  const labelBase = `atm-menu-label atm-menu-label--${side}`;
  const connectorClass = visible
    ? connectorBase
    : `${connectorBase} atm-menu-connector--hidden`;
  const labelClass = visible
    ? labelBase
    : `${labelBase} atm-menu-label--hidden`;

  // Left side, connector first, then label
  // Right side, label first, then connector
  if (side === 'left') {
    return (
      <>
        <span className={connectorClass} />
        <span className={labelClass}>{label}</span>
      </>
    );
  }

  return (
    <>
      <span className={labelClass}>{label}</span>
      <span className={connectorClass} />
    </>
  );
}

