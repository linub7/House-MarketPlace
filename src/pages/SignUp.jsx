import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { db } from '../firebase.config';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import OAuth from '../components/OAuth';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const { name, email, password } = formData;
  const navigate = useNavigate();

  const handleChangeInput = (e) => {
    // setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      updateProfile(auth.currentUser, { displayName: name });

      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      formDataCopy.timestamp = serverTimestamp();

      await setDoc(doc(db, 'users', user.uid), formDataCopy);

      navigate('/');
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong! 🤕');
    }
  };
  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome Back</p>
        </header>
        <main>
          <form onSubmit={handleSubmitForm}>
            <input
              type="text"
              className="nameInput"
              placeholder="Name"
              name="name"
              id="name"
              value={name}
              onChange={handleChangeInput}
            />
            <input
              type="email"
              className="emailInput"
              placeholder="Email"
              name="email"
              id="email"
              value={email}
              onChange={handleChangeInput}
            />
            <div className="passwordInputDiv">
              <input
                type={showPassword ? 'text' : 'password'}
                className="passwordInput"
                placeholder="Password"
                name="password"
                id="password"
                value={password}
                onChange={handleChangeInput}
              />
              <img
                onClick={() => setShowPassword((prevState) => !prevState)}
                src={visibilityIcon}
                alt="show Password"
                className="showPassword"
              />
            </div>
            <div className="signUpBar">
              <p className="signUpText">Register</p>
              <button className="signUpButton">
                <ArrowRightIcon fill="#ffffff" width="34px" height="34px" />
              </button>
            </div>
          </form>
          {/* Google OAuth */}
          <OAuth />
          <Link
            className="registerLink"
            // style={{
            //   marginTop: '1rem',
            //   fontWeight: '600',
            //   color: '#00cc66',
            //   textAlign: 'center',
            //   marginBottom: '5rem',
            // }}
            to="/sign-in"
          >
            Sign In instead
          </Link>
        </main>
      </div>
    </>
  );
};

export default SignUp;
