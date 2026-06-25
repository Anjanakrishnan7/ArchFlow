import React from 'react';
import './About.css';
import { motion } from 'framer-motion';
import { FaStar, FaUsers, FaClock, FaShieldAlt, FaAward } from 'react-icons/fa';
import { backgroundImages } from '../../utils/imageHelper';

const About = () => {
  const whyChooseUsItems = [
    {
      icon: <FaStar />,
      title: 'Quality Construction',
      description: 'We use premium materials and superior craftsmanship to deliver durable, high-quality results.'
    },
    {
      icon: <FaUsers />,
      title: 'Trusted Professionals',
      description: 'Our team consists of licensed, insured, and experienced experts dedicated to your project.'
    },
    {
      icon: <FaClock />,
      title: 'On-Time Delivery',
      description: 'We adhere to strict timelines and efficient project management to complete your project on schedule.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Transparent Pricing',
      description: 'Receive clear, detailed, and honest quotes with no hidden fees or surprise charges.'
    }
  ];



  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <motion.section
        className="public-hero"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(17, 34, 53, 0.85), rgba(10, 22, 40, 0.85)), url(${backgroundImages.about})`
        }}
      >
        <div className="public-hero-content">
          <h1>About ArchFlow</h1>
          <p>
            Building the future, restoring the past. We are a team of dedicated professionals
            committed to excellence in construction and project management.
          </p>
        </div>
      </motion.section>

      {/* Our Story Section */}
      <section className="story-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title-underlined">Our Story</h2>
          </motion.div>

          <motion.div
            className="story-container"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <div className="story-image">
              <img
                src={backgroundImages.story}
                alt="Company office or construction site"
              />
            </div>
            <div className="story-content">
              <p>
                Founded in 2010, ArchFlow began with a simple mission: to bring
                integrity, quality, and transparency to the construction industry.
                What started as a small team of passionate builders has grown into a
                leading firm known for its innovative solutions and unwavering
                commitment to client satisfaction.
              </p>
              <p>
                Over the years, we've tackled projects of all sizes, from intricate residential renovations
                to large-scale commercial developments. Our dedication to excellence has earned us
                industry recognition and the trust of countless clients.
              </p>

              <ul className="achievements-list">
                <li><FaAward /> Over 200 successful projects completed.</li>
                <li><FaAward /> 98% client satisfaction rate.</li>
                <li><FaAward /> Winner of the 2022 National Construction Excellence Award.</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title-underlined">Why Choose Us?</h2>
            <p>Our advantages are your guarantees for a successful project.</p>
          </motion.div>

          <div className="why-choose-us-grid">
            {whyChooseUsItems.map((item, index) => (
              <motion.div
                key={index}
                className="why-choose-us-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="why-choose-us-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Start Your Project?</h2>
          <p>Let's build something amazing together. Contact us today for a free consultation.</p>
          <a href="/contact" className="cta-button">Get In Touch</a>
        </div>
      </section>
    </div>
  );
};

export default About;
