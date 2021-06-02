import { cloneDeep } from "lodash";
import { Walls, Cell, Grid, RecursiveDivisionCell } from "./mazeGenerator.service";
// import { cloneDeep } from "lodash";

const getAllCells = (maze: DijkstraSolve): DijkstraCell[] => {
  let cells: DijkstraCell[] = [];
  for (let row of maze.grid) {
    for (let cell of row) {
      cells.push(cell);
    }
  }
  return cells;
};

const getUnvisitedCellFromDirection = (
  cell: DijkstraCell,
  direction: string,
  grid: DijkstraCell[][]
): DijkstraCell | null => {
  switch (direction) {
    case "N":
      if (!grid[cell.x][cell.y - 1]?.visited) return grid[cell.x][cell.y - 1];
      return null;
    case "E":
      if (!grid[cell.x + 1][cell.y]?.visited) return grid[cell.x + 1][cell.y];
      return null;
    case "S":
      if (!grid[cell.x][cell.y + 1]?.visited) return grid[cell.x][cell.y + 1];
      return null;
    case "W":
      if (!grid[cell.x - 1][cell.y]?.visited) return grid[cell.x - 1][cell.y];
      return null;
    default:
      return null;
  }
};

const getUnvisitedNeighbours = (
  cell: DijkstraCell,
  grid: DijkstraCell[][]
): DijkstraCell[] => {
  let allMoves = ["N", "E", "S", "W"];
  let cellWalls: string[] = [];

  Object.entries(cell.walls).forEach(([key, value]) => {
    if (value) cellWalls.push(key);
  });

  const isCell = (candidate: any): candidate is DijkstraCell => {
    if (candidate instanceof DijkstraCell) return true;
    return false;
  };

  const cellMoves = allMoves
    .filter((n) => !cellWalls.includes(n))
    .map((move) => getUnvisitedCellFromDirection(cell, move, grid));
  const unvisitedNeighbours: DijkstraCell[] = cellMoves.filter(isCell);

  return unvisitedNeighbours;
};

const sortNodesByDistance = (nodeList: DijkstraCell[]) => {
  return nodeList.sort(
    (firstNode, secondNode) =>
      firstNode.distanceFromSource - secondNode.distanceFromSource
  );
};

const cellNotOnPathFromDirection = (
  direction: string,
  cell: DijkstraCell,
  grid: DijkstraCell[][]
): DijkstraCell | null => {
  switch (direction) {
    case "N":
      if (!grid[cell.x][cell.y - 1]?.onPath) return grid[cell.x][cell.y - 1];
      return null;
    case "E":
      if (!grid[cell.x + 1][cell.y]?.onPath) return grid[cell.x + 1][cell.y];
      return null;
    case "S":
      if (!grid[cell.x][cell.y + 1]?.onPath) return grid[cell.x][cell.y + 1];
      return null;
    case "W":
      if (!grid[cell.x - 1][cell.y]?.onPath) return grid[cell.x - 1][cell.y];
      return null;
    default:
      return null;
  }
};

const getCellWalls = (cell: DijkstraCell) => {
  let cellWalls: string[] = [];

  Object.entries(cell.walls).forEach(([key, value]) => {
    if (value) cellWalls.push(key);
  });

  return cellWalls;
};

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
}

export class DijkstraSolve extends Grid {
  grid: DijkstraCell[][];
  frames: DijkstraCell[][][];
  mazeCells: Cell[][];

  constructor(maze: Grid, animate: boolean) {
    super(maze.width, maze.height, animate);
    this.frames = [];
    this.algorithm = "DijkstraSolve";
    this.mazeCells = maze.grid;
    this.grid = this.generateGrid();
    this.createFrame();
    try {
      this.solve();
    } catch (error) {
      alert("This maze cannot be solved!");
      console.log(error);
    }
  }

  generateGrid = () => {
    const dijkstraGrid = this.mazeCells.map(
      (row: RecursiveDivisionCell[] | Cell[]) => {
        return row.map((cell: RecursiveDivisionCell | Cell) => {
          return new DijkstraCell(cell);
        });
      }
    );
    return dijkstraGrid;
  };

  getClosestVisitableNeighbour(cell: DijkstraCell) {
    let allMoves = ["N", "E", "S", "W"];
    const cellWalls = getCellWalls(cell);

    const isDijkstraCell = (candidate: any): candidate is DijkstraCell => {
      if (candidate instanceof DijkstraCell) return true;
      return false;
    };

    const cellMoves = allMoves
      .filter((n) => !cellWalls.includes(n))
      .map((move) => cellNotOnPathFromDirection(move, cell, this.grid));

    const validMoves: DijkstraCell[] = cellMoves.filter(isDijkstraCell);

    const closestMove = validMoves.reduce((lowest, cell) =>
      lowest.distanceFromSource < cell.distanceFromSource ? lowest : cell
    );

    return closestMove;
  }

  updateNeighbourDistances = (currentCell: DijkstraCell) => {
    const updateDistance = (currentCell: DijkstraCell, targetCell: DijkstraCell) => {
      targetCell.distanceFromSource =
        currentCell.distanceFromSource + targetCell.moveCost;
    };

    const neighbours = getUnvisitedNeighbours(currentCell, this.grid);

    neighbours.forEach((cell: DijkstraCell) => {
      updateDistance(currentCell, cell);
    });
  };

  solve = () => {
    const t0 = performance.now();
    const exitCell = this.grid[this.width - 1][this.height - 1];
    const unvisitedCells = getAllCells(this);
    const startCell = this.grid[0][0];
    startCell.distanceFromSource = 0;

    while (!!unvisitedCells.length) {
      sortNodesByDistance(unvisitedCells);
      const currentCell = unvisitedCells.shift();

      if (currentCell === undefined) break;
      if (currentCell.distanceFromSource === Infinity) break;
      if (currentCell === exitCell) break;

      currentCell.visited = true;

      this.updateNeighbourDistances(currentCell);
      this.createFrame();
    }

    let currentCell = exitCell;

    while (!(currentCell === startCell)) {
      currentCell.onPath = true;
      const nextCell = this.getClosestVisitableNeighbour(currentCell);
      this.createFrame();

      currentCell = nextCell;
    }

    startCell.onPath = true;
    this.frames.push(cloneDeep(this.grid));

    const t1 = performance.now();
    console.log("solved in:", t1 - t0, "milliseconds.");
  };

  draw(canvasContext: any, unitSize: number, step: number) {
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
