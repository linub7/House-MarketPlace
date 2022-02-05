import { Link } from 'react-router-dom';
import rentCategoryImages from '../assets/jpg/rentCategoryImage.jpg';
import sellCategoryImages from '../assets/jpg/sellCategoryImage.jpg';
import Slider from '../components/Slider';

const Explore = () => {
  return (
    <div className="explore">
      <header>
        <p className="pageHeader">Explore</p>
      </header>
      <main>
        <Slider />
        <p className="exploreCategoryHeading">Categories</p>
        <div className="exploreCategories">
          <Link to="/category/rent">
            <img
              src={rentCategoryImages}
              alt="rent"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName">Places for rent</p>
          </Link>
          <Link to="/category/sale">
            <img
              src={sellCategoryImages}
              alt="sell"
              className="exploreCategoryImg"
            />
            <p
              style={{ marginBottom: '150px' }}
              className="exploreCategoryName"
            >
              Places for sale
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Explore;
