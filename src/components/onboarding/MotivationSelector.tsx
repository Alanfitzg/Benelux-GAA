"use client";

import { motion } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { TRAVEL_MOTIVATIONS } from "@/lib/constants/onboarding";
import { GripVertical } from "lucide-react";

interface MotivationSelectorProps {
  selectedMotivations: string[];
  onUpdate: (motivations: string[]) => void;
}

export default function MotivationSelector({
  selectedMotivations,
  onUpdate,
}: MotivationSelectorProps) {
  const toggleMotivation = (motivationId: string) => {
    if (selectedMotivations.includes(motivationId)) {
      onUpdate(selectedMotivations.filter((id) => id !== motivationId));
    } else {
      onUpdate([...selectedMotivations, motivationId]);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(selectedMotivations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onUpdate(items);
  };

  const unselectedMotivations = Object.values(TRAVEL_MOTIVATIONS).filter(
    (motivation) => !selectedMotivations.includes(motivation.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-600 mb-4">
          Select what motivates your GAA travel - then drag to rank by
          importance!
        </p>

        {/* Selection Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {unselectedMotivations.map((motivation, index) => (
            <motion.button
              key={motivation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleMotivation(motivation.id)}
              className={`relative p-3 rounded-lg border-2 transition-all text-center border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 ${"note" in motivation ? "opacity-60" : ""}`}
            >
              <div className="text-xl mb-1">{motivation.icon}</div>
              <h3 className="font-medium text-xs text-gray-900 mb-1">
                {motivation.label}
              </h3>
              <p className="text-xs text-gray-600 leading-tight">
                {motivation.description}
              </p>
              {"note" in motivation && (
                <p className="text-xs text-amber-600 font-medium mt-1">
                  {(motivation as { note: string }).note}
                </p>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected and Ranked Motivations */}
      {selectedMotivations.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Your Travel Priorities (drag to reorder)
          </h3>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="motivations">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-2 p-3 rounded-lg border-2 border-dashed transition-colors ${
                    snapshot.isDraggingOver
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  {selectedMotivations.map((motivationId, index) => {
                    const motivation =
                      TRAVEL_MOTIVATIONS[
                        motivationId as keyof typeof TRAVEL_MOTIVATIONS
                      ];
                    if (!motivation) return null;

                    return (
                      <Draggable
                        key={motivation.id}
                        draggableId={motivation.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-3 bg-white rounded-lg border transition-all ${
                              snapshot.isDragging
                                ? "border-primary shadow-lg rotate-2"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-xl">{motivation.icon}</span>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900">
                                  {motivation.label}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  {motivation.description}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleMotivation(motivation.id)}
                              className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <p className="text-xs text-gray-500 mt-2">
            💡 Your #1 priority will be weighted most heavily in recommendations
          </p>
        </div>
      )}

      <p className="text-sm text-gray-500 text-center">
        Selected: {selectedMotivations.length}{" "}
        {selectedMotivations.length === 1 ? "motivation" : "motivations"}
      </p>
    </div>
  );
}
