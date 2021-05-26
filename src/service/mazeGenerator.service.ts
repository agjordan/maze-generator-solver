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
      let col = [];
      for (let y = 0; y < height; y++) {
        col.push(new Cell(x, y));
      }
      this.grid.push(col);
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
      this.frames.push(cloneDeep(lastFrame));
    }
    const t1 = performance.now();
    console.log("maze generated in: ", t1 - t0, " milliseconds.");
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

    const directions = this.possibleMoves(cell);
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const newCell = newCellFromDirection(direction);
    const newDirection = getOppositeDirection(direction);

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
    for (let x = 0; x < width; x++) {
      let col = [];
      for (let y = 0; y < height; y++) {
        col.push(new RecursiveDivisionCell(x, y));
      }
      this.grid.push(col);
    }

    //add perimeter walls
    this.grid[0].forEach((cell) => (cell.walls.W = true));
    this.grid[this.grid.length - 1].forEach((cell) => (cell.walls.E = true));
    this.grid.forEach((col) => {
      col[0].walls.N = true;
      col[col.length - 1].walls.S = true;
    });

    this.frames = [this.grid];

    this.generateMaze();
    const t1 = performance.now();
    console.log("maze generated in: ", t1 - t0, " milliseconds.");
  }

  generateMaze = (): void => {
    const newCellFromDirection = (
      cell: RecursiveDivisionCell,
      direction: string
    ): RecursiveDivisionCell | undefined => {
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
          return undefined;
      }
    };

    const setIndividualWall = (
      cell: RecursiveDivisionCell,
      direction: string,
      addWalls: boolean = true
    ) => {
      cell.walls[direction] = addWalls;
      const neighbour = newCellFromDirection(cell, direction);
      if (neighbour) neighbour.walls[getOppositeDirection(direction)!] = addWalls;
    };

    const getRandomIntBetween = (min: number, max: number): number => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    const setVerticalWall = (
      index: number,
      grid: RecursiveDivisionCell[][]
    ): void => {
      const column = grid[index];
      column.forEach((cell) => {
        setIndividualWall(cell, "E", true);
      });

      const randomCell = column[getRandomIntBetween(1, column.length - 2)];
      setIndividualWall(randomCell, "E", false);
      this.frames.push(cloneDeep(this.grid));
    };

    const setHorizontalWall = (
      index: number,
      grid: RecursiveDivisionCell[][]
    ): void => {
      const column = grid.map((col) => col[index]);
      column.forEach((cell) => {
        setIndividualWall(cell, "S", true);
      });

      const randomCell = column[getRandomIntBetween(1, column.length - 2)];
      setIndividualWall(randomCell, "S", false);
      this.frames.push(cloneDeep(this.grid));
    };

    const recursiveGenerate = (grid: RecursiveDivisionCell[][]) => {
      let width: number;
      let height: number;
      let verticalSpace: boolean;

      width = grid.length;
      height = grid[0].length;
      verticalSpace = width < height;

      if (width <= 1 || height <= 1) return;
      this.grid.forEach((col) => col.forEach((cell) => (cell.currentArea = false)));
      grid.forEach((col) => col.forEach((cell) => (cell.currentArea = true)));

      this.frames.push(cloneDeep(this.grid));

      if (verticalSpace) {
        const index = getRandomIntBetween(0, height - 1);

        setHorizontalWall(index, grid);

        //split and recurse
        let half1: RecursiveDivisionCell[][] = [];
        let half2: RecursiveDivisionCell[][] = [];

        grid.forEach((col) => {
          half1.push(col.slice(0, index + 1));
          half2.push(col.slice(index + 1));
        });

        if (!!half1[0].length) recursiveGenerate(half1);
        if (!!half2[0].length) recursiveGenerate(half2);
      } else {
        const index = getRandomIntBetween(0, width - 2);

        setVerticalWall(index, grid);

        const half1 = grid.slice(0, index + 1);
        const half2 = grid.slice(index + 1);

        if (!!half1.length) recursiveGenerate(half1);
        if (!!half2.length) recursiveGenerate(half2);
      }
    };
    this.frames = [this.grid];
    recursiveGenerate(this.grid);
    this.grid.forEach((col) => col.forEach((cell) => (cell.currentArea = false)));
    this.frames.push(cloneDeep(this.grid));
    console.log("generated");
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
