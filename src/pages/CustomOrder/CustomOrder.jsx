import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import "./CustomOrder.css";



export default function CustomOrder() {
  const { url } = useContext(StoreContext);
  const API_URL = url;
  /* ================= STATE ================= */
  const [showAddOn, setShowAddOn] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pilihanBentuk, setPilihanBentuk] = useState([]);
  const [pilihanFilling, setPilihanFilling] = useState([]);
  const [pilihanKrim, setPilihanKrim] = useState([]);
  const [pilihanShipping, setPilihanShipping] = useState([]);

  const [optionsData, setOptionsData] = useState({});
  const [harga, setHarga] = useState(0);

  const [addOns, setAddOns] = useState([{ addOn: "", addOnPrice: 0 }]);

  const [data, setData] = useState({
    customerName: "",
    phone: "",
    description: "",
    cakeFlavor: "",
    cakeSize: "",
    cakeShape: "",
    krimFlavor: "",
    filling: "",
    themeColor: "",
    writingOnCake: "",
    pickupDate: "",
    pickupTime: "",
    basePrice: 0,
    totalAddOn: 0,
    shipping_method: "",
    shipping_fee: 0,
    totalPrice: 0,
    status: "Pending",
    createdAt: new Date().toISOString(),
  });

  /* ================= FETCH OPTIONS ================= */
  useEffect(() => {
    axios.get(`${API_URL}/api/options`).then((res) => {
      const merged = Object.assign(
        {},
        ...res.data.data.map((d) => d.options || {})
      );

      setPilihanBentuk(merged["Bentuk"] || []);
      setPilihanFilling(merged["Filling"] || []);
      setPilihanKrim(merged["Krim"] || []);
      setPilihanShipping(merged["Shipping Fee"] || []);
    });
  }, []);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/option-nested/688b716f4295e77658f25c79/Rasa`)
      .then((res) => {
        const mapped = {};
        res.data.data.forEach((i) => (mapped[i.name] = i.items));
        setOptionsData(mapped);
      });
  }, []);

  /* ================= HANDLERS ================= */
  const onChange = (e) => {
    const { name, value } = e.target;
    setData((p) => ({ ...p, [name]: value }));
  };

  const onSelect = (name, value) => {
    let extra = {};
    if (name === "shipping_method") {
      const found = pilihanShipping.find((i) => i.value === value);
      extra.shipping_fee = found?.price || 0;
    }
    setData((p) => ({ ...p, [name]: value, ...extra }));
  };

  const addAddOn = () =>
    setAddOns([...addOns, { addOn: "", addOnPrice: 0 }]);

  const removeAddOn = (i) =>
    setAddOns(addOns.filter((_, idx) => idx !== i));

  const updateAddOn = (i, field, value) => {
    const clone = [...addOns];
    clone[i][field] = field === "addOnPrice" ? Number(value) : value;
    setAddOns(clone);
  };

  /* ================= PRICE CALC ================= */
  useEffect(() => {
    const bentuk = pilihanBentuk.find((i) => i.value === data.cakeShape);
    const filling = pilihanFilling.find((i) => i.value === data.filling);
    const krim = pilihanKrim.find((i) => i.value === data.krimFlavor);

    const base =
      harga +
      (bentuk?.price || 0) +
      (filling?.price || 0) +
      (krim?.price || 0);

    const addOnTotal = addOns.reduce((s, i) => s + i.addOnPrice, 0);
    const total = base + addOnTotal + data.shipping_fee;

    setData((p) => ({
      ...p,
      basePrice: base,
      totalAddOn: addOnTotal,
      totalPrice: total,
    }));
  }, [
    harga,
    data.cakeShape,
    data.filling,
    data.krimFlavor,
    addOns,
    data.shipping_fee,
  ]);

  /* ================= SUBMIT ================= */
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    fd.append("addOns", JSON.stringify(addOns));
    if (files[0]) fd.append("additionalImages", files[0]);

    await axios.post(`${API_URL}/api/custom-order/add`, fd);
    alert("Pesanan berhasil dikirim 🎉");
    setLoading(false);
  };

  /* ================= RENDER ================= */
  return (
    <form className="custom-order" onSubmit={submit}>
      <h2>Custom Cake Order</h2>

      <input name="customerName" placeholder="Nama" onChange={onChange} />
      <input name="phone" placeholder="No. WhatsApp" onChange={onChange} />

      <textarea
        name="description"
        placeholder="Tema / Catatan"
        onChange={onChange}
      />

      <select
        value={data.cakeFlavor}
        onChange={(e) => {
          setData({ ...data, cakeFlavor: e.target.value, cakeSize: "" });
          setHarga(0);
        }}
      >
        <option value="">Pilih Rasa</option>
        {Object.keys(optionsData).map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>

      <select
        value={data.cakeSize}
        onChange={(e) => {
          setData({ ...data, cakeSize: e.target.value });
          const found = optionsData[data.cakeFlavor]?.find(
            (i) => i.value === e.target.value
          );
          setHarga(found?.price || 0);
        }}
      >
        <option value="">Pilih Diameter</option>
        {(optionsData[data.cakeFlavor] || []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      
      { showAddOn ?
      (
        <>
        <h4>Add On</h4>
        
        {addOns.map((a, i) => (
          <div key={i} className="addon-row">
            <input
              placeholder="Nama"
              value={a.addOn}
              onChange={(e) => updateAddOn(i, "addOn", e.target.value)}
            />
            <input
              type="number"
              placeholder="Harga"
              value={a.addOnPrice}
              onChange={(e) => updateAddOn(i, "addOnPrice", e.target.value)}
            />
            {addOns.length > 1 && (
              <button type="button" onClick={() => removeAddOn(i)}>
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addAddOn}>
          + Tambah Add On
        </button>
        </>
        ) 
        : <></> 
      }


      <input type="file" onChange={(e) => setFiles(e.target.files)} />

      <div className="price">
        <p></p>
        <p>Base: Rp {data.basePrice.toLocaleString()}</p>
        <p>AddOn: Rp {data.totalAddOn.toLocaleString()}</p>
        <p>Perkiraan Harga Total: Rp {data.totalPrice.toLocaleString()}</p>
      </div>

      <button disabled={loading} type="submit">
        {loading ? "Mengirim..." : "Kirim Pesanan"}
      </button>
    </form>
  );
}