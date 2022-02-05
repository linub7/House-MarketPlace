import { useNavigate, useLocation } from 'react-router-dom';
import { ReactComponent as OfferIcon } from '../assets/svg/localOfferIcon.svg';
import { ReactComponent as ExploreIcon } from '../assets/svg/exploreIcon.svg';
import { ReactComponent as PersonOutlineIcon } from '../assets/svg/personOutlineIcon.svg';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathMathRoute = (route) => {
    if (location.pathname == route) return true;
  };

  return (
    <footer className="navbar">
      <nav className="navbarNav">
        <ul className="navbarListItems">
          <li onClick={() => navigate('/')} className={`navbarListItem`}>
            <ExploreIcon
              fill={pathMathRoute('/') ? '#2c2c2c' : '#8f8f8f'}
              width="36px"
              height="36px"
            />
            <p
              className={
                pathMathRoute('/')
                  ? 'navbarListItemNameActive'
                  : 'navbarListItemName'
              }
              //   style={
              //     pathMathRoute('/')
              //       ? { color: '#2c2c2c', fontWeight: 'bold' }
              //       : { color: '#8f8f8f' }
              //   }
            >
              Explore
            </p>
          </li>
          <li onClick={() => navigate('/offers')} className="navbarListItem">
            <OfferIcon
              fill={pathMathRoute('/offers') ? '#2c2c2c' : '#8f8f8f'}
              width="36px"
              height="36px"
            />
            <p
              className={
                pathMathRoute('/offers')
                  ? 'navbarListItemNameActive'
                  : 'navbarListItemName'
              }
              //   style={
              //     pathMathRoute('/offers')
              //       ? { color: '#2c2c2c', fontWeight: 'bold' }
              //       : { color: '#8f8f8f' }
              //   }
            >
              Offers
            </p>
          </li>
          <li onClick={() => navigate('/profile')} className="navbarListItem">
            <PersonOutlineIcon
              fill={pathMathRoute('/profile') ? '#2c2c2c' : '#8f8f8f'}
              width="36px"
              height="36px"
            />
            <p
              className={
                pathMathRoute('/profile')
                  ? 'navbarListItemNameActive'
                  : 'navbarListItemName'
              }
              //   style={
              //     pathMathRoute('/profile')
              //       ? { color: '#2c2c2c', fontWeight: 'bold' }
              //       : { color: '#8f8f8f' }
              //   }
            >
              Profile
            </p>
          </li>
        </ul>
      </nav>
    </footer>
  );
};

export default Navbar;
