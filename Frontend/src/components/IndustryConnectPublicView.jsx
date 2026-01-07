import IcsrSection from './IcsrSection';
import ConclaveSection from './ConclaveSection';

function IndustryConnectPublicView({ user }) {
    return (
        <div className="page-container">
            <div className="page-content">
                <h1>Industry Connect — Public Dashboard</h1>
                <p>
                    Explore IIT Palakkad&apos;s industry engagement initiatives including events, workshops, and annual conclaves.
                </p>

                {/* ================= ICSR Public View ================= */}
                <section style={{ marginTop: '3rem' }}>
                    <h2 className="section-title">ICSR Section - Industry Interaction Events</h2>
                    <IcsrSection user={user} isPublicView={true} />
                </section>

                {/* ================= Conclave Public View ================= */}
                <section style={{ marginTop: '4rem' }}>
                    <h2 className="section-title">Industry-Academia Conclave</h2>
                    <ConclaveSection user={user} isPublicView={true} />
                </section>
            </div>
        </div>
    );
}

export default IndustryConnectPublicView;
