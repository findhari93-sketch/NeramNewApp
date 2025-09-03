import StepBasic from "./components/StepBasic";
import type { ComponentType } from "react";

const StepBasicComponent = StepBasic as ComponentType<Record<string, unknown>>;

export default function ApplicationForm() {
  return (
    <div>
      <h1>Application Form</h1>
      <StepBasicComponent />
    </div>
  );
}
