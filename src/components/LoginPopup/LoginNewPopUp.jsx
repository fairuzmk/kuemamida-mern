import React, { useContext, useEffect, useState } from 'react'
import './LoginPopup.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaWhatsapp } from "react-icons/fa";
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { Turnstile } from "@marsidev/react-turnstile";

const LoginNewPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);


  const [currState, setCurrState] = useState("Login"); // Login | Sign Up
  const [loginMethod, setLoginMethod] = useState("phone"); // email | phone
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0); // detik
  const [resendTimer, setResendTimer] = useState(0);
const [displayPhone, setDisplayPhone] = useState("");
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: ""
  });
  const [cfToken, setCfToken] = useState("");

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }));
  };


const handlePhoneChange = (e) => {
  let value = e.target.value.replace(/\D/g, ""); // hapus non angka
  setDisplayPhone(value);

  let numeric = value;
  if (numeric.startsWith("0")) {
    numeric = "62" + numeric.slice(1);
  }
  setData((prev) => ({
    ...prev,
    phone: numeric,
  }));
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
    if (!cfToken) return alert("Verifikasi captcha dulu");
    const response = await axios.post(url + "/api/user-new/send-otp", { 
      phone: data.phone, cfToken });
    if (response.data.success) {
      setOtpSent(true);
      alert("OTP dikirim ke WhatsApp");
      return true;
    } else {
      alert(response.data.message);
      return false;
    }
  };

    // Kirim OTP
    const handleSendOtp = async () => {
      if (!cfToken) return alert("Verifikasi captcha dulu");
      setLoading(true);
      const ok = await sendOtp();
      setLoading(false);
      if (ok) {
        setOtpSent(true);
        setTimer(600);
        setResendTimer(60);
      }
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
          <a onClick={() => setLoginMethod("phone")} className={loginMethod === "phone" ? "active" : ""}>
            Whatsapp
          </a>
          <a onClick={() => setLoginMethod("email")} className={loginMethod === "email" ? "active" : ""}>
            Email Login
          </a>
        </div>

        <div className="login-popup-inputs">
          {/* Sign Up Name */}
          {currState === "Sign Up" && loginMethod === "email" && (
            <>
            <input name="name" onChange={onChangeHandler} value={data.name} type="text" placeholder="Nama Kamu" required />
            <input type="text" name="phone" onChange={onChangeHandler} value={data.phone} placeholder="No HP" required />
            </>
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
            <div className='input-nomor-wa'>
            <div className='login-icon'><FaWhatsapp /></div>
            <label>Nomor Whatsapp</label>
            <input
              type="text"
              name="phone"
              onChange={handlePhoneChange}
              value={displayPhone}
              placeholder="Ex. 081123212321"
              required
                />
              <div className='captcha-box'>
               <Turnstile
                  siteKey="0x4AAAAAABqlW_kzRn-ubIz3"
                  options={{ appearance: "always" }}
                  onSuccess={(token) => {
                    
                    setCfToken(token);}}
                />
                </div>
              <button type="button" onClick={handleSendOtp} disabled={loading || !cfToken} >
                {cfToken ? <> {loading ? "Mengirim OTP..." : "Selanjutnya"} </> : "Loading Captcha.."}
                
              </button>

              </div>
            ) : (
              <>
                <div className='login-icon'><FaWhatsapp /></div>
                <div className='login-otp-question'>
                <p>OTP sudah dikirim ke nomor <span>{data.phone}</span>. Segera verifikasi OTP anda <span className="otp-timer">
                  OTP berlaku {Math.floor(timer / 60)}:
                  {String(timer % 60).padStart(2, "0")}
                </span>
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
      
                
                <div className='login-otp-question'>
                Belum Menerima OTP?   
                      {resendTimer > 0
                        ? ` Kirim ulang OTP setelah (${resendTimer}s)`
                        : 
                        <span onClick={handleSendOtp}> Kirim Ulang OTP </span>
                      }
               </div>
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
            <>
            <div className="login-popup-condition">
              <input type="checkbox" required />
              <p>By continuing, I agree to the terms of use & privacy policy</p>
            </div>
            <div className="login-popup-question">
            <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
            </div>
            </>
          )}

          {/* Switch Login / Sign Up */}
          <div className="login-popup-question">
            {currState === "Login" & loginMethod === "email" ? (
              <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
            ) : (
              <></>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginNewPopup;
