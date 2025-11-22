import { useState, useEffect, type FormEvent } from 'react';
import atmSign from '../assets/atm_sign.png';
import graffiti from '../assets/graffiti.png';
import sticker from '../assets/sticker_graf.png';
import systems from '../assets/systems.png';
import '../atm.css';

const CORRECT_PIN = '1234';
const INITIAL_BALANCE = 1000;
const MAX_BALANCE = 200000; //$200,000.00
const MAX_DEPOSIT = 10000;  //max per deposit
const MAX_WITHDRAW = 10000; //max per withdraw

type Screen = 'welcome' | 'pin' | 'menu' | 'withdraw' | 'withdraw-amount' | 'deposit' | 'deposit-amount' | 'balance';
type CardNetwork = 'star' | 'pulse' | 'maestro' | 'mastercard' | 'plus' | 'visa';

export function AtmLayout() {
  const sideButtons = [0, 1, 2, 3];

  const [screen, setScreen] = useState<Screen>('welcome');
  const [enteredPin, setEnteredPin] = useState('');
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const [cardType, setCardType] = useState<CardNetwork | null>(null);

  //derived from cardType, no separate auth state stored
  const isAuthenticated = cardType !== null;

  // Helper booleans
  const showWelcomeScreen = screen === 'welcome';
  const showPinScreen = screen === 'pin';
  const showMenuScreen = screen === 'menu';
  const showWithdrawScreen = screen === 'withdraw';
  const showWithdrawAmountScreen = screen === 'withdraw-amount';
  const showDepositScreen = screen === 'deposit';
  const showDepositAmountScreen = screen === 'deposit-amount';
  const showBalanceScreen = screen === 'balance';


      // auto-return to welcome screen after 30 seconds of inactivity on PIN screen
  useEffect(() => {
    if (!showPinScreen) return;

    const timeoutId = setTimeout(() => {
      // reset PIN and return to welcome screen after 30 seconds of inactivity
      setEnteredPin('');
      setMessage(null);
      setScreen('welcome');
    }, 30000); //30 seconds

    // cleanup timeout if component unmounts or screen changes
    return () => {
      clearTimeout(timeoutId);
    };
  }, [showPinScreen, enteredPin]); //reset timer when PIN changes -user activity

  // PIN flow 
  function handlePinSubmit(e?: FormEvent) {
    if (e) {
      e.preventDefault();
    }

    if (enteredPin.length === 4 && enteredPin === CORRECT_PIN) {
      setCardType('star');
      setScreen('menu');
      setMessage(null);
    } else {
      setCardType(null);
      setMessage('Wrong PIN. Retry.');
    }
  }

  function handleGoToPin() {
    setEnteredPin('');
    setMessage(null);
    setScreen('pin');
  }

  function handleExit() {
    if (!isAuthenticated) return; //only allow exit if authenticated
    setCardType(null);
    setEnteredPin('');
    setAmount('');
    setMessage(null);
    setScreen('welcome');
  }

  function handleSelectWithdraw() {
    if (!isAuthenticated) return;
    setAmount('');
    setMessage(null);
    setScreen('withdraw');
  }

  function handleSelectDeposit() {
    if (!isAuthenticated) return;
    setAmount('');
    setMessage(null);
    setScreen('deposit');
  }

  function handleSelectBalance() {
    if (!isAuthenticated) return;
    setMessage(null);
    setScreen('balance');
  }

  function handleReEnterPin() {
    if (!isAuthenticated) return; // only allow if authenticated
    setCardType(null);
    setEnteredPin('');
    setMessage(null);
    setScreen('pin');
  }

  function cardClass(name: CardNetwork) {
    const base = `atm-card atm-card--${name}`;
    return cardType === name ? `${base} atm-card--active` : base;
  }

  // Button mapping for all screens
  const screenButtonMapping: Record<Screen, {
    left: { [key: number]: (() => void) | null };
    right: { [key: number]: (() => void) | null };
  }> = {
    welcome: {
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
        3: handleGoToPin, // Enter PIN
      },
    },
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
        3: handlePinSubmit, // NEXT
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
        0: () => handleQuickWithdraw(20), //$20
        1: () => handleQuickWithdraw(40), //$40
        2: () => handleQuickWithdraw(60), //$60
        3: () => setScreen('menu'), // Back to menu
      },
      right: {
        0: () => handleQuickWithdraw(100), //$100
        1: () => handleQuickWithdraw(200), //$200
        2: () => handleQuickWithdraw(400), //$400
        3: () => {
          // Other Amount - navigate to withdraw-amount screen
          setAmount('');
          setMessage(null);
          setScreen('withdraw-amount');
        },
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
    'withdraw-amount': {
      left: {
        0: null,
        1: null,
        2: null,
        3: () => {
          setAmount('');
          setMessage(null);
          setScreen('withdraw');
        }, // Back to withdraw screen
      },
      right: {
        0: null,
        1: null,
        2: null,
        3: () => {
          // Withdraw button - process the withdrawal
          // Only enable if amount has at least 1 digit and contains only digits
          if (!amount || !/^\d+$/.test(amount)) return;
          const value = parseAmount();
          if (value == null || value <= 0) return;
          
          // First check insufficient funds
          if (value > balance) {
            setMessage(`Insufficient funds.\nBal.${balance} | Amt.${value}`);
            return;
          }
          
          // Then check if amount is a multiple of 20 (only if amount <= balance)
          if (value % 20 !== 0) {
            setMessage(`Use multiples of 20\nBal.${balance} | Amt.${value}`);
            return;
          }
          
          // Check max withdraw limit
          if (value > MAX_WITHDRAW) {
            setMessage(`Withdraw Limit $${MAX_WITHDRAW.toFixed(2)}`);
            return;
          }
          
          const newBalance = balance - value;
          setBalance(newBalance);
          setMessage(`Withdraw $${value.toFixed(2)}\nBalance $${newBalance.toFixed(2)}`);
          setAmount('');
          setScreen('balance');
        }, // Withdraw
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
          
          // Check max deposit limit
          if (value > MAX_DEPOSIT) {
            setMessage(`Deposit Limit $${MAX_DEPOSIT.toFixed(2)}\nAmt Entered $${value.toFixed(2)}`);
            return;
          }
          
          // Check max balance limit
          const newBalance = balance + value;
          if (newBalance > MAX_BALANCE) {
            setMessage(`ATM limit reached\nBalance $${MAX_BALANCE.toFixed(2)}`);
            return;
          }
          
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

    // Check max withdraw limit
    if (value > MAX_WITHDRAW) {
      setMessage(`Withdraw Limit $${MAX_WITHDRAW.toFixed(2)}`);
      return;
    }

    // First check insufficient funds
    if (value > balance) {
      setMessage(`Insufficient funds.\nBal.${balance} | Amt.${value}`);
      return;
    }

    // Then check if amount is a multiple of 20 (only if amount <= balance)
    if (value % 20 !== 0) {
      setMessage(`Use multiples of 20\nBal.${balance} | Amt.${value}`);
      return;
    }

    const newBalance = balance - value;
    setBalance(newBalance);
    setMessage(`Withdraw $${value.toFixed(2)}\nBalance $${newBalance.toFixed(2)}`);
    setAmount('');
    setScreen('balance');
  }

  function handleDeposit(e: FormEvent) {
    e.preventDefault();
    const value = parseAmount();
    if (value == null) return;

    // Check max deposit limit
    if (value > MAX_DEPOSIT) {
      setMessage(`Max deposit $${MAX_DEPOSIT}`);
      return;
    }
    
    // Check max balance limit
    const newBalance = balance + value;
    if (newBalance > MAX_BALANCE) {
      setMessage(`ATM limit reached\nBalance $${MAX_BALANCE.toFixed(2)}`);
      return;
    }

    setBalance(newBalance);
    setMessage(`Deposit $${value.toFixed(2)}\nBalance $${newBalance.toFixed(2)}`);
    setAmount('');
    setScreen('balance');
  }

  function handleQuickDeposit(amountValue: number) {
    // Check max deposit limit
    if (amountValue > MAX_DEPOSIT) {
      setMessage(`Max deposit $${MAX_DEPOSIT}`);
      return;
    }
    
    // Check max balance limit
    const newBalance = balance + amountValue;
    if (newBalance > MAX_BALANCE) {
      setMessage(`ATM limit reached\nBalance $${MAX_BALANCE.toFixed(2)}`);
      return;
    }
    
    setBalance(newBalance);
    setMessage(`Deposit $${amountValue.toFixed(2)}\nBalance $${newBalance.toFixed(2)}`);
    setAmount('');
    setScreen('balance');
  }

  function handleQuickWithdraw(amountValue: number) {
    // Check max withdraw limit
    if (amountValue > MAX_WITHDRAW) {
      setMessage(`Withdraw Limit $${MAX_WITHDRAW.toFixed(2)}`);
      return;
    }
    
    // Check insufficient funds
    if (amountValue > balance) {
      setMessage(`Insufficient funds.\nBalance $${balance.toFixed(2)}`);
      return;
    }
    
    const newBalance = balance - amountValue;
    setBalance(newBalance);
    setMessage(`Withdraw $${amountValue.toFixed(2)}\nBalance $${newBalance.toFixed(2)}`);
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
            <div className={cardClass('star')} />
            <div className={cardClass('pulse')} />
            <div className={cardClass('maestro')} />
            <div className={cardClass('mastercard')} />
            <div className={cardClass('plus')} />
            <div className={cardClass('visa')} />
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
                        const mapping = screenButtonMapping[screen];
                        const handler = mapping.left[i as keyof typeof mapping.left];
                        if (handler) {
                          handler();
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
                        {showWelcomeScreen && (
                          <>
                            <p className="atm-screen-header-line">Welcome to the</p>
                            <p className="atm-screen-header-line">ATM</p>
                          </>
                        )}
                        {showPinScreen && (
                          <>
                            <p className="atm-screen-header-line">
                              {message || 'Enter PIN'}
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
                            {message && message.includes('Deposit Limit') ? (
                              <>
                                <p className="atm-screen-header-line">Deposit Limit ${MAX_DEPOSIT}</p>
                                <p className="atm-screen-header-line">
                                  Bal.${balance} | Amt.${amount ? parseFloat(amount) : 0}
                                </p>
                              </>
                            ) : message ? (
                              <>
                                {message.split('\n').map((line, index) => (
                                  <p key={index} className="atm-screen-header-line">{line}</p>
                                ))}
                              </>
                            ) : (
                              <>
                                <p className="atm-screen-header-line">Enter Deposit Amt</p>
                                <p className="atm-screen-header-line">
                                  Bal.${balance} | Amt.${amount ? parseFloat(amount) : 0}
                                </p>
                              </>
                            )}
                          </>
                        )}
                        {showWithdrawAmountScreen && (
                          <>
                            {message && message.includes('Withdraw Limit') ? (
                              <>
                                <p className="atm-screen-header-line">Withdraw Limit ${MAX_WITHDRAW}</p>
                                <p className="atm-screen-header-line">
                                  Bal.${balance} | Amt.${amount ? parseFloat(amount) : 0}
                                </p>
                              </>
                            ) : message && message.includes('Insufficient funds') ? (
                              <>
                                <p className="atm-screen-header-line">Insufficient funds.</p>
                                <p className="atm-screen-header-line">
                                  Bal.${balance} | Amt.${amount ? parseFloat(amount) : 0}
                                </p>
                              </>
                            ) : message ? (
                              <>
                                {message.split('\n').map((line, index) => (
                                  <p key={index} className="atm-screen-header-line">{line}</p>
                                ))}
                              </>
                            ) : amount && /^\d+$/.test(amount) && parseFloat(amount) > 0 && parseFloat(amount) % 20 !== 0 ? (
                              <>
                                <p className="atm-screen-header-line">Use multiples of 20</p>
                                <p className="atm-screen-header-line">
                                  Bal.${balance} | Amt.${parseFloat(amount)}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="atm-screen-header-line">Enter Withdraw Amt</p>
                                <p className="atm-screen-header-line">
                                  Bal.${balance} | Amt.${amount ? parseFloat(amount) : 0}
                                </p>
                              </>
                            )}
                          </>
                        )}
                        {showWithdrawScreen && (
                          <>
                            {message ? (
                              <>
                                {message.split('\n').map((line, index) => (
                                  <p key={index} className="atm-screen-header-line">{line}</p>
                                ))}
                              </>
                            ) : balance === 0 ? (
                              <>
                                <p className="atm-screen-header-line">Current Balance</p>
                                <p className="atm-screen-header-line">$0</p>
                              </>
                            ) : (
                              <>
                                <p className="atm-screen-header-line">Balance ${balance.toFixed(2)}</p>
                                <p className="atm-screen-header-line">Select Withdraw Amt</p>
                              </>
                            )}
                          </>
                        )}
                        {showDepositScreen && (
                          <>
                            {message ? (
                              <>
                                {message.split('\n').map((line, index) => (
                                  <p key={index} className="atm-screen-header-line">{line}</p>
                                ))}
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
                                <span className="atm-menu-label atm-menu-label--left">
                                  $20
                                </span>
                              </>
                            ) : showWithdrawScreen && !message && balance !== 0 ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span className="atm-menu-label atm-menu-label--left">
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
                                <span className="atm-menu-label atm-menu-label--right">
                                  $100
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : showWithdrawScreen && !message && balance !== 0 ? (
                              <>
                                <span className="atm-menu-label atm-menu-label--right">
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
                                <span className="atm-menu-label atm-menu-label--left">
                                  $40
                                </span>
                              </>
                            ) : showWithdrawScreen && !message && balance !== 0 ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span className="atm-menu-label atm-menu-label--left">
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
                                <span className="atm-menu-label atm-menu-label--right">
                                  Exit
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : showDepositScreen && !message ? (
                              <>
                                <span className="atm-menu-label atm-menu-label--right">
                                  $200
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : showWithdrawScreen && !message && balance !== 0 ? (
                              <>
                                <span className="atm-menu-label atm-menu-label--right">
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
                                <span className="atm-menu-label atm-menu-label--left">
                                  Withdraw
                                </span>
                              </>
                            ) : showDepositScreen && !message ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span className="atm-menu-label atm-menu-label--left">
                                  $60
                                </span>
                              </>
                            ) : showWithdrawScreen && !message && balance !== 0 ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span className="atm-menu-label atm-menu-label--left">
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
                                <span className="atm-menu-label atm-menu-label--right">
                                  Balance
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : showDepositScreen && !message ? (
                              <>
                                <span className="atm-menu-label atm-menu-label--right">
                                  $400
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : showWithdrawScreen && !message && balance !== 0 ? (
                              <>
                                <span className="atm-menu-label atm-menu-label--right">
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
                                <span className="atm-menu-label atm-menu-label--left">
                                  Deposit
                                </span>
                              </>
                            ) : showDepositAmountScreen ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span className="atm-menu-label atm-menu-label--left">
                                  Back
                                </span>
                              </>
                            ) : showWithdrawAmountScreen ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span className="atm-menu-label atm-menu-label--left">
                                  Back
                                </span>
                              </>
                            ) : showDepositScreen ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span className="atm-menu-label atm-menu-label--left">
                                  Back
                                </span>
                              </>
                            ) : showWithdrawScreen || showBalanceScreen ? (
                              <>
                                <span className="atm-menu-connector atm-menu-connector--left" />
                                <span className="atm-menu-label atm-menu-label--left">
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
                            {showWelcomeScreen ? (
                              <>
                                <span className="atm-menu-label atm-menu-label--right">
                                Enter PIN
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : showPinScreen ? (
                              <>
                                <span className="atm-menu-label atm-menu-label--right">
                                NEXT
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
                            ) : showDepositAmountScreen ? (
                              <>
                                <span className="atm-menu-label atm-menu-label--right">
                                  Deposit
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : showWithdrawAmountScreen ? (
                              <>
                                <span className="atm-menu-label atm-menu-label--right">
                                  Withdraw
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : showDepositScreen && !message ? (
                              <>
                                <span className="atm-menu-label atm-menu-label--right">
                                  Other Amount
                                </span>
                                <span className="atm-menu-connector atm-menu-connector--right" />
                              </>
                            ) : showWithdrawScreen && !message && balance !== 0 ? (
                              <>
                                <span className="atm-menu-label atm-menu-label--right">
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
                        const mapping = screenButtonMapping[screen];
                        const handler = mapping.right[i as keyof typeof mapping.right];
                        if (handler) {
                          handler();
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
              onChange={(e) => {
                const value = e.target.value;
                // Only allow digits and limit to 5 digits
                if (/^\d*$/.test(value) && value.length <= 5) {
                  setAmount(value);
                }
              }}
              maxLength={5}
              autoFocus
              className="atm-pin-input"
            />
          </form>
        </div>
      )}

      {showWithdrawAmountScreen && (
        <div className="atm-controls">
          <form className="atm-amount-form" onSubmit={handleWithdraw}>
            <label className="atm-pin-label">
              KEYPAD:
            </label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow digits and limit to 5 digits
                if (/^\d*$/.test(value) && value.length <= 5) {
                  setAmount(value);
                }
              }}
              maxLength={5}
              autoFocus
              className="atm-pin-input"
            />
          </form>
        </div>
      )}

    </div>
  );
}
