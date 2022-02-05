import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import googleIcon from '../assets/svg/googleIcon.svg';

const OAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // check for user
      const docRef = doc(db, 'users', user.uid);
      const docSnap = getDoc(docRef);

      // if user, doesn't exist, create user
      if (!(await docSnap).exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }
      navigate('/');
    } catch (error) {
      toast.error('Could not authorize with GOOGLE ');
      console.log(error);
    }
  };

  return (
    <div className="socialLogin">
      <p>Sign {location.pathname === '/sign-up' ? 'Up' : 'In'} with </p>
      <button className="socialIconDiv" onClick={handleGoogleClick}>
        <img src={googleIcon} alt="google" className="socialIconImg" />
      </button>
    </div>
  );
};

export default OAuth;
