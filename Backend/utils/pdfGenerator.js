const puppeteer = require('puppeteer');

/**
 * Generates a PDF from an HTML string
 * @param {string} htmlContent - The HTML string to render
 * @returns {Promise<Buffer>} - The generated PDF as a buffer
 */
const generatePDF = async (htmlContent) => {
  let browser = null;
  try {
    // Launch a headless browser
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set the HTML content of the page
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0', // Wait for all resources (images, fonts) to load
    });

    // Generate the PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Ensure CSS backgrounds are printed
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = generatePDF;
