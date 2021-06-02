import React, { useState, useRef } from "react";
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
  const [dimensions] = useState({ width: 30, height: 15 });
  const [maze, setMaze] = useState(new Grid(dimensions.width, dimensions.height));
  const [delayBetweenFrames, setFrameDelay] = useState(1);
  const [animate, setAnimate] = useState(true);

  let solveButtonRef = useRef<HTMLButtonElement>(null);
  let backtrackButtonRef = useRef<HTMLButtonElement>(null);
  let divisionButtonRef = useRef<HTMLButtonElement>(null);

  const handleChange = (event: any): void => {
    let newDelay = Number(event.target.value);
    newDelay = Math.max(newDelay, 0);
    newDelay = Math.min(newDelay, 2000);
    setFrameDelay(newDelay);
  };

  const handleSolveClick = () => {
    if (!!solveButtonRef.current)
      solveButtonRef.current.setAttribute("disabled", "disabled");
    setMaze(new DijkstraSolve(maze, animate));
    if (!!solveButtonRef.current) solveButtonRef.current.removeAttribute("disabled");
  };

  const handleBacktrackClick = () => {
    if (!!backtrackButtonRef.current)
      backtrackButtonRef.current.setAttribute("disabled", "disabled");
    setMaze(
      new RecursiveBacktrackMaze(dimensions.width, dimensions.height, animate)
    );
    if (!!backtrackButtonRef.current)
      backtrackButtonRef.current.removeAttribute("disabled");
  };

  const handleDivisionClick = () => {
    if (!!divisionButtonRef.current)
      divisionButtonRef.current.setAttribute("disabled", "disabled");
    setMaze(new RecursiveDivisionMaze(dimensions.width, dimensions.height, animate));
    if (!!divisionButtonRef.current)
      divisionButtonRef.current.removeAttribute("disabled");
  };

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
          <button ref={backtrackButtonRef} onClick={handleBacktrackClick}>
            New Backtrack maze
          </button>
          <button ref={divisionButtonRef} onClick={handleDivisionClick}>
            New Division maze
          </button>
          <button ref={solveButtonRef} onClick={handleSolveClick}>
            Solve
          </button>
          Interval:{" "}
          <input
            type="number"
            min="1"
            max="1000"
            step="10"
            defaultValue={delayBetweenFrames}
            onChange={handleChange}
          />{" "}
          ms.
          <input
            type="checkbox"
            name="animate"
            id="animate"
            defaultChecked={true}
            onChange={() => {
              setAnimate(!animate);
            }}
          />
          Animate
        </div>
      </div>
    </div>
  );
};

export default Maze;
