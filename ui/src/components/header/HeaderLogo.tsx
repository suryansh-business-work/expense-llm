import { NavLink } from 'react-router-dom';

const HeaderLogo = () => (
  <>
    <div className="col-auto">
      <div className="logo">
        <NavLink to="/bots">
          <img src="/logo/botify-logo-dark.svg" alt="Botify Your Life" />
        </NavLink>
      </div>
    </div>
  </>
);

export default HeaderLogo;
