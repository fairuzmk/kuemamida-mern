import { createContext, useEffect, useState } from "react";
import axios from "axios";




export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});

    const url = "https://kuemamida-backend.onrender.com";
    const [token, setToken] = useState(() => {
        return localStorage.getItem("token") || "";
    });

    const [food_list, setFoodList] = useState([])

    // const addToCart = (itemId) => {
    //     if (!cartItems[itemId]) {
    //         setCartItems((prev) => ({ ...prev, [itemId]: 1 }))

    //     }
    //     else {
    //         setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
    //     }
    // }

    // const removeFromCart = (itemId) => {
    //     setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
    // }

    // const getTotalCartAmount = () => {
    //     let totalAmount = 0;
    //     for (const item in cartItems) {
    //         if (cartItems[item] > 0) {
    //             let itemInfo = food_list.find((product) => product._id === item);
    //             totalAmount += itemInfo.price * cartItems[item];
    //         }

    //     }
    //     return totalAmount;
    // }

    const addToCart = (itemKey) => {
        setCartItems((prev) => ({
            ...prev,
            [itemKey]: (prev[itemKey] || 0) + 1,
        }));
        };

        const removeFromCart = (itemKey) => {
        setCartItems((prev) => {
            const updated = { ...prev };
            if (updated[itemKey] > 1) {
            updated[itemKey] -= 1;
            } else {
            delete updated[itemKey];
            }
            return updated;
        });
        };

        const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const itemKey in cartItems) {
            if (cartItems[itemKey] > 0) {
            const [id, varian] = itemKey.split('_');
            const itemInfo = food_list.find((product) => product._id === id);

            const varianPrice = itemInfo?.varians?.find(v => v.varianName === varian)?.varianPrice;
            const basePrice = itemInfo?.price || 0;
            const finalPrice = varianPrice || basePrice;

            totalAmount += finalPrice * cartItems[itemKey];
            }
        }
        return totalAmount;
        };
    const fetchFoodList = async () => {
        const response = await axios.get(url+"/api/food/list");
        console.log(response.data)
        setFoodList(response.data.data)
        if (response.data.success){
          
        }
        else{
          toast.error("Error")
        }
      }

    useEffect(()=>{

        async function loadData(){
            await fetchFoodList();

        }

        loadData();
    },[])

    const quantityItem = () => {
        let quantity = 0;
        for (const item in cartItems){
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                quantity += cartItems[item];
            }

        }
        return quantity;
    }

    const getShippingCost = () => {
        let shippingcost=20000;
        return shippingcost;
    }

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        quantityItem,
        getShippingCost,
        url,
        token, 
        setToken
    }



    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}

        </StoreContext.Provider>
    )
}

export default StoreContextProvider;