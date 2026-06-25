import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Projects.css';

// Import images
import project1 from '../../assets/images/projects/project1.jpg';
import project2 from '../../assets/images/projects/project2.jpg';
import project3 from '../../assets/images/projects/project3.jpg';
import project4 from '../../assets/images/projects/project4.jpg';
import project5 from '../../assets/images/projects/project5.jpg';
import project6 from '../../assets/images/projects/project6.jpg';

const projectData = [
  { id: 1, title: 'Luxury Residential Villa', category: 'Residential', description: 'A stunning modern villa featuring bespoke interiors and state-of-the-art amenities for luxury living.', image: project1 },
  { id: 2, title: 'Commercial Office Space', category: 'Commercial', description: 'A high-performance workspace designed for collaboration, productivity, and corporate excellence.', image: project2 },
  { id: 3, title: 'Retail Store Interior Design', category: 'Interior', description: 'An immersive retail environment crafted to enhance brand identity and elevate the customer experience.', image: project3 },
  { id: 4, title: 'Modern Apartment Renovation', category: 'Renovation', description: 'Complete overhaul of a downtown apartment, focusing on open-plan living and minimalist design.', image: project4 },
  { id: 5, title: 'Duplex Construction Project', category: 'Residential', description: 'Ground-up construction of a contemporary duplex, optimized for family living and investment returns.', image: project5 },
  { id: 6, title: 'Restaurant Fit-Out Project', category: 'Interior', description: 'A unique and inviting dining space brought to life with custom fixtures and a warm, ambient atmosphere.', image: project6 },
];

const Projects = () => {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  return (
    <div className="projects-page">
      <motion.div
        className="public-page-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 className="public-page-title">Our Portfolio</h1>
        <p className="public-page-subtitle">
          Explore our featured projects designed with precision and creativity.
        </p>
      </motion.div>

      <motion.div className="projects-grid">
        <AnimatePresence>
          {projectData.map((project) => (
            <motion.div
              key={project.id}
              className="project-card"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div
                className="project-image"
                style={{ backgroundImage: `url(${project.image})` }}
              ></div>
              <div className="project-content">
                <span className="project-category">{project.category}</span>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Projects;
