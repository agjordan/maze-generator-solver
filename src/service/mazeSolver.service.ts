import { RecursiveBacktrackMaze, Walls, Cell, Grid } from "./mazeGenerator.service";
import { cloneDeep } from "lodash";

class CellForSolving extends Cell {
  visited: boolean;
  walls: Walls;

  constructor(cell: Cell) {
    super(cell.x, cell.y);
    this.visited = false;
    this.walls = cell.walls;
  }
}

class DijkstraCell extends CellForSolving {
  distanceFromSource: number;
  moveCost: number;
  onPath: boolean;

  constructor(cell: Cell) {
    super(cell);
    this.distanceFromSource = Infinity;
    this.moveCost = 1;
    this.onPath = false;
  }

  setDistanceFromSource(distance: number) {
    this.distanceFromSource = distance;
  }
}

export class DijkstraMaze extends Grid {
  height: number;
  width: number;
  grid: DijkstraCell[][];
  frames: DijkstraCell[][][];

  constructor(maze: RecursiveBacktrackMaze) {
    super(maze.width, maze.height);
    this.height = maze.height;
    this.width = maze.width;
    this.frames = [];
    this.algorithm = "DijkstraSolve";

    this.grid = maze.grid.map((row) => {
      return row.map((cell) => {
        return new DijkstraCell(cell);
      });
    });
  }

  getUnvisitedNeighbours = (cell: DijkstraCell): DijkstraCell[] => {
    let allMoves = ["N", "E", "S", "W"];
    let cellWalls: string[] = [];

    Object.entries(cell.walls).forEach(([key, value]) => {
      if (value) cellWalls.push(key);
    });

    const cellFromDirection = (direction: string): DijkstraCell | null => {
      switch (direction) {
        case "N":
          if (!this.grid[cell.x][cell.y - 1].visited)
            return this.grid[cell.x][cell.y - 1];
          return null;
        case "E":
          if (!this.grid[cell.x + 1][cell.y].visited)
            return this.grid[cell.x + 1][cell.y];
          return null;
        case "S":
          if (!this.grid[cell.x][cell.y + 1].visited)
            return this.grid[cell.x][cell.y + 1];
          return null;
        case "W":
          if (!this.grid[cell.x - 1][cell.y].visited)
            return this.grid[cell.x - 1][cell.y];
          return null;
        default:
          return null;
      }
    };

    const isCell = (candidate: any): candidate is DijkstraCell => {
      if (candidate instanceof DijkstraCell) return true;
      return false;
    };

    const cellMoves = allMoves
      .filter((n) => !cellWalls.includes(n))
      .map((move) => cellFromDirection(move));
    const validMoves: DijkstraCell[] = cellMoves.filter(isCell)!;

    return validMoves;
  };

  getBestPathNeighbor(cell: DijkstraCell) {
    let allMoves = ["N", "E", "S", "W"];
    let cellWalls: string[] = [];

    Object.entries(cell.walls).forEach(([key, value]) => {
      if (value) cellWalls.push(key);
    });

    const cellFromDirection = (direction: string): DijkstraCell | null => {
      switch (direction) {
        case "N":
          if (!this.grid[cell.x][cell.y - 1].onPath)
            return this.grid[cell.x][cell.y - 1];
          return null;
        case "E":
          if (!this.grid[cell.x + 1][cell.y].onPath)
            return this.grid[cell.x + 1][cell.y];
          return null;
        case "S":
          if (!this.grid[cell.x][cell.y + 1].onPath)
            return this.grid[cell.x][cell.y + 1];
          return null;
        case "W":
          if (!this.grid[cell.x - 1][cell.y].onPath)
            return this.grid[cell.x - 1][cell.y];
          return null;
        default:
          return null;
      }
    };

    const isCell = (candidate: any): candidate is DijkstraCell => {
      if (candidate instanceof DijkstraCell) return true;
      return false;
    };

    const cellMoves = allMoves
      .filter((n) => !cellWalls.includes(n))
      .map((move) => cellFromDirection(move));
    const validMoves: DijkstraCell[] = cellMoves.filter(isCell)!;

    return validMoves.reduce((lowest, cell) =>
      lowest.distanceFromSource < cell.distanceFromSource ? lowest : cell
    );
  }

  draw(canvasContext: any, unitSize: number, step: number) {
    canvasContext.clearRect(0, 0, unitSize * this.width, unitSize * this.height);
    if (this.frames[step] === undefined) return;
    canvasContext.strokeStyle = "#800080";
    canvasContext.lineWidth = 5;
    canvasContext.beginPath();
    this.frames[step].forEach((row) => {
      row.forEach((cell) => {
        if (cell.visited) {
          canvasContext.fillStyle = "#FDA4BA";
          canvasContext.fillRect(
            cell.x * unitSize,
            cell.y * unitSize,
            unitSize + 1,
            unitSize + 1
          );
        }

        if (cell.onPath) {
          canvasContext.fillStyle = "#00BFFF";
          canvasContext.fillRect(
            cell.x * unitSize,
            cell.y * unitSize,
            unitSize,
            unitSize
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

const getAllNodes = (grid: DijkstraCell[][]): DijkstraCell[] => {
  let nodes: DijkstraCell[] = [];
  for (let row of grid) {
    for (let cell of row) {
      nodes.push(cell);
    }
  }
  return nodes;
};

const sortNodesByDistance = (nodeList: DijkstraCell[]) => {
  return nodeList.sort(
    (firstNode, secondNode) =>
      firstNode.distanceFromSource - secondNode.distanceFromSource
  );
};

const updateDistance = (currentCell: DijkstraCell, targetCell: DijkstraCell) => {
  targetCell.distanceFromSource =
    currentCell.distanceFromSource + targetCell.moveCost;
};

const updateNeighbourDistances = (currentCell: DijkstraCell, maze: DijkstraMaze) => {
  const neighbours = maze.getUnvisitedNeighbours(currentCell);
  neighbours.forEach((cell) => {
    updateDistance(currentCell, cell);
  });
};

export const dijkstraSolve = (submission: Grid): DijkstraMaze => {
  const t0 = performance.now();
  const maze = new DijkstraMaze(submission);
  const exitCell = maze.grid[maze.width - 1][maze.height - 1];
  const unvisitedCells = getAllNodes(maze.grid);
  const startCell = maze.grid[0][0];
  startCell.distanceFromSource = 0;

  while (!!unvisitedCells.length) {
    sortNodesByDistance(unvisitedCells);
    const currentCell = unvisitedCells.shift();

    if (currentCell === undefined) break;
    if (currentCell.distanceFromSource === Infinity) break;
    if (currentCell === exitCell) break;

    currentCell.visited = true;

    updateNeighbourDistances(currentCell, maze);
    maze.frames.push(cloneDeep(maze.grid));
  }

  let currentCell = exitCell;

  while (!(currentCell === startCell)) {
    // for (let i = 0; i < 50; i++) {
    console.log(currentCell);
    currentCell.onPath = true;
    const nextCell = maze.getBestPathNeighbor(currentCell);
    maze.frames.push(cloneDeep(maze.grid));
    currentCell = nextCell;
  }

  startCell.onPath = true;
  maze.frames.push(cloneDeep(maze.grid));

  const t1 = performance.now();

  console.log("solved in:", t1 - t0, "milliseconds.", maze);

  return maze;
};
