const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'sections', 'GameGuideSection.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace guideConfig with data inside the function body
content = content.replace(/guideConfig\?/g, 'data?');
content = content.replace(/guideConfig\./g, 'data.');

fs.writeFileSync(file, content);
console.log('Fixed GameGuideSection parameters');
