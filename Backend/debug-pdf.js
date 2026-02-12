import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

console.log('Type of pdf:', typeof pdf);
console.log('Keys of pdf:', Object.keys(pdf));
if (typeof pdf.PDFParse === 'function') {
    console.log('pdf.PDFParse is a function/class');
    try {
        const instance = new pdf.PDFParse(Buffer.from([]));
        console.log('Instance created successfully');
        console.log('Instance keys:', Object.keys(Object.getPrototypeOf(instance)));
    } catch (e) {
        console.log('Error creating instance:', e.message);
    }
}


