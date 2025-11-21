import atmSign from '../assets/atm_sign.png';
import graffiti from '../assets/graffiti.png';
import sticker from '../assets/sticker_graf.png';
import systems from '../assets/systems.png';
import creditSprite from '../assets/creditcard_sprite.png';
import '../atm.css';

export function AtmLayout() {
  const sideButtons = [0, 1, 2, 3];

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
                    <div className="atm-side-button" />
                    <div className="atm-side-button-connector" />
                  </div>
                ))}
              </div>

              <div className="atm-screen-wrapper">
                <div className="atm-screen">
                    <div className="atm-screen-content">
                    <div className="atm-screen-header">
                        <p className="atm-screen-header-line">Hi Peter Parker!</p>
                        <p className="atm-screen-header-line">Please make a choice...</p>
                    </div>

                    <div className="atm-screen-menu">
                        <div className="atm-menu-row">
                        <div className="atm-menu-slot atm-menu-slot--left">
                        </div>
                        <div className="atm-menu-slot atm-menu-slot--right">
                            <span className="atm-menu-label atm-menu-label--right">Exit</span>
                            <span className="atm-menu-connector atm-menu-connector--right" />
                        </div>
                        </div>

                        <div className="atm-menu-row">
                        <div className="atm-menu-slot atm-menu-slot--left">
                            <span className="atm-menu-connector atm-menu-connector--left" />
                            <span className="atm-menu-label atm-menu-label--left">Withdraw</span>
                        </div>
                        <div className="atm-menu-slot atm-menu-slot--right">
                            <span className="atm-menu-label atm-menu-label--right">Balance</span>
                            <span className="atm-menu-connector atm-menu-connector--right" />
                        </div>
                        </div>

                        <div className="atm-menu-row">
                        <div className="atm-menu-slot atm-menu-slot--left">
                            <span className="atm-menu-connector atm-menu-connector--left" />
                            <span className="atm-menu-label atm-menu-label--left">Deposit</span>
                        </div>
                        <div className="atm-menu-slot atm-menu-slot--right">
                            <span className="atm-menu-label atm-menu-label--right">
                            Re-Enter PIN
                            </span>
                            <span className="atm-menu-connector atm-menu-connector--right" />
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
                    <div className="atm-side-button" />
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
    </div>
  );
}
