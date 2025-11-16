/*const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];*/

const odds = [11, 13, 15, 17, 19, 21];
const Xm = odds[Math.floor(Math.random() * odds.length)];
const Ym = odds[Math.floor(Math.random() * odds.length)];
const map = generateMap(Xm, Ym);
console.log(map.map(r => r.join(" ")).join("\n"));

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const TICK = 30;

const CELL_SIZE = 32;

const FOV = toRadians(60);

const COLORS = {
  floor: "#a89984",
  ceiling: "#282828",
  wall: "#fe8019",
  wallDark: "#d65d0e",
  rays: "#fabd2f",
};

const player = {
  x: CELL_SIZE * 1.5,
  y: CELL_SIZE * 1.5,
  angle: toRadians(0),
  speed: 0,
  strafe: 0
};

const canvas = document.createElement("canvas");
canvas.setAttribute("width", SCREEN_WIDTH);
canvas.setAttribute("height", SCREEN_HEIGHT);
document.body.appendChild(canvas);

const context = canvas.getContext("2d");

function clearScreen() {
  context.fillStyle = "red";
  context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

function renderMinimap(posX = 0, posY = 0, scale, rays) {
  const cellSize = scale * CELL_SIZE;
  map.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        context.fillStyle = "black";
        context.fillRect(
          posX + x * cellSize,
          posY + y * cellSize,
          cellSize,
          cellSize
        );
      }
    });
  });
  context.fillStyle = "white";
  context.fillRect(
    posX + player.x * scale - 10 / 2,
    posY + player.y * scale - 10 / 2,
    10,
    10
  );

  context.strokeStyle = "white";
  context.beginPath();
  context.moveTo(player.x * scale, player.y * scale);
  context.lineTo(
    (player.x + Math.cos(player.angle) * 20) * scale,
    (player.y + Math.sin(player.angle) * 20) * scale
  );
  context.closePath();
  context.stroke();

  context.strokeStyle = COLORS.rays;
  rays.forEach((ray) => {
    context.beginPath();
    context.moveTo(player.x * scale, player.y * scale);
    context.lineTo(
      (player.x + Math.cos(ray.angle) * ray.distance) * scale,
      (player.y + Math.sin(ray.angle) * ray.distance) * scale
    );
    context.closePath();
    context.stroke();
  });
}

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function outOfMapBounds(x, y) {
  return x < 0 || x >= map[0].length || y < 0 || y >= map.length;
}

function getVCollision(angle) {
  const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2);

  const firstX = right
    ? Math.floor(player.x / CELL_SIZE) * CELL_SIZE + CELL_SIZE
    : Math.floor(player.x / CELL_SIZE) * CELL_SIZE;

  const firstY = player.y + (firstX - player.x) * Math.tan(angle);

  const xA = right ? CELL_SIZE : -CELL_SIZE;
  const yA = xA * Math.tan(angle);

  let wall;
  let nextX = firstX;
  let nextY = firstY;
  while (!wall) {
    const cellX = right
      ? Math.floor(nextX / CELL_SIZE)
      : Math.floor(nextX / CELL_SIZE) - 1;
    const cellY = Math.floor(nextY / CELL_SIZE);

    if (outOfMapBounds(cellX, cellY)) {
      break;
    }
    wall = map[cellY][cellX];
    if (!wall) {
      nextX += xA;
      nextY += yA;
    }
  }
  return {
    angle,
    distance: distance(player.x, player.y, nextX, nextY),
    vertical: true,
  };
}

function getHCollision(angle) {
  const up = Math.abs(Math.floor(angle / Math.PI) % 2);
  const firstY = up
    ? Math.floor(player.y / CELL_SIZE) * CELL_SIZE
    : Math.floor(player.y / CELL_SIZE) * CELL_SIZE + CELL_SIZE;
  const firstX = player.x + (firstY - player.y) / Math.tan(angle);

  const yA = up ? -CELL_SIZE : CELL_SIZE;
  const xA = yA / Math.tan(angle);

  let wall;
  let nextX = firstX;
  let nextY = firstY;
  while (!wall) {
    const cellX = Math.floor(nextX / CELL_SIZE);
    const cellY = up
      ? Math.floor(nextY / CELL_SIZE) - 1
      : Math.floor(nextY / CELL_SIZE);

    if (outOfMapBounds(cellX, cellY)) {
      break;
    }

    wall = map[cellY][cellX];
    if (!wall) {
      nextX += xA;
      nextY += yA;
    }
  }
  return {
    angle,
    distance: distance(player.x, player.y, nextX, nextY),
    vertical: false,
  };
}

function castRay(angle) {
  const vCollision = getVCollision(angle);
  const hCollision = getHCollision(angle);

  return hCollision.distance >= vCollision.distance ? vCollision : hCollision;
}

