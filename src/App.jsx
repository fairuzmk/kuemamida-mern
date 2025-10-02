import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
// import LoginPopup from './components/LoginPopup/LoginPopup'
import ProtectedRoute from './components/ProtectedRoute';
import CustomOrder from './pages/CustomOrder/CustomOrder'
import DetailPage from './pages/DetailPage/DetailPage'
import ManualPayment from './pages/Payments/ManualPayment'
import VerifyPage from './pages/Payments/VerifyPage'
import MyOrders from './pages/MyOrders/MyOrders'
import LoginNewPopup from './components/LoginPopup/LoginNewPopUp'
import AccountDetail from './pages/AccountDetails/AccountDetail'
import HamperDetailPage from './pages/DetailPage/HamperDetailPage'


const App = () => {

  const[showLogin,setShowLogin] = useState(false)

  return (
    <>
    
    <div className='app'>
    {showLogin?<LoginNewPopup setShowLogin={setShowLogin}/>:<></>}
      <Navbar setShowLogin={setShowLogin} />  
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/detail/:slugAndId' element={<DetailPage/>} />
        <Route path="/hampers/:id" element={<HamperDetailPage />} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/payment' element={<ManualPayment/>} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/my-account" element={<AccountDetail />} />
        <Route path="/order" element={
          <ProtectedRoute>
            <PlaceOrder />
          </ProtectedRoute>
        } />
        <Route path='/custom-cake' element={<CustomOrder/>} />


      </Routes>
      
    </div>
    <Footer/>
    </>
  )
}

export default App