"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Trash2, Download, PenTool } from "lucide-react";
import { toast } from "sonner";

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Fill background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = isEraser ? "#ffffff" : color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      toast.success("Whiteboard cleared");
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `whiteboard-${new Date().getTime()}.png`;
    link.click();
    toast.success("Whiteboard downloaded");
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-secondary dark:bg-background p-4 flex flex-col">
      <div className="bg-card dark:bg-card border border-border rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r pr-4 border-border">
            <button
              onClick={() => setIsEraser(false)}
              className={`p-2 rounded-lg transition-colors ${!isEraser ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'hover:bg-secondary text-muted-foreground'}`}
              title="Pen Tool"
            >
              <PenTool className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={`p-2 rounded-lg transition-colors ${isEraser ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'hover:bg-secondary text-muted-foreground'}`}
              title="Eraser"
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={color} 
              onChange={(e) => { setColor(e.target.value); setIsEraser(false); }}
              className="w-8 h-8 rounded cursor-pointer"
              title="Color"
            />
            <input 
              type="range" 
              min="1" max="20" 
              value={lineWidth} 
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-24 cursor-pointer"
              title="Line Width"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={clearCanvas}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
          <button 
            onClick={downloadCanvas}
            className="flex items-center gap-2 text-sm bg-primary text-white hover:bg-[#0948CC] px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      <div className="flex-1 w-full bg-white rounded-xl shadow-inner overflow-hidden border border-border cursor-crosshair touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
