import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import ProtectedRoute from './components/ProtectedRoute';
import CustomOrder from './pages/CustomOrder/CustomOrder'

const App = () => {

  const[showLogin,setShowLogin] = useState(false)

  return (
    <>
    
    <div className='app'>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <Navbar setShowLogin={setShowLogin} />  
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/cart' element={<Cart/>} />
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