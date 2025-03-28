// Function to normalize coordinates to canvas
function normalizeCoords(coords, canvasWidth, canvasHeight) {
  const allX = coords.flat().map(c => c[0]);
  const allY = coords.flat().map(c => c[1]);
  const minX = Math.min(...allX), maxX = Math.max(...allX);
  const minY = Math.min(...allY), maxY = Math.max(...allY);

  return coords.map(polygon =>
      polygon.map(point => [
          ((point[0] - minX) / (maxX - minX)) * (canvasWidth - 100) + 50,
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

// Function to get bounding box
function getBoundingBox(coords) {
  const x = coords.map(c => c[0]);
  const y = coords.map(c => c[1]);
  return {
      minX: Math.min(...x), maxX: Math.max(...x),
      minY: Math.min(...y), maxY: Math.max(...y)
  };
}

// Function to check if two polygons overlap (bounding box method)
function doPolygonsOverlap(poly1, poly2) {
  const bb1 = getBoundingBox(poly1);
  const bb2 = getBoundingBox(poly2);
  return bb1.minX < bb2.maxX && bb1.maxX > bb2.minX &&
         bb1.minY < bb2.maxY && bb1.maxY > bb2.minY;
}

// Function to approximate intersection coordinates (bounding box)
function getIntersectionCoords(poly1, poly2) {
  const bb1 = getBoundingBox(poly1);
  const bb2 = getBoundingBox(poly2);
  const minX = Math.max(bb1.minX, bb2.minX);
  const maxX = Math.min(bb1.maxX, bb2.maxX);
  const minY = Math.max(bb1.minY, bb2.minY);
  const maxY = Math.min(bb1.maxY, bb2.maxY);
  return [
      [minX, minY], [maxX, minY],
      [maxX, maxY], [minX, maxY]
  ];
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
          if (doPolygonsOverlap(zones[i].area.coordinates[0][0], zones[j].area.coordinates[0][0])) {
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

// Draw overlapping zones in the detail page
function drawOverlappingZones(zone1, zone2) {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const coords1 = zone1.area.coordinates[0][0];
  const coords2 = zone2.area.coordinates[0][0];
  const allCoords = [coords1, coords2];
  const normalized = normalizeCoords(allCoords, canvas.width, canvas.height);

  // Draw zone1 in blue
  drawPolygon(ctx, normalized[0], 'blue');
  // Draw zone2 in red
  drawPolygon(ctx, normalized[1], 'red');

  // Highlight intersection in yellow
  const intersection = getIntersectionCoords(coords1, coords2);
  const normIntersection = normalizeCoords([intersection], canvas.width, canvas.height)[0];
  drawPolygon(ctx, normIntersection, 'yellow', true);
}