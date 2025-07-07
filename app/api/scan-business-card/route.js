// File: app/api/scan-business-card/route.js npm install jsqr sharp

import { NextResponse } from 'next/server';
import jsQR from 'jsqr';
import sharp from 'sharp';

// --- Helper function to decode QR codes from the image buffer ---
async function decodeQrCode(imageBase64) {
    try {
        const buffer = Buffer.from(imageBase64, 'base64');
        const { data, info } = await sharp(buffer)
            .raw()
            .toBuffer({ resolveWithObject: true });

        const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
        
        if (code && code.data) {
            console.log("✅ QR Code Detected! Data:", code.data);
            return code.data;
        }
        return null;
    } catch (error) {
        console.error("QR Code decoding failed:", error);
        return null;
    }
}

// --- The new, intelligent text parser ---
function parseBusinessCardText(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    let parsedFields = [];
    let usedLines = new Set(); // Keep track of lines we've already parsed

    const fieldPatterns = [
        { label: 'Email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i, type: 'standard' },
        { label: 'Phone', regex: /(?:(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?)/, type: 'standard' },
        { label: 'Website', regex: /\b(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i, type: 'social' },
        { label: 'LinkedIn', regex: /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i, type: 'social' },
        { label: 'Twitter', regex: /twitter\.com\/[a-zA-Z0-9_]+/i, type: 'social' },
    ];
    
    // --- Step 1: Extract data using RegEx patterns ---
    lines.forEach((line, index) => {
        for (const pattern of fieldPatterns) {
            const match = line.match(pattern.regex);
            if (match && match[0].length > 4) { // Basic check to avoid tiny false positives
                // Avoid re-adding the same email/website if it appears in multiple regexes
                if (!parsedFields.some(f => f.value === match[0])) {
                    parsedFields.push({
                        label: pattern.label,
                        value: match[0],
                        type: pattern.type
                    });
                    usedLines.add(index);
                }
            }
        }
    });

    // --- Step 2: Attempt to find Name and Company from remaining lines ---
    const remainingLines = lines.filter((_, index) => !usedLines.has(index));
    
    // Assume the first remaining line is the Name
    if (remainingLines.length > 0) {
        parsedFields.unshift({ label: 'Name', value: remainingLines[0], type: 'standard' });
        usedLines.add(lines.indexOf(remainingLines[0]));
    }
    
    // Assume the second remaining line might be Company/Title
    if (remainingLines.length > 1) {
        parsedFields.push({ label: 'Company/Title', value: remainingLines[1], type: 'custom' });
        usedLines.add(lines.indexOf(remainingLines[1]));
    }
    
    // Add any other remaining lines as generic "Note" fields
    lines.forEach((line, index) => {
        if (!usedLines.has(index)) {
             parsedFields.push({ label: 'Note', value: line, type: 'custom' });
        }
    });

    return parsedFields;
}


// --- Main API Handler ---
export async function POST(request) {
    try {
        const { imageBase64 } = await request.json();
        if (!imageBase64) {
            return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
        }

        const rawBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        
        // --- Step 1: Decode QR Code in parallel ---
        const qrCodePromise = decodeQrCode(rawBase64);

        // --- Step 2: Call Google Vision API for Text Detection ---
        const visionResponsePromise = fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_VISION_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [{
                    image: { content: rawBase64 },
                    features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
                }]
            })
        });

        // --- Step 3: Wait for both promises to resolve ---
        const [qrData, visionResponse] = await Promise.all([qrCodePromise, visionResponsePromise]);
        
        const visionData = await visionResponse.json();

        if (visionData.error) {
            console.error('Google Vision API Error:', visionData.error);
            return NextResponse.json({ success: false, error: visionData.error.message }, { status: 400 });
        }

        let parsedFields = [];
        if (visionData.responses && visionData.responses[0] && visionData.responses[0].fullTextAnnotation) {
            const extractedText = visionData.responses[0].fullTextAnnotation.text;
            parsedFields = parseBusinessCardText(extractedText);
        }
        
        // --- Step 4: Add the QR code data if it was found ---
        if (qrData) {
            parsedFields.unshift({ // Add to the top of the list
                label: 'QR Code',
                value: qrData,
                type: 'custom'
            });
        }
        
        if (parsedFields.length === 0) {
             return NextResponse.json({ success: false, error: 'No text or QR code was detected.' }, { status: 400 });
        }

        // --- Final Success Response ---
        return NextResponse.json({ 
            success: true,
            // We now return an array of field objects, not a single object
            parsedFields: parsedFields
        });
        
    } catch (error) {
        console.error('Error in /api/scan-business-card:', error);
        return NextResponse.json({ error: 'Failed to process image.' }, { status: 500 });
    }
}