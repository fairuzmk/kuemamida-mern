import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./HamperDetailPage.css";
import { StoreContext } from "../../context/StoreContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function HamperDetailPage() {
  const { id } = useParams();
  const { url, food_list, addBundleToCart } = useContext(StoreContext);

  const [hamper, setHamper] = useState(null);
  const [quantity, setQuantity] = useState(1); // jumlah paket dibeli
  const [selections, setSelections] = useState([]); // [{slotIndex, picks:[{foodId, varianIndex?}]}]
  const [previewAmount, setPreviewAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false); // loading untuk tombol tambah ke keranjang


  // ambil detail hampers
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`${url}/api/hamper/${id}`);
        if (mounted) {
          if (res.data?.success) {
            const h = res.data.data;
            setHamper(h);
            // init picks per slot
            const init = (h.slots || []).map((s, idx) => ({
              slotIndex: idx,
              picks: Array.from({ length: s.quantity || 0 }, () => ({})),
            }));
            setSelections(init);
          } else {
            toast.error(res.data?.message || "Gagal memuat hampers");
          }
        }
      } catch (err) {
        toast.error("Gagal memuat hampers");
      }
    })();
    return () => (mounted = false);
  }, [id, url]);

  // kandidat produk per slot (byIds > byCategory)
  const candidatesBySlot = useMemo(() => {
    if (!hamper) return [];
    return (hamper.slots || []).map((slot) => {
      const byIds = slot.byIds || [];
      const byCategory = slot.byCategory || [];
      let candidates = food_list || [];

      if (byIds.length) {
        const setIds = new Set(byIds.map(String));
        candidates = candidates.filter((f) => setIds.has(String(f._id)));
      } else if (byCategory.length) {
        const setCats = new Set(byCategory);
        candidates = candidates.filter((f) => setCats.has(f.category || ""));
      }
      return candidates;
    });
  }, [hamper, food_list]);

  // ubah pilihan user
  const setPick = (slotIdx, pickIdx, field, value) => {
    setSelections((prev) => {
      const next = prev.map((s) => ({ ...s, picks: s.picks.map((p) => ({ ...p })) }));
      next[slotIdx].picks[pickIdx][field] = value;
      if (field === "foodId") {
        next[slotIdx].picks[pickIdx].varianIndex = undefined; // reset varian saat ganti produk
      }
      return next;
    });
  };

  // bentuk payload bundle untuk preview & addToCart
  const buildBundlePayload = () => {
    if (!hamper) return null;
    const payload = {
      type: "bundle",
      bundleId: hamper._id,
      name: hamper.name,
      image: hamper.image,
      quantity: Number(quantity) || 1,
      selections: [],

    };
    
    for (const s of selections) {
      for (const p of s.picks) {
        if (!p.foodId) {
          toast.error(`Mohon pilih item untuk slot "${hamper.slots[s.slotIndex].name}"`);
          return null;
        }
        const sel = { slotIndex: s.slotIndex, foodId: p.foodId, quantity: 1 };
        const slot = hamper.slots[s.slotIndex];
        if (slot.allowVariants && p.varianIndex !== undefined && p.varianIndex !== "") {
          sel.varianIndex = Number(p.varianIndex);
        }
        payload.selections.push(sel);
      }
    }
    return payload;
  };

  // preview harga via backend
  const handlePreview = async () => {
     if (!isComplete()) {
         toast.warn("Harap isi paket terlebih dahulu");
         return { ok: false };
       }
    const bp = buildBundlePayload();
    if (!bp) return { ok: false };
    setLoading(true);
    try {
      const res = await axios.post(`${url}/api/hamper/preview`, {
        bundleId: bp.bundleId,
        quantity: bp.quantity,
        selections: bp.selections,
      });
      if (res.data?.success && res.data?.valid) {
        setPreviewAmount(res.data.amount);
        return { ok: true, amount: res.data.amount };
      } else {
        setPreviewAmount(null);
        toast.error(res.data?.message || "Pilihan tidak valid");
        return { ok: false };
      }
    } catch (err) {
      setPreviewAmount(null);
      toast.error("Gagal preview");
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

   const addToCartBundle = typeof addBundleToCart === "function"
   ? addBundleToCart
   : (bp) => {
       const raw = localStorage.getItem("cartBundles");
       const cur = raw ? JSON.parse(raw) : [];
       const key = JSON.stringify({ bundleId: bp.bundleId, selections: bp.selections });
       const idx = cur.findIndex((x) => x._key === key);
       if (idx >= 0) cur[idx].quantity = (cur[idx].quantity || 1) + (bp.quantity || 1);
       else cur.push({ ...bp, _key: key, id: String(Date.now()) });
       localStorage.setItem("cartBundles", JSON.stringify(cur));
     };

  // tambah ke keranjang
  const handleAddToCart = async () => {
     if (!isComplete()) {
         toast.warn("Harap isi paket terlebih dahulu");
         return;
       }
    const bp = buildBundlePayload();
    if (!bp) return;

    // opsional: preview dulu untuk validasi cepat
    if (hamper?.pricingMode === "SUM_MINUS_DISCOUNT") {
      const r = await handlePreview();
      if (!r?.ok) return;
    }
       try {
           setAdding(true);
           await Promise.resolve(addToCartBundle(bp)); // jaga-jaga kalau nanti async
           toast.success("Hampers ditambahkan ke keranjang");
         } catch (e) {
           toast.error("Gagal menambahkan ke keranjang");
         } finally {
           setAdding(false);
         }
  };

   const isComplete = () => {
       if (!hamper) return false;
       for (const s of selections) {
         for (const p of s.picks) {
           if (!p.foodId) return false;
         }
       }
       return true;
     };

  if (!hamper) return <div className="hamper-loading">Memuat hampers…</div>;

  return (
    <div className="hamper-container">
      <ToastContainer position="bottom-center" autoClose={3000} />
      <div className="hamper-image">
        {hamper.image ? (
          <img src={hamper.image} alt={hamper.name} />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>

      <div className="hamper-details">
        <h1 className="hamper-title">{hamper.name}</h1>

        <p className="hamper-price">
          { hamper.pricingMode === "FIXED" ? 
          (
            <>Rp {Number(hamper.basePrice || 0).toLocaleString()} / paket</>
          ) : hamper.pricingMode === "SUM_MINUS_DISCOUNT" ?  (
            <>
              Harga dinamis: (jumlah harga item − diskon Rp{" "}
              {Number(hamper.discountAmount || 0).toLocaleString()})
            </>
            )
           : hamper.pricingMode === "BASE_PLUS_ITEMS" ? (
               <>
                 (Harga item + Packaging Rp {Number(hamper.basePrice || 0).toLocaleString()} 
                  {Number(hamper.discountAmount || 0) > 0 ? <> − diskon Rp {Number(hamper.discountAmount || 0).toLocaleString()}</> : null})
               </>
            )
            : null
            }
        </p>

        <div className="hamper-desc">
          <p>{hamper.description || "-"}</p>
        </div>

        <div className="hamper-slots">
          <h3>Pilih Isi Paket</h3>
          {!isComplete() && (
            <div className="slot-warning">
              Harap isi semua slot paket terlebih dahulu.
            </div>
          )}
          {(hamper.slots || []).map((slot, sIdx) => {
            const candidates = candidatesBySlot[sIdx] || [];
            return (
              <div key={sIdx} className="slot-card">
                <div className="slot-head">
                  <h4>{slot.name}</h4>
                  <small>pilih {slot.quantity} item</small>
                </div>

                {(selections[sIdx]?.picks || []).map((pick, pIdx) => {
                  const selectedFood = candidates.find((f) => f._id === pick.foodId);
                  return (
                    <div key={pIdx} className="slot-row">
                      {/* pilih produk */}
                      <select
                        className="slot-select"
                        value={pick.foodId || ""}
                        onChange={(e) => setPick(sIdx, pIdx, "foodId", e.target.value)}
                      >
                        <option value="">-- Pilih Produk --</option>
                        {candidates.map((f) => (
                          <option key={f._id} value={f._id}>
                            {f.name}
                          </option>
                        ))}
                      </select>

                      {/* pilih varian bila diizinkan */}
                      {slot.allowVariants && selectedFood?.varians?.length ? (
                        <select
                          className="slot-select"
                          value={pick.varianIndex !== undefined ? pick.varianIndex : ""}
                          onChange={(e) =>
                            setPick(
                              sIdx,
                              pIdx,
                              "varianIndex",
                              e.target.value === "" ? undefined : Number(e.target.value)
                            )
                          }
                        >
                          <option value="">(default)</option>
                          {selectedFood.varians.map((v, i) => (
                            <option key={`${selectedFood._id}_${i}`} value={i}>
                              {v.varianName} — Rp {(v.varianPrice ?? selectedFood.price).toLocaleString()} — stok {v.varianStock}
                            </option>
                          ))}
                        </select>
                      ) : selectedFood ? (
                        <span className="slot-price">Rp {Number(selectedFood.price || 0).toLocaleString()}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="hamper-actions">
          <button className="btn" disabled={loading || !isComplete()} onClick={handlePreview}>
            {loading ? "Memeriksa..." : "Preview Harga"}
          </button>
          {previewAmount != null && (
            <div className="preview-amount">Perkiraan total paket: Rp {previewAmount.toLocaleString()}</div>
          )}
        </div>

        <div className="hamper-qty">
          <span>Jumlah Paket:</span>
          <div className="qty-control">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)}>+</button>
          </div>
        </div>

        <div className="hamper-actions">
         <button
            className="btn primary"
            disabled={!isComplete() || adding}
            onClick={handleAddToCart}
          >
          {adding ? "Menambahkan..." : "Tambah ke Keranjang"}
          </button>
        </div>

        
      </div>
    </div>
  );
}
