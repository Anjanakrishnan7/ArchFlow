import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectPayments = () => {
    const { id } = useParams();
    return (
        <div style={{ padding: '2rem' }}>
            <h1>Project Payments</h1>
            <p>Project ID: {id}</p>
            <p>This page will show payment history, paid amount, pending balance, and allow receipt uploads.</p>
        </div>
    );
};

export default ProjectPayments;
