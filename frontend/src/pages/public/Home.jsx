import FeatureCard from '../../components/FeatureCard';
import { FaCalendarAlt, FaTasks, FaUsers } from 'react-icons/fa';
import { RiRobot2Fill } from 'react-icons/ri';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: <FaCalendarAlt className="feature-icon" />,
      title: 'Visual Schedule',
      description: 'Plan and track your construction projects with visual schedules and timelines.',
    },
    {
      icon: <FaTasks className="feature-icon" />,
      title: 'Task Management',
      description: 'Organize and manage tasks efficiently with our comprehensive task management system.',
    },
    {
      icon: <FaUsers className="feature-icon" />,
      title: 'Team Collaboration',
      description: 'Collaborate seamlessly with your team members and stakeholders.',
    },
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            <span className="hero-title-white">Welcome to </span>
            ArchFlow
          </h1>
          <p>
            The all-in-one platform for managing construction projects from start to finish.
          </p>
          <a href="/register" className="btn-hero">Get Started</a>
        </div>
      </section>

      <section className="features-section">

        <div className="features-wrapper">

          <div className="features-grid">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;