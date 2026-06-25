import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectMinutes = () => {
    const { id } = useParams();
    return (
        <div style={{ padding: '2rem' }}>
            <h1>Project Minutes</h1>
            <p>Project ID: {id}</p>
            <p>View work minutes created by staff (Read-only, sorted by latest first).</p>
        </div>
    );
};

export default ProjectMinutes;
