export default function AddOnRow({ data, onChange, onRemove }) {
    return (
      <div className="addon-row">
        <input
          placeholder="Nama Add On"
          value={data.addOn}
          onChange={(e) => onChange("addOn", e.target.value)}
        />
        <input
          type="number"
          placeholder="Harga"
          value={data.addOnPrice}
          onChange={(e) => onChange("addOnPrice", e.target.value)}
        />
        <button type="button" onClick={onRemove}>
          ✕
        </button>
      </div>
    );
  }
  