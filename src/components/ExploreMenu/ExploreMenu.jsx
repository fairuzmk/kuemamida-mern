import React from 'react'
import './ExploreMenu.css'
import { menu_list } from '../../assets/assets'


const ExploreMenu = ({category, setCategory}) => {

  return (
    <div className='explore-menu' id='explore-menu'>
        <h1>Explore our Menu</h1>
        <hr />
        <p className='explore-menu-text'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quasi quisquam voluptatibus nisi totam accusantium ipsum recusandae dolore at eius! Blanditiis nemo dolore, placeat doloribus impedit minima quibusdam necessitatibus quas magni.</p>
        <div className="explore-menu-list">
            {menu_list.map((item,index)=>{
                return (
                    <div onClick={()=>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} key={index} className="explore-menu-list-item">
                        <img className={category===item.menu_name?"active":""} src={item.menu_image} alt="" />
                        <p>{item.menu_name}</p>
                    </div>
                )
            })}
        </div>
    </div>
  )
}

export default ExploreMenu