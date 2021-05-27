import { cloneDeep } from "lodash";

const possibleMoves = (cell: Cell, grid: Cell[][]): string[] => {
  let moves = [];
  if (cell.y - 1 >= 0 && !grid[cell.x][cell.y - 1].visited) moves.push("N");
  if (cell.x + 1 < grid.length && !grid[cell.x + 1][cell.y].visited) moves.push("E");
  if (cell.y + 1 < grid[0].length && !grid[cell.x][cell.y + 1].visited)
    moves.push("S");
  if (cell.x - 1 >= 0 && !grid[cell.x - 1][cell.y].visited) moves.push("W");
  return moves;
};

const getNeighbourDirections = (
  grid: Cell[][],
  relativeX: number,
  relativeY: number
) => {
  let directions = [];
  if (relativeY - 1 >= 0) directions.push("N");
  if (relativeX + 1 < grid.length) directions.push("E");
  if (relativeY + 1 < grid[0].length) directions.push("S");
  if (relativeX - 1 >= 0) directions.push("W");
  return directions;
};

const getOppositeDirection = (direction: string): string | null => {
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

const getRandomIntInclusive = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getCellFromDirection = (
  direction: string,
  grid: Cell[][],
  relativeX: number,
  relativeY: number
): Cell | undefined => {
  switch (direction) {
    case "N":
      if (relativeY - 1 >= 0) return grid[relativeX][relativeY - 1];
      return undefined;
    case "E":
      if (relativeX + 1 < grid.length) return grid[relativeX + 1][relativeY];
      return undefined;
    case "S":
      if (relativeY + 1 < grid[0].length) return grid[relativeX][relativeY + 1];
      return undefined;
    case "W":
      if (relativeX - 1 >= 0) return grid[relativeX - 1][relativeY];
      return undefined;
    default:
      return undefined;
  }
};

const setWallForCellAndNeighbour = (
  cell: Cell,
  direction: string,
  grid: Cell[][],
  addWalls: boolean = true
) => {
  cell.walls[direction] = addWalls;

  const firstX = grid[0][0].x;
  const firstY = grid[0][0].y;

  const relativeX = Math.abs(firstX - cell.x);
  const relativeY = Math.abs(firstY - cell.y);

  if (getNeighbourDirections(grid, relativeX, relativeY).includes(direction)) {
    const neighbour = getCellFromDirection(direction, grid, relativeX, relativeY);
    if (neighbour) neighbour.walls[getOppositeDirection(direction)!] = addWalls;
  }
};

const setWallForCollection = (
  cells: Cell[],
  direction: string,
  grid: Cell[][],
  addWalls: boolean
) => {
  cells.forEach((cell) =>
    setWallForCellAndNeighbour(cell, direction, grid, addWalls)
  );
};

const createHorizontalWallWithGate = (
  index: number,
  grid: RecursiveDivisionCell[][]
): void => {
  const row = grid.map((col) => col[index]);
  setWallForCollection(row, "S", grid, true);

  const randomCell = row[getRandomIntInclusive(1, row.length - 2)];
  setWallForCellAndNeighbour(randomCell, "S", grid, false);
};

const createVerticalWallWithGate = (
  index: number,
  grid: RecursiveDivisionCell[][]
): void => {
  const column = grid[index];

  setWallForCollection(column, "E", grid, true);

  const randomCell = column[getRandomIntInclusive(1, column.length - 2)];
  setWallForCellAndNeighbour(randomCell, "E", grid, false);
};

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

export class EmptyWalls extends Walls {
  constructor() {
    super();
    this.N = false;
    this.E = false;
    this.S = false;
    this.W = false;
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

export class RecursiveDivisionCell extends Cell {
  currentArea: boolean;

  constructor(x: number, y: number) {
    super(x, y);
    this.walls = new EmptyWalls();
    this.currentArea = true;
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

    this.generateGrid();
    this.frames = [cloneDeep(this.grid)];
  }

  createFrame = (frame: Cell[][] = []) => {
    if (frame.length < 1) frame = cloneDeep(this.grid);
    this.frames.push(cloneDeep(frame));
  };

  generateGrid = () => {
    for (let x = 0; x < this.width; x++) {
      let col = [];
      for (let y = 0; y < this.height; y++) {
        col.push(new Cell(x, y));
      }
      this.grid.push(col);
    }
  };
  generateMaze = (cell: Cell) => {};

  draw(canvasContext: any, unitSize: number, step: number) {
    // canvasContext.clearRect(0, 0, unitSize * this.width, unitSize * this.height);
    canvasContext.beginPath();
    this.frames[step].forEach((col) => {
      canvasContext.strokeStyle = "#800080";
      canvasContext.lineWidth = 5;
      col.forEach((cell) => {
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
    super(width, height);
    const t0 = performance.now();
    this.algorithm = "recursiveBacktrackGenerate";

    this.generateMaze(this.grid[0][0]);

    let lastFrame = this.frames.pop();
    if (lastFrame) {
      lastFrame[0][0].backtracked = true;
      this.createFrame(cloneDeep(lastFrame));
    }
    const t1 = performance.now();
    console.log("maze generated in: ", t1 - t0, " milliseconds.");
  }

  generateMaze = (cell: Cell) => {
    cell.visited = true;
    this.createFrame();

    const directions = possibleMoves(cell, this.grid);
    const direction = directions[getRandomIntInclusive(0, directions.length - 1)];
    const nextCell = getCellFromDirection(direction, this.grid, cell.x, cell.y);

    if (!nextCell && this.stack.length < 1) return;

    if (nextCell) {
      setWallForCellAndNeighbour(cell, direction, this.grid, false);
      this.stack.push(cell);
      this.generateMaze(nextCell);
    } else {
      cell.backtracked = true;
      const oldCell = this.stack.pop();
      if (oldCell) {
        this.generateMaze(oldCell);
      }
    }
  };

  draw(canvasContext: any, unitSize: number, step: number) {
    // canvasContext.clearRect(0, 0, unitSize * this.width, unitSize * this.height);
    canvasContext.beginPath();
    this.frames[step].forEach((col) => {
      canvasContext.strokeStyle = "#800080";
      canvasContext.lineWidth = 5;
      col.forEach((cell) => {
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

export class RecursiveDivisionMaze extends Grid {
  grid: RecursiveDivisionCell[][];
  frames: RecursiveDivisionCell[][][];

  constructor(width: number, height: number) {
    super(width, height);
    const t0 = performance.now();
    this.algorithm = "recursiveDivisionGenerate";
    this.grid = [];

    // replace Cells with RecursiveDivisionCells (they have no walls)
    for (let x = 0; x < width; x++) {
      let col = [];
      for (let y = 0; y < height; y++) {
        col.push(new RecursiveDivisionCell(x, y));
      }
      this.grid.push(col);
    }

    //adding W, E, N, S perimeter walls
    let topRow: RecursiveDivisionCell[] = [];
    let botRow: RecursiveDivisionCell[] = [];
    this.grid.forEach((col) => {
      topRow.push(col[0]);
      botRow.push(col[col.length - 1]);
    });
    setWallForCollection(topRow, "N", this.grid, true);
    setWallForCollection(botRow, "S", this.grid, true);
    setWallForCollection(this.grid[0], "W", this.grid, true);
    setWallForCollection(this.grid[this.grid.length - 1], "E", this.grid, true);

    this.frames = [this.grid];

    this.generateMaze();

    const t1 = performance.now();
    console.log("maze generated in: ", t1 - t0, " milliseconds.");
  }

  generateMaze = (): void => {
    const recusiveDivisionGeneration = (grid: RecursiveDivisionCell[][]) => {
      let width: number;
      let height: number;
      let verticalSpace: boolean;

      width = grid.length;
      height = grid[0].length;
      verticalSpace = width < height;

      //exit condition to ensure we don't have an endless loop, also controls size of final rooms
      if (width <= 1 || height <= 1) return;

      this.grid.forEach((col) => col.forEach((cell) => (cell.currentArea = false)));
      grid.forEach((col) => col.forEach((cell) => (cell.currentArea = true)));
      this.createFrame();

      if (verticalSpace) {
        const index = getRandomIntInclusive(0, height - 2);

        createHorizontalWallWithGate(index, grid);
        this.createFrame();

        //split and recurse
        let half1: RecursiveDivisionCell[][] = [];
        let half2: RecursiveDivisionCell[][] = [];

        grid.forEach((col) => {
          half1.push(col.slice(0, index + 1));
          half2.push(col.slice(index + 1));
        });
        if (!!half1[0].length) recusiveDivisionGeneration(half1);
        if (!!half2[0].length) recusiveDivisionGeneration(half2);
      } else {
        const index = getRandomIntInclusive(0, width - 2);

        createVerticalWallWithGate(index, grid);
        this.createFrame();

        const half1 = grid.slice(0, index + 1);
        const half2 = grid.slice(index + 1);
        if (!!half1.length) recusiveDivisionGeneration(half1);
        if (!!half2.length) recusiveDivisionGeneration(half2);
      }
    };

    this.frames = [this.grid];
    recusiveDivisionGeneration(this.grid);
    this.grid.forEach((col) => col.forEach((cell) => (cell.currentArea = false)));
    this.frames.push(cloneDeep(this.grid));
  };

  draw = (canvasContext: any, unitSize: number, step: number) => {
    // canvasContext.clearRect(0, 0, unitSize * this.width, unitSize * this.height);
    canvasContext.beginPath();

    if (!this.frames[step]) return;

    this.frames[step].forEach((col) => {
      canvasContext.strokeStyle = "#800080";
      canvasContext.lineWidth = 5;
      col.forEach((cell) => {
        canvasContext.fillStyle = "#FDA4BA";
        if (cell.currentArea) {
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
  };
}
