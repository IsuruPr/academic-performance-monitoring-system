import C from "./theme";

// ── Shared Styles ─────────────────────────────────────────────────────────
const cs = {
  page:         { minHeight: "100vh", paddingBottom: 110, background: C.bg, color: C.text, fontFamily: "'Syne',sans-serif" },
  header:       { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 20px 16px" },
  logo:         { width: 46, height: 46, background: `linear-gradient(135deg,${C.accent},${C.teal})`, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, color: C.white, boxShadow: `0 6px 20px ${C.accent}44`, letterSpacing: -1 },
  appTitle:     { fontSize: 21, fontWeight: 800, letterSpacing: "-.5px", color: C.text },
  appSub:       { fontSize: 10, color: C.muted, letterSpacing: ".5px", marginTop: 1 },
  liveBadge:    { display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: C.tealD, letterSpacing: "1px", background: "rgba(11,172,238,.08)", border: `1px solid rgba(11,172,238,.25)`, borderRadius: 20, padding: "6px 12px" },
  liveDot:      { width: 7, height: 7, borderRadius: "50%", background: C.teal, boxShadow: `0 0 6px ${C.teal}`, display: "inline-block" },
  sectionLabel: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 8px", fontSize: 10, letterSpacing: "1.8px", color: C.muted, textTransform: "uppercase" },
  emptyBox:     { textAlign: "center", background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 18, padding: "40px 24px", margin: "0 16px" },
  card:         { display: "flex", alignItems: "stretch", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", cursor: "pointer", transition: "all .22s", boxShadow: "0 2px 8px rgba(85,165,236,.06)" },
  cardBar:      { width: 4, background: `linear-gradient(180deg,${C.accent},${C.teal})`, flexShrink: 0 },
  delBtn:       { background: "none", border: "1px solid transparent", color: C.muted, fontSize: 12, width: 27, height: 27, borderRadius: 7, cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  fab:          { position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${C.accent},${C.teal})`, color: C.white, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 50, padding: "16px 40px", cursor: "pointer", boxShadow: `0 8px 30px ${C.accent}44`, transition: "all .22s", whiteSpace: "nowrap", zIndex: 99 },
  nav:          { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 16px 12px", position: "sticky", top: 0, background: C.bg, borderBottom: `1px solid ${C.border}`, zIndex: 10, boxShadow: "0 2px 8px rgba(85,165,236,.06)" },
  navTitle:     { fontSize: 16, fontWeight: 700, color: C.text },
  backBtn:      { background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 10, cursor: "pointer", transition: "all .2s" },
  formCard:     { margin: "0 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 22, padding: "24px 20px", boxShadow: "0 4px 16px rgba(85,165,236,.08)" },
  fLabel:       { display: "block", fontSize: 10, letterSpacing: "1.2px", color: C.muted, textTransform: "uppercase", marginBottom: 6 },
  fInput:       { width: "100%", background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 16px", color: C.text, fontFamily: "'Syne',sans-serif", fontSize: 15, outline: "none", marginBottom: 18, transition: "border-color .2s", boxSizing: "border-box" },
  wInput:       { width: 68, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 10px", color: C.text, fontFamily: "'DM Mono',monospace", fontSize: 15, textAlign: "center", outline: "none", transition: "border .2s" },
  btnPrimary:   { width: "100%", background: `linear-gradient(135deg,${C.accent},${C.teal})`, color: C.white, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 14, padding: 16, cursor: "pointer", transition: "opacity .2s", boxShadow: `0 4px 16px ${C.accent}44` },
  outCard:      { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 10px", textAlign: "center" },
  outLbl:       { fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: ".5px", marginTop: 4 },
  outSub:       { fontSize: 9, color: C.muted, marginTop: 3 },
  markInput:    { background: C.white, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", color: C.text, fontFamily: "'DM Mono',monospace", fontSize: 17, outline: "none", transition: "border .2s" },
};

export default cs;