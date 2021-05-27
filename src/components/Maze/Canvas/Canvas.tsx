import React, { useRef, useEffect, useState } from "react";
import {
  Grid,
  RecursiveBacktrackMaze,
  RecursiveDivisionMaze,
} from "../../../service/mazeGenerator.service";
import { DijkstraSolve } from "../../../service/mazeSolver.service";

type CanvasProps = {
  maze: Grid | RecursiveBacktrackMaze | RecursiveDivisionMaze | DijkstraSolve;
  delayBetweenFrames: number;
};

const Canvas = ({ maze, delayBetweenFrames }: CanvasProps) => {
  const canvasRef = useRef(null);
  const [step, setStep] = useState(0);
  const [measured, setMeasured] = useState(false);
  const [unitSize, setUnitSize] = useState(1);
  const [context, setContext] = useState(
    document.createElement("canvas").getContext("2d")
  );

  useEffect(() => {
    setStep(0);
    const canvas: any = canvasRef.current;
    const tmpContext = canvas.getContext("2d");
    const parentDiv = canvas.parentElement;
    if (!measured) {
      tmpContext.canvas.width = parentDiv?.offsetWidth;
      tmpContext.canvas.height = parentDiv?.offsetHeight;
      let tempUnitSize = 1;
      while (
        tempUnitSize * maze.height < tmpContext.canvas.height - 50 &&
        tempUnitSize * maze.width < tmpContext.canvas.width - 50
      ) {
        tempUnitSize += 1;
      }
      setUnitSize(tempUnitSize);
      setMeasured(true);
      tmpContext.translate(5, 5);
      setContext(tmpContext);
    }
  }, [maze, measured]);

  useEffect(() => {
    if (!context) throw new Error("No context");

    context.clearRect(
      0,
      0,
      maze.width * unitSize + 300,
      maze.height * unitSize + 100
    );
    context.font = "20px Roboto";
    context.fillText(
      `${step + 1} / ${maze.frames.length}`,
      0,
      maze.height * unitSize + 30
    );
    maze.draw(context, unitSize, step);

    setTimeout(() => {
      if (step + 1 < maze.frames.length) setStep(step + 1);
    }, delayBetweenFrames);
  }, [step, context, maze, unitSize, delayBetweenFrames]);

  return <canvas ref={canvasRef} />;
};

export default Canvas;
