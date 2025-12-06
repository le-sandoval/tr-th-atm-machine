import { useState, useEffect, type FormEvent } from 'react';
import atmSign from '../assets/atm_sign.png';
import graffiti from '../assets/graffiti.png';
import sticker from '../assets/sticker_graf.png';
import systems from '../assets/systems.png';
import { AtmKeypadInput } from './AtmKeypadInput';
import { AtmMenuOption } from './AtmMenuOption';
import { AtmScreenHeader } from './AtmScreenHeader';
import '../atm.css';

const CORRECT_PIN = '1234';
const INITIAL_BALANCE = 1000;

// Operational constraints
// - MAX_BALANCE caps how much cash this fictional ATM can hold
// - MAX_DEPOSIT and MAX_WITHDRAW model per-transaction limits
const MAX_BALANCE = 200000; // $200,000.00
const MAX_DEPOSIT = 10000;  // max per deposit
const MAX_WITHDRAW = 10000; // max per withdraw

// Helper functions for formatting balance/amount lines
function formatAmtLine(bal: number, amt: number): string {
  return `Bal:$${bal} | Amt:$${amt}`;
}

function formatBalanceLine(balance: number): string {
  return `Balance $${balance.toFixed(2)}`;
}

function formatAmountEnteredLine(amount: number): string {
  return `Amt Entered $${amount.toFixed(2)}`;
}

const MESSAGES = {
  wrongPin: 'Wrong PIN. Retry.',
  positiveAmount: 'Please enter a positive amount.',
  insufficientFunds: 'Insufficient funds.',
  insufficientFundsWithBalance: (balance: number) => 
    `Insufficient funds.\n${formatBalanceLine(balance)}`,
  insufficientFundsWithDetails: (balance: number, amount: number) => 
    `Insufficient funds.\n${formatAmtLine(balance, amount)}`,
  multiplesOf20: 'Use multiples of 20',
  multiplesOf20WithDetails: (balance: number, amount: number) => 
    `Use multiples of 20\n${formatAmtLine(balance, amount)}`,
  withdrawLimit: (limit: number) => `Withdraw Limit $${limit.toFixed(2)}`,
  depositLimit: (limit: number) => `Deposit Limit $${limit.toFixed(2)}`,
  depositLimitWithAmount: (limit: number, amount: number) => 
    `Deposit Limit $${limit.toFixed(2)}\n${formatAmountEnteredLine(amount)}`,
  maxDeposit: (limit: number) => `Max deposit $${limit}`,
  atmLimitReached: (limit: number) => `ATM limit reached\n${formatBalanceLine(limit)}`,
  withdrawSuccess: (amount: number, balance: number) => 
    `Withdraw $${amount.toFixed(2)}\n${formatBalanceLine(balance)}`,
  depositSuccess: (amount: number, balance: number) => 
    `Deposit $${amount.toFixed(2)}\n${formatBalanceLine(balance)}`,
} as const;

type Screen = 'welcome' | 'pin' | 'menu' | 'withdraw' | 'withdraw-amount' | 'deposit' | 'deposit-amount' | 'balance' | 'history';
type CardNetwork = 'star' | 'pulse' | 'maestro' | 'mastercard' | 'plus' | 'visa';

