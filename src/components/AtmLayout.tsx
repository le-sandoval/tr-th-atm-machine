import { useState, useEffect, type FormEvent } from 'react';
import atmSign from '../assets/atm_sign.png';
import graffiti from '../assets/graffiti.png';
import sticker from '../assets/sticker_graf.png';
import systems from '../assets/systems.png';
import creditSprite from '../assets/creditcard_sprite.png';
import '../atm.css';

const CORRECT_PIN = '1234';
const INITIAL_BALANCE = 1000;

type Screen = 'pin' | 'menu' | 'withdraw' | 'deposit' | 'deposit-amount' | 'balance';

export function AtmLayout() {
  const sideButtons = [0, 1, 2, 3];

  const [screen, setScreen] = useState<Screen>('pin');
  const [enteredPin, setEnteredPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const [cardType, setCardType] = useState<'star' | null>(null);

  // Helper booleans
  const showPinScreen = screen === 'pin';
  const showMenuScreen = screen === 'menu';
  const showWithdrawScreen = screen === 'withdraw';
  const showDepositScreen = screen === 'deposit';
  const showDepositAmountScreen = screen === 'deposit-amount';
  const showBalanceScreen = screen === 'balance';

  // Debug: Log screen changes
  useEffect(() => {
    console.log('Screen state changed to:', screen);
    console.log('showMenuScreen:', showMenuScreen);
    console.log('showWithdrawScreen:', showWithdrawScreen);
    console.log('showDepositScreen:', showDepositScreen);
    console.log('showBalanceScreen:', showBalanceScreen);
    
    // Check if menu buttons exist in DOM when on menu screen
    if (showMenuScreen) {
      setTimeout(() => {
        const allClickableLabels = document.querySelectorAll('.atm-menu-label--clickable');
        console.log('Total clickable labels found:', allClickableLabels.length);
        allClickableLabels.forEach((label, index) => {
          console.log(`Label ${index}:`, label.textContent?.trim(), 'has onClick:', !!(label as HTMLElement).onclick);
        });
      }, 100);
    }
  }, [screen, showMenuScreen, showWithdrawScreen, showDepositScreen, showBalanceScreen]);

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

  function handleSelectWithdraw() {
    console.log('handleSelectWithdraw called - current screen:', screen);
    setAmount('');
    setMessage(null);
    setScreen('withdraw');
    console.log('Screen set to withdraw');
  }

  function handleSelectDeposit() {
    console.log('handleSelectDeposit called - current screen:', screen);
    setAmount('');
    setMessage(null);
    setScreen('deposit');
    console.log('Screen set to deposit');
  }

  function handleSelectBalance() {
    console.log('handleSelectBalance called - current screen:', screen);
    setMessage(null);
    setScreen('balance');
    console.log('Screen set to balance');
  }

  function handleReEnterPin() {
    console.log('handleReEnterPin called - current screen:', screen);
    setIsAuthenticated(false);
    setCardType(null);
    setEnteredPin('');
    setMessage(null);
    setScreen('pin');
    console.log('Screen set to pin');
  }

  // Button mapping for all screens
  const screenButtonMapping: Record<Screen, {
    left: { [key: number]: (() => void) | null };
    right: { [key: number]: (() => void) | null };
  }> = {
    pin: {
      left: {
        0: null,
        1: null,
        2: null,
        3: null,
      },
      right: {
        0: null,
        1: null,
        2: null,
        3: handlePinSubmit, // Enter PIN
      },
    },
    menu: {
      left: {
        0: null,
        1: null,
        2: handleSelectWithdraw, // Withdraw
        3: handleSelectDeposit, // Deposit
      },
      right: {
        0: null,
        1: handleExit, // Exit
        2: handleSelectBalance, // Balance
        3: handleReEnterPin, // Re-Enter PIN
      },
    },
    withdraw: {
      left: {
        0: null,
        1: null,
        2: null,
        3: () => setScreen('menu'), // Back to menu
      },
      right: {
        0: null,
        1: null,
        2: null,
        3: null,
      },
    },
    deposit: {
      left: {
        0: () => handleQuickDeposit(20), // $20
        1: () => handleQuickDeposit(40), // $40
        2: () => handleQuickDeposit(60), // $60
        3: () => {
          if (message) {
            // If there's a message, clear it and stay on deposit screen
            setMessage(null);
          } else {
            // If no message, go back to main menu
            setMessage(null);
            setScreen('menu');
          }
        }, // Back button: clear message or go to main menu
      },
      right: {
        0: () => handleQuickDeposit(100), // $100
        1: () => handleQuickDeposit(200), // $200
        2: () => handleQuickDeposit(400), // $400
        3: () => {
          // Other Amount - navigate to deposit-amount screen
          setAmount('');
          setMessage(null);
          setScreen('deposit-amount');
        },
      },
    },
    'deposit-amount': {
      left: {
        0: null,
        1: null,
        2: null,
        3: () => {
          setAmount('');
          setMessage(null);
          setScreen('deposit');
        }, // Back to deposit screen
      },
      right: {
        0: null,
        1: null,
        2: null,
        3: () => {
          // Deposit button - process the deposit
          // Only enable if amount has at least 1 digit and contains only digits
          if (!amount || !/^\d+$/.test(amount)) return;
          const value = parseAmount();
          if (value == null || value <= 0) return;
          const newBalance = balance + value;
          setBalance(newBalance);
          setMessage(`Deposit $${value.toFixed(2)}\nBalance $${newBalance.toFixed(2)}`);
          setAmount('');
          setScreen('balance');
        }, // Deposit
      },
    },
    balance: {
      left: {
        0: null,
        1: null,
        2: null,
        3: () => setScreen('menu'), // Back to menu
      },
      right: {
        0: null,
        1: null,
        2: null,
        3: null,
      },
    },
  };

  function parseAmount(): number | null {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setMessage('Please enter a positive amount.');
      return null;
    }
    return value;
  }

  function handleWithdraw(e: FormEvent) {
    e.preventDefault();
    const value = parseAmount();
    if (value == null) return;

    if (value > balance) {
      setMessage('Insufficient funds.');
      return;
    }

    setBalance((prev) => prev - value);
    setMessage(`Withdrawal of $${value.toFixed(2)} successful.`);
    setAmount('');
    setScreen('balance');
  }

  function handleDeposit(e: FormEvent) {
    e.preventDefault();
    const value = parseAmount();
    if (value == null) return;

    setBalance((prev) => prev + value);
    setMessage(`Deposit of $${value.toFixed(2)} successful.`);
    setAmount('');
    setScreen('balance');
  }

  function handleQuickDeposit(amountValue: number) {
    const newBalance = balance + amountValue;
    setBalance(newBalance);
    setMessage(`Deposit $${amountValue.toFixed(2)}\nBalance $${newBalance.toFixed(2)}`);
    setAmount('');
    setScreen('balance');
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
                        console.log(`Left button ${i} clicked, screen:`, screen);
                        const mapping = screenButtonMapping[screen];
                        const handler = mapping.left[i as keyof typeof mapping.left];
                        if (handler) {
                          console.log(`Calling handler for left-${i} on ${screen} screen`);
                          handler();
                        } else {
                          console.log(`No handler for left-${i} on ${screen} screen`);
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
                          </>
                        )}
                        {showDepositAmountScreen && (
                          <>
                            <p className="atm-screen-header-line">Enter Amount To Deposit</p>
                            <p className="atm-screen-header-line">
                              ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                            </p>
                            {message && (
                              <p className="atm-screen-header-line">{message}</p>
                            )}
                          </>
                        )}
                        {showWithdrawScreen && (
                          <>
                            <p className="atm-screen-header-line">Withdraw</p>
                            <p className="atm-screen-header-line">Current balance: ${balance.toFixed(2)}</p>
                            {message && (
                              <p className="atm-screen-header-line">{message}</p>
                            )}
                          </>
                        )}
                        {showDepositScreen && (
                          <>
                            {message ? (
                              <>
                                <p className="atm-screen-header-line">{message}</p>
                              </>
                            ) : (
                              <>
                                <p className="atm-screen-header-line">Select Amount to </p>
                                <p className="atm-screen-header-line">Deposit</p>
                              </>
                            )}
                          </>
                        )}
                        {showBalanceScreen && (
                          <>
                            {message ? (
                              <>
                                {message.split('\n').map((line, index) => (
                                  <p key={index} className="atm-screen-header-line">{line}</p>
                                ))}
                              </>
                            ) : (
                              <>
                                <p className="atm-screen-header-line">Your balance is:</p>
                                <p className="atm-screen-header-line">${balance.toFixed(2)}</p>
                              </>
                            )}
                          </>
                        )}
                    </div>

                    <div className="atm-screen-menu">
                        <div className="atm-menu-row">
                        <div className="atm-menu-slot atm-menu-slot--left">
                            {showDepositScreen && !message ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span 
                                  className="atm-menu-label atm-menu-label--left atm-menu-label--clickable"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleQuickDeposit(20);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  $20
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left atm-menu-connector--hidden" />
                                <span className="atm-menu-label atm-menu-label--left atm-menu-label--hidden">Empty</span>
                              </>
                            )}
                        </div>
                        <div className="atm-menu-slot atm-menu-slot--right">
                            {showDepositScreen && !message ? (
                              <>
                                <span 
                                  className="atm-menu-label atm-menu-label--right atm-menu-label--clickable"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleQuickDeposit(100);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  $100
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : (
                              <>
                                <span className="atm-menu-label atm-menu-label--right atm-menu-label--hidden">Empty</span>
                                <span className="atm-menu-connector atm-menu-connector--right atm-menu-connector--hidden" />
                              </>
                            )}
                        </div>
                        </div>

                        <div className="atm-menu-row">
                        <div className="atm-menu-slot atm-menu-slot--left">
                            {showDepositScreen && !message ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span 
                                  className="atm-menu-label atm-menu-label--left atm-menu-label--clickable"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleQuickDeposit(40);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  $40
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left atm-menu-connector--hidden" />
                                <span className="atm-menu-label atm-menu-label--left atm-menu-label--hidden">Empty</span>
                              </>
                            )}
                        </div>
                        <div className="atm-menu-slot atm-menu-slot--right">
                            {showMenuScreen ? (
                              <>
                                <span 
                                  className="atm-menu-label atm-menu-label--right atm-menu-label--clickable"
                                  onClick={(e) => {
                                    console.log('Exit button clicked');
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
                            ) : showDepositScreen && !message ? (
                              <>
                                <span 
                                  className="atm-menu-label atm-menu-label--right atm-menu-label--clickable"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleQuickDeposit(200);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  $200
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
                                <span 
                                  className="atm-menu-label atm-menu-label--left atm-menu-label--clickable"
                                  onClick={(e) => {
                                    console.log('Withdraw button clicked', e);
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Calling handleSelectWithdraw');
                                    handleSelectWithdraw();
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleSelectWithdraw();
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  style={{ cursor: 'pointer' }}
                                >
                                  Withdraw
                                </span>
                              </>
                            ) : showDepositScreen && !message ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span 
                                  className="atm-menu-label atm-menu-label--left atm-menu-label--clickable"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleQuickDeposit(60);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  $60
                                </span>
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
                                <span 
                                  className="atm-menu-label atm-menu-label--right atm-menu-label--clickable"
                                  onClick={(e) => {
                                    console.log('Balance button clicked', e);
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Calling handleSelectBalance');
                                    handleSelectBalance();
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleSelectBalance();
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  style={{ cursor: 'pointer' }}
                                >
                                  Balance
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : showDepositScreen && !message ? (
                              <>
                                <span 
                                  className="atm-menu-label atm-menu-label--right atm-menu-label--clickable"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleQuickDeposit(400);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  $400
                                </span>
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
                                <span 
                                  className="atm-menu-label atm-menu-label--left atm-menu-label--clickable"
                                  onClick={(e) => {
                                    console.log('Deposit button clicked', e);
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Calling handleSelectDeposit');
                                    handleSelectDeposit();
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleSelectDeposit();
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  style={{ cursor: 'pointer' }}
                                >
                                  Deposit
                                </span>
                              </>
                            ) : showDepositAmountScreen ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span 
                                  className="atm-menu-label atm-menu-label--left atm-menu-label--clickable"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setAmount('');
                                    setMessage(null);
                                    setScreen('deposit');
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setAmount('');
                                      setMessage(null);
                                      setScreen('deposit');
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  style={{ cursor: 'pointer' }}
                                >
                                  Back
                                </span>
                              </>
                            ) : showDepositScreen ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span 
                                  className="atm-menu-label atm-menu-label--left atm-menu-label--clickable"
                                  onClick={(e) => {
                                    console.log('Back button clicked', e);
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (message) {
                                      // If there's a message, clear it and stay on deposit screen
                                      setMessage(null);
                                    } else {
                                      // If no message, go back to main menu
                                      setMessage(null);
                                      setScreen('menu');
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      if (message) {
                                        setMessage(null);
                                      } else {
                                        setMessage(null);
                                        setScreen('menu');
                                      }
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  style={{ cursor: 'pointer' }}
                                >
                                  Back
                                </span>
                              </>
                            ) : showWithdrawScreen || showBalanceScreen ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span 
                                  className="atm-menu-label atm-menu-label--left atm-menu-label--clickable"
                                  onClick={(e) => {
                                    console.log('Back button clicked', e);
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setMessage(null);
                                    setScreen('menu');
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setMessage(null);
                                      setScreen('menu');
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  style={{ cursor: 'pointer' }}
                                >
                                  Back
                                </span>
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
                                <span 
                                  className="atm-menu-label atm-menu-label--right atm-menu-label--clickable"
                                  onClick={(e) => {
                                    console.log('Re-Enter PIN button clicked', e);
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Calling handleReEnterPin');
                                    handleReEnterPin();
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleReEnterPin();
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  style={{ cursor: 'pointer' }}
                                >
                                Re-Enter PIN
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : showDepositAmountScreen ? (
                              <>
                                <span 
                                  className={`atm-menu-label atm-menu-label--right ${amount && /^\d+$/.test(amount) ? 'atm-menu-label--clickable' : ''}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // Only enable if amount has at least 1 digit and contains only digits
                                    if (!amount || !/^\d+$/.test(amount)) return;
                                    const value = parseAmount();
                                    if (value == null || value <= 0) return;
                                    const newBalance = balance + value;
                                    setBalance(newBalance);
                                    setMessage(`Deposit $${value.toFixed(2)}\nBalance $${newBalance.toFixed(2)}`);
                                    setAmount('');
                                    setScreen('balance');
                                  }}
                                  style={{ cursor: amount && /^\d+$/.test(amount) ? 'pointer' : 'default', opacity: amount && /^\d+$/.test(amount) ? 1 : 0.5 }}
                                >
                                  Deposit
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : showDepositScreen && !message ? (
                              <>
                                <span 
                                  className="atm-menu-label atm-menu-label--right atm-menu-label--clickable"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setAmount('');
                                    setMessage(null);
                                    setScreen('deposit-amount');
                                  }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  Other Amount
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
                        console.log(`Right button ${i} clicked, screen:`, screen);
                        const mapping = screenButtonMapping[screen];
                        const handler = mapping.right[i as keyof typeof mapping.right];
                        if (handler) {
                          console.log(`Calling handler for right-${i} on ${screen} screen`);
                          handler();
                        } else {
                          console.log(`No handler for right-${i} on ${screen} screen`);
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

      {showWithdrawScreen && (
        <div className="atm-controls">
          <form className="atm-amount-form" onSubmit={handleWithdraw}>
            <label className="atm-pin-label">
              Amount:
            </label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              className="atm-pin-input"
            />
            <button type="submit" className="atm-pin-submit">Confirm Withdraw</button>
          </form>
        </div>
      )}

      {showDepositAmountScreen && (
        <div className="atm-controls">
          <form className="atm-amount-form" onSubmit={handleDeposit}>
            <label className="atm-pin-label">
              KEYPAD:
            </label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              className="atm-pin-input"
            />
          </form>
        </div>
      )}

    </div>
  );
}
