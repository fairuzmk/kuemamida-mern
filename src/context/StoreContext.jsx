import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';



export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState(() => {
       try { return JSON.parse(localStorage.getItem("cartItems")) || {}; } catch { return {}; }
     });
    const [cartBundles, setCartBundles] = useState(() => {
        try { return JSON.parse(localStorage.getItem("cartBundles")) || []; } catch { return []; }
      });

    // const url = "https://kuemamida-backend.onrender.com";
    
    // const url = "https://kuemamida.milkioserver.my.id";

    const url = "http://localhost:4000";
    const [token, setToken] = useState(() => {
        return localStorage.getItem("token") || "";
    });

    const [food_list, setFoodList] = useState([])
    const [hampers, setHampers] = useState([]);
    const [hampersPagination, setHampersPagination] = useState(null);
    

  //   const addToCart = async (itemKey) => {
  //     const [id, varianName] = itemKey.split("_");
  
  //     // Cari item berdasarkan ID dari food_list
  //     const itemInfo = food_list.find((product) => product._id === id);
  
  //     if (!itemInfo) {
  //         toast.error("Produk tidak ditemukan");
  //         return;
  //     }
  
  //     // Ambil stock berdasarkan varian (jika ada) atau stock utama
  //     let availableStock = 0;
  //     if (varianName) {
  //         const varian = itemInfo.varians?.find(v => v.varianName === varianName);
  //         if (!varian) {
  //             toast.error("Varian tidak ditemukan");
  //             return;
  //         }
  //         availableStock = varian.varianStock;
  //     } else {
  //         availableStock = itemInfo.stock;
  //     }
  
  //     const currentQty = cartItems[itemKey] || 0;
  
  //     // Proteksi: tidak boleh melebihi stock
  //     if (currentQty >= availableStock) {
  //         toast.warn("Stok tidak mencukupi");
  //         return;
  //     }
  
  //     // Tambah ke cart
  //     setCartItems((prev) => ({
  //         ...prev,
  //         [itemKey]: currentQty + 1,
  //     }));
  
  //     // Sync ke backend kalau ada token
  //     if (token) {
  //         await axios.post(url + "/api/cart/add", { itemKey }, { headers: { token } });
  //     }
  // };


  // === Cart product (single) ===
