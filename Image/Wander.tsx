import * as React from "react";

interface WanderProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
}

const Wander: React.FC<WanderProps> = ({ ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 128 60"
    {...props}
  >
    <g id="Group 196">
      <path
        id="R"
        fill="url(#paint0_linear_639_639)"
        fillRule="evenodd"
        d="M88.086 29.873 65.522 1.263c-.951-1.234-1.883-1.436-2.904-.11l-22.6 28.674 21.874 19.77 2.124-45.294 2.124 45.293z"
        clipRule="evenodd"
      ></path>
      <path
        id="R_2"
        fill="url(#paint1_linear_639_639)"
        d="m104.109 59.443 22.932-48.937c.492-1.072-.683-2.143-1.705-1.555l-34.29 19.71-22.289 25.108z"
      ></path>
      <path
        id="R_3"
        fill="url(#paint2_linear_639_639)"
        d="M23.891 59.443.96 10.506c-.492-1.072.683-2.143 1.705-1.555l34.29 19.71 22.289 25.108z"
      ></path>
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_639_639"
        x1="63.883"
        x2="63.883"
        y1="49.596"
        y2="0.244"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6B57F9"></stop>
        <stop offset="1" stopColor="#9787FF"></stop>
      </linearGradient>
      <linearGradient
        id="paint1_linear_639_639"
        x1="77.879"
        x2="108.669"
        y1="39.532"
        y2="57.022"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6B57F9"></stop>
        <stop offset="1" stopColor="#9787FF"></stop>
      </linearGradient>
      <linearGradient
        id="paint2_linear_639_639"
        x1="50.121"
        x2="19.331"
        y1="39.532"
        y2="57.022"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6B57F9"></stop>
        <stop offset="1" stopColor="#9787FF"></stop>
      </linearGradient>
    </defs>
  </svg>
);
export default Wander;
