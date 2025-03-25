'use strict'

// setup the canvas
function setCanvas(height, width, id){
  const canvas = document.getElementById(id)
  const ctx = canvas.getContext('2d')
  const dpi = window.devicePixelRatio

  canvas.height = height * dpi
  canvas.width = width * dpi
  ctx.scale(dpi, dpi)
  canvas.style.height = `${height}px`
  canvas.style.width = `${width}px`
  canvas.style.backgroundColor = "black"
  ctx.fillStyle = "white"
  ctx.strokeStyle = "white"
  return ctx
}

const ctx = setCanvas(innerHeight, innerWidth, "canvas")
const canvas = document.getElementById("canvas")

function drawCircle(obj, color){
  ctx.beginPath()
  ctx.arc(obj[0], obj[1], obj[2], 0, 2 * Math.PI)
  ctx.strokeStyle = color? color:"white"
  ctx.stroke()
  ctx.strokeStyle = "white"
}

function line(origin, point){
  ctx.beginPath()
  ctx.moveTo(origin.x, origin.y)
  ctx.lineTo(point.x, point.y)
  ctx.stroke()
}



/**
 * Calculates the angle (in radians) from point `p1` to point `p2`.
 *
 * @param {Object} p1 - The starting point.
 * @param {number} p1.x - The x-coordinate of the starting point.
 * @param {number} p1.y - The y-coordinate of the starting point.
 * @param {Object} p2 - The target point.
 * @param {number} p2.x - The x-coordinate of the target point.
 * @param {number} p2.y - The y-coordinate of the target point.
 * @returns {number} The angle in radians, ranging from -π to π (-180° to 180°).
 *
 * @example
 * let p1 = { x: 10, y: 20 };
 * let p2 = { x: 30, y: 40 };
 * let angle = direction(p1, p2);
 * console.log(angle); // Output: ~0.785 (45 degrees)
 */
function direction(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}


/**
 * Calculates the Euclidean distance (magnitude) between two points `p1` and `p2` in 2D space.
 *
 * @param {Object} p1 - The first point.
 * @param {number} p1.x - The x-coordinate of the first point.
 * @param {number} p1.y - The y-coordinate of the first point.
 * @param {Object} p2 - The second point.
 * @param {number} p2.x - The x-coordinate of the second point.
 * @param {number} p2.y - The y-coordinate of the second point.
 * @returns {number} The distance between `p1` and `p2`.
 *
 * @example
 * let p1 = { x: 3, y: 4 };
 * let p2 = { x: 6, y: 8 };
 * let dist = magnitude(p1, p2);
 * console.log(dist); // Output: 5
 */
function magnitude(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y)
}

/**
 * Finds the point on the circumference of a circle that aligns with a given point.
 * Ensures the returned point is always on the boundary of the circle, 
 * regardless of where the input point is.
 *
 * @param {Object} point - A reference point (inside, outside, or on the circle).
 * @param {number} point.x - The x-coordinate of the reference point.
 * @param {number} point.y - The y-coordinate of the reference point.
 * @param {Object} origin - The center of the circle.
 * @param {number} origin.x - The x-coordinate of the circle's center.
 * @param {number} origin.y - The y-coordinate of the circle's center.
 * @param {number} r - The radius of the circle.
 * @returns {Object} The coordinates `{ x, y }` of the intersection point on the circle's boundary.
 *
 * @example
 * let point = { x: 50, y: 80 }
 * let origin = { x: 100, y: 100 }
 * let radius = 30
 * let intersection = circumferenceIntrs(point, origin, radius)
 * console.log(intersection) // Output: A point on the circle's boundary
 */
function circumferenceIntrs(point, origin, r) {
    let dir = direction(origin, point)
    let x = origin.x + (r * Math.cos(dir))
    let y = origin.y + (r * Math.sin(dir))
    return { x, y }
}


/**
 * Checks if a given angle is within a certain range of a reference angle.
 *
 * @param {number} angle - The angle to check (in radians).
 * @param {number} reference - The reference angle (in radians).
 * @param {number} tolerance - Allowed difference both in positive and negetive scale(in radians).
 * @returns {boolean} True if the angle is within the range, false otherwise.
 *
 * @example
 * let reference = Math.PI / 4  // 45 degrees
 * let testAngle = Math.PI / 6  // 30 degrees
 * let tolerance = (20 * Math.PI) / 180  // 20 degrees in radians
 * isBoundedAngle(testAngle, reference, tolerance)  // true
 */
