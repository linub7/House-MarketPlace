import { getAuth, updateProfile } from 'firebase/auth';
import ListingItem from '../components/ListingItem';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';

const Profile = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const isMounted = useRef(true);

  const [changeDetails, setChangeDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  const { name, email } = formData;

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, 'listings');

      const q = query(
        listingsRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );

      const querySnap = await getDocs(q);

      let listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings(listings);
      setLoading(false);
    };

    fetchUserListings();
  }, [auth.currentUser.uid]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/sign-in');
    isMounted.current = false;
  };

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    try {
      if (auth.currentUser.displayName !== name) {
        // update displayName in fb
        await updateProfile(auth.currentUser, { displayName: name });

        // update in firestore
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { name });
      }
    } catch (error) {
      toast.error('Could not update profile details');
    }
  };

  const handleListingDelete = async (listingId) => {
    if (window.confirm('Are You sure you want to delete this listing? 🤯')) {
      await deleteDoc(doc(db, 'listings', listingId));
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingId
      );
      setListings(updatedListings);
      toast.success('Successfully deleted listings ✌️');
    }
  };

  const handleListingEdit = (listingId) =>
    navigate(`/edit-listing/${listingId}`);

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button className="logOut" type="button" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              changeDetails && handleSubmit();
              setChangeDetails((prevState) => !prevState);
            }}
          >
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>
        <div className="profileCard">
          <form>
            <input
              type="text"
              name="name"
              value={name}
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              value={email}
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled
              onChange={handleChange}
            />
          </form>
        </div>
        <Link to="/create-listing" className="createListing">
          <img src={homeIcon} alt="home icon" />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt="arrow right icon" />
        </Link>
        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  handleDelete={() => handleListingDelete(listing.id)}
                  handleEdit={() => handleListingEdit(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
