// Simple header wrapper that renders one or more lines with consistent styling.
import type { ReactNode } from 'react';

type AtmScreenHeaderProps = {
  lines: ReactNode[];
};

export function AtmScreenHeader({ lines }: AtmScreenHeaderProps) {
  return (
    <div className="atm-screen-header">
      {lines.map((line, index) => (
        <p key={index} className="atm-screen-header-line">
          {line}
        </p>
      ))}
    </div>
  );
}

