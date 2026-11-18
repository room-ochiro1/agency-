"use client";

// The one place GSAP plugins are registered. Import gsap, ScrollTrigger and useGSAP from here.
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);

/** Strong ease-out for entrances, the same curve as --ease-out in globals.css. */
export const EASE_OUT = CustomEase.create("agency-out", "0.23,1,0.32,1");

export { gsap, ScrollTrigger, useGSAP };
