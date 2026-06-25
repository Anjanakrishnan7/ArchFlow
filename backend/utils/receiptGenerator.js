const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a professional PDF receipt for a payment transaction
 * @param {Object} transaction - The transaction object populated with project and client
 * @returns {Promise<string>} - The filename of the generated PDF
 */
const generateReceipt = async (transaction) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                margin: 50,
                size: 'A4'
            });

            // Add error listener to doc itself
            doc.on('error', (err) => {
                console.error(`[PDF] Document Generation Error:`, err);
                reject(err);
            });

            // Sanitize transactionId for filename
            const safeTxId = (transaction.transactionId || 'bank_transfer').replace(/[^a-z0-9]/gi, '_');
            const filename = `receipt-${safeTxId}-${transaction._id.toString().slice(-6)}.pdf`;
            const filePath = path.join(__dirname, '../uploads/payment-proofs', filename);

            // Ensure directory exists
            const dir = path.join(__dirname, '../uploads/payment-proofs');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const stream = fs.createWriteStream(filePath);

            stream.on('error', (err) => {
                console.error(`[PDF] Stream Error for ${filename}:`, err);
                reject(err);
            });

            doc.pipe(stream);

            // === HEADER SECTION ===
            // Company branding
            doc.fontSize(28)
                .fillColor('#1a365d')
                .font('Helvetica-Bold')
                .text('ARCHFLOW', 50, 50, { align: 'center' });

            doc.fontSize(11)
                .fillColor('#4a5568')
                .font('Helvetica')
                .text('Construction Management System', { align: 'center' });

            doc.moveDown(0.5);

            // Horizontal line separator
            doc.strokeColor('#cbd5e0')
                .lineWidth(1)
                .moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .stroke();

            doc.moveDown(1);

            // === TITLE SECTION ===
            doc.fontSize(18)
                .fillColor('#2d3748')
                .font('Helvetica-Bold')
                .text('PAYMENT RECEIPT', { align: 'center' });

            doc.moveDown(2);

            // === TRANSACTION DETAILS SECTION ===
            doc.fontSize(12)
                .fillColor('#2d3748')
                .font('Helvetica-Bold')
                .text('Transaction Details', 50);

            doc.moveDown(0.5);

            // Small separator line
            doc.strokeColor('#e2e8f0')
                .lineWidth(0.5)
                .moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .stroke();

            doc.moveDown(1);

            // Details grid with proper alignment
            const leftCol = 100;
            const rightCol = 300;
            const lineHeight = 20;
            let currentY = doc.y;

            const details = [
                { label: 'Transaction ID:', value: transaction.transactionId || 'N/A' },
                { label: 'Date:', value: transaction.paidAt ? new Date(transaction.paidAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) },
                { label: 'Project Name:', value: transaction.projectId?.name || 'N/A' },
                { label: 'Client Name:', value: transaction.clientId?.fullName || 'N/A' },
                { label: 'Purpose:', value: transaction.purpose || 'N/A' },
                { label: 'Payment Method:', value: transaction.paymentMethod || 'Bank Transfer' }
            ];

            details.forEach(({ label, value }) => {
                doc.fontSize(10)
                    .fillColor('#718096')
                    .font('Helvetica')
                    .text(label, leftCol, currentY, { width: 180, align: 'left' });

                doc.fontSize(10)
                    .fillColor('#2d3748')
                    .font('Helvetica-Bold')
                    .text(value, rightCol, currentY, { width: 245 });

                currentY += lineHeight;
            });

            doc.moveDown(1);

            // === AMOUNT SECTION (Highlighted) ===
            const amountBoxY = currentY + 20;

            // Amount box background
            doc.rect(50, amountBoxY, 495, 50)
                .fillAndStroke('#f7fafc', '#e2e8f0');

            doc.fontSize(11)
                .fillColor('#718096')
                .font('Helvetica')
                .text('Total Amount Paid', leftCol, amountBoxY + 10);

            doc.fontSize(20)
                .fillColor('#1a365d')
                .font('Helvetica-Bold')
                .text(`INR ${Number(transaction.amount || 0).toLocaleString('en-IN')}`, rightCol, amountBoxY + 10);

            doc.moveDown(4);

            // === STATUS SECTION ===
            const statusY = doc.y + 20;

            doc.fontSize(13)
                .fillColor('#22c55e')
                .font('Helvetica-Bold')
                .text('VERIFIED & APPROVED', { align: 'center' });

            doc.moveDown(3);

            // === SIGNATURE & SEAL SECTION ===
            const signaturePath = path.join(__dirname, '../uploads/signatures/archflowsign.jpg');
            const sealPath = path.join(__dirname, '../uploads/signatures/archflow.seal.png');

            // Check if signature and seal exist
            const hasSignature = fs.existsSync(signaturePath);
            const hasSeal = fs.existsSync(sealPath);

            if (hasSignature || hasSeal) {
                // Ensure we have enough space on the page
                const currentY = doc.y;

                // If we're too low on the page (past 600), add a new page
                if (currentY > 600) {
                    doc.addPage();
                }

                doc.moveDown(2);
                let currentImgY = doc.y;

                // Center-aligned positioning for better visibility
                const pageWidth = 595; // A4 width in points
                const centerX = pageWidth / 2;

                if (hasSignature) {
                    try {
                        doc.fontSize(9)
                            .fillColor('#718096')
                            .font('Helvetica')
                            .text('Authorized Signature', 50, currentImgY, { width: 495, align: 'center' });

                        currentImgY += 20;

                        // Center the signature image (100px wide)
                        doc.image(signaturePath, centerX - 50, currentImgY, {
                            width: 100,
                            height: 40
                        });

                        currentImgY += 50;
                    } catch (sigError) {
                        console.error(`[PDF] Error adding signature:`, sigError);
                    }
                }

                if (hasSeal) {
                    try {
                        doc.fontSize(9)
                            .fillColor('#718096')
                            .font('Helvetica')
                            .text('Official Seal', 50, currentImgY, { width: 495, align: 'center' });

                        currentImgY += 20;

                        // Center the seal image (80px wide)
                        doc.image(sealPath, centerX - 40, currentImgY, {
                            width: 80,
                            height: 80
                        });

                        currentImgY += 90;
                    } catch (sealError) {
                        console.error(`[PDF] Error adding seal:`, sealError);
                    }
                }
            }

            // === FOOTER SECTION ===
            doc.fontSize(9)
                .fillColor('#a0aec0')
                .font('Helvetica')
                .text(
                    'This is a computer-generated receipt and does not require a physical signature.',
                    50,
                    750,
                    { align: 'center', width: 495 }
                );

            doc.fontSize(8)
                .fillColor('#cbd5e0')
                .text(
                    `Generated on ${new Date().toLocaleString('en-IN')}`,
                    50,
                    765,
                    { align: 'center', width: 495 }
                );

            doc.end();

            stream.on('finish', () => {
                resolve(filename);
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateReceipt };
