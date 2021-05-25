import React, { useState, useEffect } from "react";
import styles from "./Maze.module.scss";
import {
  generateRecursiveBacktrackMaze,
  Grid,
} from "../../service/mazeGenerator.service";
import { dijkstraSolve } from "../../service/mazeSolver.service";
import Canvas from "./Canvas/Canvas";
import { cloneDeep } from "lodash";

const Maze = () => {
  const [dimensions] = useState({ width: 15, height: 10 });
  const [maze, setMaze] = useState(new Grid(dimensions.width, dimensions.height));
  const [delayBetweenFrames, setFrameDelay] = useState(1);

  useEffect(() => {
    // setDimensions({ width: 10, height: 10 });
    console.log(maze);
  }, [maze]);

  const handleChange = (event: any): void => {
    let newDelay = Number(event.target.value);
    newDelay = Math.max(newDelay, 0);
    newDelay = Math.min(newDelay, 2000);
    setFrameDelay(newDelay);
  };

  return (
    <div className={styles.mazeContainer}>
      <div className={styles.maze} id="maze">
        <Canvas maze={maze} delayBetweenFrames={delayBetweenFrames} />
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
              generateRecursiveBacktrackMaze(dimensions.width, dimensions.height)
            );
          }}
        >
          New maze
        </button>
        Interval:{" "}
        <input
          type="number"
          min="0"
          max="2000"
          defaultValue={delayBetweenFrames}
          onChange={handleChange}
        />{" "}
        ms.
        <button
          onClick={() => {
            setMaze(dijkstraSolve(maze));
          }}
        >
          Solve
        </button>
      </div>
    </div>
  );
};

export default Maze;
