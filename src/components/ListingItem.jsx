import { Link } from 'react-router-dom';
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg';
import { ReactComponent as EditIcon } from '../assets/svg/editIcon.svg';
import BedIcon from '../assets/svg/bedIcon.svg';
import BathIcon from '../assets/svg/bathtubIcon.svg';

const ListingItem = ({ listing, id, handleDelete, handleEdit }) => {
  const {
    type,
    imageUrls,
    name,
    location,
    offer,
    discountedPrice,
    regularPrice,
    bedrooms,
    bathrooms,
  } = listing;
  return (
    <li className="categoryListing">
      <Link to={`/category/${type}/${id}`} className="categoryListingLink">
        <img src={imageUrls[0]} alt={name} className="categoryListingImg" />
        <div className="categoryListingDetails">
          <p className="categoryListingLocation">{location}</p>
          <p className="categoryListingName">{name}</p>

          <p className="categoryListingPrice">
            $
            {offer
              ? discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              : regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            {type === 'rent' && ' / Month'}
          </p>
          <div className="categoryListingInfoDiv">
            <img src={BedIcon} alt="bed" />
            <p className="categoryListingInfoText">
              {bedrooms > 1 ? `${bedrooms} Bedrooms` : '1 Bedroom'}
            </p>
            <img src={BathIcon} alt="bath" />
            <p className="categoryListingInfoText">
              {bathrooms > 1 ? `${bathrooms} Bathrooms` : '1 Bathroom'}
            </p>
          </div>
        </div>
      </Link>

      {handleDelete && (
        <DeleteIcon
          className="removeIcon"
          fill="rgb(231, 76,60)"
          onClick={() => handleDelete(listing.id, listing.name)}
        />
      )}

      {handleEdit && (
        <EditIcon className="editIcon" onClick={() => handleEdit(id)} />
      )}
    </li>
  );
};

export default ListingItem;
