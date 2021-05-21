import React, { useState } from "react";
import styles from "./Maze.module.scss";
import { generateRecursiveBacktrackMaze, Grid } from "../../service/mazeGenerator.service";
import Canvas from "./Canvas/Canvas";
import { cloneDeep } from 'lodash';

const Maze = () => {

  // const [maze, setMaze] = useState(generateRecursiveBacktrackMaze(10,10));
  const [maze, setMaze] = useState(new Grid(10,10));
  const [delayBetweenFrames, setFrameDelay] = useState(25)

  const handleChange = (event:any):void => {
    let newDelay = Number(event.target.value)
    newDelay = Math.max(newDelay, 0)
    newDelay = Math.min(newDelay, 2000)
    setFrameDelay(newDelay)
  }

  return (
    <div className={styles.mazeContainer}>
      <div className={styles.maze} id="maze">
        <Canvas maze={maze} delayBetweenFrames={delayBetweenFrames} />
        <button onClick={() => {setMaze(cloneDeep(maze))}}>Re-run</button>
        <button onClick={() => {setMaze(generateRecursiveBacktrackMaze(10,10))}}>New maze</button>
        <input type="number" min='0' max='2000' defaultValue={delayBetweenFrames} onChange={handleChange}/>
      </div>
      
    </div>
  );
};

export default Maze;
