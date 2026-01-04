import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import TestimonialSlider from '../../components/Testimonials Sliders/TestimonialSlider'


const Home = () => {
  
        const [category, setCategory] = useState("Featured");
    return (
    <div>
        <Header/>
        <ExploreMenu category={category} setCategory={setCategory}/>
        <FoodDisplay category={category}/>
        <TestimonialSlider/>
    </div>
  )
}

export default Home