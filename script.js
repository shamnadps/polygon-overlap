// Function to normalize coordinates to canvas
function normalizeCoords(coords, canvasWidth, canvasHeight) {
  const allX = coords.flat().map(c => c[0]);
  const allY = coords.flat().map(c => c[1]);
  const minX = Math.min(...allX), maxX = Math.max(...allX);
  const minY = Math.min(...allY), maxY = Math.max(...allY);

  return coords.map(polygon =>
      polygon.map(point => [
          ((point[0] - minX) / (maxX - minX)) * (canvasWidth - 200) + 50,
          ((maxY - point[1]) / (maxY - minY)) * (canvasHeight - 100) + 50
      ])
  );
}

// Function to draw a polygon on canvas
function drawPolygon(ctx, coords, color, fill = false) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  coords.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
  });
  ctx.closePath();
  if (fill) ctx.fill();
  else ctx.stroke();
}

// Function to check if two polygons overlap using Turf.js
function doPolygonsOverlap(poly1, poly2) {
  const geo1 = { type: 'Polygon', coordinates: [poly1] };
  const geo2 = { type: 'Polygon', coordinates: [poly2] };
  const intersect = turf.intersect(geo1, geo2);
  if (intersect) {
      const area = turf.area(intersect);
      console.log('Intersection area:', area);
      return area > 0.0001; // Adjust threshold (in square meters)
  }
  return false;
}

// Function to get the exact intersection coordinates using Turf.js
function getIntersectionCoords(poly1, poly2) {
  const geo1 = { type: 'Polygon', coordinates: [poly1] };
  const geo2 = { type: 'Polygon', coordinates: [poly2] };
  const intersect = turf.intersect(geo1, geo2);
  return intersect ? intersect.geometry.coordinates[0] : [];
}

// Draw all zones on the main page
function drawAllZones(zones) {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const allCoords = zones.map(z => z.area.coordinates[0][0]);
  const normalized = normalizeCoords(allCoords, canvas.width, canvas.height);

  zones.forEach((zone, i) => {
      drawPolygon(ctx, normalized[i], 'blue');
  });
}

// List overlapping zones with links
function listOverlappingZones(zones) {
  const list = document.getElementById('overlapList');
  const overlaps = [];
  for (let i = 0; i < zones.length; i++) {
      for (let j = i + 1; j < zones.length; j++) {
          const poly1 = zones[i].area.coordinates[0][0];
          const poly2 = zones[j].area.coordinates[0][0];
          if (doPolygonsOverlap(poly1, poly2)) {
              overlaps.push([zones[i].name, zones[j].name]);
          }
      }
  }

  overlaps.forEach(([name1, name2]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `overlap.html?zone1=${encodeURIComponent(name1)}&zone2=${encodeURIComponent(name2)}`;
      a.target = '_blank';
      a.textContent = `${name1} overlaps with ${name2}`;
      li.appendChild(a);
      list.appendChild(li);
  });
}

// Draw overlapping zones in the detail page with legend
function drawOverlappingZones(zone1, zone2) {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const coords1 = zone1.area.coordinates[0][0];
  const coords2 = zone2.area.coordinates[0][0];
  const intersection = getIntersectionCoords(coords1, coords2);
  console.log('Zone1 coords:', coords1);
  console.log('Zone2 coords:', coords2);
  console.log('Intersection coords:', intersection);

  const allCoords = [coords1, coords2, intersection].filter(c => c.length > 0);
  const normalized = normalizeCoords(allCoords, canvas.width, canvas.height);

  // Draw zone1 in blue
  drawPolygon(ctx, normalized[0], 'blue');
  // Draw zone2 in red
  drawPolygon(ctx, normalized[1], 'red');
  // Highlight intersection in yellow (filled)
  if (normalized[2]) {
      drawPolygon(ctx, normalized[2], 'yellow', true);
  } else {
      console.log('No visible overlap - intersection is empty or too small.');
  }

  // Draw legend on the right
  ctx.font = '16px Arial';
  ctx.fillStyle = 'black';
  const legendX = 50;
  console.log('Drawing legend at x:', legendX);

  ctx.fillText('Legend:', legendX, 50);
  ctx.fillStyle = 'blue';
  ctx.fillRect(legendX, 70, 20, 20);
  ctx.fillStyle = 'black';
  ctx.fillText(zone1.name, legendX + 30, 85);

  ctx.fillStyle = 'red';
  ctx.fillRect(legendX, 100, 20, 20);
  ctx.fillStyle = 'black';
  ctx.fillText(zone2.name, legendX + 30, 115);

  ctx.fillStyle = 'yellow';
  ctx.fillRect(legendX, 130, 20, 20);
  ctx.fillStyle = 'black';
  ctx.fillText('Overlap', legendX + 30, 145);
}