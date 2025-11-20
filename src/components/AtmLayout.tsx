import atmSign from '../assets/atm_sign.png';
import graffiti from '../assets/graffiti.png';
import sticker from '../assets/sticker_graf.png';
import systems from '../assets/systems.png';
import '../atm.css';

export function AtmLayout() {
  return (
    <div className="atm-page">
      <div className="atm-machine">
        <div className="atm-sign-bar">
          <img src={atmSign} alt="ATM 24 hour banking" className="atm-sign-img" />
          <img src={graffiti} alt="" className="atm-sign-graffiti" />
        </div>

        <div className="atm-divider" />

        <div className="atm-shell">
          <div className="atm-inner">
            <div className="atm-screen-wrapper">
              <div className="atm-screen">
                <p>Welcome to the ATM</p>
              </div>
            </div>
          </div>

          <img src={sticker} alt="" className="atm-sticker" />
          <img src={systems} alt="" className="atm-systems-logo" />
        </div>
      </div>
    </div>
  );
}
