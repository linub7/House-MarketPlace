import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';
import OAuth from '../components/OAuth';
const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { email, password } = formData;
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

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        navigate('/');
      }
    } catch (error) {
      toast.error('Bad User Credentials 😥');
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
            <Link className="forgotPasswordLink" to={'/forgot-password'}>
              Forgot Password?
            </Link>
            <div className="signInBar">
              <p className="signInText">Sign In</p>
              <button className="signInButton">
                <ArrowRightIcon fill="#ffffff" width="34px" height="34px" />
              </button>
            </div>
          </form>
          {/* Google OAuth */}
          <OAuth />
          <Link className="registerLink" to="/sign-up">
            Sign Up instead
          </Link>
        </main>
      </div>
    </>
  );
};

export default SignIn;
