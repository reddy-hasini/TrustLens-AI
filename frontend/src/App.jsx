import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock3,
  Search,
  RefreshCw,
  FileCheck2,
  Scale,
  Activity,
} from "lucide-react";

import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [activePage, setActivePage] = useState("dashboard");

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/claims`);

      if (!response.ok) {
        throw new Error("Failed to fetch claims");
      }

      const data = await response.json();
      setClaims(data.claims || []);
    } catch (err) {
      setError(
        "Unable to connect to the TrustLens backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimDetails = async (claimId) => {
    try {
      setDetailsLoading(true);

      const response = await fetch(`${API_URL}/claims/${claimId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch claim details");
      }

      const data = await response.json();
      setSelectedClaim(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const filteredClaims = claims.filter((claim) =>
    claim.claim_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const verifiedCount = claims.filter(
    (claim) => claim.claim_status === "verified"
  ).length;

  const pendingCount = claims.filter(
    (claim) => claim.claim_status === "pending"
  ).length;

  const contradictedCount = claims.filter(
    (claim) => claim.verdict === "contradicted"
  ).length;

  const totalEvidence = claims.reduce(
    (sum, claim) => sum + (claim.total_evidence || 0),
    0
  );

  const claimsWithEvidence = claims.filter(
    (claim) => claim.total_evidence !== null && claim.total_evidence !== undefined
  ).length;

  const getVerdictClass = (value) => {
    if (value === "verified") return "verified";
    if (value === "contradicted") return "contradicted";
    if (value === "mixed") return "mixed";
    return "pending";
  };

  const getVerdictLabel = (claim) => {
    if (claim.claim_status === "pending") return "Pending";
    if (claim.verdict === "verified") return "Verified";
    if (claim.verdict === "contradicted") return "Contradicted";
    if (claim.verdict === "mixed") return "Mixed";

    return claim.verdict || "Pending";
  };

  const renderStats = () => (
    <section className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon blue">
          <FileCheck2 size={22} />
        </div>

        <div>
          <span>Total Claims</span>
          <strong>{claims.length}</strong>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon green">
          <ShieldCheck size={22} />
        </div>

        <div>
          <span>Verified</span>
          <strong>{verifiedCount}</strong>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon orange">
          <Clock3 size={22} />
        </div>

        <div>
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon red">
          <ShieldAlert size={22} />
        </div>

        <div>
          <span>Contradicted</span>
          <strong>{contradictedCount}</strong>
        </div>
      </div>
    </section>
  );

  const renderClaimsList = () => (
    <section className="claims-section">
      <div className="section-header">
        <div>
          <h3>Claims</h3>

          <p>Evidence-backed verification results</p>
        </div>

        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search claims..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="error-box">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {loading && (
        <div className="loading">Loading TrustLens results...</div>
      )}

      {!loading && !error && (
        <div className="claims-list">
          {filteredClaims.map((claim) => (
            <article
              className="claim-card clickable"
              key={claim.claim_id}
              onClick={() => fetchClaimDetails(claim.claim_id)}
            >
              <div className="claim-top">
                <div className="claim-number">
                  CLAIM #{claim.claim_id}
                </div>

                <span
                  className={`verdict ${getVerdictClass(claim.verdict)}`}
                >
                  {getVerdictLabel(claim)}
                </span>
              </div>

              <h4>{claim.claim_text}</h4>

              <div className="claim-metrics">
                <div className="metric">
                  <span>Confidence</span>

                  <strong>
                    {claim.confidence_score !== null &&
                    claim.confidence_score !== undefined
                      ? `${claim.confidence_score}%`
                      : "—"}
                  </strong>
                </div>

                <div className="metric">
                  <span>Supporting</span>

                  <strong>
                    {claim.supporting_score !== null &&
                    claim.supporting_score !== undefined
                      ? claim.supporting_score
                      : "—"}
                  </strong>
                </div>

                <div className="metric">
                  <span>Contradicting</span>

                  <strong>
                    {claim.contradicting_score !== null &&
                    claim.contradicting_score !== undefined
                      ? claim.contradicting_score
                      : "—"}
                  </strong>
                </div>

                <div className="metric">
                  <span>Evidence</span>

                  <strong>{claim.total_evidence ?? "—"}</strong>
                </div>

                <div className="metric">
                  <span>Balance</span>

                  <strong>
                    {claim.evidence_balance !== null &&
                    claim.evidence_balance !== undefined
                      ? claim.evidence_balance
                      : "—"}
                  </strong>
                </div>
              </div>

              <div className="claim-bottom">
                <div className="evidence-status">
                  <span className="label">Evidence status</span>

                  <span
                    className={`evidence-tag ${getVerdictClass(
                      claim.evidence_status
                    )}`}
                  >
                    {claim.evidence_status || "Pending"}
                  </span>
                </div>

                <div className="claim-status">
                  <span className="label">Status</span>

                  <span>{claim.claim_status}</span>
                </div>
              </div>

              {claim.explanation && (
                <div className="explanation">
                  <strong>Verification explanation</strong>

                  <p>{claim.explanation}</p>
                </div>
              )}
            </article>
          ))}

          {filteredClaims.length === 0 && (
            <div className="empty-state">No claims found.</div>
          )}
        </div>
      )}
    </section>
  );

  const renderDashboard = () => (
    <>
      <header className="header">
        <div>
          <p className="eyebrow">EVIDENCE-AWARE INTELLIGENCE</p>

          <h2>Verification Dashboard</h2>

          <p className="subtitle">
            Analyze claims using weighted evidence and transparent verification.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchClaims}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "spin" : ""}
          />

          Refresh
        </button>
      </header>

      {renderStats()}

      {renderClaimsList()}
    </>
  );

  const renderClaimsPage = () => (
    <>
      <header className="header">
        <div>
          <p className="eyebrow">CLAIM INTELLIGENCE</p>

          <h2>Claims</h2>

          <p className="subtitle">
            Review every claim and inspect its verification results.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchClaims}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "spin" : ""}
          />

          Refresh
        </button>
      </header>

      {renderClaimsList()}
    </>
  );

  const renderEvidencePage = () => (
    <>
      <header className="header">
        <div>
          <p className="eyebrow">EVIDENCE INTELLIGENCE</p>

          <h2>Evidence</h2>

          <p className="subtitle">
            Review how supporting and contradicting evidence affects each claim.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchClaims}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "spin" : ""}
          />

          Refresh
        </button>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Scale size={22} />
          </div>

          <div>
            <span>Total Evidence</span>
            <strong>{totalEvidence}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span>Claims With Evidence</span>
            <strong>{claimsWithEvidence}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Clock3 size={22} />
          </div>

          <div>
            <span>Pending Claims</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <ShieldAlert size={22} />
          </div>

          <div>
            <span>Contradicted</span>
            <strong>{contradictedCount}</strong>
          </div>
        </div>
      </section>

      <section className="claims-section">
        <div className="section-header">
          <div>
            <h3>Evidence Analysis</h3>

            <p>
              Weighted evidence and balance for each claim
            </p>
          </div>
        </div>

        {loading && (
          <div className="loading">Loading evidence data...</div>
        )}

        {!loading && !error && (
          <div className="claims-list">
            {claims.map((claim) => (
              <article
                className="claim-card clickable"
                key={claim.claim_id}
                onClick={() => fetchClaimDetails(claim.claim_id)}
              >
                <div className="claim-top">
                  <div className="claim-number">
                    CLAIM #{claim.claim_id}
                  </div>

                  <span
                    className={`verdict ${getVerdictClass(claim.verdict)}`}
                  >
                    {getVerdictLabel(claim)}
                  </span>
                </div>

                <h4>{claim.claim_text}</h4>

                <div className="claim-metrics">
                  <div className="metric">
                    <span>Supporting</span>

                    <strong>
                      {claim.supporting_score ?? "—"}
                    </strong>
                  </div>

                  <div className="metric">
                    <span>Contradicting</span>

                    <strong>
                      {claim.contradicting_score ?? "—"}
                    </strong>
                  </div>

                  <div className="metric">
                    <span>Neutral</span>

                    <strong>
                      {claim.neutral_count ?? "—"}
                    </strong>
                  </div>

                  <div className="metric">
                    <span>Total Evidence</span>

                    <strong>
                      {claim.total_evidence ?? "—"}
                    </strong>
                  </div>

                  <div className="metric">
                    <span>Balance</span>

                    <strong>
                      {claim.evidence_balance ?? "—"}
                    </strong>
                  </div>
                </div>

                <div className="claim-bottom">
                  <div className="evidence-status">
                    <span className="label">Evidence status</span>

                    <span
                      className={`evidence-tag ${getVerdictClass(
                        claim.evidence_status
                      )}`}
                    >
                      {claim.evidence_status || "Pending"}
                    </span>
                  </div>

                  <div className="claim-status">
                    <span className="label">Net evidence</span>

                    <span>
                      {claim.net_evidence_score ?? "—"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={28} />
          </div>

          <div>
            <h1>TrustLens</h1>
            <span>AI Verification Engine</span>
          </div>
        </div>

        <nav className="navigation">

          <div
            className={`nav-item ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActivePage("dashboard")}
          >
            <Activity size={19} />
            Dashboard
          </div>

          <div
            className={`nav-item ${
              activePage === "claims" ? "active" : ""
            }`}
            onClick={() => setActivePage("claims")}
          >
            <FileCheck2 size={19} />
            Claims
          </div>

          <div
            className={`nav-item ${
              activePage === "evidence" ? "active" : ""
            }`}
            onClick={() => setActivePage("evidence")}
          >
            <Scale size={19} />
            Evidence
          </div>

        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-dot"></span>
            System Online
          </div>

          <span className="version">
            TrustLens v1.0
          </span>
        </div>

      </aside>

      {/* MAIN */}
      <main className="main">

        {activePage === "dashboard" && renderDashboard()}

        {activePage === "claims" && renderClaimsPage()}

        {activePage === "evidence" && renderEvidencePage()}

      </main>

      {/* CLAIM DETAILS PANEL */}
      {selectedClaim && (
        <div
          className="details-overlay"
          onClick={() => setSelectedClaim(null)}
        >
          <div
            className="details-panel"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="details-header">

              <div>
                <span className="claim-number">
                  CLAIM #{selectedClaim.claim_id}
                </span>

                <h3>Verification Details</h3>
              </div>

              <button
                className="close-button"
                onClick={() => setSelectedClaim(null)}
              >
                ×
              </button>

            </div>

            {detailsLoading ? (
              <div className="loading">
                Loading claim details...
              </div>
            ) : (
              <>
                <div className="details-claim">
                  {selectedClaim.claim_text}
                </div>

                <div className="details-verdict">

                  <span
                    className={`verdict ${getVerdictClass(
                      selectedClaim.verdict
                    )}`}
                  >
                    {getVerdictLabel(selectedClaim)}
                  </span>

                  <div className="confidence-large">
                    <span>Confidence</span>

                    <strong>
                      {selectedClaim.confidence_score ?? "—"}%
                    </strong>
                  </div>

                </div>

                <div className="details-grid">

                  <div className="detail-box">
                    <span>Supporting Score</span>

                    <strong>
                      {selectedClaim.supporting_score ?? "—"}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span>Contradicting Score</span>

                    <strong>
                      {selectedClaim.contradicting_score ?? "—"}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span>Neutral Evidence</span>

                    <strong>
                      {selectedClaim.neutral_count ?? "—"}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span>Total Evidence</span>

                    <strong>
                      {selectedClaim.total_evidence ?? "—"}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span>Net Evidence Score</span>

                    <strong>
                      {selectedClaim.net_evidence_score ?? "—"}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span>Evidence Balance</span>

                    <strong>
                      {selectedClaim.evidence_balance ?? "—"}
                    </strong>
                  </div>

                </div>

                <div className="detail-status">

                  <div>
                    <span>Evidence Status</span>

                    <strong>
                      {selectedClaim.evidence_status ?? "Pending"}
                    </strong>
                  </div>

                  <div>
                    <span>Claim Status</span>

                    <strong>
                      {selectedClaim.claim_status ?? "Pending"}
                    </strong>
                  </div>

                </div>

                {selectedClaim.explanation && (
                  <div className="detail-explanation">

                    <h4>Verification Explanation</h4>

                    <p>
                      {selectedClaim.explanation}
                    </p>

                  </div>
                )}

              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default App;