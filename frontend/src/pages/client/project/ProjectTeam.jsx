import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectTeam = () => {
    const { id } = useParams();
    return (
        <div style={{ padding: '2rem' }}>
            <h1>Project Team</h1>
            <p>Project ID: {id}</p>
            <p>Show assigned team members with role and contact information.</p>
        </div>
    );
};

export default ProjectTeam;
