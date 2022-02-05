import { getDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { db } from '../firebase.config';

const Contact = () => {
  const [message, setMessage] = useState('');
  const [landlord, setLandlord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useParams();
  const { landlordId } = params;

  useEffect(() => {
    const getLandlord = async () => {
      try {
        const docRef = doc(db, 'users', landlordId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setLandlord(docSnap.data());
          setLoading(false);
        } else {
          toast.error('Could not get landlord data');
          setLoading(false);
        }
      } catch (error) {
        toast.error('Could not get landlord data');
        setLoading(false);
      }
    };
    getLandlord();
  }, [landlordId]);

  const handleChangeInput = (e) => setMessage(e.target.value);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Contact Landlord</p>
      </header>
      {landlord !== null && (
        <main>
          <div className="contactLandlord">
            <p className="landlordName">{landlord?.name}</p>
          </div>
          <form className="messageForm">
            <div className="messageDiv">
              <label htmlFor="message" className="messageLabel">
                Message
              </label>
              <textarea
                name="message"
                id="message"
                className="textarea"
                value={message}
                onChange={handleChangeInput}
              ></textarea>
            </div>
            <a
              href={`mailto:${landlord.email}?Subject=${searchParams.get(
                'listingName'
              )}&body=${message}`}
            >
              <button
                type="button"
                className="primaryButton"
                style={{ marginBottom: '110px' }}
              >
                Send Message
              </button>
            </a>
          </form>
        </main>
      )}
    </div>
  );
};

export default Contact;