function isBoundedAngle(angle, reference, tolerance) {
    // Find coordinates of the given angle on the unit circle
    let angleX = Math.cos(angle)
    let angleY = Math.sin(angle)

    // Find coordinates of the reference angle on the unit circle
    let referenceX = Math.cos(reference)
    let referenceY = Math.sin(reference)
    
    // atan2 hack !!
    // Convert (x, y) back into an angle
    // This ensures that the angle is normalized between -π and π (or -180° and 180°)
    angle = Math.atan2(angleY, angleX)
    reference = Math.atan2(referenceY, referenceX)

    let lowerBound = reference - tolerance
    let upperBound = reference + tolerance

    return angle >= lowerBound && angle <= upperBound
}


function setDistanceBetween(p1, p2, allowedDistance){
  let dx = p2.x - p1.x 
  let dy = p2.y - p1.y 
  let currentDistance = Math.sqrt(dx*dx + dy*dy)
  
  // if both points are at same place there's 
  // no angle to scale to. so scale to x by default.
  if (currentDistance===0){
    return {
      x: p1.x + allowedDistance,
      y: p1.y
    }
  }
  
  // Scale dx and dy to make the new point exactly allowedDistance away
  let scale = allowedDistance / currentDistance
  let x = p1.x + dx * scale // p1.x -> offset by x
  let y = p1.y + dy * scale // p1.y -> offset by y 
  
  return {x, y}
}

function fixChain(points, circleSize) {
  let fixed = [[...points[0]]]
  
  for (let i=1; i<points.length; i++){
    let prevPoint = {
      x: fixed[i-1][0],
      y: fixed[i-1][1]
    }
    let nextPoint = {
      x: points[i][0],
      y: points[i][1]
    }

    let fixedPoint = setDistanceBetween(
      prevPoint, 
      nextPoint, 
      circleSize
    )

    fixed.push([fixedPoint.x, fixedPoint.y, circleSize])
  }

  return fixed
}


let chain = [
  [100, 100, 10],
  [Math.random()*innerWidth, Math.random()*innerHeight, 9],
  [Math.random()*innerWidth, Math.random()*innerHeight, 8],
  [Math.random()*innerWidth, Math.random()*innerHeight, 7],
  [Math.random()*innerWidth, Math.random()*innerHeight, 6],
  [Math.random()*innerWidth, Math.random()*innerHeight, 5],
  [Math.random()*innerWidth, Math.random()*innerHeight, 5],
  [Math.random()*innerWidth, Math.random()*innerHeight, 4],
  [Math.random()*innerWidth, Math.random()*innerHeight, 4],
  [Math.random()*innerWidth, Math.random()*innerHeight, 3],
  [Math.random()*innerWidth, Math.random()*innerHeight, 3],
  [Math.random()*innerWidth, Math.random()*innerHeight, 3],
  [Math.random()*innerWidth, Math.random()*innerHeight, 3],
  [Math.random()*innerWidth, Math.random()*innerHeight, 3],
  [Math.random()*innerWidth, Math.random()*innerHeight, 3],
  [Math.random()*innerWidth, Math.random()*innerHeight, 3],
]

chain = fixChain(chain, 5)

for (let i=0; i<chain.length; i++){
  drawCircle(chain[i], "red")
}





const bound = canvas.getBoundingClientRect()
let target = {x:chain[0][0], y: chain[0][1]}

canvas.addEventListener("click", (e)=>{
  let x = e.clientX - bound.x
  let y = e.clientY - bound.y
  target.x = x 
  target.y = y
})

function animate() {
    // Clear the canvas (assuming you have a context variable)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move the head towards the target
    let head = { x: chain[0][0], y: chain[0][1] };
    let dx = target.x - head.x;
    let dy = target.y - head.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {  // If the head is not already at the target
        let speed = 2;  // Adjust this for faster or slower movement
        let scale = speed / distance;
        head.x += dx * scale;
        head.y += dy * scale;

        chain[0][0] = head.x;
        chain[0][1] = head.y;
    }

    // Recalculate the rest of the chain to follow
    chain = fixChain(chain, 5);  

    // Draw the updated chain
    for (let i = 0; i < chain.length; i++) {
        drawCircle(chain[i], "red");
    }

    requestAnimationFrame(animate);
}
requestAnimationFrame(animate)
