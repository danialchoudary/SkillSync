import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

/**
 * Extracts text content from a PDF URL or local path.
 * @param {string} pdfUrl - URL or local path of the PDF file.
 * @returns {Promise<string>} - Extracted text.
 */
export async function extractTextFromPdf(pdfUrl) {
    if (!pdfUrl) return '';
    try {
        let buffer;
        if (pdfUrl.startsWith('http')) {
            const response = await fetch(pdfUrl);

            if (!response.ok) {
                console.error(
                    `[PDF Utils] Failed to fetch PDF. Status: ${response.status} ${response.statusText}`,
                );
                if (response.status === 401 && pdfUrl.includes('cloudinary')) {
                    console.warn(
                        '[PDF Utils] Possible Cloudinary security restriction. Ensure asset is public or re-upload as "raw" resource.',
                    );
                }
                return '';
            }

            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else {
            buffer = await fs.readFile(absolutePath);
        }

        if (buffer.length === 0) {
            console.error('[PDF Utils] PDF buffer is empty.');
            return '';
        }

        const instance = new pdf.PDFParse({ data: buffer });
        const data = await instance.getText();
        return data.text;
    } catch (error) {
        console.error('[PDF Utils] PDF extraction error:', error);
        return '';
    }
}
