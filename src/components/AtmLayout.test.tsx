// Note: Run (npm install) first to install testing dependencies
// The following imports require: Vitest, @testing-library/react, @testing-library/jest-dom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { AtmLayout } from './AtmLayout';

describe('AtmLayout', () => {
  it('shows welcome screen by default', () => {
    render(<AtmLayout />);
    expect(screen.getByText(/Welcome to the/i)).toBeInTheDocument();
    expect(screen.getByText(/ATM/i)).toBeInTheDocument();
  });

  it('accepts the correct PIN and shows the main menu', () => {
    render(<AtmLayout />);
    // 1. Click "Enter PIN" button (right-3 side button on welcome screen)
    const enterPinButton = document.getElementById('right-3');
    expect(enterPinButton).toBeInTheDocument();
    fireEvent.click(enterPinButton!);

    // 2. Type the PIN into the keypad
    const input = document.querySelector('input[type="password"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: '1234' } });

    // 3. Submit the PIN form, press NEXT button
    const form = input.closest('form') as HTMLFormElement;
    expect(form).toBeInTheDocument();
    fireEvent.submit(form);

    // 4. Expect the menu greeting to appear
    expect(
      screen.getByText(/Hi Peter Parker!/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Please make a choice.../i)
    ).toBeInTheDocument();
  });

  it('shows an error on wrong PIN', () => {
    render(<AtmLayout />);
    // Go to PIN screen - click Enter PIN button
    const enterPinButton = document.getElementById('right-3');
    expect(enterPinButton).toBeInTheDocument();
    fireEvent.click(enterPinButton!);

    const input = document.querySelector('input[type="password"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: '0000' } });
    
    const form = input.closest('form') as HTMLFormElement;
    expect(form).toBeInTheDocument();
    fireEvent.submit(form);

    expect(
      screen.getByText(/Wrong PIN. Retry./i)
    ).toBeInTheDocument();
  });
});

