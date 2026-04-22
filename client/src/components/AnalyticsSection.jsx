function AnalyticsSection({
  metrics,
  yearAverages,
  gradeDistribution,
  creditByYear,
  analyticsProjection,
  analyticsNotes,
  handlePrintReport,
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Visual Analytics & PDF Reports</h2>
        <p>Use the charts below to review past performance, next-semester prediction, and your printable report.</p>
      </div>
      <div className="chart-grid">
        <article className="chart-card">
          <h3>Semester GPA Trend</h3>
          <div className="chart-list">
            {metrics.semesters.map((semester) => (
              <div key={semester.key} className="chart-row">
                <span>{semester.title}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.min(100, (semester.semesterGpa / 4) * 100)}%` }} />
                </div>
                <strong>{semester.semesterGpa.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="chart-card">
          <h3>Year Average GPA</h3>
          <div className="chart-list">
            {yearAverages.map((yearItem) => (
              <div key={yearItem.year} className="chart-row">
                <span>Year {yearItem.year}</span>
                <div className="bar-track soft">
                  <div className="bar-fill amber" style={{ width: `${Math.min(100, (yearItem.average / 4) * 100)}%` }} />
                </div>
                <strong>{yearItem.average.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="chart-card">
          <h3>Grade Distribution</h3>
          <div className="chart-list">
            {gradeDistribution.map((bucket) => (
              <div key={bucket.label} className="chart-row">
                <span>{bucket.label}</span>
                <div className="bar-track soft">
                  <div className="bar-fill violet" style={{ width: `${bucket.percentage}%` }} />
                </div>
                <strong>{bucket.count}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="chart-card">
          <h3>Credit Completion By Year</h3>
          <div className="chart-list">
            {creditByYear.map((yearItem) => (
              <div key={yearItem.year} className="chart-row">
                <span>Year {yearItem.year}</span>
                <div className="bar-track">
                  <div className="bar-fill green" style={{ width: `${yearItem.percentage}%` }} />
                </div>
                <strong>{yearItem.credits}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="chart-card">
          <h3>Next Semester Prediction</h3>
          <div className="prediction-metrics">
            <div className="prediction-card">
              <span>Predicted Semester GPA</span>
              <strong>{analyticsProjection.predictedNextSemesterGpa.toFixed(2)}</strong>
            </div>
            <div className="prediction-card">
              <span>Predicted Average Mark</span>
              <strong>{analyticsProjection.predictedMark.toFixed(1)}%</strong>
            </div>
            <div className="prediction-card">
              <span>Projected CGPA After Next Semester</span>
              <strong>{analyticsProjection.projectedCgpa.toFixed(2)}</strong>
            </div>
          </div>
          <div className="trend-compare">
            <div className="trend-column">
              <span>Recent Avg</span>
              <div style={{ height: `${(analyticsProjection.recentAverage / 4) * 180}px` }} />
              <strong>{analyticsProjection.recentAverage.toFixed(2)}</strong>
            </div>
            <div className="trend-column predicted">
              <span>Predicted Next</span>
              <div style={{ height: `${(analyticsProjection.predictedNextSemesterGpa / 4) * 180}px` }} />
              <strong>{analyticsProjection.predictedNextSemesterGpa.toFixed(2)}</strong>
            </div>
          </div>
        </article>
        <article className="chart-card">
          <h3>Analytics Summary</h3>
          <div className="analysis-notes">
            {analyticsNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </article>
      </div>
      <div className="comparison-card">
        <h3>Printable Report</h3>
        <p>Use the browser print dialog to save this dashboard as PDF with current GPA, classification, warnings, and charts.</p>
        <button className="primary-button" type="button" onClick={handlePrintReport}>
          Export PDF Report
        </button>
      </div>
    </section>
  );
}

export default AnalyticsSection;
