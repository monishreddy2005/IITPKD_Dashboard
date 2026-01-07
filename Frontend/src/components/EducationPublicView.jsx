import PlacementSection from './PlacementSection';
import AdministrativeSection from './AdministrativeSection';
import EducationAcademicSection from './EducationAcademicSection';

function EducationPublicView({ user }) {
    return (
        <div className="page-container">
            <div className="page-content">
                <h1>Education — Public Dashboard</h1>
                <p>
                    Explore key statistics of IIT Palakkad&apos;s education ecosystem, including placement analytics, administrative data, and academic program insights.
                </p>

                {/* ================= Placement Public View ================= */}
                <section style={{ marginTop: '3rem' }}>
                    <h2 className="section-title">Placements & Career Outcomes</h2>
                    <PlacementSection user={user} isPublicView={true} />
                </section>

                {/* ================= Administrative Public View ================= */}
                <section style={{ marginTop: '4rem' }}>
                    <h2 className="section-title">Administrative Section</h2>
                    <AdministrativeSection user={user} isPublicView={true} />
                </section>

                {/* ================= Academic Public View ================= */}
                <section style={{ marginTop: '4rem' }}>
                    <h2 className="section-title">Academic Section</h2>
                    <EducationAcademicSection user={user} isPublicView={true} />
                </section>
            </div>
        </div>
    );
}

export default EducationPublicView;
