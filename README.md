# ATM Simulator

A small React + TypeScript ATM simulator that recreates a classic physical cash
machine experience. It includes side buttons mapped to on-screen menu labels, quick
cash withdrawal options, and a PIN entry workflow. The UI is styled to match the
provided mockups (`Mock_1.png`, `Mock_2.png`), including logos, graffiti
details, and a KEYPAD area below the ATM screen to simulate digit input.


## Features

- **Welcome → PIN → Menu flow**
  - Default **Welcome** screen
  - **Enter PIN** screen with visual PIN slots (`*` for entered digits)
  - **Main menu** with options: Withdraw, Deposit, Balance, Exit, Re-Enter PIN
- **Authentication model**
  - Correct PIN is `1234`
  - Successful PIN sets an internal card network (`'star'`) and treats
    `cardType !== null` as an *authenticated* session
  - Exit and Re-Enter PIN clear session state
- **Withdraw & Deposit**
  - Quick cash buttons for common amounts (`$20`, `$40`, `$60`, `$100`, `$200`, `$400`)
  - “Other Amount” paths for custom withdraw/deposit values
  - **Validation & rules:**
    - Amount must be positive
    - Withdraw amounts must be multiples of **$20**
    - Per-transaction limits:
      - `MAX_WITHDRAW = 10,000`
      - `MAX_DEPOSIT = 10,000`
    - Global ATM cash cap:
      - `MAX_BALANCE = 200,000`
    - Insufficient funds and limit breaches show descriptive messages
- **Balance screen**
  - Shows current balance with `toFixed(2)` formatting
- **UX guard**
  - If the user stays on the **PIN** screen for 30 seconds, the app:
    - Clears the entered PIN and message
    - Returns to the **Welcome** screen

## Tech Stack

- **React** + **TypeScript**
- **CSS** (custom `atm.css` for layout and styling)
- **Vitest** + **@testing-library/react** + **@testing-library/jest-dom** for tests
- **jsdom** for simulating the browser environment in tests

## Project Structure (ATM-related)

```text
src/
  components/
    AtmLayout.tsx        # Main ATM screen and state machine
    AtmKeypadInput.tsx   # Reusable keypad input (PIN & amounts)
    AtmMenuOption.tsx    # Reusable left/right menu options
    AtmScreenHeader.tsx  # Reusable screen header wrapper
  assets/
    atm_sign.png
    graffiti.png
    sticker_graf.png
    systems.png
atm.css                  # Styling for ATM UI
```

## Core Components

### `AtmLayout.tsx`

Top-level ATM experience and screen state machine.

Responsible for:

- Managing UI state:
  - `screen` (`'welcome' | 'pin' | 'menu' | 'withdraw' | 'withdraw-amount' | 'deposit' | 'deposit-amount' | 'balance'`)
  - `enteredPin`
  - `balance`
  - `amount`
  - `message`
  - `cardType` (used as the **authentication source of truth**)
- Implementing:
  - Button mapping for left/right side hardware buttons
  - Withdraw & deposit flows and all validation rules
  - PIN timeout behavior (30s inactivity guard)
- Rendering:
  - Different screen headers via `AtmScreenHeader`
  - On-screen button labels via `AtmMenuOption`
  - Keypad inputs via `AtmKeypadInput`

### `AtmKeypadInput.tsx`

Reusable keypad input for:

- **PIN entry**
- **Deposit amount entry**
- **Withdraw amount entry**

Props:

- `value: string`
- `onChange(value: string): void`
- `onSubmit(e: FormEvent): void`
- `label?: string` (defaults to `"KEYPAD:"`)
- `type?: 'password' | 'number'` (defaults to `'number'`)
- `maxLength?: number`
- `restrictToDigits?: boolean` (defaults to `true`)

Behavior:

- Enforces digit-only input if `restrictToDigits` is `true`
- Enforces `maxLength` for both PIN and amounts
- Picks the correct form class (`atm-pin-form` vs `atm-amount-form`)

### `AtmMenuOption.tsx`

Reusable on-screen menu option used to align labels with the side buttons.

Props:

- `side: 'left' | 'right'`
- `label: string`
- `visible: boolean`

Behavior:

- Left side: renders **connector → label**
- Right side: renders **label → connector**
- Adds `--hidden` CSS modifiers when `visible` is `false`

### `AtmScreenHeader.tsx`

Simple wrapper for header lines at the top of the ATM screen.

Props:

- `lines: ReactNode[]` — array of lines (strings or React nodes)

Behavior:

- Renders each line as a `<p>` with `atm-screen-header-line` class

## Business Rules

- **PIN**
  - Only `1234` is accepted
  - Correct PIN sets `cardType` to `'star'`
  - `cardType !== null` is considered authenticated
- **Withdraw**
  - Must be **> 0**
  - Must be a multiple of **20**
  - Must not exceed `MAX_WITHDRAW`
  - Must not exceed current `balance`
- **Deposit**
  - Must be **> 0**
  - Must not exceed `MAX_DEPOSIT`
  - `balance + amount` must not exceed `MAX_BALANCE`
- **Messages**
  - Specific helper messages created in the `MESSAGES` object
  - Some messages include:
    - Current balance
    - Requested amount
    - Limit values

## Getting Started

### Install dependencies

```bash
npm install
# or
pnpm install
```

### Run the app

Adjust the script if your dev script name is different:

```bash
npm run dev
```

Then open the URL shown in the terminal (for Vite, usually
`http://localhost:5173/`).

### Run tests

```bash
npm test
```

This will run the Vitest test suite, including:

- Default welcome state
- Successful PIN entry and transition to the main menu
- Wrong PIN message behavior

## Design Decisions

- **Derived auth state**  
  Instead of keeping a separate `isAuthenticated` flag, the component derives
  auth status from `cardType`. If `cardType !== null`, the session is
  considered authenticated. This reduces duplicated state and keeps a single
  source of truth.

- **Reusable UI components**  
  Repetitive patterns (keypad input, header lines, menu options) were pulled
  into focused components (`AtmKeypadInput`, `AtmScreenHeader`, and 
  `AtmMenuOption`) to reduce duplication and make the JSX easier to reason
  about.

- **Guard rails for UX & safety**  
  Basic guards (like the 30-second timeout on the PIN screen and strict
  validation on amounts) help mimic real-world ATM behavior and surface
  business rules clearly in the UI.

## Possible Extensions

- Transaction history / mini-statement
- Multiple users / PINs instead of a single hardcoded user
- Configurable limits and PIN via props or external configuration
- Improved accessibility and keyboard navigation
- Animations or sound effects to further mimic physical ATM interaction

-------------------------------------------------------------------------------------------------------
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
