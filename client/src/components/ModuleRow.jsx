function ModuleRow({ module, onChange, onRemove }) {
  return (
    <div className="module-row">
      <input
        type="text"
        placeholder="Module code"
        value={module.code}
        onChange={(event) => onChange("code", event.target.value)}
      />
      <input
        type="text"
        placeholder="Module name"
        value={module.name}
        onChange={(event) => onChange("name", event.target.value)}
      />
      <input
        type="number"
        min="0"
        placeholder="Credits"
        value={module.credits}
        onChange={(event) => onChange("credits", event.target.value)}
      />
      <select value={module.grade} onChange={(event) => onChange("grade", event.target.value)}>
        <option value="">Select grade</option>
        {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "E"].map((grade) => (
          <option key={grade} value={grade}>
            {grade}
          </option>
        ))}
      </select>
      <button className="danger-button" type="button" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

export default ModuleRow;
