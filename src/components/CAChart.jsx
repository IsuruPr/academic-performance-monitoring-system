import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from "recharts";
import C  from "../Theme";
import cs from "../styles";

export default function CAChart({ modules }) {
  if (modules.length === 0) return null;

  const barData = modules.map(m => ({
    name:   m.moduleName.length > 10 ? m.moduleName.slice(0, 10) + "…" : m.moduleName,
    CA:     m.stats?.currentCA ?? 0,
    Target: m.marks?.targetGrade ?? 75,
  }));

  const firstWithMarks = modules.find(m => m.marks);
  const radarData = firstWithMarks ? [
    { subject: "Lab",  score: parseFloat(firstWithMarks.marks.labMark)  || 0 },
    { subject: "Quiz", score: parseFloat(firstWithMarks.marks.quizMark) || 0 },
    { subject: "Mid",  score: parseFloat(firstWithMarks.marks.midMark)  || 0 },
  ] : [];

  return (
    <div style={{ margin: "0 16px 16px" }}>
      <div style={cs.sectionLabel}>📊 CA Performance Chart</div>

      {/* Bar Chart — CA vs Target */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 8px 8px", marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", paddingLeft: 12, marginBottom: 8 }}>
          CA Score vs Target per Module
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={barData} barGap={4}>
            <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: "Syne", fontSize: 12 }} cursor={{ fill: "rgba(85,165,236,.08)" }} />
            <Bar dataKey="CA"     name="CA Score" radius={[6, 6, 0, 0]} fill={C.accent} />
            <Bar dataKey="Target" name="Target"   radius={[6, 6, 0, 0]} fill={C.teal} opacity={0.4} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", paddingTop: 4 }}>
          <span style={{ fontSize: 10, color: C.accent, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, background: C.accent, borderRadius: 2 }} /> CA Score
          </span>
          <span style={{ fontSize: 10, color: C.teal, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, background: C.teal, borderRadius: 2, opacity: .6 }} /> Target
          </span>
        </div>
      </div>

      {/* Radar Chart — mark breakdown */}
      {radarData.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 8px 8px" }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", paddingLeft: 12, marginBottom: 4 }}>
            Mark Breakdown — {firstWithMarks.moduleName}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: C.muted, fontSize: 11, fontFamily: "DM Mono" }} />
              <Radar dataKey="score" stroke={C.accent} fill={C.accent} fillOpacity={0.2} strokeWidth={2} dot={{ fill: C.accent, r: 4 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
