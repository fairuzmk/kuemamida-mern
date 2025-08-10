import React, { useContext, useEffect, useState } from 'react'
import './LoginPopup.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const LoginNewPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);


  const [currState, setCurrState] = useState("Login"); // Login | Sign Up
  const [loginMethod, setLoginMethod] = useState("email"); // email | phone
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0); // detik
  const [resendTimer, setResendTimer] = useState(0);

  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: ""
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  // REGISTER / LOGIN EMAIL
  const onLoginEmail = async (event) => {
    event.preventDefault();
    let endpoint = currState === "Login" ? "/api/user-new/login-email" : "/api/user-new/register";
    const response = await axios.post(url + endpoint, data);
    if (response.data.success) {
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      setShowLogin(false);
    } else {
      alert(response.data.message);
    }
  };

    // Handle change untuk OTP box
    const handleOtpChange = (value, index) => {
        if (/^\d*$/.test(value)) {
          let newOtp = [...otp];
          newOtp[index] = value;
          setOtp(newOtp);
      
          // update data.otp biar ikut berubah
          setData(prev => ({ ...prev, otp: newOtp.join("") }));
      
          // Fokus otomatis ke kotak berikutnya
          if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
          }
        }
      };
      

  // KIRIM OTP
  const sendOtp = async () => {
    if (!data.phone) return alert("Masukkan nomor HP");
    const response = await axios.post(url + "/api/user-new/send-otp", { phone: data.phone });
    if (response.data.success) {
      setOtpSent(true);
      alert("OTP dikirim ke WhatsApp");
    } else {
      alert(response.data.message);
    }
  };

    // Kirim OTP
    const handleSendOtp = async () => {
        setLoading(true);
        await sendOtp(); // call API
        setLoading(false);
        setOtpSent(true);
        setTimer(300); // 5 menit
        setResendTimer(60); // 1 menit
      };
    

      
  // VERIFIKASI OTP
  const verifyOtp = async () => {
    if (!data.otp) return alert("Masukkan OTP");
    const response = await axios.post(url + "/api/user-new/verify-otp", { phone: data.phone, otp: data.otp });
    if (response.data.success) {
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      setShowLogin(false);
    } else {
      alert(response.data.message);
    }
  };

// Verifikasi OTP
    const handleVerifyOtp = async () => {
    await verifyOtp();
    };

 // Timer mundur OTP Expired
 useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

    // Timer mundur Resend OTP
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
          interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
      }, [resendTimer]);
      
  return (
    <div className="login-popup">
      <form
        onSubmit={loginMethod === "email" ? onLoginEmail : (e) => e.preventDefault()}
        className="login-popup-container"
      >
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <span className="svg-login-icon" onClick={() => setShowLogin(false)}>
            <FontAwesomeIcon icon={faXmark} />
          </span>
        </div>

        {/* Pilihan metode login */}
        <div className="login-method-toggle">
          <a onClick={() => setLoginMethod("email")} className={loginMethod === "email" ? "active" : ""}>
            Login with Email
          </a>
          <a onClick={() => setLoginMethod("phone")} className={loginMethod === "phone" ? "active" : ""}>
            Login with WA
          </a>
        </div>

        <div className="login-popup-inputs">
          {/* Sign Up Name */}
          {currState === "Sign Up" && loginMethod === "email" && (
            <input name="name" onChange={onChangeHandler} value={data.name} type="text" placeholder="Nama Kamu" required />
            
          )}

          {loginMethod === "email" && (
            <>
              <input type="email" name="email" onChange={onChangeHandler} value={data.email} placeholder="Email Kamu" required />
              <input type="password" name="password" onChange={onChangeHandler} value={data.password} placeholder="Password" required />
            </>
          )}

          {loginMethod === "phone" && (
            <>
            
      
            {!otpSent ? (
              <>
            <input
              type="text"
              name="phone"
              onChange={onChangeHandler}
              value={data.phone}
              placeholder="No HP Kamu"
              required
                />
              <button type="button" onClick={handleSendOtp} disabled={loading}>
                {loading ? "Mengirim..." : "Kirim OTP"}
              </button>
              </>
            ) : (
              <>
                <div className='login-popup-question'>
                <p>OTP sudah dikirim ke nomor <span>{data.phone}</span>. Belum Menerima OTP?   
               
                
                  {resendTimer > 0
                    ? ` Kirim ulang OTP setelah (${resendTimer}s)`
                    : 
                    <span className="" onClick={handleSendOtp}> Kirim Ulang OTP </span>
                  }
                </p>
                </div>
                <div className="otp-input-group">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                    />
                  ))}
                </div>
      
                <p className="otp-timer">
                  OTP berlaku {Math.floor(timer / 60)}:
                  {String(timer % 60).padStart(2, "0")}
                </p>
      
                <button type="button" onClick={handleVerifyOtp}>
                  Verifikasi OTP
                </button>
      
                
              </>
            )}
          </>
          )}

          {/* Submit untuk email */}
          {loginMethod === "email" && (
            <button type="submit">{currState === "Sign Up" ? "Create Account" : "Login"}</button>
          )}

          {/* Checkbox syarat */}
          {currState === "Sign Up" && loginMethod === "email" && (
            <div className="login-popup-condition">
              <input type="checkbox" required />
              <p>By continuing, I agree to the terms of use & privacy policy</p>
            </div>
          )}

          {/* Switch Login / Sign Up */}
          <div className="login-popup-question">
            {currState === "Login" ? (
              <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
            ) : (
              <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginNewPopup;
