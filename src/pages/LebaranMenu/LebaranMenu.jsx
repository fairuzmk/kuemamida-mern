
import React, { useState } from 'react'
import './LebaranMenu.css'
import LebaranHeader from '../../components/Header/LebaranHeader'
import HeaderMenuLebaran from '../../components/ExploreMenu/HeaderMenuLebaran'
import FoodDisplayLebaran from '../../components/FoodDisplay/FoodDisplayLebaran'

const LebaranMenu = () => {
  const [category, setCategory] = useState("Kue Kering"); // default Kue Kering
  return (
    <div>
      <LebaranHeader/>
      <HeaderMenuLebaran category={category} setCategory={setCategory}/>
      <FoodDisplayLebaran category={category}/>
    </div>
  )
}
export default LebaranMenu
