import fs from 'fs';
import path from 'path';

const docsCssPath = path.join(process.cwd(), 'docs', 'styles', 'style.css');
const customCssPath = path.join(process.cwd(), 'src', 'assets', 'docs-custom.css');

if (fs.existsSync(docsCssPath) && fs.existsSync(customCssPath)) {
    const customCss = fs.readFileSync(customCssPath, 'utf8');
    fs.appendFileSync(docsCssPath, '\n/* Custom CSS Injected by Script */\n' + customCss);
    console.log('Custom CSS appended to Compodoc style.css successfully.');
} else {
    console.error('Could not find docs/styles/style.css or src/assets/docs-custom.css');
}
