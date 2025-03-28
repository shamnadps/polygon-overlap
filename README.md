# Parking Zones Overlap Visualizer

This project visualizes parking zones stored in a GeoJSON format (`zones.json`) and identifies overlapping zones. It consists of two main pages:

- **index.html**: Displays all zones on a canvas and lists overlapping pairs as clickable links.
- **overlap.html**: Shows a detailed view of two overlapping zones with their intersection highlighted and a legend.

---

## Features

- **Main Page (index.html)**: Renders all parking zones in blue and provides links to overlapping pairs.
- **Detail Page (overlap.html)**: Displays two zones (blue and red) with their overlapping area in yellow, accompanied by a legend.
- **Overlap Detection**: Uses Turf.js to accurately detect and calculate polygon intersections.
- **Canvas Visualization**: Polygons are normalized and drawn on an HTML5 canvas for easy viewing.

---

## Project Structure
/polygons/
├── zones.json        # GeoJSON file containing parking zone data
├── index.html       # Main page showing all zones and overlap links
├── overlap.html     # Detail page for overlapping zones
├── script.js        # Shared JavaScript logic for drawing and overlap detection
└── README.md        # This file

---

## Prerequisites

- **Node.js**: Required to run a local server (e.g., `http-server`).
- **Browser**: A modern browser (e.g., Chrome, Firefox) with JavaScript enabled.
- **Internet Access**: To load Turf.js from a CDN (optional if bundled locally).

---

## Setup Instructions

### Clone or Download
Clone this repository or download the files to a local directory (e.g., `/Users/shamnad.shaji/personal/polygons/`).

### Install a Local Server
Install `http-server` globally via npm:

```bash
npm install -g http-server
```

### Prepare `zones.json`

Ensure your `zones.json` file is in the project directory and follows the GeoJSON MultiPolygon format. Below is an example structure:

```json
[
    {
        "name": "ZoneName",
        "area": {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [
                        [longitude1, latitude1],
                        [longitude2, latitude2],
                        [longitude3, latitude3],
                        [longitude1, latitude1]
                    ]
                ]
            ]
        }
    }
]
```
Example zones are provided in the code comments.

### Start the Server

1. Navigate to the project directory:

   ```bash
   cd /Users/shamnad.shaji/personal/polygons
   ```

2. Start the server using the following command:
  ```bash
  npx http-server -o --cors
  ```

3. The server will start, typically at http://localhost:8080.

## Usage

### View All Zones

1. Open your browser and go to [http://localhost:8080/index.html](http://localhost:8080/index.html).
2. All zones from `zones.json` will be drawn in blue on the canvas.
3. Below the canvas, a list of overlapping zone pairs will appear as clickable links.

### View Overlapping Zones

1. Click an overlap link (e.g., "Iso-Erottaja overlaps with ZoneB").
2. A new window will open at `overlap.html` showing:
   - The first zone in blue.
   - The second zone in red.
   - The overlapping area in yellow (if present).
   - A legend on the right identifying each color.

## Debugging

- Open the browser console (F12 > Console) to see logs:
  - Overlap detection results.
  - Raw coordinates and intersection details.

## Implementation Details

### Libraries
- **Turf.js**: Used for geospatial calculations (overlap detection and intersection).
  - Loaded via CDN:  
    ```html
    <script src="https://cdn.jsdelivr.net/npm/@turf/turf@6/turf.min.js"></script>
    ```
- **HTML5 Canvas**: Used for rendering polygons and the legend.

### Overlap Detection
- `doPolygonsOverlap` uses `turf.intersect` to check if two polygons overlap.
- False positives are minimized, but tiny overlaps (e.g., single points) might not be visible.

### Normalization
- `normalizeCoords` scales polygon coordinates to fit the canvas, leaving space for the legend in `overlap.html`.

### Colors
- **index.html**: All zones are blue.
- **overlap.html**:
  - First zone: Blue.
  - Second zone: Red.
  - Overlap: Yellow.

### Normalization

- `normalizeCoords` scales polygon coordinates to fit the canvas, leaving space for the legend in `overlap.html`.

### Colors

- **index.html**: All zones are blue.
- **overlap.html**:
  - First zone: Blue.
  - Second zone: Red.
  - Overlap: Yellow.

### Troubleshooting

#### "Failed to fetch zones.json"
- Ensure `zones.json` is in the project directory and the server is running.
- Check the browser console for HTTP errors (e.g., 404) and verify the file path.

#### Legends Missing
- Verify the canvas width (1000px in `overlap.html`) and the legend position (`canvas.width - 180`).
- Check the console logs for zone names and errors.

#### Polygons Don’t Overlap
If polygons are listed as overlapping but not visually overlapping:
1. Check the console logs for intersection coordinates.
2. Verify the `zones.json` coordinates—polygons might not intersect as expected.
3. Adjust the overlap threshold in `doPolygonsOverlap` if needed:

   ```javascript
   const area = turf.area(intersect);
   return area > 0.0001; // Minimum area in square meters