const addToCart = async (itemKey, qty = 1) => {
  if (!itemKey) return;
  const [id, varianName] = itemKey.split("_");
  const itemInfo = food_list.find((p) => p._id === id);
  if (!itemInfo) return toast.error("Produk tidak ditemukan");

  // hitung stok varian / produk
  let availableStock = 0;
  if (varianName) {
    const v = itemInfo.varians?.find((x) => x.varianName === varianName);
    if (!v) return toast.error("Varian tidak ditemukan");
    availableStock = Number(v.varianStock || 0);
  } else {
    availableStock = Number(itemInfo.stock || 0);
  }

  // pakai functional update agar tidak kena stale state saat tambah cepat/loop
  // juga batasi penambahan terhadap sisa stok
  let added = 0;
  setCartItems((prev) => {
    const cur = Number(prev[itemKey] || 0);
    const remaining = Math.max(0, availableStock - cur);
    const toAdd = Math.min(remaining, Math.max(1, Number(qty) || 1));
    if (toAdd <= 0) {
      toast.warn("Stok tidak mencukupi");
      return prev;
    }
    added = toAdd; // simpan utk dipakai setelah setState
    return { ...prev, [itemKey]: cur + toAdd };
  });

  // sinkron ke server (kalau login). Servermu sekarang endpoint-nya add per 1,
  // jadi kirim berulang; kalau nanti ada endpoint batch, ganti jadi satu request.
  if (token && added > 0) {
    try {
      for (let i = 0; i < added; i++) {
        // penting: await supaya urut, hindari race di backend
        // eslint-disable-next-line no-await-in-loop
        await axios.post(url + "/api/cart/add", { itemKey }, { headers: { token } });
      }
    } catch (e) {
      // optional: rollback ringan (tidak wajib)
      console.warn("Sync addToCart gagal:", e?.message);
    }
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

        // Hitung subtotal 1 bundle (sudah x quantity bundle)
        const getBundleSubtotal = (bundle, hampers, food_list) => {
          if (!bundle) return 0;
          const h = (hampers || []).find(x => String(x._id) === String(bundle.bundleId));
          if (!h) return 0;

          // jumlah harga item yang dipilih user
          let sumItems = 0;
          for (const sel of (bundle.selections || [])) {
            const prod = (food_list || []).find(p => String(p._id) === String(sel.foodId));
            if (!prod) continue;
            let price = Number(prod.price || 0);
            if (sel.varianIndex != null && prod.varians?.[sel.varianIndex]) {
              const v = prod.varians[sel.varianIndex];
              price = Number(v.varianPrice ?? price);
            }
            const pickQty = Number(sel.quantity || 1);
            sumItems += price * pickQty;
          }

          const q = Number(bundle.quantity || 1);
          const base = Number(h.basePrice || 0);
          const disc = Number(h.discountAmount || 0);

          let amount = 0;
          switch (h.pricingMode) {
            case "FIXED":
              amount = base * q;
              break;
            case "SUM_MINUS_DISCOUNT":
              amount = Math.max(0, (sumItems * q) - disc);
              break;
            case "BASE_PLUS_ITEMS":
              amount = Math.max(0, ((base + sumItems) * q) - disc);
              break;
            default:
              amount = base * q; // fallback
          }
          return amount;
        };


        const getTotalCartAmount = () => {
          let totalAmount = 0;

          // 1) Produk biasa
          for (const itemKey in cartItems) {
            const qty = cartItems[itemKey];
            if (qty > 0) {
              const [id, varian] = itemKey.split("_");
              const itemInfo = food_list.find((p) => p._id === id);
              const varianPrice = itemInfo?.varians?.find(v => v.varianName === varian)?.varianPrice;
              const basePrice = itemInfo?.price || 0;
              const finalPrice = (varianPrice != null ? varianPrice : basePrice);
              totalAmount += finalPrice * qty;
            }
          }

          // 2) Bundles / Hampers
          for (const b of (cartBundles || [])) {
            totalAmount += getBundleSubtotal(b, hampers, food_list);
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

     
          const fetchHampers = async (page, limit) => {
            try {
              const usePaging =
                page != null &&
                limit != null &&
                String(page).trim() !== "" &&
                String(limit).trim() !== "";

              const params = usePaging ? { page, limit } : {};

              const res = await axios.get(`${url}/api/hamper/list`, { params });
              if (res.data?.success) {
                setHampers(res.data.data || []);
                setHampersPagination(res.data.pagination || null);
              }
            } catch (e) {
              console.error("Gagal fetch hampers:", e);
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
        const response = await axios.post(`${url}/api/cart/get`, {}, { headers: { token } })
        setCartItems(response.data.cartData || {});
        setCartBundles(response.data.cartBundles || []);
      };

      useEffect(() => {
        async function loadData(){
          await fetchFoodList();
          await fetchHampers(); 

          // if (localStorage.getItem("token")) {
          //   setToken(localStorage.getItem("token"));
          //   await loadCartData(localStorage.getItem("token"));
          // }
        }
        loadData();
      }, []);

      useEffect(() => {
        (async () => {
          if (token) {
            await Promise.all([
                syncLocalItemsToServer(),   
                syncLocalBundlesToServer(),   
              ]);
            // setelah sync, refresh cart (produk + bundles) dari server
            await loadCartData(token);
          }
        })();
      }, [token]);

       useEffect(() => {
           if (!token) {
             localStorage.setItem("cartItems", JSON.stringify(cartItems));
           }
         }, [cartItems, token]);

      useEffect(() => {
        if (!token) {
          localStorage.setItem("cartBundles", JSON.stringify(cartBundles));
        }
      }, [cartBundles, token]);



      const quantityItem = () => {
        // jumlah item produk biasa (cartItems)
        const productQty = Object.values(cartItems).reduce((sum, q) => sum + (q || 0), 0);
      
        // jumlah paket hampers (cartBundles) — gunakan quantity per bundle
        const bundleQty = (cartBundles || []).reduce((sum, b) => {
          const q = Number(b?.quantity) || 1; // default 1 kalau belum ada
          return sum + q;
        }, 0);
      
        return productQty + bundleQty;
      };

      // ===== Bundle helpers ke server =====
      const addBundleToCartServer = async (payload) => {
        // payload: { bundleId, name, quantity, selections }
        await axios.post(`${url}/api/cart/bundle/add`, payload, { headers: { token } });
      };

      const updateBundleQtyServer = async (id, body) => {
        // body bisa { delta: 1 } / { delta: -1 } / { quantity: N }
        const res = await axios.post(`${url}/api/cart/bundle/qty`, { id, ...body }, { headers: { token } });
        return res.data?.cartBundles || [];
      };

      const removeBundleFromCartServer = async (id) => {
        const res = await axios.post(`${url}/api/cart/bundle/remove`, { id }, { headers: { token } });
        return res.data?.cartBundles || [];
      };


      const syncLocalItemsToServer = async () => {
        const raw = localStorage.getItem("cartItems");
        const local = raw ? JSON.parse(raw) : {};
        if (!Object.keys(local).length) return;
        await axios.post(`${url}/api/cart/items/sync`, { items: local }, { headers: { token } });
        localStorage.removeItem("cartItems");
      };

      const syncLocalBundlesToServer = async () => {
        try {
          // ambil localStorage hanya sekali saat user BARU login
          const raw = localStorage.getItem("cartBundles");
          const localBundles = raw ? JSON.parse(raw) : [];
          if (!localBundles.length) return;
          await axios.post(`${url}/api/cart/bundle/sync`, { bundles: localBundles }, { headers: { token } });
          localStorage.removeItem("cartBundles"); // selesai dipindah ke server
        } catch (e) {
          console.warn("Sync bundles gagal:", e?.message);
        }
      };

      const addBundleToCart = async (bundlePayload) => {
        // bundlePayload: { bundleId, name, quantity, selections }
        if (token) {
          // simpan di server
          await addBundleToCartServer({
            bundleId: bundlePayload.bundleId,
            name: bundlePayload.name,
            quantity: bundlePayload.quantity || 1,
            selections: bundlePayload.selections,
            image:bundlePayload.image,
          });
          // ambil ulang dari server
          const res = await axios.post(`${url}/api/cart/get`, {}, { headers: { token } });
          setCartBundles(res.data?.cartBundles || []);
          toast.success("Hampers ditambahkan ke keranjang");
          return;
        }
      
        // fallback: localStorage (guest)
        const key = JSON.stringify({ bundleId: bundlePayload.bundleId, selections: bundlePayload.selections });
        setCartBundles((prev) => {
          const idx = prev.findIndex((b) => b._key === key);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], quantity: (next[idx].quantity || 1) + (bundlePayload.quantity || 1) };
            return next;
          }
          return [...prev, { ...bundlePayload, _key: key, id: String(Date.now()) }];
        });
      };
    
      const incBundleQty = async (id) => {
        if (token) {
          const bundles = await updateBundleQtyServer(id, { delta: 1 });
          setCartBundles(bundles);
          return;
        }
        setCartBundles(prev => prev.map(b => b.id === id ? { ...b, quantity: (b.quantity || 1) + 1 } : b));
      };
      
      const decBundleQty = async (id) => {
        if (token) {
          const bundles = await updateBundleQtyServer(id, { delta: -1 });
          setCartBundles(bundles);
          return;
        }
        setCartBundles(prev => prev.flatMap(b => {
          if (b.id !== id) return [b];
          const q = (b.quantity || 1) - 1;
          return q > 0 ? [{ ...b, quantity: q }] : [];
        }));
      };
      
      const removeBundleFromCart = async (id) => {
        if (token) {
          const bundles = await removeBundleFromCartServer(id);
          setCartBundles(bundles);
          return;
        }
        setCartBundles((prev) => prev.filter((b) => b.id !== id));
      };


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
        options,
        cartBundles,
        addBundleToCart,
        removeBundleFromCart,
        incBundleQty,        
        decBundleQty,
        hampers,
        hampersPagination,
        fetchHampers,
        getBundleSubtotal,       
        setCartBundles,
        loadCartData 
    }



    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}

        </StoreContext.Provider>
    )
}

export default StoreContextProvider;