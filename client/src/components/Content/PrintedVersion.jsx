// Rewrite/client/src/components/Content/PrintedVersion.jsx
import React from 'react';
import { FaPrint, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';

const PrintedVersion = ({ lineage, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    // Function to format contributor information
    const getContributors = () => {
        const contributors = new Map();
        lineage.forEach((segment, index) => {
            if (segment.author?.username) {
                if (!contributors.has(segment.author.username)) {
                    contributors.set(segment.author.username, {
                        name: segment.author.username,
                        segments: [index + 1],
                        dates: [new Date(segment.createdAt)]
                    });
                } else {
                    const contributor = contributors.get(segment.author.username);
                    contributor.segments.push(index + 1);
                    contributor.dates.push(new Date(segment.createdAt));
                }
            }
        });
        return Array.from(contributors.values());
    };

    const contributors = getContributors();

    return (
        <div className="printed-version-modal" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <div className="printed-version-container" style={{
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '1200px',
                height: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Print Controls */}
                <div className="print-controls" style={{
                    padding: '15px 20px',
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #ddd',
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0 }}>Document Preview - Complete Narrative</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={handlePrint}
                            className="btn btn-primary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px'
                            }}
                        >
                            <FaPrint /> Print Document
                        </button>
                        <button 
                            onClick={onClose}
                            className="btn btn-secondary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px'
                            }}
                        >
                            <FaTimes /> Close
                        </button>
                    </div>
                </div>

                {/* Printed Document View */}
                <div className="printed-document-scroll" style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '20px',
                    backgroundColor: '#e5e5e5'
                }}>
                    <div className="printed-document" style={{
                        width: '21cm',
                        minHeight: '29.7cm',
                        margin: '0 auto',
                        padding: '2.54cm 3.17cm',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                        fontFamily: "'Times New Roman', Times, serif",
                        fontSize: '12pt',
                        lineHeight: '1.8',
                        color: '#000000'
                    }}>
                        {/* Title Page */}
                        <div className="title-page" style={{
                            textAlign: 'center',
                            marginBottom: '40px',
                            pageBreakAfter: 'avoid'
                        }}>
                            <h1 style={{
                                fontSize: '28pt',
                                margin: '100px 0 20px 0',
                                fontWeight: 'bold'
                            }}>
                                {lineage[0]?.title || 'Collaborative Narrative'}
                            </h1>
                            <p style={{
                                fontSize: '14pt',
                                margin: '20px 0',
                                fontStyle: 'italic'
                            }}>
                                A collaborative work by {contributors.length} contributor{contributors.length !== 1 ? 's' : ''}
                            </p>
                            <div style={{
                                marginTop: '50px',
                                fontSize: '12pt',
                                color: '#666'
                            }}>
                                <p>Generated on {format(new Date(), 'PPPP')}</p>
                            </div>
                        </div>

                        {/* Table of Contents */}
                        <div className="table-of-contents" style={{
                            marginBottom: '40px',
                            pageBreakAfter: 'avoid'
                        }}>
                            <h2 style={{
                                fontSize: '18pt',
                                borderBottom: '1px solid #333',
                                paddingBottom: '10px',
                                marginBottom: '20px'
                            }}>
                                Contents
                            </h2>
                            {lineage.map((segment, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '10px',
                                    fontSize: '11pt'
                                }}>
                                    <span>
                                        Segment {index + 1}: {segment.author?.username || 'Anonymous'}
                                        {index === 0 ? ' (Beginning)' : ''}
                                    </span>
                                    <span>Page {index + 1}</span>
                                </div>
                            ))}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '20px',
                                fontSize: '11pt',
                                fontWeight: 'bold'
                            }}>
                                <span>Contributors & Citations</span>
                                <span>Page {lineage.length + 1}</span>
                            </div>
                        </div>

                        {/* Main Content - Continuous Narrative */}
                        <div className="main-content">
                            {lineage.map((segment, index) => (
                                <div 
                                    key={segment.id}
                                    className="narrative-section"
                                    style={{
                                        marginBottom: '30px',
                                        position: 'relative'
                                    }}
                                >
                                    {/* Section Header */}
                                    <div style={{
                                        marginBottom: '15px',
                                        paddingBottom: '5px',
                                        borderBottom: '1px solid #ccc'
                                    }}>
                                        <span style={{
                                            fontSize: '11pt',
                                            color: '#666'
                                        }}>
                                            Segment {index + 1} • 
                                            <strong style={{ marginLeft: '5px', color: '#000' }}>
                                                {segment.author?.username || 'Anonymous'}
                                            </strong>
                                            {' • '}
                                            {format(new Date(segment.createdAt), 'PPP')}
                                        </span>
                                    </div>

                                    {/* Content with citation markers */}
                                    <div 
                                        className="segment-content"
                                        style={{
                                            textAlign: 'justify'
                                        }}
                                    >
                                        {/* Render HTML content with citation markers */}
                                        <div dangerouslySetInnerHTML={{ 
                                            __html: segment.text.replace(
                                                /<p>/g, 
                                                `<p><sup class="citation-marker" style="font-size: 8pt; color: #666; margin-right: 4px;">[${index + 1}]</sup>`
                                            )
                                        }} />
                                    </div>

                                    {/* Continuation marker */}
                                    {index < lineage.length - 1 && (
                                        <div style={{
                                            textAlign: 'center',
                                            margin: '20px 0',
                                            color: '#999',
                                            fontSize: '10pt',
                                            fontStyle: 'italic'
                                        }}>
                                            ✦ ✦ ✦
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Contributors and Citations Page */}
                        <div className="citations-page" style={{
                            marginTop: '50px',
                            paddingTop: '30px',
                            borderTop: '2px solid #333',
                            pageBreakBefore: 'always'
                        }}>
                            <h2 style={{
                                fontSize: '18pt',
                                marginBottom: '30px',
                                borderBottom: '1px solid #333',
                                paddingBottom: '10px'
                            }}>
                                Contributors & Citations
                            </h2>

                            {/* Contributors List */}
                            <div style={{ marginBottom: '40px' }}>
                                <h3 style={{
                                    fontSize: '14pt',
                                    marginBottom: '20px'
                                }}>
                                    Contributors
                                </h3>
                                {contributors.map((contributor, idx) => (
                                    <div key={idx} style={{
                                        marginBottom: '15px',
                                        padding: '10px',
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: '4px'
                                    }}>
                                        <strong style={{ fontSize: '13pt' }}>
                                            {contributor.name}
                                        </strong>
                                        <p style={{
                                            margin: '5px 0 0 0',
                                            fontSize: '11pt',
                                            color: '#555'
                                        }}>
                                            Contributed to segment{contributor.segments.length > 1 ? 's' : ''}: {contributor.segments.join(', ')}
                                        </p>
                                        <p style={{
                                            margin: '5px 0 0 0',
                                            fontSize: '10pt',
                                            color: '#777'
                                        }}>
                                            Contribution period: {format(Math.min(...contributor.dates), 'PPP')} to {format(Math.max(...contributor.dates), 'PPP')}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Full Citations */}
                            <div>
                                <h3 style={{
                                    fontSize: '14pt',
                                    marginBottom: '20px'
                                }}>
                                    Segment Citations
                                </h3>
                                {lineage.map((segment, index) => (
                                    <div key={segment.id} style={{
                                        marginBottom: '20px',
                                        padding: '15px',
                                        borderLeft: '3px solid #3498db'
                                    }}>
                                        <p style={{
                                            margin: '0 0 5px 0',
                                            fontSize: '11pt'
                                        }}>
                                            <strong>[{index + 1}]</strong> {segment.author?.username || 'Anonymous'}, 
                                            <span style={{ color: '#666' }}>
                                                {' '}"{segment.title || 'Untitled'}", 
                                            </span>
                                            <span style={{ fontStyle: 'italic' }}>
                                                {' '}Collaborative Narrative,
                                            </span>
                                            <span style={{ color: '#666' }}>
                                                {' '}created {format(new Date(segment.createdAt), 'PPP')}
                                            </span>
                                        </p>
                                        {/* Preview of content */}
                                        <div style={{
                                            margin: '10px 0 0 20px',
                                            fontSize: '10pt',
                                            color: '#555',
                                            borderLeft: '2px solid #eee',
                                            paddingLeft: '10px'
                                        }}>
                                                            <div dangerouslySetInnerHTML={{ 
                                                __html: segment.text.length > 200 
                                                    ? segment.text.substring(0, 200) + '...' 
                                                    : segment.text 
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Citation Summary */}
                            <div style={{
                                marginTop: '40px',
                                padding: '20px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px',
                                textAlign: 'center'
                            }}>
                                <p style={{ margin: 0, fontSize: '11pt' }}>
                                    This document contains {lineage.length} segments contributed by {contributors.length} author{contributors.length !== 1 ? 's' : ''}.
                                    Each citation marker [n] in the text corresponds to the full citation above.
                                </p>
                            </div>
                        </div>

                        {/* Document Footer */}
                        <div className="document-footer" style={{
                            marginTop: '50px',
                            paddingTop: '20px',
                            borderTop: '1px solid #ccc',
                            fontSize: '10pt',
                            color: '#666',
                            textAlign: 'center'
                        }}>
                            <p>
                                Complete narrative • {lineage.length} segment{lineage.length !== 1 ? 's' : ''} • 
                                {contributors.length} contributor{contributors.length !== 1 ? 's' : ''}
                            </p>
                            <p>Generated on {format(new Date(), 'PPPP p')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print-specific styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printed-document, .printed-document * {
                        visibility: visible;
                    }
                    .printed-document {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 2.54cm 3.17cm !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        background: white !important;
                    }
                    .print-controls {
                        display: none !important;
                    }
                    .printed-document-scroll {
                        padding: 0 !important;
                        background: white !important;
                        overflow: visible !important;
                    }
                    .printed-version-modal {
                        background: white !important;
                        position: absolute !important;
                        padding: 0 !important;
                    }
                    .printed-version-container {
                        width: 100% !important;
                        height: auto !important;
                        box-shadow: none !important;
                    }
                    
                    /* Citation markers in print */
                    .citation-marker {
                        font-size: 8pt !important;
                        color: #000 !important;
                        font-weight: normal !important;
                    }
                    
                    /* Ensure proper page breaks */
                    .citations-page {
                        page-break-before: always;
                    }
                    
                    .title-page {
                        page-break-after: avoid;
                    }
                    
                    .table-of-contents {
                        page-break-after: avoid;
                    }
                    
                    /* Avoid breaking segments across pages */
                    .narrative-section {
                        page-break-inside: avoid;
                    }
                    
                    /* Font adjustments for print */
                    body, .printed-document {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    /* Ensure links don't show URLs in print */
                    a {
                        text-decoration: none;
                        color: #000;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrintedVersion;