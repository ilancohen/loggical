# Loggical Interactive Playground

The ultimate hands-on experience for exploring Loggical's features! Configure logger settings in real-time and see immediate results with live preview.

## 📁 File Structure

```
playground/
├── index.html          # Main playground interface
├── styles.css          # All styling and ANSI color classes
├── playground.js       # Interactive functionality and logger logic
└── README.md          # This file
```

## 🚀 Features

### Quick Actions

- **Basic Logger Demo**: Pre-configured buttons to test different log levels
- **Real-time Console Output**: See the logger in action immediately

### Interactive Playground

- **Custom Messages**: Write your own log messages
- **Log Level Selection**: Choose from DEBUG, INFO, WARN, ERROR, HIGHLIGHT, FATAL
- **Colorization Control**: Toggle between None, Basic, and Enhanced color levels
- **Prefix Customization**: Add custom prefixes to identify log sources
- **Format Options**: Configure timestamps, symbols, object formatting, and more
- **Preset Configurations**: Quick buttons for Standard, Compact, Readable, and Server presets

### Live Preview

- **ANSI to HTML Conversion**: See exactly how colored logs will appear
- **Real-time Updates**: Preview changes as you modify settings (no console spam!)
- **Smart Color Handling**: Shows plain text for "None" color level, colored output for others

## 🎯 How to Use

1. **Start a local server** in the project root:

   ```bash
   python3 -m http.server 8000
   ```

2. **Open your browser** and navigate to:

   ```
   http://localhost:8000/examples/playground/
   ```

3. **Try the quick actions** to see basic logger functionality

4. **Experiment with the playground**:
   - Customize your message and settings
   - Watch the preview update in real-time
   - Click "🚀 Try It Out!" to actually log to the browser console
   - Try different presets to see various configurations

## 🎨 Color Support

The playground includes full ANSI color support with proper HTML rendering:

- **18 color variants** (standard and bright colors)
- **Bold and dim text** styling
- **Smart color stripping** for "None" color level
- **Terminal-style dark theme** for authentic preview experience

## 🔧 Technical Details

### CSS (`styles.css`)

- Modern, responsive design
- Complete ANSI color class definitions
- Dark terminal-style output area
- Smooth animations and hover effects

### JavaScript (`playground.js`)

- Modular ES6 structure with clear sections
- ANSI escape code to HTML conversion
- Console output capture for preview (no console pollution)
- Debounced real-time updates
- Comprehensive error handling

### HTML (`index.html`)

- Clean semantic structure
- External resource linking
- Accessible form controls
- Modern HTML5 structure

## 🎮 Playground Sections

1. **Basic Example**: Simple demonstration buttons
2. **Configuration**: Form controls for all logger options
3. **Presets**: Quick configuration switching
4. **Preview**: Real-time output visualization
5. **Console Logging**: Actual logger output on button click

This playground provides a comprehensive way to explore Loggical's capabilities without writing any code!
