"use client";

import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { TemplateField } from "./template-field";
import { DrawingField } from "./drawing-field";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  DEFAULT_GROUP,
  type TemplateFieldForm,
} from "@/providers/template-field-provider";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import {
  type PageMeasurement,
  generateRange,
  getPageNumber,
} from "@/lib/pdf-positioning";

interface FieldCanvasProp {
  mode?: "readonly" | "edit";
  measurements: PageMeasurement;
}

const resizeObserverOptions = {};

export function FieldCanvas({ mode = "edit", measurements }: FieldCanvasProp) {
  const { control, getValues } = useFormContext<TemplateFieldForm>();
  const { append, fields, remove } = useFieldArray({
    name: "fields",
    control,
    keyName: "_id",
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const [focusId, setFocusId] = useState("");
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [viewport, setViewport] = useState({ height: 0, width: 0 });

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      const { height, width } = entry.contentRect;
      setViewport({ height, width });
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  const handleFocus = (id: string) => {
    if (mode === "edit") {
      setFocusId(id);
    }
  };

  const heightRange = generateRange(measurements, viewport.width);

  return (
    <>
      <div
        ref={setContainerRef}
        className="absolute bottom-0 left-0 right-0 top-0 z-10 cursor-crosshair"
        onMouseDown={(e) => {
          e.preventDefault();

          const fieldType = getValues("fieldType");

          if (!fieldType) return;

          if (e.button !== 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setIsDrawing(true);
          setFocusId("");
          setStartPos({ x, y });
          setEndPos({ x, y });
        }}
        onMouseMove={(e) => {
          e.preventDefault();

          const fieldType = getValues("fieldType");

          if (!fieldType) return;
          if (!isDrawing) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          setViewport({ width: rect.width, height: rect.height });

          setEndPos({ x, y });
        }}
        onMouseUp={(e) => {
          e.preventDefault();

          const fieldType = getValues("fieldType");

          if (!fieldType) return;
          if (!isDrawing) return;
          setIsDrawing(false);
          if (startPos.x !== endPos.x && startPos.y !== endPos.y) {
            const id = nanoid();

            const top = Math.min(startPos.y, endPos.y);
            const left = Math.min(startPos.x, endPos.x);
            const width = Math.abs(endPos.x - startPos.x);
            const height = Math.abs(endPos.y - startPos.y);

            const pageNum = getPageNumber(top, heightRange);

            append({
              id,
              name: `field ${fields.length}`,
              left,
              top,
              width,
              height,
              type: fieldType,
              defaultValue: "",
              readOnly: false,
              required: true,
              viewportHeight: viewport.height,
              viewportWidth: viewport.width,
              page: pageNum,
              group: DEFAULT_GROUP[0]?.name ?? "",
            });

            setFocusId(id);
          }
        }}
      />
      {isDrawing && (
        <DrawingField
          left={Math.min(startPos.x, endPos.x)}
          top={Math.min(startPos.y, endPos.y)}
          height={Math.abs(endPos.y - startPos.y)}
          width={Math.abs(endPos.x - startPos.x)}
        />
      )}

      {fields.map((field, index) => (
        <TemplateField
          viewportWidth={field.viewportWidth}
          viewportHeight={field.viewportHeight}
          currentViewportWidth={viewport.width}
          currentViewportHeight={viewport.height}
          key={field._id}
          focusId={focusId}
          height={field.height}
          left={field.left}
          top={field.top}
          id={field.id}
          width={field.width}
          handleFocus={handleFocus}
          index={index}
          handleDelete={() => {
            remove(index);
          }}
        />
      ))}
    </>
  );
}
