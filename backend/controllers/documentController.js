const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

exports.uploadDocument = async (req, res) => {
    try {
        const { projectId, title, description } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        if (!projectId || !title) {
            fs.unlinkSync(file.path);
            return res.status(400).json({ success: false, message: 'ProjectId and title are required' });
        }

        // Construct fileUrl based on the uploaded file path
        const fileUrl = `/uploads/${file.path.split('uploads')[1].replace(/\\/g, '/').substring(1)}`;

        const newDocument = new Document({
            projectId,
            title,
            description,
            fileName: req.file.originalname,
            fileUrl: fileUrl,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            uploadedBy: req.user.id // Assuming req.user.id is available from middleware
        });

        await newDocument.save();
        res.status(201).json({ success: true, document: newDocument });
    } catch (error) {
        console.error('Error uploading document:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path); // Clean up uploaded file on error
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getProjectDocuments = async (req, res) => {
    try {
        const { projectId } = req.params;
        const documents = await Document.find({ projectId })
            .select('-status')
            .populate('uploadedBy', 'fullName')
            .sort({ uploadedAt: -1 });

        res.status(200).json({
            success: true,
            documents
        });
    } catch (error) {
        console.error('Error in getProjectDocuments:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Check ownership (Clients can only delete their own)
        if (req.user.role === 'client' && document.uploadedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this document' });
        }

        // Remove file from filesystem
        const filePath = path.join(__dirname, '..', document.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Document.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error in deleteDocument:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
