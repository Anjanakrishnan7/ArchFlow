import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectDocuments = () => {
    const { id } = useParams();
    return (
        <div style={{ padding: '2rem' }}>
            <h1>Project Documents</h1>
            <p>Project ID: {id}</p>
            <p>Client can upload/download documents (PDF, drawings, etc.).</p>
        </div>
    );
};

export default ProjectDocuments;
