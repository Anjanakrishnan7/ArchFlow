/**
 * Image Helper Utility
 * Centralizes image imports for easier management
 */

// Service Images
import architectureImg from '../assets/images/services/service1.jpg';
import constructionImg from '../assets/images/services/service2.jpg';
import interiorImg from '../assets/images/services/service3.jpg';
import renovationImg from '../assets/images/services/service4.jpg';

// Project Images
import project1 from '../assets/images/projects/project1.jpg';
import project2 from '../assets/images/projects/project2.jpg';
import project3 from '../assets/images/projects/project3.jpg';


import aboutBg from '../assets/images/backgrounds/about-bg.jpg';
import storyImg from '../assets/images/backgrounds/story.jpg';

// ... (rest of imports)

export const backgroundImages = {
    about: aboutBg,
    story: storyImg,
};
export const serviceImages = {
    architecture: architectureImg,
    construction: constructionImg,
    interior: interiorImg,
    renovation: renovationImg,
};

export const projectImages = {
    project1,
    project2,
    project3,
};





// Helper function to get image by name
export const getServiceImage = (serviceName) => {
    return serviceImages[serviceName] || null;
};

export const getProjectImage = (projectName) => {
    return projectImages[projectName] || null;
};
