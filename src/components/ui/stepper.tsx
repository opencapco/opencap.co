"use client";

import { cn } from "@/lib/utils";
import {
  DescendantProvider,
  createDescendantContext,
  useDescendant,
  useDescendants,
  useDescendantsInit,
} from "@/providers/descendants";
import { RiCheckLine } from "@remixicon/react";
import {
  type ComponentProps,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import Modal, { type ModalProps } from "../common/push-modal";
import { Button, type ButtonProps } from "./button";
import { Card } from "./card";
import { DialogFooter } from "./dialog";

const StepperDescendantContext = createDescendantContext(
  "StepperDescendantContext",
);

type TStepperContext = {
  activeIndex: number;
  prev: () => void;
  next: () => void;
  reset: () => void;
};

const StepperContext = createContext<TStepperContext | null>(null);

interface StepperRootProps {
  children: ReactNode;
}

export function useStepper() {
  const data = useContext(StepperContext);

  if (!data) {
    throw new Error("useStepper hook should be used inside StepperRoot");
  }

  return data;
}

interface StepperStepProps extends ComponentProps<"div"> {
  children: ReactNode;
  title: string;
}

export function StepperStep({ children, title, ...rest }: StepperStepProps) {
  const { activeIndex } = useStepper();
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  const handleRefSet = useCallback((refValue: HTMLDivElement) => {
    ref.current = refValue;
    setElement(refValue);
  }, []);

  const descendant = useMemo(() => {
    return {
      // Assign the DOM node using a stateful reference. This should be safer
      // than passing the ref directly.
      element,
      data: {
        title,
      },
    };
  }, [element, title]);

  const index = useDescendant(
    descendant,

    StepperDescendantContext,
  );
  const isSelected = index === activeIndex;

  return (
    <div {...rest} ref={handleRefSet}>
      {isSelected ? children : null}
    </div>
  );
}

export function StepperRoot({ children }: StepperRootProps) {
  const [descendants, setDescendants] = useDescendantsInit();
  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => {
    if (descendants.length !== activeIndex) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const prev = () => {
    if (activeIndex !== 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const reset = () => {
    setActiveIndex(0);
  };

  return (
    <DescendantProvider
      context={StepperDescendantContext}
      items={descendants}
      set={setDescendants}
    >
      <StepperContext.Provider value={{ activeIndex, next, prev, reset }}>
        {children}
      </StepperContext.Provider>
    </DescendantProvider>
  );
}

export type StepperModalProps = ModalProps;

function StepList() {
  const steps = useDescendants(StepperDescendantContext);
  const { activeIndex: currentStep } = useStepper();

  return steps.map((step, stepId) => (
    <li
      key={step.data.title}
      className="group relative pb-5"
      {...(currentStep === stepId && { "aria-current": "step" })}
    >
      <div
        className={cn(
          "absolute left-4 top-4 -ml-1 mt-0.5 h-full w-0.5 group-last:hidden",
          stepId < currentStep ? "bg-teal-500" : "bg-gray-300",
        )}
        aria-hidden="true"
      />
      <span className="group relative flex items-center">
        <span className="flex h-9 items-center" aria-hidden="true">
          <span
            className={cn(
              "relative z-10 flex h-6 w-6 items-center justify-center rounded-full ",
              currentStep === stepId && "border-2 border-teal-500 bg-white",
              stepId > currentStep &&
                "border-2 border-gray-300 bg-white group-hover:border-gray-400",
              stepId < currentStep && "bg-teal-500 group-hover:bg-teal-600",
            )}
          >
            {stepId < currentStep ? (
              <RiCheckLine className="h-4 w-4 text-white" aria-hidden="true" />
            ) : (
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  currentStep === stepId && "bg-teal-500",
                  stepId > currentStep &&
                    "bg-transparent group-hover:bg-gray-300",
                )}
              />
            )}
          </span>
        </span>
        <span className="ml-4 flex min-w-0 flex-col">
          <span
            className={cn(
              "text-sm font-medium",
              currentStep === stepId && "text-teal-500",
              stepId > currentStep && "text-gray-500",
            )}
          >
            {step.data.title}
          </span>
        </span>
      </span>
    </li>
  ));
}

export function StepperModal({
  children,
  size = "4xl",
  ...rest
}: StepperModalProps) {
  return (
    <StepperRoot>
      <Modal size={size} {...rest}>
        <div className="grid grid-cols-10">
          <nav
            aria-label="Progress"
            className="red col-span-3 hidden max-w-64 md:block"
          >
            <ol className="overflow-hidden">
              <StepList />
            </ol>
          </nav>
          <div className="col-span-12 space-y-6 md:col-span-7">
            <Card className="p-6">{children}</Card>
          </div>
        </div>
      </Modal>
    </StepperRoot>
  );
}

interface StepperModalContentProps {
  children: ReactNode;
}

export function StepperModalContent({ children }: StepperModalContentProps) {
  const steps = useDescendants(StepperDescendantContext);
  const { activeIndex } = useStepper();
  const currentTitle = steps?.[activeIndex]?.data?.title ?? "";
  return (
    <div>
      <h5 className="text-lg font-medium">{currentTitle}</h5>
      {children}
    </div>
  );
}

export function StepperModalFooter({
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return <DialogFooter {...rest}>{children}</DialogFooter>;
}

export function StepperPrev({
  children,
  ...rest
}: ButtonProps & { children: ReactNode }) {
  const { prev, activeIndex } = useStepper();

  return (
    <Button
      variant="outline"
      disabled={activeIndex === 0}
      type="button"
      onClick={prev}
      {...rest}
    >
      {children}
    </Button>
  );
}

export function StepperNext({
  children,
  ...rest
}: ButtonProps & { children: ReactNode }) {
  const { next } = useStepper();

  return (
    <Button onClick={next} {...rest}>
      {children}
    </Button>
  );
}
