import { cloneDeep } from "lodash";

export class Walls {
  N: boolean;
  E: boolean;
  S: boolean;
  W: boolean;
  [key: string]: boolean;

  constructor() {
    this.N = true;
    this.E = true;
    this.S = true;
    this.W = true;
  }
}

export class Cell {
  x: number;
  y: number;
  walls: Walls;
  visited: boolean;
  backtracked: boolean;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.walls = new Walls();
    this.visited = false;
    this.backtracked = false;
  }
}

export class Grid {
  height: number;
  width: number;
  grid: Cell[][];
  stack: Cell[];
  frames: Cell[][][];
  algorithm: string;
  [key: string]: any;

  constructor(width: number, height: number) {
    this.height = height <= 50 ? height : 50;
    this.width = width <= 50 ? width : 50;
    this.grid = [];
    this.stack = [];
    this.algorithm = "grid";

    for (let x = 0; x < width; x++) {
      let row = [];
      for (let y = 0; y < height; y++) {
        row.push(new Cell(x, y));
      }
      this.grid.push(row);
    }

    this.frames = cloneDeep([this.grid]);
    this.grid[0][0].visited = true;
  }

  possibleMoves = (cell: Cell): string[] => {
    let moves = [];
    if (cell.y - 1 >= 0 && !this.grid[cell.x][cell.y - 1].visited) moves.push("N");
    if (cell.x + 1 < this.width && !this.grid[cell.x + 1][cell.y].visited)
      moves.push("E");
    if (cell.y + 1 < this.height && !this.grid[cell.x][cell.y + 1].visited)
      moves.push("S");
    if (cell.x - 1 >= 0 && !this.grid[cell.x - 1][cell.y].visited) moves.push("W");
    return moves;
  };

  generateMaze(cell: Cell) {}

  draw(canvasContext: any, unitSize: number, step: number) {
    canvasContext.clearRect(0, 0, unitSize * this.width, unitSize * this.height);
    canvasContext.beginPath();
    this.frames[step].forEach((row) => {
      canvasContext.strokeStyle = "#800080";
      canvasContext.lineWidth = 5;
      row.forEach((cell) => {
        canvasContext.fillStyle = "#FDA4BA";
        if (cell.visited && !cell.backtracked) {
          canvasContext.fillRect(
            cell.x * unitSize,
            cell.y * unitSize,
            unitSize + 1,
            unitSize + 1
          );
        }
        canvasContext.moveTo(cell.x * unitSize - 2.5, cell.y * unitSize);
        if (cell.walls.N) {
          canvasContext.lineTo(cell.x * unitSize + unitSize, cell.y * unitSize);
        } else {
          canvasContext.moveTo(cell.x * unitSize + unitSize, cell.y * unitSize);
        }
        if (cell.walls.E) {
          canvasContext.lineTo(
            cell.x * unitSize + unitSize,
            cell.y * unitSize + unitSize
          );
        } else {
          canvasContext.moveTo(
            cell.x * unitSize + unitSize,
            cell.y * unitSize + unitSize
          );
        }
        if (cell.walls.S) {
          canvasContext.lineTo(cell.x * unitSize, cell.y * unitSize + unitSize);
        } else {
          canvasContext.moveTo(cell.x * unitSize, cell.y * unitSize + unitSize);
        }
        if (cell.walls.W) {
          canvasContext.lineTo(cell.x * unitSize, cell.y * unitSize);
        } else {
          canvasContext.moveTo(cell.x * unitSize, cell.y * unitSize);
        }
      });
    });
    canvasContext.stroke();

    canvasContext.beginPath();
    canvasContext.lineJoin = "round";
    canvasContext.lineWidth = 10;
    canvasContext.rect(0, 0, this.width * unitSize, this.height * unitSize);
    canvasContext.stroke();

    canvasContext.beginPath();
    canvasContext.lineWidth = 10;
    canvasContext.strokeStyle = "#FFFFFF";
    canvasContext.moveTo(0, 5);
    canvasContext.lineTo(0, unitSize - 2.5);
    canvasContext.moveTo(this.width * unitSize, this.height * unitSize - 5);
    canvasContext.lineTo(
      this.width * unitSize,
      this.height * unitSize - unitSize + 2.5
    );
    canvasContext.stroke();

    canvasContext.beginPath();
    canvasContext.lineWidth = 3;
    canvasContext.fillStyle = "#000000";
    canvasContext.moveTo(unitSize / 4, unitSize / 4);
    canvasContext.lineTo(3 * (unitSize / 4), unitSize / 2);
    canvasContext.lineTo(unitSize / 4, 3 * (unitSize / 4));
    canvasContext.fill();

    canvasContext.beginPath();
    canvasContext.moveTo(
      this.width * unitSize - 3 * (unitSize / 4),
      this.height * unitSize - 3 * (unitSize / 4)
    );
    canvasContext.lineTo(
      this.width * unitSize - unitSize / 4,
      this.height * unitSize - unitSize / 2
    );
    canvasContext.lineTo(
      this.width * unitSize - 3 * (unitSize / 4),
      this.height * unitSize - unitSize / 4
    );
    canvasContext.fill();
  }
}

export class RecursiveBacktrackMaze extends Grid {
  constructor(width: number, height: number) {
    super(height, width);
    this.algorithm = "recursiveBacktrackGenerate";
    this.generateMaze(this.grid[0][0]);
  }

  generateMaze = (cell: Cell) => {
    const currentFrame = cloneDeep(this.grid);
    this.frames.push(currentFrame);

    const newCellFromDirection = (direction: string): Cell | null => {
      switch (direction) {
        case "N":
          return this.grid[cell.x][cell.y - 1];
        case "E":
          return this.grid[cell.x + 1][cell.y];
        case "S":
          return this.grid[cell.x][cell.y + 1];
        case "W":
          return this.grid[cell.x - 1][cell.y];
        default:
          return null;
      }
    };

    const newDirectionFromDirection = (direction: string): string | null => {
      switch (direction) {
        case "N":
          return "S";
        case "E":
          return "W";
        case "S":
          return "N";
        case "W":
          return "E";
        default:
          return null;
      }
    };
    const directions = this.possibleMoves(cell);
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const newCell = newCellFromDirection(direction);
    const newDirection = newDirectionFromDirection(direction);

    if (!newCell && !(this.stack.length > 0)) return;

    if (newCell && newDirection) {
      this.stack.push(cell);
      cell.walls[direction] = false;
      newCell.walls[newDirection] = false;
      newCell.visited = true;
      this.generateMaze(newCell);
    } else {
      cell.backtracked = true;
      const oldCell = this.stack.pop();
      if (oldCell) {
        this.generateMaze(oldCell);
      }
    }
  };
}

export const generateRecursiveBacktrackMaze = (
  height: number = 10,
  width: number = 10,
  render: boolean = true
): RecursiveBacktrackMaze => {
  const t0 = performance.now();
  const maze = new RecursiveBacktrackMaze(width, height);
  let lastFrame = maze.frames.pop();
  if (lastFrame) {
    lastFrame[0][0].backtracked = true;
    maze.frames.push(lastFrame);
  }
  const t1 = performance.now();
  console.log("maze generated in: ", t1 - t0, " milliseconds.");
  return maze;
};
