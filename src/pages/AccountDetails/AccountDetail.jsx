import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./AccountDetail.css";
import { StoreContext } from "../../context/StoreContext";
import { toast, ToastContainer } from 'react-toastify';

export default function AccountDetail() {
  const [user, setUser] = useState({ name: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { url, token } = useContext(StoreContext); // ambil base URL dari context
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${url}/api/user-new/account`, {
          headers: { token }
        });
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await axios.post(
        `${url}/api/user-new/account/update`,
        { name: user.name || "", 
          address: user.address || "" },
        { headers: { token } }
      );
      if (res.data.success) {
        setMessage("Data berhasil diperbarui!");
        toast.success("Data berhasil diperbarui");
      } else {
        setMessage(res.data.message || "Gagal memperbarui data.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Memuat data...</p>;

  return (
    <>
    <div className="account-detail-container">
        
      <h1>Account Detail</h1>

      {message && <p className="message">{message}</p>}

      <label>
        Nama Lengkap:
        <input
          type="text"
          name="name"
          value={user.name}
          onChange={handleChange}
        />
      </label>

      <label>
        Nomor Whatsapp:
        <input
          type="number"
          name="phone"
          value={user.phone}
          disabled
        />
      </label>

      <label>
        Alamat:
        <textarea
          name="address"
          value={user.address}
          onChange={handleChange}
        />
      </label>

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Menyimpan..." : "Update Data"}
      </button>
      
    </div>
    <ToastContainer position="bottom-center" autoClose={2000} />
    </>
  );
}
