import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Page.css';
import './HomePage.css';
import SplashScreen from './SplashScreen';
import ImageSlider from './ImageSlider';
import NirfRankingSection from './NirfRankingSection';

// ⚙️ INSTRUCTIONS: Add your IIT Palakkad images here
// Step 1: Place your images in: Frontend/src/assets/images/iit-palakkad/
// Step 2: Import them below (uncomment and add your image paths)
// Step 3: Add them to the images array in the ImageSlider component

// Example imports (uncomment and modify when you add images):
import iitImage1 from '../assets/images/iit-palakkad/image1.jpg';
import iitImage2 from '../assets/images/iit-palakkad/image2.jpg';
import iitImage3 from '../assets/images/iit-palakkad/image3.jpg';
import iitImage4 from '../assets/images/iit-palakkad/image4.jpg';
import iitImage5 from '../assets/images/iit-palakkad/image5.png';
import iitImage6 from '../assets/images/iit-palakkad/image6.jpg';



// For now, using empty array - add your images here when ready
const iitPalakkadImages = [
  // Add your imported images here, for example:
  iitImage1,
  iitImage2,
  iitImage3,
  iitImage4,
  iitImage5,
  iitImage6,

];

function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className="page-container">
        <div className="page-content">
          <div className="welcome-section">
            <h1>Exploring the Vision that shapes Indian Institute of Technology Palakkad</h1>

            {/* Image Slider - IIT Palakkad Images */}
            <ImageSlider images={iitPalakkadImages} autoSlideInterval={4000} />

            <div className="content-card">
              <h2>Purpose</h2>
              <p>To create knowledge; to communicate knowledge; and to apply knowledge for the benefit of society. To nurture lifelong learners with rigorous foundation and a passion for innovation; strong ethical values and social responsibility. To be home to the best minds from across the globe.</p>
            </div>

            <div className="content-card">
              <h2>Core Values</h2>
              <p>We are a happy and vibrant community founded on reason and compassion, driven by curiosity, creativity and a desire to be agents of change. We cherish a sense of belonging towards the Institution. We foster diversity in composition and thought, boundaryless inquiries and interactions, and free and independent thinking. We espouse an ecologically and socially responsible way of life.</p>
            </div>



            <div className="content-card">
              <h2>Envisioned Future</h2>
              <p>We envision being a globally recognized institution at the forefront of education, research, and technology development, having strong ties with industries and other academic institutions.</p>
              <p>We envision being an inclusive and diverse community on a sustainable and green campus, actively engaged with its neighborhood.</p>
            </div>


            {/* NIRF Ranking Section */}
            <NirfRankingSection />

            {/* Main Sections Overview */}
            <div className="content-card">
              <h2>Explore Our Institute</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>

                <div className="section-link-card">
                  <h3><Link to="/people-campus" style={{ color: '#f7a600', textDecoration: 'underline', fontSize: '1.5rem' }}>People and Campus</Link></h3>
                  <p>Explore our vibrant community, faculty profiles, staff details, and the life that thrives on our campus.</p>
                </div>

                <div className="section-link-card">
                  <h3><Link to="/research" style={{ color: '#f7a600', textDecoration: 'underline', fontSize: '1.5rem' }}>Research</Link></h3>
                  <p>Discover our cutting-edge research projects, publications, patents, and centers of excellence driving innovation.</p>
                </div>

                <div className="section-link-card">
                  <h3><Link to="/education" style={{ color: '#f7a600', textDecoration: 'underline', fontSize: '1.5rem' }}>Education</Link></h3>
                  <p>Learn about our academic programs, curriculum, departments, and the learning environment we offer.</p>
                </div>

                <div className="section-link-card">
                  <h3><Link to="/industry-connect" style={{ color: '#f7a600', textDecoration: 'underline', fontSize: '1.5rem' }}>Industry Connect</Link></h3>
                  <p>See our strong ties with the industry, including placements, internships, and collaborative projects.</p>
                </div>

                <div className="section-link-card">
                  <h3><Link to="/innovation-entrepreneurship" style={{ color: '#f7a600', textDecoration: 'underline', fontSize: '1.5rem' }}>Innovation and Entrepreneurship</Link></h3>
                  <p>Check out our incubation centre, startup ecosystem, and initiatives fostering the entrepreneurial spirit.</p>
                </div>

                <div className="section-link-card">
                  <h3><Link to="/outreach-extension" style={{ color: '#f7a600', textDecoration: 'underline', fontSize: '1.5rem' }}>Outreach and Extension</Link></h3>
                  <p>Read about our social initiatives, workshops, conferences, and community outreach programs.</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
