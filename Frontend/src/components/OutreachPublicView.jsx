import OpenHouseSection from './OpenHouseSection';
import NptelSection from './NptelSection';
import UbaSection from './UbaSection';

function OutreachPublicView({ user }) {
    return (
        <div className="page-container">
            <div className="page-content">
                <h1>Outreach & Extension — Public Dashboard</h1>
                <p>
                    Discover IIT Palakkad&apos;s commitment to community engagement and knowledge dissemination through Open House events,
                    NPTEL courses, and Unnat Bharat Abhiyan initiatives.
                </p>

                {/* ================= Open House Public View ================= */}
                <section style={{ marginTop: '3rem' }}>
                    <h2 className="section-title">Open House</h2>
                    <OpenHouseSection user={user} isPublicView={true} />
                </section>

                {/* ================= NPTEL Public View ================= */}
                <section style={{ marginTop: '4rem' }}>
                    <h2 className="section-title">NPTEL – CCE (Centre for Continuing Education)</h2>
                    <NptelSection user={user} isPublicView={true} />
                </section>

                {/* ================= UBA Public View ================= */}
                <section style={{ marginTop: '4rem' }}>
                    <h2 className="section-title">Unnat Bharat Abhiyan (UBA)</h2>
                    <UbaSection user={user} isPublicView={true} />
                </section>
            </div>
        </div>
    );
}

export default OutreachPublicView;
