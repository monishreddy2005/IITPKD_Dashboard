
import './Page.css';
import './PeopleCampus.css';

import AcademicSection from './AcademicSection';
import AdministrativeSection from './AdministrativeSection';
import IgrcSection from './IgrcSection';
import IccSection from './IccSection';
import EwdSection from './EwdSection';
import IarSection from './IarSection';

function PeopleCampusPublicView({ user }) {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>People & Campus — Public Dashboard</h1>
        <p>
          This public dashboard presents consolidated academic and administrative
          statistics of IIT Palakkad for transparent institutional reporting.
        </p>

        {/* ================= Academic Public View ================= */}
        <section style={{ marginTop: '3rem' }}>
          <h2 className="section-title">Academic Section</h2>
          <AcademicSection user={user} isPublicView={true} />
        </section>

        {/* ================= Administrative Public View ================= */}
        <section style={{ marginTop: '4rem' }}>
          <h2 className="section-title">Administrative Section</h2>
          <AdministrativeSection user={user} isPublicView={true} />
        </section>

        {/* ================= IGRC Public View ================= */}
        <section style={{ marginTop: '4rem' }}>
          <h2 className="section-title">Internal Grievance Resolution Cell (IGRC)</h2>
          <IgrcSection user={user} isPublicView={true} />
        </section>

        {/* ================= ICC Public View ================= */}
        <section style={{ marginTop: '4rem' }}>
          <h2 className="section-title">Internal Complaints Committee (ICC)</h2>
          <IccSection user={user} isPublicView={true} />
        </section>

        {/* ================= EWD Public View ================= */}
        <section style={{ marginTop: '4rem' }}>
          <h2 className="section-title">Engineering & Works Division (EWD)</h2>
          <EwdSection user={user} isPublicView={true} />
        </section>

        {/* ================= IAR Public View ================= */}
        <section style={{ marginTop: '4rem' }}>
          <h2 className="section-title">International & Alumni Relations (IAR)</h2>
          <IarSection user={user} isPublicView={true} />
        </section>
      </div>
    </div>
  );
}

export default PeopleCampusPublicView;