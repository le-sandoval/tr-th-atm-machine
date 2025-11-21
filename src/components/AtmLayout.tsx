import { useState, type FormEvent } from 'react';
import atmSign from '../assets/atm_sign.png';
import graffiti from '../assets/graffiti.png';
import sticker from '../assets/sticker_graf.png';
import systems from '../assets/systems.png';
import creditSprite from '../assets/creditcard_sprite.png';
import '../atm.css';

const CORRECT_PIN = '1234';
const INITIAL_BALANCE = 1000;

type Screen = 'pin' | 'menu' | 'withdraw' | 'deposit' | 'balance';

export function AtmLayout() {
  const sideButtons = [0, 1, 2, 3];

  const [screen, setScreen] = useState<Screen>('pin');
  const [enteredPin, setEnteredPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  // for card highlighting
  const [cardType, setCardType] = useState<'star' | null>(null);

  // Helper booleans
  const showPinScreen = screen === 'pin';
  const showMenuScreen = screen === 'menu';
  const showWithdrawScreen = screen === 'withdraw';
  const showDepositScreen = screen === 'deposit';
  const showBalanceScreen = screen === 'balance';

  // PIN flow 
  function handlePinSubmit(e?: FormEvent) {
    if (e) {
      e.preventDefault();
    }

    if (enteredPin.length === 4 && enteredPin === CORRECT_PIN) {
      setIsAuthenticated(true);
      setCardType('star');
      setScreen('menu');
      setMessage(null);
    } else {
      setIsAuthenticated(false);
      setCardType(null);
      setMessage('Wrong PIN. Retry.');
    }
  }

  function handleExit() {
    setIsAuthenticated(false);
    setCardType(null);
    setEnteredPin('');
    setAmount('');
    setMessage(null);
    setScreen('pin');
  }

  return (
    <div className="atm-page">
      <div className="atm-machine">
        <div className="atm-sign-bar">
          <img src={atmSign} alt="ATM 24 hour banking" className="atm-sign-img" />
          <img src={graffiti} alt="" className="atm-sign-graffiti" />
        </div>

        <div className="atm-divider" />

        <div className="atm-shell">
          <div className="atm-card-strip">
            <img
              src={creditSprite}
              alt="Supported card networks"
              className="atm-card-sprite"
            />
          </div>

          <div className="atm-inner">
            <div className="atm-console">
              <div className="atm-side-buttons atm-side-buttons--left">
                {sideButtons.map((i) => (
                  <div className="atm-side-button-row" key={`left-${i}`}>
                    <div 
                      className="atm-side-button" 
                      id={`left-${i}`}
                      onClick={() => {
                         //Handle left button clicks
                        if (showPinScreen) {
                          // Left buttons don't do anything on PIN screen
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="atm-side-button-connector" />
                  </div>
                ))}
              </div>

              <div className="atm-screen-wrapper">
                <div className="atm-screen">
                    <div className="atm-screen-content">
                    <div className="atm-screen-header">
                        {showPinScreen && (
                          <>
                            <p className="atm-screen-header-line">
                              {message || 'Welcome to the ATM'}
                            </p>

                            <div className="atm-pin-visual">
                              {Array.from({ length: 4 }).map((_, index) => (
                                <span
                                  key={index}
                                  className={
                                    'atm-pin-slot' +
                                    (index < enteredPin.length ? ' atm-pin-slot--filled' : '')
                                  }
                                >
                                  {index < enteredPin.length ? '*' : '_'}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                        {showMenuScreen && (
                          <>
                            <p className="atm-screen-header-line">Hi Peter Parker!</p>
                            <p className="atm-screen-header-line">Please make a choice...</p>
                            {message && (
                              <p className="atm-screen-header-line">{message}</p>
                            )}
                          </>
                        )}
                    </div>

                    <div className="atm-screen-menu">
                        <div className="atm-menu-row">
                        <div className="atm-menu-slot atm-menu-slot--left">
                        </div>
                        <div className="atm-menu-slot atm-menu-slot--right">
                            {showMenuScreen ? (
                              <>
                                <span 
                                  className="atm-menu-label atm-menu-label--right atm-menu-label--clickable"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleExit();
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleExit();
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  style={{ cursor: 'pointer' }}
                                >
                                  Exit
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : (
                              <>
                                <span className="atm-menu-label atm-menu-label--right atm-menu-label--hidden">Exit</span>
                                <span className="atm-menu-connector atm-menu-connector--right atm-menu-connector--hidden" />
                              </>
                            )}
                        </div>
                        </div>

                        <div className="atm-menu-row">
                        <div className="atm-menu-slot atm-menu-slot--left">
                            {showMenuScreen ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span className="atm-menu-label atm-menu-label--left">Withdraw</span>
                              </>
                            ) : (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left atm-menu-connector--hidden" />
                                <span className="atm-menu-label atm-menu-label--left atm-menu-label--hidden">Withdraw</span>
                              </>
                            )}
                        </div>
                        <div className="atm-menu-slot atm-menu-slot--right">
                            {showMenuScreen ? (
                              <>
                                <span className="atm-menu-label atm-menu-label--right">Balance</span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : (
                              <>
                                <span className="atm-menu-label atm-menu-label--right atm-menu-label--hidden">Balance</span>
                                <span className="atm-menu-connector atm-menu-connector--right atm-menu-connector--hidden" />
                              </>
                            )}
                        </div>
                        </div>

                        <div className="atm-menu-row">
                        <div className="atm-menu-slot atm-menu-slot--left">
                            {showMenuScreen ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span className="atm-menu-label atm-menu-label--left">Deposit</span>
                              </>
                            ) : (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left atm-menu-connector--hidden" />
                                <span className="atm-menu-label atm-menu-label--left atm-menu-label--hidden">Deposit</span>
                              </>
                            )}
                        </div>
                        <div className="atm-menu-slot atm-menu-slot--right">
                            {showPinScreen ? (
                              <>
                                <span 
                                  className="atm-menu-label atm-menu-label--right atm-menu-label--clickable"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handlePinSubmit();
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handlePinSubmit();
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  style={{ cursor: 'pointer' }}
                                >
                                Enter PIN
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : showMenuScreen ? (
                              <>
                                <span className="atm-menu-label atm-menu-label--right">
                                Re-Enter PIN
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : (
                              <>
                                <span className="atm-menu-label atm-menu-label--right atm-menu-label--hidden">
                                Re-Enter PIN
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right atm-menu-connector--hidden" />
                              </>
                            )}
                        </div>
                        </div>

                    </div>
                    </div>
                </div>
              </div>

              <div className="atm-side-buttons atm-side-buttons--right">
                {sideButtons.map((i) => (
                  <div
                    className="atm-side-button-row atm-side-button-row--right"
                    key={`right-${i}`}
                  >
                    <div 
                      className="atm-side-button" 
                      id={`right-${i}`}
                      onClick={() => {
                          // Handle right button clicks
                        if (showPinScreen && i === 3) {
                          //Bottom right button - index 3 - submits PIN
                          handlePinSubmit();
                        } else if (showMenuScreen && i === 1) {
                          // Right button - index 1 - exits to PIN screen
                          handleExit();
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="atm-side-button-connector" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="atm-lower-decor">
            <img src={sticker} alt="" className="atm-sticker" />
            <img src={systems} alt="Systems logo" className="atm-systems-logo" />
          </div>
        </div>
      </div>

      {showPinScreen && (
        <div className="atm-controls">
          <form className="atm-pin-form" onSubmit={handlePinSubmit}>
            <label className="atm-pin-label">
              KEYPAD:
            </label>
            <input
              type="password"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              maxLength={4}
              autoFocus
              className="atm-pin-input"
            />
          </form>
        </div>
      )}

    </div>
  );
}
