import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';



export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});

    const url = "https://kuemamida-backend.onrender.com";
    // const url = "http://localhost:4000";
    const [token, setToken] = useState(() => {
        return localStorage.getItem("token") || "";
    });

    const [food_list, setFoodList] = useState([])
    

    const addToCart = async (itemKey) => {
      const [id, varianName] = itemKey.split("_");
  
      // Cari item berdasarkan ID dari food_list
      const itemInfo = food_list.find((product) => product._id === id);
  
      if (!itemInfo) {
          toast.error("Produk tidak ditemukan");
          return;
      }
  
      // Ambil stock berdasarkan varian (jika ada) atau stock utama
      let availableStock = 0;
      if (varianName) {
          const varian = itemInfo.varians?.find(v => v.varianName === varianName);
          if (!varian) {
              toast.error("Varian tidak ditemukan");
              return;
          }
          availableStock = varian.varianStock;
      } else {
          availableStock = itemInfo.stock;
      }
  
      const currentQty = cartItems[itemKey] || 0;
  
      // Proteksi: tidak boleh melebihi stock
      if (currentQty >= availableStock) {
          toast.warn("Stok tidak mencukupi");
          return;
      }
  
      // Tambah ke cart
      setCartItems((prev) => ({
          ...prev,
          [itemKey]: currentQty + 1,
      }));
  
      // Sync ke backend kalau ada token
      if (token) {
          await axios.post(url + "/api/cart/add", { itemKey }, { headers: { token } });
      }
  };

        const removeFromCart = async (itemKey) => {
        setCartItems((prev) => {
            const updated = { ...prev };
            if (updated[itemKey] > 1) {
            updated[itemKey] -= 1;
            } else {
            delete updated[itemKey];
            }
            return updated;
        });
        if (token) {
            await axios.post(url+"/api/cart/remove", {itemKey}, {headers: {token}})
        }
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

        const [options, setOptions] = useState({
            diameter: [],
            bentuk: [],
            rasa: [],
            filling: [],
            krim: [],
            shipping: []
          });

        const fetchOptions = async () => {
            try {
              const res = await axios.get(`${url}/api/options`);
              const allOptions = res.data.data.map((doc) => doc.options || {});
              const mergedOptions = Object.assign({}, ...allOptions);
          
              if (mergedOptions) {
                const diameterList = mergedOptions["Diameter"] || [];
                const bentukList = mergedOptions["Bentuk"] || [];
                const rasaList = mergedOptions["Rasa"] || [];
                const fillingList = mergedOptions["Filling"] || [];
                const krimList = mergedOptions["Krim"] || [];
                const shippingList = mergedOptions["Shipping Fee"] || [];
          
                const formatted = (list) =>
                  list.map((item) => ({
                    value: item.value,
                    label: item.label,
                    price: item.price,
                  }));
          
                setOptions({
                  diameter: formatted(diameterList),
                  bentuk: formatted(bentukList),
                  rasa: formatted(rasaList),
                  filling: formatted(fillingList),
                  krim: formatted(krimList),
                  shipping: formatted(shippingList),
                });
              }
            } catch (err) {
              console.error("Gagal mengambil data opsi:", err);
            }
          };

    
    const fetchFoodList = async () => {
        const response = await axios.get(url+"/api/food/list");
        
        setFoodList(response.data.data)
        if (response.data.success){
          
        }
        else{
          toast.error("Error")
        }
      }

      const loadCartData = async (token) => {
        const response = await axios.post(url+"/api/cart/get", {}, {headers:{token}})
        setCartItems(response.data.cartData);
      }

    useEffect(()=>{

        async function loadData(){
            await fetchFoodList();
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"));
                await loadCartData(localStorage.getItem("token"));
            }

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



    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        quantityItem,
        url,
        token, 
        setToken,
        fetchOptions,
        options
    }



    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}

        </StoreContext.Provider>
    )
}

export default StoreContextProvider;