import React from "react";
import { NeonButton, type NeonButtonProps } from "./NeonButton";

export type SurfButtonProps = NeonButtonProps;

export const SurfButton: React.FC<SurfButtonProps> = (props) => {
  return <NeonButton {...props} showSparkle />;
};
