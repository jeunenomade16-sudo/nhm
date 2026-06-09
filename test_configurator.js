const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Paths
const workspaceDir = 'c:\\Users\\nomad\\Desktop\\nhm';
const htmlPath = path.join(workspaceDir, 'index.html');
const jsPath = path.join(workspaceDir, 'app.js');

// Load files
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
let jsContent = fs.readFileSync(jsPath, 'utf8');

// Strip DOMContentLoaded wrapper to run the script exactly once as an IIFE
jsContent = jsContent.replace("document.addEventListener('DOMContentLoaded', () => {", "(function() {");
// Replace the trailing "});" at the end of the file
const lastBraceIndex = jsContent.lastIndexOf("});");
if (lastBraceIndex !== -1) {
    jsContent = jsContent.substring(0, lastBraceIndex) + "})();" + jsContent.substring(lastBraceIndex + 3);
}

console.log('--- STARTING CONFIGURATOR INTERACTIVE TESTS ---');

// Set up JSDOM environment, removing all script tags to prevent double script execution
const cleanHtml = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
const dom = new JSDOM(cleanHtml, {
    runScripts: "dangerously",
    resources: "usable"
});

const { window } = dom;
const { document } = window;

// Inject App code (will run instantly as an IIFE)
const scriptElement = document.createElement("script");
scriptElement.textContent = jsContent;
document.body.appendChild(scriptElement);

// Helper function to click an element
function click(el) {
    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
}

// Helper function to assert values
function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

// Helper function to normalize spaces
function cleanSpaces(str) {
    return str.replace(/\s+/g, ' ').trim();
}

// Helper function to sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper state checker
function stateTopIs(val) {
    const activeTop = document.querySelector('.swatch-btn[data-type="top"].active');
    return activeTop && activeTop.getAttribute('data-value') === val;
}

// Run tests
async function runTests() {
    try {
        const tablePreview = document.getElementById('table-preview');
        const productPrice = document.getElementById('product-price');

        // 1. Initial State Check
        assert(tablePreview.src === 'charcoal_table.png', `Initial image should be charcoal_table.png, got ${tablePreview.src}`);
        assert(cleanSpaces(productPrice.textContent) === '1 890 €', `Initial price should be 1 890 €, got "${cleanSpaces(productPrice.textContent)}"`);

        // 2. Click Oak Top
        const oakBtn = document.querySelector('.swatch-btn[data-value="oak"]');
        console.log('Clicking Oak Top...');
        click(oakBtn);
        
        await sleep(250);
        
        assert(stateTopIs('oak'), 'State top should be oak');
        assert(tablePreview.src === 'oak_black.png', `Image should change to oak_black.png, got ${tablePreview.src}`);
        assert(cleanSpaces(productPrice.textContent) === '2 140 €', `Price should be 2 140 €, got "${cleanSpaces(productPrice.textContent)}"`);

        // 3. Click Brass Base
        const brassBtn = document.querySelector('.swatch-btn[data-value="brass"]');
        console.log('Clicking Brass Base...');
        click(brassBtn);
        
        await sleep(250);
        
        assert(tablePreview.src === 'oak_brass.png', `Image should change to oak_brass.png, got ${tablePreview.src}`);
        assert(cleanSpaces(productPrice.textContent) === '2 440 €', `Price should be 2 440 €, got "${cleanSpaces(productPrice.textContent)}"`);

        // 4. Click White Marble Top
        const marbleBtn = document.querySelector('.swatch-btn[data-value="marble"]');
        console.log('Clicking Marble Top...');
        click(marbleBtn);
        
        await sleep(250);
        
        assert(tablePreview.src === 'marble_brass.png', `Image should change to marble_brass.png, got ${tablePreview.src}`);
        assert(cleanSpaces(productPrice.textContent) === '2 790 €', `Price should be 2 790 €, got "${cleanSpaces(productPrice.textContent)}"`);

        // 5. Test Add to Cart Modal
        const addToCartBtn = document.getElementById('btn-add-to-cart');
        const cartBadge = document.querySelector('.cart-badge');
        const cartModal = document.getElementById('cart-modal');

        console.log('Clicking Add to Cart...');
        click(addToCartBtn);

        await sleep(1300); // Wait for simulated cart loader (1200ms)

        assert(cartBadge.textContent === '1', `Cart badge count should be 1, got ${cartBadge.textContent}`);
        assert(cartModal.classList.contains('active'), 'Cart modal should be active');
        
        console.log('🎉 ALL CONFIGURATOR INTERACTIVE TESTS PASSED SUCCESSFULLY!');
        process.exit(0);
    } catch (err) {
        console.error('Test execution threw an error:', err);
        process.exit(1);
    }
}

runTests();