export function AtmLayout() {
  const sideButtons = [0, 1, 2, 3] as const;

  const [screen, setScreen] = useState<Screen>('welcome');
  const [enteredPin, setEnteredPin] = useState('');
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const [cardType, setCardType] = useState<CardNetwork | null>(null);

  // Transaction history state
  const [transactions, setTransactions] = useState<Array<{
    type: 'deposit' | 'withdraw';
    amount: number;
    balance: number;
    timestamp: Date;
  }>>([]);

  // For this assignment, a successful PIN sets a cardType, in this case 'star',
  // and "cardType !== null" is treated as "this session is authenticated".
  // No extra isAuthenticated flag needed, cardType is the source of truth.
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
  const showTransactionHistoryScreen = screen === 'history';


  // Simple client side guard to mimic ATM behavior,
  // if the user stays on the PIN screen for 30s, clear the PIN entry
  // and return to the welcome screen
  useEffect(() => {
    if (!showPinScreen) return;

    const timeoutId = setTimeout(() => {
      setEnteredPin('');
      setMessage(null);
      setScreen('welcome');
    }, 30000); //30 seconds

    // Cleanup timeout if component unmounts or screen changes
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
      setMessage(MESSAGES.wrongPin);
    }
  }

  function handleGoToPin() {
    setEnteredPin('');
    setMessage(null);
    setScreen('pin');
  }

  function handleExit() {
    if (!isAuthenticated) return;
    setCardType(null);
    setEnteredPin('');
    setAmount('');
    setMessage(null);
    setTransactions([]); // Clear transaction history on logout
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

  function handleSelectTransactionHistory() {
    if (!isAuthenticated) return;
    setMessage(null);
    setScreen('history');
  }

  function handleReEnterPin() {
    if (!isAuthenticated) return;
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
        1: handleSelectTransactionHistory, // Transaction History
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
        0: balance === 0 ? null : () => handleQuickWithdraw(20), // $20
        1: balance === 0 ? null : () => handleQuickWithdraw(40), // $40
        2: balance === 0 ? null : () => handleQuickWithdraw(60), // $60
        3: () => setScreen('menu'), // Back to menu (always enabled)
      },
      right: {
        0: balance === 0 ? null : () => handleQuickWithdraw(100), // $100
        1: balance === 0 ? null : () => handleQuickWithdraw(200), // $200
        2: balance === 0 ? null : () => handleQuickWithdraw(400), // $400
        3: balance === 0 ? null : () => {
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
            setMessage(MESSAGES.insufficientFundsWithDetails(balance, value));
            return;
          }
          
          // Then check if amount is a multiple of 20 (only if amount <= balance)
          if (value % 20 !== 0) {
            setMessage(MESSAGES.multiplesOf20WithDetails(balance, value));
            return;
          }
          
          // Check max withdraw limit
          if (value > MAX_WITHDRAW) {
            setMessage(MESSAGES.withdrawLimit(MAX_WITHDRAW));
            return;
          }
          
          const newBalance = balance - value;
          setBalance(newBalance);
          
          // Add transaction to history
          setTransactions(prev => [...prev, {
            type: 'withdraw',
            amount: value,
            balance: newBalance,
            timestamp: new Date(),
          }]);
          
          setMessage(MESSAGES.withdrawSuccess(value, newBalance));
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
            setMessage(MESSAGES.depositLimitWithAmount(MAX_DEPOSIT, value));
            return;
          }
          
          // Check max balance limit
          const newBalance = balance + value;
          if (newBalance > MAX_BALANCE) {
            setMessage(MESSAGES.atmLimitReached(MAX_BALANCE));
            return;
          }
          
          setBalance(newBalance);
          setMessage(MESSAGES.depositSuccess(value, newBalance));
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
    history: {
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
      setMessage(MESSAGES.positiveAmount);
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
      setMessage(MESSAGES.withdrawLimit(MAX_WITHDRAW));
      return;
    }

    // First check insufficient funds
    if (value > balance) {
      setMessage(MESSAGES.insufficientFundsWithDetails(balance, value));
      return;
    }

    // Then check if amount is a multiple of 20 (only if amount <= balance)
    if (value % 20 !== 0) {
      setMessage(MESSAGES.multiplesOf20WithDetails(balance, value));
      return;
    }

    const newBalance = balance - value;
    setBalance(newBalance);
    
    // Add transaction to history
    setTransactions(prev => [...prev, {
      type: 'withdraw',
      amount: value,
      balance: newBalance,
      timestamp: new Date(),
    }]);
    
    setMessage(MESSAGES.withdrawSuccess(value, newBalance));
    setAmount('');
    setScreen('balance');
  }

  function handleDeposit(e: FormEvent) {
    e.preventDefault();
    const value = parseAmount();
    if (value == null) return;

    // Check max deposit limit
    if (value > MAX_DEPOSIT) {
      setMessage(MESSAGES.maxDeposit(MAX_DEPOSIT));
      return;
    }
    
    // Check max balance limit
    const newBalance = balance + value;
    if (newBalance > MAX_BALANCE) {
      setMessage(MESSAGES.atmLimitReached(MAX_BALANCE));
      return;
    }

    setBalance(newBalance);
    
    // Add transaction to history
    setTransactions(prev => [...prev, {
      type: 'deposit',
      amount: value,
      balance: newBalance,
      timestamp: new Date(),
    }]);
    
    setMessage(MESSAGES.depositSuccess(value, newBalance));
    setAmount('');
    setScreen('balance');
  }

  function handleQuickDeposit(amountValue: number) {
    // Check max deposit limit
    if (amountValue > MAX_DEPOSIT) {
      setMessage(MESSAGES.maxDeposit(MAX_DEPOSIT));
      return;
    }
    
    // Check max balance limit
    const newBalance = balance + amountValue;
    if (newBalance > MAX_BALANCE) {
      setMessage(MESSAGES.atmLimitReached(MAX_BALANCE));
      return;
    }
    
    setBalance(newBalance);
    
    // Add transaction to history
    setTransactions(prev => [...prev, {
      type: 'deposit',
      amount: amountValue,
      balance: newBalance,
      timestamp: new Date(),
    }]);
    
    setMessage(MESSAGES.depositSuccess(amountValue, newBalance));
    setAmount('');
    setScreen('balance');
  }

  function handleQuickWithdraw(amountValue: number) {
    // Check max withdraw limit
    if (amountValue > MAX_WITHDRAW) {
      setMessage(MESSAGES.withdrawLimit(MAX_WITHDRAW));
      return;
    }
    
    // Check insufficient funds
    if (amountValue > balance) {
      setMessage(MESSAGES.insufficientFundsWithBalance(balance));
      return;
    }
    
    const newBalance = balance - amountValue;
    setBalance(newBalance);
    
    // Add transaction to history
    setTransactions(prev => [...prev, {
      type: 'withdraw',
      amount: amountValue,
      balance: newBalance,
      timestamp: new Date(),
    }]);
    
    setMessage(MESSAGES.withdrawSuccess(amountValue, newBalance));
    setAmount('');
    setScreen('balance');
  }

  const quickAmountVisible =
    (showDepositScreen || showWithdrawScreen) &&
    !message &&
    (showDepositScreen || balance !== 0);

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
                    {showWelcomeScreen && (
                      <AtmScreenHeader lines={['Welcome to the', 'ATM']} />
                    )}
                    {showPinScreen && (
                      <div className="atm-screen-header">
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
                      </div>
                    )}
                    {showMenuScreen && (
                      <AtmScreenHeader lines={['Hi Peter Parker!', 'Please make a choice...']} />
                    )}
                    {showDepositAmountScreen && (() => {
                      const lines = message && message.includes('Deposit Limit')
                        ? [`Deposit Limit $${MAX_DEPOSIT}`, formatAmtLine(balance, amount ? parseFloat(amount) : 0)]
                        : message
                          ? message.split('\n')
                          : ['Enter Deposit Amt', formatAmtLine(balance, amount ? parseFloat(amount) : 0)];
                      return <AtmScreenHeader lines={lines} />;
                    })()}
                    {showWithdrawAmountScreen && (() => {
                      const currentAmount = amount && /^\d+$/.test(amount) ? parseFloat(amount) : 0;
                      const lines = message && message.includes('Withdraw Limit')
                        ? [`Withdraw Limit $${MAX_WITHDRAW}`, formatAmtLine(balance, currentAmount)]
                        : message && message.includes(MESSAGES.insufficientFunds)
                          ? [MESSAGES.insufficientFunds, formatAmtLine(balance, currentAmount)]
                          : message && message.includes(MESSAGES.multiplesOf20)
                            ? [MESSAGES.multiplesOf20, formatAmtLine(balance, currentAmount)]
                            : message
                              ? message.split('\n')
                              : ['Enter Withdraw Amt', formatAmtLine(balance, currentAmount)];
                      return <AtmScreenHeader lines={lines} />;
                    })()}
                    {showWithdrawScreen && (() => {
                      const lines = message
                        ? message.split('\n')
                        : balance === 0
                          ? ['Current Balance', '$0']
                          : [formatBalanceLine(balance), 'Select Withdraw Amt'];
                      return <AtmScreenHeader lines={lines} />;
                    })()}
                    {showDepositScreen && (() => {
                      const lines = message
                        ? message.split('\n')
                        : ['Select Amount to ', 'Deposit'];
                      return <AtmScreenHeader lines={lines} />;
                    })()}
                    {showBalanceScreen && (() => {
                      const lines = message
                        ? message.split('\n')
                        : ['Your balance is:', `$${balance.toFixed(2)}`];
                      return <AtmScreenHeader lines={lines} />;
                    })()}
                    {showTransactionHistoryScreen && (() => {
                      const lines: string[] = [];
                      
                      if (transactions.length === 0) {
                        lines.push('No transactions');
                        lines.push('yet');
                      } else {
                        lines.push('Last Transactions');
                        // Show last 3 transactions (most recent first)
                        const recentTransactions = transactions.slice(-3).reverse();
                        recentTransactions.forEach((tx) => {
                          const symbol = tx.type === 'deposit' ? '+' : '-';
                          const amount = tx.amount.toFixed(2);
                          lines.push(`${symbol} $${amount}`);
                        });
                        lines.push(`Total: ${transactions.length}`);
                      }
                      
                      return <AtmScreenHeader lines={lines} />;
                    })()}

                    <div className="atm-screen-menu">
                        <div className="atm-menu-row">
                        <div className="atm-menu-slot atm-menu-slot--left">
                            <AtmMenuOption
                              side="left"
                              label="$20"
                              visible={quickAmountVisible}
                            />
                        </div>
                        <div className="atm-menu-slot atm-menu-slot--right">
                            <AtmMenuOption
                              side="right"
                              label="$100"
                              visible={quickAmountVisible}
                            />
                        </div>
                        </div>

                        <div className="atm-menu-row">
                        <div className="atm-menu-slot atm-menu-slot--left">
                            {(() => {
                              let label = 'History';
                              let visible = false;
                              if (showMenuScreen) {
                                label = 'History';
                                visible = true;
                              } else if ((showDepositScreen || showWithdrawScreen) && !message) {
                                label = '$40';
                                visible = true;
                              }
                              return <AtmMenuOption side="left" label={label} visible={visible} />;
                            })()}
                        </div>
                        <div className="atm-menu-slot atm-menu-slot--right">
                            {(() => {
                              let label = 'Exit';
                              let visible = false;
                              if (showMenuScreen) {
                                label = 'Exit';
                                visible = true;
                              } else if (showDepositScreen && !message) {
                                label = '$200';
                                visible = true;
                              } else if (showWithdrawScreen && !message && balance !== 0) {
                                label = '$200';
                                visible = true;
                              }
                              return <AtmMenuOption side="right" label={label} visible={visible} />;
                            })()}
                        </div>
                        </div>

                        <div className="atm-menu-row">
                        <div className="atm-menu-slot atm-menu-slot--left">
                            {(() => {
                              let label = 'Withdraw';
                              let visible = false;
                              if (showMenuScreen) {
                                label = 'Withdraw';
                                visible = true;
                              } else if ((showDepositScreen || showWithdrawScreen) && !message && (showDepositScreen || balance !== 0)) {
                                label = '$60';
                                visible = true;
                              }
                              return <AtmMenuOption side="left" label={label} visible={visible} />;
                            })()}
                        </div>
                        <div className="atm-menu-slot atm-menu-slot--right">
                            {(() => {
                              let label = 'Balance';
                              let visible = false;
                              if (showMenuScreen) {
                                label = 'Balance';
                                visible = true;
                              } else if (showDepositScreen && !message) {
                                label = '$400';
                                visible = true;
                              } else if (showWithdrawScreen && !message && balance !== 0) {
                                label = '$400';
                                visible = true;
                              }
                              return <AtmMenuOption side="right" label={label} visible={visible} />;
                            })()}
                        </div>
                        </div>

                        <div className="atm-menu-row">
                        <div className="atm-menu-slot atm-menu-slot--left">
                            {(() => {
                              let label = 'Deposit';
                              let visible = false;
                              if (showMenuScreen) {
                                label = 'Deposit';
                                visible = true;
                              } else if (showDepositAmountScreen || showWithdrawAmountScreen || showDepositScreen || showWithdrawScreen || showBalanceScreen || showTransactionHistoryScreen) {
                                label = 'Back';
                                visible = true;
                              }
                              return <AtmMenuOption side="left" label={label} visible={visible} />;
                            })()}
                        </div>
                        <div className="atm-menu-slot atm-menu-slot--right">
                            {(() => {
                              let label = 'Re-Enter PIN';
                              let visible = false;
                              if (showWelcomeScreen) {
                                label = 'Enter PIN';
                                visible = true;
                              } else if (showPinScreen) {
                                label = 'NEXT';
                                visible = true;
                              } else if (showMenuScreen) {
                                label = 'Re-Enter PIN';
                                visible = true;
                              } else if (showDepositAmountScreen) {
                                label = 'Deposit';
                                visible = true;
                              } else if (showWithdrawAmountScreen) {
                                label = 'Withdraw';
                                visible = true;
                              } else if (showDepositScreen && !message) {
                                label = 'Other Amount';
                                visible = true;
                              } else if (showWithdrawScreen && !message && balance !== 0) {
                                label = 'Other Amount';
                                visible = true;
                              }
                              return <AtmMenuOption side="right" label={label} visible={visible} />;
                            })()}
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
        <AtmKeypadInput
          value={enteredPin}
          onChange={setEnteredPin}
          onSubmit={handlePinSubmit}
          type="password"
          maxLength={4}
          restrictToDigits
        />
      )}

      {showDepositAmountScreen && (
        <AtmKeypadInput
          value={amount}
          onChange={setAmount}
          onSubmit={handleDeposit}
          type="number"
          maxLength={5}
          restrictToDigits
        />
      )}

      {showWithdrawAmountScreen && (
        <AtmKeypadInput
          value={amount}
          onChange={setAmount}
          onSubmit={handleWithdraw}
          type="number"
          maxLength={5}
          restrictToDigits
        />
      )}

    </div>
  );
}
