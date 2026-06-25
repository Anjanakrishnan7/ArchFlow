import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import { backgroundImages } from '../../utils/imageHelper';
import './Contact.css';

const Contact = () => {
  const contactInfoItems = [
    { icon: <FaMapMarkerAlt />, title: 'Our Office', text: '123 Construction St, Building City, BC 12345' },
    { icon: <FaEnvelope />, title: 'Email Us', text: 'info@projectplanner.com' },
    { icon: <FaPhoneAlt />, title: 'Call Us', text: '+1 (555) 123-4567' },
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };

  return (
    <div className="contact-page">
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
          <h1>Contact Us</h1>
          <p>We&apos;re here to help and answer any question you might have. We look forward to hearing from you.</p>
        </div>
      </motion.section>

      {/* Contact Info Section */}
      <section className="contact-main-section">
        <div className="container contact-form-container">
          <motion.div
            className="contact-details-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            style={{ width: '100%', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}
          >
            <h2 className="section-title-underlined">Get In Touch</h2>
            <p>Have a question or a project in mind? Contact us through the details below.</p>
            <div className="info-stack">
              {contactInfoItems.map((item, index) => (
                <div key={index} className="info-card-stacked" style={{ textAlign: 'left' }}>
                  <div className="info-icon">{item.icon}</div>
                  <div className="info-text-content">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
