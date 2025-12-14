import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./HamperDetailPage.css";
import { StoreContext } from "../../context/StoreContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCartPlus } from "react-icons/fa6";

export default function HamperDetailPage() {
  const { id } = useParams();
  const { url, food_list, addBundleToCart, getRemainingQty } = useContext(StoreContext);

  const [hamper, setHamper] = useState(null);
  const [quantity, setQuantity] = useState(1); // jumlah paket dibeli
  const [selections, setSelections] = useState([]); // [{slotIndex, picks:[{foodId, varianIndex?}]}]
  const [previewAmount, setPreviewAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false); // loading untuk tombol tambah ke keranjang

  // --- helper: bikin Set varian allowed (lowercase) ---
  const getAllowedVariantSet = (slot) => {
    const arr = slot?.allowedVariants || [];
    return new Set(arr.map((x) => String(x).trim().toLowerCase()));
  };

  const getCategoryId = (food) =>
    typeof food?.category === "object" && food.category?._id
      ? String(food.category._id)
      : String(food?.category || "");


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
    let candidates = (food_list || [])
      // hanya produk aktif
      .filter((f) => f?.isActive);

    if (byIds.length) {
      const setIds = new Set(byIds.map(String));
      candidates = candidates.filter((f) => setIds.has(String(f._id)));
    } else if (byCategory.length) {
      const setCats = new Set(byCategory.map(String));
      candidates = candidates.filter((f) => setCats.has(getCategoryId(f)));
    }

    return candidates;
  });
}, [hamper, food_list]);


  // ubah pilihan user (dengan auto-select 1 varian jika hanya satu yang valid)
  const setPick = (slotIdx, pickIdx, field, value) => {
    setSelections((prev) => {
      const next = prev.map((s) => ({ ...s, picks: s.picks.map((p) => ({ ...p })) }));
      next[slotIdx].picks[pickIdx][field] = value;

      if (field === "foodId") {
        // reset varian jika ganti produk
        next[slotIdx].picks[pickIdx].varianIndex = undefined;
      
        const slotRule = hamper?.slots?.[slotIdx];
        const food = (food_list || []).find((f) => f._id === value);
      
        // AUTO-SELECT: ambil varian valid pertama (izinkan + stok > 0)
        if (slotRule?.allowVariants && food?.varians?.length) {
          const allowedSet = getAllowedVariantSet(slotRule); // nama varian lowercase
          const all = food.varians.map((v, i) => ({ v, i }));
          const filteredByAllowed =
            allowedSet.size > 0
              ? all.filter(({ v }) =>
                  allowedSet.has(String(v.varianName || "").trim().toLowerCase())
                )
              : all;
      
          const filteredInStock = filteredByAllowed.filter(
            ({ i }) => getRemainingQty(food._id, i) > 0
          );
      
          if (filteredInStock.length > 0) {
            next[slotIdx].picks[pickIdx].varianIndex = filteredInStock[0].i;
          }
        }
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

    // stok varian vs stok total produk
    const getVariantStock = (food, varIdx) =>
      Number.isInteger(varIdx) ? Number(food?.varians?.[varIdx]?.varianStock || 0)
                                : Number(food?.stock || 0);
    
    const getVariantName = (food, varIdx) =>
      Number.isInteger(varIdx) ? String(food?.varians?.[varIdx]?.varianName || "") : "";



      // --- snapshot cartItems (context atau localStorage)
      const getCartItemsSnapshot = () => {
        if (cartItems && typeof cartItems === "object") return cartItems;
        try { return JSON.parse(localStorage.getItem("cartItems") || "{}"); } catch { return {}; }
      };

      // berapa unit sudah “terpesan” di cart (single + bundling) untuk foodId/varIdx ini
      const getAlreadyReserved = (foodId, varIdx) => {
        let sum = 0;

        // single product (key: `${foodId}_${varianName}`)
        try {
          const food = (food_list || []).find(f => String(f._id) === String(foodId));
          const vName = getVariantName(food, varIdx);
          if (vName) sum += Number((cartItems || {})[`${foodId}_${vName}`] || 0);
        } catch {}

        // bundling dari STATE (bukan localStorage) → kalikan quantity bundle
        try {
          for (const b of (cartBundles || [])) {
            const perPkg = (b.selections || []).filter(
              (sel) =>
                String(sel.foodId) === String(foodId) &&
                ((sel.varianIndex ?? -1) === (Number.isInteger(varIdx) ? varIdx : -1))
            ).length;
            sum += perPkg * Number(b.quantity || 1);
          }
        } catch {}

        return sum;
      };

      // utility kecil
      const keyFor = (foodId, varIdx) =>
        `${foodId}|${Number.isInteger(varIdx) ? varIdx : -1}`;

      // pastikan stok cukup untuk bundle yang akan ditambahkan (hitung pick sejenis)
      const ensureBundleRoom = (bp) => {
        const countPerKey = new Map(); // `${foodId}|${varIdx}` -> picks per paket
        for (const sel of bp.selections || []) {
          const key = `${sel.foodId}|${Number.isInteger(sel.varianIndex) ? sel.varianIndex : -1}`;
          countPerKey.set(key, (countPerKey.get(key) || 0) + 1);
        }
        for (const [key, perPkg] of countPerKey) {
          const [foodId, idxStr] = key.split("|");
          const varIdx = Number(idxStr);
          const varIdxVal = isNaN(varIdx) || varIdx < 0 ? undefined : varIdx;
          const remaining = getRemainingQty(foodId, varIdxVal);
          const need = perPkg * Number(bp.quantity || 1);
          if (need > remaining) {
            toast.warn("Stok paket melebihi stok tersedia");
            return false;
          }
        }
        return true;
      };
      



    const canBuy = (food, varIdx) => {
      // optional: hormati flag aktif & inStock kalau ada
      if (food?.isActive === false) return false;
      if (food?.inStock === false) return false;
      return getVariantStock(food, varIdx) > 0;
    };

    // validasi seluruh pilihan di bundle
    const validateBundleStock = (bp) => {
      for (const pick of bp?.selections || []) {
        const food = (food_list || []).find(f => String(f._id) === String(pick.foodId));
        if (!food || !canBuy(food, pick.varianIndex)) return false;
      }
      return true;
    };

     const addToCartBundle =
       typeof addBundleToCart === "function"
         ? async (bp) => {
             if (!validateBundleStock(bp)) {
               toast.warn("Ada item hampers yang stoknya habis / tidak aktif");
               return false; // << batal
             }
             if (!ensureBundleRoom(bp)) return;
             await Promise.resolve(addBundleToCart(bp));
             return true;    // << sukses
           }
         : async (bp) => {
             if (!validateBundleStock(bp)) {
               toast.warn("Ada item hampers yang stoknya habis / tidak aktif");
               return false; // << batal
             }
             const raw = localStorage.getItem("cartBundles");
             const cur = raw ? JSON.parse(raw) : [];
             const key = JSON.stringify({ bundleId: bp.bundleId, selections: bp.selections });
             const idx = cur.findIndex((x) => x._key === key);
             if (idx >= 0) cur[idx].quantity = (cur[idx].quantity || 1) + (bp.quantity || 1);
             else cur.push({ ...bp, _key: key, id: String(Date.now()) });
             localStorage.setItem("cartBundles", JSON.stringify(cur));
             return true;    // << sukses
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
           const ok = await Promise.resolve(addToCartBundle(bp));
     if (ok) {
       toast.success("Hampers ditambahkan ke keranjang");
     }
    } catch (e) {
      toast.error("Gagal menambahkan ke keranjang");
    } finally {
      setAdding(false);
    }
  };

  // validasi lengkap: jika slot membatasi varian, varian wajib dipilih dan harus termasuk allowed
  const isComplete = () => {
    if (!hamper) return false;
    for (const s of selections) {
      const slotRule = hamper.slots?.[s.slotIndex];
      const allowedSet = getAllowedVariantSet(slotRule);

      for (const p of s.picks) {
        if (!p.foodId) return false;

        if (slotRule?.allowVariants && allowedSet.size > 0) {
          const food = (food_list || []).find((f) => f._id === p.foodId);
          const v = p.varianIndex != null ? food?.varians?.[p.varianIndex] : null;
          if (!v) return false;
          const nameOk = allowedSet.has(String(v.varianName || "").trim().toLowerCase());
          if (!nameOk) return false;
        }
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
          <img src={hamper.image?hamper.image:"https://res.cloudinary.com/diotafsul/image/upload/v1765699502/Artboard_1bundlproduct_abalpr.png"} alt={hamper.name} />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>

      <div className="hamper-details">
        <h1 className="hamper-title">{hamper.name}</h1>

        <p className="hamper-price">
          {hamper.pricingMode === "FIXED" ? (
            <>Rp {Number(hamper.basePrice || 0).toLocaleString()} / paket</>
          ) : hamper.pricingMode === "SUM_MINUS_DISCOUNT" ? (
            <>
              Harga dinamis: (jumlah harga item − diskon Rp{" "}
              {Number(hamper.discountAmount || 0).toLocaleString()})
            </>
          ) : hamper.pricingMode === "BASE_PLUS_ITEMS" ? (
            <>
              (Harga item + Packaging Rp {Number(hamper.basePrice || 0).toLocaleString()}
              {Number(hamper.discountAmount || 0) > 0 ? (
                <> − diskon Rp {Number(hamper.discountAmount || 0).toLocaleString()}</>
              ) : null}
              )
            </>
          ) : null}
        </p>

        <div className="hamper-desc">
          <p>{hamper.description || "-"}</p>
        </div>

        <div className="hamper-slots">
          <h3>Pilih Isi Paket</h3>
          {!isComplete() && <div className="slot-warning">Harap isi semua slot paket terlebih dahulu.</div>}
          {(hamper.slots || []).map((slot, sIdx) => {
            const candidates = candidatesBySlot[sIdx] || [];
            const allowedSet = getAllowedVariantSet(slot);
            return (
              <div key={sIdx} className="slot-card">
                <div className="slot-head">
                  <h4>{slot.name}</h4>
                  <small>pilih {slot.quantity} item</small>
                </div>

                {(selections[sIdx]?.picks || []).map((pick, pIdx) => {
                  const selectedFood = candidates.find((f) => f._id === pick.foodId);

                  // siapkan daftar varian yang difilter (kalau ada aturan)
                  let filteredVariants = [];
                  if (slot.allowVariants && selectedFood?.varians?.length) {
                    filteredVariants =
                      allowedSet.size > 0
                        ? selectedFood.varians
                            .map((v, i) => ({ v, i }))
                            .filter(({ v }) =>
                              allowedSet.has(String(v.varianName || "").trim().toLowerCase())
                            )
                        : selectedFood.varians.map((v, i) => ({ v, i }));
                  }

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
                          
                          {filteredVariants.map(({ v, i }) => {
                             const remaining = getRemainingQty(selectedFood._id, i);
                             return (
                               <option
                                 key={`${selectedFood._id}_${i}`}
                                 value={i}
                                 disabled={remaining <= 0}
                               >
                                 {v.varianName} — Rp {(v.varianPrice ?? selectedFood.price).toLocaleString()} — sisa {remaining}
                               </option>
                             );
                           })}
                        </select>
                      ) : selectedFood ? (
                          <span className="slot-price">
                            Rp {Number(selectedFood.price || 0).toLocaleString()} • sisa {getRemainingQty(selectedFood._id, undefined)}
                          </span>
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
            <div className="preview-amount">
              Perkiraan total paket: Rp {previewAmount.toLocaleString()}
            </div>
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
          <button className="btn primary add-to-cart" disabled={!isComplete() || adding} onClick={handleAddToCart}>
            <FaCartPlus className="icon" />
            {adding ? "Menambahkan..." : "Masukkan Keranjang"}
          </button>
        </div>
      </div>
    </div>
  );
}
