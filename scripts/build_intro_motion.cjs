/* Export review samples with the exact continuous renderer used in the app. */
const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const dom=new JSDOM('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 260"></svg>',{runScripts:'outside-only'});
for(const file of ['intro-frames.js','intro-motion.js'])dom.window.eval(fs.readFileSync(path.join(root,file),'utf8'));
const svg=dom.window.document.querySelector('svg'),renderer=dom.window.BambooMotion.createRenderer(svg);
for(const ms of [0,200,500,750,1050,1350,1650,1800]){renderer.render(ms);fs.writeFileSync(path.join(root,'assets/intro',`motion-${String(ms).padStart(4,'0')}.svg`),svg.outerHTML);}
dom.window.close();
console.log('Exported eight samples from the continuous 1800ms renderer.');
