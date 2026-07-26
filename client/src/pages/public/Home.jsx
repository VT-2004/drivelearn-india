import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import HowItWorks from '../../components/HowItWorks';
import Features from '../../components/Features';
import Footer from '../../components/Footer';
import '../../styles/landing.css';

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <div className="lane-divider"></div>
      <HowItWorks />
      <Features />
      <Footer />
    </div>
  );
};

export default Home;
