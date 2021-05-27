import React, { useState } from "react";
import styles from "./Maze.module.scss";
import {
  Grid,
  RecursiveBacktrackMaze,
  RecursiveDivisionMaze,
} from "../../service/mazeGenerator.service";
import Canvas from "./Canvas/Canvas";
import { cloneDeep } from "lodash";
import { DijkstraSolve } from "../../service/mazeSolver.service";

const Maze = () => {
  const [dimensions] = useState({ width: 15, height: 10 });
  const [maze, setMaze] = useState(new Grid(dimensions.width, dimensions.height));
  const [delayBetweenFrames, setFrameDelay] = useState(1);

  const handleChange = (event: any): void => {
    let newDelay = Number(event.target.value);
    newDelay = Math.max(newDelay, 0);
    newDelay = Math.min(newDelay, 2000);
    setFrameDelay(newDelay);
  };

  console.log(maze);
  return (
    <div className={styles.mazeContainer}>
      <div className={styles.maze} id="maze">
        <Canvas maze={maze} delayBetweenFrames={delayBetweenFrames} />
        <div>
          <button
            onClick={() => {
              setMaze(cloneDeep(maze));
            }}
          >
            Re-run
          </button>
          <button
            onClick={() => {
              setMaze(
                new RecursiveBacktrackMaze(dimensions.width, dimensions.height)
              );
            }}
          >
            New Backtrack maze
          </button>
          <button
            onClick={() => {
              setMaze(
                new RecursiveDivisionMaze(dimensions.width, dimensions.height)
              );
            }}
          >
            New Division maze
          </button>
          Interval:{" "}
          <button
            onClick={() => {
              setMaze(new DijkstraSolve(maze));
            }}
          >
            Solve
          </button>
          <input
            type="number"
            min="1"
            max="1000"
            step="10"
            defaultValue={delayBetweenFrames}
            onChange={handleChange}
          />{" "}
          ms.
        </div>
      </div>
    </div>
  );
};

export default Maze;
