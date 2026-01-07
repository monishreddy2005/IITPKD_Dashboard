import ResearchIcsrSection from './ResearchIcsrSection';
import ResearchAdministrativeSection from './ResearchAdministrativeSection';
import ResearchLibrarySection from './ResearchLibrarySection';

function ResearchPublicView({ user }) {
    return (
        <div className="page-container">
            <div className="page-content">
                <h1>Research — Public Dashboard</h1>
                <p>
                    This public dashboard presents consolidated research statistics of IIT Palakkad for transparent institutional reporting, including funded projects, consultancy, and scholarly outputs.
                </p>

                {/* ================= ICSR Public View ================= */}
                <section style={{ marginTop: '3rem' }}>
                    <h2 className="section-title">ICSR (Industrial Consultancy & Sponsored Research)</h2>
                    <ResearchIcsrSection user={user} isPublicView={true} />
                </section>

                {/* ================= Administrative Public View ================= */}
                <section style={{ marginTop: '4rem' }}>
                    <h2 className="section-title">Administrative (Industry Externships)</h2>
                    <ResearchAdministrativeSection user={user} isPublicView={true} />
                </section>

                {/* ================= Library Public View ================= */}
                <section style={{ marginTop: '4rem' }}>
                    <h2 className="section-title">Library & Scholarly Outputs</h2>
                    <ResearchLibrarySection user={user} isPublicView={true} />
                </section>
            </div>
        </div>
    );
}

export default ResearchPublicView;
