const fs = require('fs');
const path = require('path');

const dir = 'c:/experiments/fretmaster/public/soundfonts';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    try {
      // Use a function constructor to create a scope where var MIDI can be redefined
      const fn = new Function('content', 'var MIDI; ' + content + '; return MIDI;');
      const MIDI = fn(content);
      
      // Find the key in MIDI.Soundfont
      const keys = Object.keys(MIDI.Soundfont);
      if (keys.length > 0) {
        const instrumentData = MIDI.Soundfont[keys[0]];
        const jsonContent = JSON.stringify(instrumentData);
        const newFile = file.replace('.js', '.json');
        fs.writeFileSync(path.join(dir, newFile), jsonContent);
        console.log(`Converted ${file} to ${newFile}`);
      }
    } catch (e) {
      console.error(`Failed to eval/convert ${file}: ${e.message}`);
    }
  }
});
