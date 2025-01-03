import { React, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// import GoogleLoginLink from './GoogleLoginLink'
import intra_logo from '../images/42_Logo.png'
import google_logo from '../images/google_logo.png'
import pong_right from "../images/pong right.png"
import AuthContext from "../context_login_Register/AuthContext"
import ForgetPsdEmail from './VerifyPsdEmail.jsx'

export const Login = () => {

  // const [email, setEmail] = useState("")
  // const [password, setPassword] = useState("")
  const { user, authtoken } = useContext(AuthContext);
  const navigate = useNavigate();

  const {loginUsers} = useContext(AuthContext)
  const {GoogleLogin} = useContext(AuthContext)
  const {Intra42Login} = useContext(AuthContext)
  // const {authtoken} = useContext(AuthContext);


  useEffect(() => {
    if (authtoken || localStorage.getItem('authtoken')) {
        navigate('/profil', { replace: true });
    }
}, [authtoken, navigate]);

  const loginsubmit = (event) => {
    event.preventDefault();
    const email = event.target.email.value
    const password = event.target.password.value
    // console.log(email);
    // console.log(password);
    loginUsers(email, password)
  }
  

  return (
    <div className='cnt-lg grid grid-cols-2 gap-2 p-2 text-white justify-items-center bg-black'>
      <div className=' w-full h-full content-center'>
        <form onSubmit={loginsubmit} className='w-[454px] h-[531px] '>
              <h1 className='font-bold rgb(255, 255, 255)'>LOGIN</h1>
              <input type="email" autoComplete='off'  name="email"   placeholder='EMAIL' required/>
              <input type="password" autoComplete='off' name='password'  placeholder='PASSWORD' required/>
              <div className='text-red'>
                <span 
                onClick={() => navigate('/password-reset')}
                className="cursor-pointer hover:text-red-600"
                >Forgot your password?</span>
              </div>
              <div className='content-center'>
                  <button type="submit">SIGN IN</button>
              </div>
              <div className="lines">
          <div className="line bg-gray-500 flex-1 h-[3px]"></div>
            <p className='text-gray-500'>OR</p>
          <div className="line bg-gray-500 flex-1 h-[3px]"></div>
        </div>
        <div>
            <div className="social-row google-social">
              <Link onClick={GoogleLogin}>
                  <img src={google_logo} alt="google" />
                  Log in with Google
                </Link>
            </div>
            <div className="social-row intra-social">
                <Link onClick={Intra42Login}>
                    <img src={intra_logo} alt="Intra" />
                    Log in with 42
                </Link>
            </div>
        </div>
        <div className="text-white uppercase flex gap-2 justify-between text-sm leading-loose">
            <span>Don't have account?</span>
            <Link to={'/register'} className='btn-signup hover:text-aqua-600'>
                SIGN UP
            </Link>
        </div>
        </form>
      </div>
        <div className='pong-row w-full h-full md:h-screen content-center grid-cols-2'>
          <img src={pong_right} alt="Pong" className="pong-right w-[730px] h-[730px]"/>
        </div>
    </div>
  )
}

export default Login
