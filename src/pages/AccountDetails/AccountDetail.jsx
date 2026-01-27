import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./AccountDetail.css";
import { StoreContext } from "../../context/StoreContext";
import { toast, ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

export default function AccountDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/order";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { url, user, setUser, token } = useContext(StoreContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${url}/api/user-new/account`, {
          headers: { token },
        });
        if (res.data?.success) {
          const u = res.data.user ?? {};
          // Normalisasi: tidak boleh null/undefined
          setUser({
            name: u.name ?? "",
            address: u.address ?? "",
            phone: u.phone ?? "",   // penting: hindari null
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUser();
  }, [token, url]); // tambahkan url di deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value ?? "" }));
  };

  const refreshUser = async () => {
    const res = await axios.get(`${url}/api/user-new/account`, {
      headers: { token },
    });
    if (res.data?.success) {
      setUser(res.data.user);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        name: (user.name || "").trim(),
        address: (user.address || "").trim(),
        isVerified: true,
      };
      const res = await axios.post(`${url}/api/user-new/account/update`, payload, {
        headers: { token },
      });

      if (res.data?.success) {
        setUser((prev) => ({
          ...prev,
          ...payload,
        }));
        setMessage("Data berhasil diperbarui!");
        await refreshUser();
        navigate(from, { replace: true });
        toast.success("Data berhasil diperbarui");
      } else {
        setMessage(res.data?.message || "Gagal memperbarui data.");
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
        <p className="text-account">Silahkan lengkapi terlebih dahulu data dibawah ini sebelum checkout</p>
        {message && <p className="message">{message}</p>}

        <label>
          Nama Lengkap:
          <input
            type="text"
            name="name"
            value={user?.name ?? ""}        // fallback string kosong
            onChange={handleChange}
          />
        </label>

        <label>
          Nomor Whatsapp:
          <input
            type="text"                     // ganti dari number -> text
            inputMode="numeric"             // keyboard numerik di mobile
            name="phone"
            value={user.phone ?? ""}        // jangan pernah null
            readOnly                        // atau disabled kalau memang tak boleh diubah
          />
        </label>

        <label>
          Alamat:
          <textarea
            name="address"
            value={user.address ?? ""}      // jangan null
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
