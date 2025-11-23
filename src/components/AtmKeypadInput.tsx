// Reusable keypad input for PIN and numeric amounts, with simple digit-only validation.
import type { FormEvent } from 'react';

type AtmKeypadInputProps = {
  value: string;
  label?: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  type?: 'password' | 'number';
  maxLength?: number;
  restrictToDigits?: boolean;
};

export function AtmKeypadInput({
  value,
  label = 'KEYPAD:',
  onChange,
  onSubmit,
  type = 'number',
  maxLength,
  restrictToDigits = true,
}: AtmKeypadInputProps) {
  return (
    <div className="atm-controls">
      <form className={type === 'password' ? 'atm-pin-form' : 'atm-amount-form'} onSubmit={onSubmit}>
        <label className="atm-pin-label">{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => {
            const next = e.target.value;

            if (restrictToDigits && !/^\d*$/.test(next)) return;
            if (maxLength && next.length > maxLength) return;

            onChange(next);
          }}
          maxLength={maxLength}
          autoFocus
          className="atm-pin-input"
        />
      </form>
    </div>
  );
}