function fixFishEye(distance, angle, playerAngle) {
  const diff = angle - playerAngle;
  return distance * Math.cos(diff);
}

function getRays() {
  const initialAngle = player.angle - FOV / 2;
  const numberOfRays = SCREEN_WIDTH;
  const angleStep = FOV / numberOfRays;
  return Array.from({ length: numberOfRays }, (_, i) => {
    const angle = initialAngle + i * angleStep;
    const ray = castRay(angle);
    return ray;
  });
}

function movePlayer() {
  // Forward/backward movement
  const stepX = Math.cos(player.angle) * player.speed;
  const stepY = Math.sin(player.angle) * player.speed;

  // Strafing (perpendicular to angle)
  const strafeX = Math.cos(player.angle + Math.PI / 2) * player.strafe;
  const strafeY = Math.sin(player.angle + Math.PI / 2) * player.strafe;

  // Calculate proposed new positions
  const newX = player.x + stepX + strafeX;
  const newY = player.y + stepY + strafeY;

  // Check X movement collision
  const cellX = Math.floor(newX / CELL_SIZE);
  const cellYForX = Math.floor(player.y / CELL_SIZE);
  if (!outOfMapBounds(cellX, cellYForX) && map[cellYForX][cellX] === 0) {
    player.x = newX;
  }

  // Check Y movement collision
  const cellY = Math.floor(newY / CELL_SIZE);
  const cellXForY = Math.floor(player.x / CELL_SIZE);
  if (!outOfMapBounds(cellXForY, cellY) && map[cellY][cellXForY] === 0) {
    player.y = newY;
  }
}

function renderScene(rays) {
  rays.forEach((ray, i) => {
    const distance = fixFishEye(ray.distance, ray.angle, player.angle);
    const wallHeight = ((CELL_SIZE * 5) / distance) * 277;
    context.fillStyle = ray.vertical ? COLORS.wallDark : COLORS.wall;
    context.fillRect(i, SCREEN_HEIGHT / 2 - wallHeight / 2, 1, wallHeight);
    context.fillStyle = COLORS.floor;
    context.fillRect(
      i,
      SCREEN_HEIGHT / 2 + wallHeight / 2,
      1,
      SCREEN_HEIGHT / 2 - wallHeight / 2
    );
    context.fillStyle = COLORS.ceiling;
    context.fillRect(i, 0, 1, SCREEN_HEIGHT / 2 - wallHeight / 2);
  });
}

function generateMap(rows, cols) {
  // Fill everything with walls
  const map = Array.from({ length: rows }, () => Array(cols).fill(1));

  // Directions (dx, dy)
  const dirs = [
    [0, -1], // up
    [1, 0],  // right
    [0, 1],  // down
    [-1, 0]  // left
  ];

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Maze carving with recursive backtracking
  function carve(x, y) {
    map[y][x] = 0; // empty floor
    const directions = [...dirs];
    shuffle(directions);

    for (const [dx, dy] of directions) {
      const nx = x + dx * 2;
      const ny = y + dy * 2;
      if (ny > 0 && ny < rows -1 && nx > 0 && nx < cols - 1 && map[ny][nx] === 1) {
        map[y + dy][x + dx] = 0; // carve passage between
        carve(nx, ny);
      }
    }
  }

  // Always start at (1,1)
  carve(1, 1);

  // Ensure player start is free
  map[1][1] = 0;

  // Ensure exit is free (one before the wall border, not at the edge)
  map[rows - 2][cols - 2] = 0;

  // Punch a few random walls into floors to add variety (loops, side paths)
  for (let y = 2; y < rows - 2; y++) {
    for (let x = 2; x < cols - 2; x++) {
      if (map[y][x] === 1 && Math.random() < 0.1) {
        map[y][x] = 0;
      }
    }
  }

  return map;
}

function gameLoop() {
  clearScreen();
  movePlayer();
  const rays = getRays();
  renderScene(rays);
  renderMinimap(0, 0, 0.6, rays);
}

setInterval(gameLoop, TICK);

// Fixed key event handlers - now using the strafe property
document.addEventListener("keydown", (e) => {
  if (e.key == "w") {
    player.speed = 2;
  }
  if (e.key == "s") {
    player.speed = -1.4;
  }
  if (e.key == "q") {
    player.angle -= toRadians(1.8);
  }
  if (e.key == "e") {
    player.angle += toRadians(1.8);
  }
  if (e.key == "a") {
    player.strafe = -2; // Left strafe
  }
  if (e.key == "d") {
    player.strafe = 2; // Right strafe
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key == 'w' || e.key == "s") {
    player.speed = 0;
  }
  if (e.key == 'q' || e.key == 'e') {
    // Angle stops changing, but keep current angle
  }
  if (e.key == 'a' || e.key == 'd') {
    player.strafe = 0; // Stop strafing
  }
});
