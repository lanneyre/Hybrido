// @ts-nocheck

// --- Helper function to parse Markdown for docx ---

const parseMarkdownForDocx = (markdown, docx) => {
    // This function receives the 'docx' library object as a parameter
    // to avoid direct access to the global 'window' object.
    const { Paragraph, TextRun, HeadingLevel } = docx;

    // Helper to process inline markdown (bold, italics) within a single line of text.
    // It splits the text by markdown syntax and creates an array of TextRun objects.
    const createRunsFromMarkdown = (text: string): any[] => {
        const children: any[] = [];
        // Split by bold/italic markdown, keeping the delimiters for processing.
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);
        
        parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                // It's a bold part.
                children.push(new TextRun({ text: part.slice(2, -2), bold: true }));
            } else if (part.startsWith('*') && part.endsWith('*')) {
                // It's an italic part.
                children.push(new TextRun({ text: part.slice(1, -1), italics: true }));
            } else if (part) {
                // It's a regular text part.
                children.push(new TextRun(part));
            }
        });
        return children;
    };

    const paragraphs = [];
    const lines = markdown.split('\n');

    for (const line of lines) {
        if (line.startsWith('## ')) {
            const content = line.substring(3);
            paragraphs.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: createRunsFromMarkdown(content) }));
        } else if (line.startsWith('### ')) {
            const content = line.substring(4);
            paragraphs.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: createRunsFromMarkdown(content) }));
        } else if (line.startsWith('* ') || line.startsWith('- ')) {
            const content = line.substring(2);
            paragraphs.push(new Paragraph({ bullet: { level: 0 }, children: createRunsFromMarkdown(content) }));
        } else if (line.trim() === '') {
            // Handle empty lines for spacing.
            paragraphs.push(new Paragraph({ children: [new TextRun('')] }));
        } else {
            // It's a regular paragraph.
            paragraphs.push(new Paragraph({ children: createRunsFromMarkdown(line) }));
        }
    }
    return paragraphs;
};


// --- Export Functions ---

export const exportAsPdf = (content, filename) => {
    if (typeof window.jspdf === 'undefined') {
        console.error("jsPDF library is not loaded.");
        alert("La bibliothèque d'exportation PDF n'est pas chargée. Veuillez réessayer.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const margin = 15;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    const baseLineHeight = 7; // Corresponds to font size 12 with some spacing
    
    let cursorY = margin;

    const checkPageBreak = (neededHeight = baseLineHeight) => {
        if (cursorY + neededHeight > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
        }
    };

    const originalLines = content.split('\n');

    originalLines.forEach(line => {
        let text = line;
        let style = 'normal';
        let size = 12;
        let indent = 0;

        if (line.startsWith('## ')) {
            text = line.substring(3);
            style = 'bold';
            size = 16;
        } else if (line.startsWith('### ')) {
            text = line.substring(4);
            style = 'bold';
            size = 14;
        } else if (line.startsWith('* ') || line.startsWith('- ')) {
            text = `• ${line.substring(2)}`;
            indent = 5; // Indent list items
        }

        // Simple bold/italic stripping, as mixed styles on one line are complex with jsPDF's basic API.
        text = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
        
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
        
        const wrappedLines = doc.splitTextToSize(text, contentWidth - indent);
        // A more dynamic line height based on font size.
        const lineHeight = size * 0.5;

        wrappedLines.forEach(wrappedLine => {
            checkPageBreak(lineHeight);
            doc.text(wrappedLine, margin + indent, cursorY);
            cursorY += lineHeight;
        });

        // Add extra space after headings or for blank lines
        if (line.startsWith('## ')) {
            cursorY += 4;
        } else if (line.startsWith('### ')) {
            cursorY += 2;
        } else if (line.trim() === '') {
            cursorY += baseLineHeight / 2;
        }
        checkPageBreak(0); // Check if the added space pushed us over
    });

    doc.save(`${filename}.pdf`);
};

export const exportAsDocx = (content, filename) => {
    const docx = window.docx;
    if (typeof docx === 'undefined') {
        console.error("docx library is not loaded.");
        alert("La bibliothèque d'exportation DOCX n'est pas chargée. Veuillez réessayer.");
        return;
    }

    const { Document, Packer } = docx;
    
    const doc = new Document({
        sections: [{
            properties: {},
            children: parseMarkdownForDocx(content, docx),
        }],
    });

    Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.docx`;
        document.body.appendChild(a); // Append for compatibility
        a.click();
        document.body.removeChild(a); // Clean up
        URL.revokeObjectURL(url);
    });
};

export const exportAsJson = (data, filename) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const exportAsXlsx = (data, filename) => {
    if (typeof window.XLSX === 'undefined') {
        console.error("XLSX library is not loaded.");
        alert("La bibliothèque d'exportation Excel n'est pas chargée. Veuillez réessayer.");
        return;
    }
    
    const XLSX = window.XLSX;
    let worksheet;

    if (data.quiz) { // Handle quiz structure
        const quizData = data.quiz.map(q => ({
            Question: q.question,
            Type: q.type,
            Options: (q.options || []).join(', '),
            Réponse: q.answer,
            Explication: q.explanation
        }));
        worksheet = XLSX.utils.json_to_sheet(quizData);
    } else if (data.glossary) { // Handle glossary structure
        const glossaryData = data.glossary.map(item => ({
            Terme: item.term,
            Définition: item.definition
        }));
        worksheet = XLSX.utils.json_to_sheet(glossaryData);
    } else {
        console.error("Unsupported data structure for XLSX export");
        return;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ressource");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};
