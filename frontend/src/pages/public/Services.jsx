import React, { useState, useEffect, useRef } from 'react';
import './Services.css';
import { motion, AnimatePresence } from 'framer-motion';

// Import service images
import service1 from '../../assets/images/services/service1.jpg';
import service2 from '../../assets/images/services/service2.jpg';
import service3 from '../../assets/images/services/service3.jpg';
import service4 from '../../assets/images/services/service4.jpg';
import service5 from '../../assets/images/services/service5.jpg';
import service6 from '../../assets/images/services/service6.jpg';

const ServiceCard = ({ service, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut', delay: index * 0.1 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  return (
    <motion.div
      ref={cardRef}
      className={`service-card ${isLoaded ? 'loaded' : 'loading'}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {!isLoaded && <div className="image-skeleton"></div>}
      {isInView && (
        <img
          src={service.bgImage}
          alt={service.title}
          className="service-image"
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
      <div className="service-content">
        <h3 className="service-title">{service.title}</h3>
        <p className="service-description">{service.description}</p>
      </div>
    </motion.div>
  );
};

const Services = () => {
  const services = [
    {
      id: 'res-con',
      bgImage: service1,
      title: 'Residential Construction',
      description: 'From custom homes to multi-family units, we deliver high-quality residential projects on time and within budget, ensuring your vision comes to life.'
    },
    {
      id: 'com-proj',
      bgImage: service2,
      title: 'Commercial Projects',
      description: 'We specialize in constructing state-of-the-art commercial spaces, including office buildings, retail centers, and industrial facilities.'
    },
    {
      id: 'ren-rem',
      bgImage: service3,
      title: 'Renovation & Remodeling',
      description: 'Transform your existing space with our expert renovation services. We handle everything from kitchen remodels to full-scale building makeovers.'
    },
    {
      id: 'int-des',
      bgImage: service4,
      title: 'Interior Design',
      description: 'Our in-house design team collaborates with you to create functional and aesthetically pleasing interiors that reflect your unique style and brand.'
    },
    {
      id: 'proj-man',
      bgImage: service5,
      title: 'Project Management',
      description: 'With meticulous planning and transparent communication, our project managers oversee every detail to ensure a seamless process from start to finish.'
    },
    {
      id: 'main-rep',
      bgImage: service6,
      title: 'Maintenance & Repair',
      description: 'Protect your investment with our reliable maintenance and repair services, ensuring your property remains safe, functional, and pristine.'
    }
  ];

  return (
    <div className="services-page">
      <motion.div
        className="public-page-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 className="public-page-title">Our Expertise</h1>
        <p className="public-page-subtitle">
          Expert construction and project management solutions.
        </p>
      </motion.div>

      <div className="services-grid">
        <AnimatePresence>
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Services;
