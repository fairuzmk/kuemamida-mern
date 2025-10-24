// === VoucherCoupons: kartu kupon gaya "klaim" ===
import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./CartCoupon.css";

export function VoucherCoupons() {
  const {
    url,
    applyVoucher,
    clearVoucher,          // <-- AMBIL dari context
    voucher,
    getTotalCartAmount,
  } = useContext(StoreContext);

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const subtotal = getTotalCartAmount();

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${url}/api/vouchers`);
        if (on) setVouchers(res.data?.data || []);
      } catch (e) {
        console.error(e);
        if (on) setVouchers([]);
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [url]);

  const isEligible = (v) => {
    const now = Date.now();
    const notExpired = !v.expired_at || new Date(v.expired_at).getTime() >= now;
    const underLimit =
      !(typeof v.usage_limit === "number" && typeof v.used_count === "number" && v.usage_limit > 0) ||
      v.used_count < v.usage_limit;
    const active = !!v.is_active;
    const meetMin = Number(subtotal) >= Number(v.min_purchase || 0);
    return active && notExpired && underLimit && meetMin;
  };

  const list = useMemo(() => {
    const arr = Array.isArray(vouchers) ? [...vouchers] : [];
    return arr.sort((a, b) => {
      const ea = isEligible(a) ? 0 : 1;
      const eb = isEligible(b) ? 0 : 1;
      if (ea !== eb) return ea - eb;
      const ta = a.expired_at ? new Date(a.expired_at).getTime() : Infinity;
      const tb = b.expired_at ? new Date(b.expired_at).getTime() : Infinity;
      return ta - tb;
    });
  }, [vouchers, subtotal]);

  const fmtRp = (n) => (Number(n || 0)).toLocaleString("id-ID");
  const fmtDate = (s) => {
    if (!s) return "-";
    const d = new Date(s); if (isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2,"0");
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  };
  const usagePct = (used=0, limit=0) => !limit ? 0 : Math.max(0, Math.min(100, Math.round((used/limit)*100)));

  return (
    <section className="coupon-section">
      <div className="coupon-section__head">
        <h3>Voucher untuk kamu</h3>
        <small>Subtotal: Rp {fmtRp(subtotal)}</small>
      </div>

      {/* Banner voucher terpakai */}
      {voucher?.code && (
        <div className="coupon-applied">
          <span>Voucher terpakai: <b>{voucher.code}</b></span>
          <button className="coupon-applied__clear" onClick={clearVoucher}>
            Batalkan
          </button>
        </div>
      )}

      {loading ? (
        <div className="coupon-empty">Memuat voucher…</div>
      ) : list.length === 0 ? (
        <div className="coupon-empty">Belum ada voucher.</div>
      ) : (
        <div className="coupon-list">
          {list.map((v) => {
            const eligible = isEligible(v);
            const applied = voucher?.code?.toUpperCase() === String(v.code || "").toUpperCase();
            const title = v.type === "percentage" ? `Diskon ${v.value}%` : `Diskon Rp${fmtRp(v.value)}`;
            const pct = usagePct(v.used_count || 0, v.usage_limit || 0);
            return (
              <div key={v._id} className={`coupon ${eligible ? "" : "coupon--dim"}`}>
                <div className="coupon__left">
                  <span className="coupon__code">{(v.code || "").toUpperCase()}</span>
                </div>
                <div className="coupon__cut" aria-hidden="true" />
                <div className="coupon__body">
                  <div className="coupon__title">{title}</div>
                  <div className="coupon__min">Min. Blj Rp{fmtRp(v.min_purchase)}</div>
                  <div className="coupon__sub">
                    {typeof v.usage_limit === "number" && v.usage_limit > 0 ? <>Terpakai {pct}%, </> : null}
                    S/D: {fmtDate(v.expired_at)}
                  </div>
                </div>
                <div className="coupon__action">
                  {applied ? (
                    <button className="coupon__btn coupon__btn--ghost" onClick={clearVoucher}>
                      Batalkan
                    </button>
                  ) : (
                    <button
                      className="coupon__btn"
                      disabled={!eligible}
                      onClick={() => applyVoucher(v.code)}
                    >
                      Klaim
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
