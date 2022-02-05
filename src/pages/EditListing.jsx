import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { db } from '../firebase.config';
import { v4 as uuidv4 } from 'uuid';
import { serverTimestamp, updateDoc, getDoc, doc } from 'firebase/firestore';

const EditListing = () => {
  // eslint-disable-next-line no-unused-vars
  const [geoLocationEnabled, setGeoLocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState(null);
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;

  const navigate = useNavigate();
  const isMounted = useRef(true);
  const auth = getAuth();
  const params = useParams();

  // redirect if listing is not user's
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error('You can not edit that listing');
      navigate('/');
    }
  }, [auth.currentUser.uid, listing, navigate]);

  // fetch Listing to edit
  useEffect(() => {
    setLoading(true);
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data(), address: docSnap.data().location });
        setLoading(false);
      } else {
        navigate('/');
        toast.error('Listing does not exist');
      }
    };
    fetchListing();
  }, [params.listingId, navigate]);

  // sets userRef to logged in user
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate('/sign-in');
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  const handleChangeInput = (e) => {
    let boolean = null;

    if (e.target.value === 'true') {
      boolean = true;
    }
    if (e.target.value === 'false') {
      boolean = false;
    }

    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.name]: boolean ?? e.target.value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error('Discounted price must be less than regular price');
      return;
    }

    if (images.length > 6) {
      setLoading(false);
      toast.error('Max 6 images');
      return;
    }

    const geolocation = {};
    let location;

    if (geoLocationEnabled) {
      const response = await fetch(
        `https://geocode.xyz?auth=936442686101989587764x18876&locate=${address}&json=1`
      );
      const result = await response.json();
      console.log({ result });

      console.log(result.latt, result.longt);
      geolocation.lat = result.latt ?? 0;
      geolocation.lng = result.longt ?? 0;
      location = address;
      console.log(geolocation, location);
      // for positionstack
      // const response = await fetch(
      //   `http://api.positionstack.com/v1/forward?access_key=${process.env.REACT_APP_GEOCODE}&query=${address}`
      // );
      // const data = await response.json();
      // console.log({ data });
      // geolocation.lat = data.data[0]?.latitude ?? 0;
      // geolocation.lng = data.data[0]?.longitude ?? 0;
      // location = data.data[0]?.label;
      // console.log(geolocation, location);
      // for google geocoding api
      // const response = await fetch(
      //   `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyAj1lg0Thhg1wWSABx9pe61HJteo4ysLII`
      // );
      // const data = await response.json();
      // geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      // geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;
      // location =
      //   data.status === 'ZERO_RESULTS'
      //     ? undefined
      //     : data.results[0]?.formattedAddress;
      // if (location === undefined || location.includes('undefined')) {
      //   setLoading(false);
      //   toast.error('Please enter a correct address');
      // }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;

      location = address;
    }
    // Store images in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, 'images/' + fileName);

        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
              default:
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    const imageUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch((error) => {
      setLoading(false);
      toast.error('Images not uploaded');
      console.log(error);
      return;
    });

    const formDataCopy = {
      ...formData,
      imageUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };

    delete formDataCopy.address;
    delete formDataCopy.images;
    location && (formDataCopy.location = location);
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    // update Listing
    const docRef = doc(db, 'listings', params.listingId);
    await updateDoc(docRef, formDataCopy);
    toast.success('Listing Updated 👌');
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  if (loading) {
    return <Spinner />;
  }
  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit Listing</p>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <label className="formLabel">Sell / Rent</label>
          <div className="formButtons">
            <button
              type="button"
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              name="type"
              value="sale"
              onClick={handleChangeInput}
            >
              Sell
            </button>
            <button
              type="button"
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              name="type"
              value="rent"
              onClick={handleChangeInput}
            >
              Rent
            </button>
          </div>
          <label className="formLabel">Name</label>
          <input
            className="formInputName"
            type="text"
            name="name"
            value={name}
            onChange={handleChangeInput}
            maxLength="32"
            minLength="10"
            required
          />
          <div className="formRooms flex">
            <div>
              <label className="formLabel">BedRooms</label>
              <input
                className="formInputSmall"
                type="number"
                name="bedrooms"
                value={bedrooms}
                onChange={handleChangeInput}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel">BathRooms</label>
              <input
                className="formInputSmall"
                type="number"
                name="bathrooms"
                value={bathrooms}
                onChange={handleChangeInput}
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <label className="formLabel">Parking spot</label>
          <div className="formButtons">
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type="button"
              name="parking"
              value={true}
              onClick={handleChangeInput}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type="button"
              name="parking"
              value={false}
              onClick={handleChangeInput}
            >
              No
            </button>
          </div>
          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type="button"
              name="furnished"
              value={true}
              onClick={handleChangeInput}
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type="button"
              name="furnished"
              value={false}
              onClick={handleChangeInput}
            >
              No
            </button>
          </div>
          <label className="formLabel">Address</label>
          <textarea
            className="formInputAddress"
            type="text"
            name="address"
            value={address}
            onChange={handleChangeInput}
            required
          />

          {!geoLocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  name="latitude"
                  value={latitude}
                  onChange={handleChangeInput}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  name="longitude"
                  value={longitude}
                  onChange={handleChangeInput}
                  required
                />
              </div>
            </div>
          )}

          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type="button"
              name="offer"
              value={true}
              onClick={handleChangeInput}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type="button"
              name="offer"
              value={false}
              onClick={handleChangeInput}
            >
              No
            </button>
          </div>

          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              className="formInputSmall"
              type="number"
              name="regularPrice"
              value={regularPrice}
              onChange={handleChangeInput}
              min="50"
              max="750000000"
              required
            />
            {type === 'rent' && <p className="formPriceText">$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input
                className="formInputSmall"
                type="number"
                name="discountedPrice"
                value={discountedPrice}
                onChange={handleChangeInput}
                min="50"
                max="750000000"
                required={offer}
              />
            </>
          )}

          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            className="formInputFile"
            type="file"
            name="images"
            onChange={handleChangeInput}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />
          <button type="submit" className="primaryButton createListingButton">
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditListing;
